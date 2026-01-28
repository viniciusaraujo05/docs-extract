<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\ConnectedAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class IntegrationController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        return \Inertia\Inertia::render('settings/integrations', [
            'integrations' => $user->connectedAccounts()->get()->map(fn ($account) => [
                'provider' => $account->provider,
                'name' => $account->name,
                'email' => $account->email,
                'avatar' => $account->avatar,
                'created_at' => $account->created_at,
            ]),
        ]);
    }

    public function connect(Request $request, string $locale, string $provider)
    {
        if ($provider !== 'google') {
            abort(404);
        }

        // Store return URL if provided
        if ($request->has('return_to')) {
            session(['oauth_return_to' => $request->input('return_to')]);
        }

        // Store locale for callback redirect
        session(['integration_locale' => $locale]);

        // Request offline access to get refresh token
        // Request specific scopes for Drive and Sheets
        return Socialite::driver('google')
            ->scopes([
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/spreadsheets',
            ])
            ->with(['access_type' => 'offline', 'prompt' => 'consent select_account'])
            ->redirectUrl(route('integrations.callback', ['provider' => $provider]))
            ->redirect();
    }

    public function callback(Request $request, string $provider)
    {
        if ($provider !== 'google') {
            abort(404);
        }

        /** @var User $user */
        $user = $request->user();
        $locale = session('integration_locale', 'en');

        try {
            /** @var \Laravel\Socialite\Two\User $socialUser */
            $socialUser = Socialite::driver('google')
                ->redirectUrl(route('integrations.callback', ['provider' => $provider]))
                ->user();

            Log::info('Google OAuth Callback', [
                'user_id' => $user->id,
                'google_id' => $socialUser->getId(),
                'has_token' => ! empty($socialUser->token),
                'has_refresh_token' => ! empty($socialUser->refreshToken),
                'expires_in' => $socialUser->expiresIn,
            ]);

            $data = [
                'provider_id' => $socialUser->getId(),
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'avatar' => $socialUser->getAvatar(),
                'token' => $socialUser->token,
                'expires_at' => now()->addSeconds($socialUser->expiresIn),
            ];

            if ($socialUser->refreshToken) {
                $data['refresh_token'] = $socialUser->refreshToken;
            }

            $account = ConnectedAccount::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'provider' => 'google',
                ],
                $data
            );

            Log::info('Connected Account Saved', ['account_id' => $account->id]);

            $returnTo = session('oauth_return_to');
            if ($returnTo) {
                session()->forget('oauth_return_to');

                return redirect($returnTo)->with('success', 'Google account connected successfully.');
            }

            return redirect()->route('settings.integrations', ['locale' => $locale])
                ->with('success', 'Google account connected successfully.');

        } catch (\Exception $e) {
            Log::error('Google OAuth Error', ['message' => $e->getMessage()]);

            return redirect()->route('settings.integrations', ['locale' => $locale])
                ->with('error', 'Failed to connect Google account: '.$e->getMessage());
        }
    }

    public function disconnect(Request $request, string $locale, string $provider)
    {
        /** @var User $user */
        $user = $request->user();

        $user->connectedAccounts()->where('provider', $provider)->delete();

        return back()->with('success', 'Account disconnected.');
    }

    public function listDriveFiles(Request $request, string $locale, \App\Services\GoogleDriveService $driveService)
    {
        /** @var User $user */
        $user = $request->user();
        $folderId = $request->query('folderId');

        try {
            return $driveService->listFiles($user, $folderId);
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'Unauthorized')) {
                return response()->json(['error' => $e->getMessage()], 401);
            }
            if ($e->getMessage() === 'Google account not connected') {
                return response()->json(['error' => $e->getMessage()], 400);
            }

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadDriveFile(Request $request, string $locale, string $fileId, \App\Services\GoogleDriveService $driveService)
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $file = $driveService->downloadFile($user, $fileId);

            return response($file['content'])
                ->header('Content-Type', $file['mime_type'])
                ->header('Content-Disposition', "attachment; filename=\"{$file['filename']}\"");

        } catch (\Exception $e) {
            if ($e->getMessage() === 'Google account not connected') {
                return response()->json(['error' => $e->getMessage()], 403);
            }

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function exportBatch(Request $request, string $locale, Batch $batch)
    {
        /** @var User $user */
        $user = $request->user();

        // Check ownership
        if ($batch->user_id !== $user->id) {
            abort(403);
        }

        $account = $user->connectedAccounts()->where('provider', 'google')->first();

        if (! $account) {
            return response()->json(['error' => 'Google account not connected'], 400);
        }

        \App\Jobs\ExportToGoogleSheetsJob::dispatch($batch, $user);

        return response()->json(['success' => true, 'message' => 'Export started in background']);
    }

    public function exportRawData(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
            'filename' => 'nullable|string',
        ]);

        /** @var User $user */
        $user = $request->user();
        $account = $user->connectedAccounts()->where('provider', 'google')->first();

        if (! $account) {
            return response()->json(['error' => 'Google account not connected'], 400);
        }

        // Refresh token if needed
        if ($account->expires_at && $account->expires_at->isPast()) {
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'grant_type' => 'refresh_token',
                'refresh_token' => $account->refresh_token,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $account->update([
                    'token' => $data['access_token'],
                    'expires_at' => now()->addSeconds($data['expires_in']),
                ]);
            } else {
                return response()->json(['error' => 'Could not refresh Google token'], 401);
            }
        }

        $token = $account->token;
        $title = $request->input('filename', 'Export').' - '.now()->format('Y-m-d H:i');

        // 1. Create Spreadsheet
        $response = Http::withToken($token)
            ->post('https://sheets.googleapis.com/v4/spreadsheets', [
                'properties' => [
                    'title' => $title,
                ],
            ]);

        if ($response->failed()) {
            Log::error('Export failed: Could not create spreadsheet', ['response' => $response->body()]);

            return response()->json(['error' => 'Failed to create spreadsheet'], 500);
        }

        $spreadsheetId = $response->json('spreadsheetId');
        $spreadsheetUrl = $response->json('spreadsheetUrl');

        // 2. Prepare Data
        $data = $request->input('data');
        if (empty($data)) {
            return response()->json(['url' => $spreadsheetUrl]); // Empty sheet
        }

        // Normalize data to array of arrays
        $rows = [];

        // Ensure data is a list of objects
        if (! array_is_list($data)) {
            $data = [$data];
        }

        // Headers from first item
        $headers = array_keys($data[0]);
        $rows[] = $headers;

        foreach ($data as $item) {
            $row = [];
            foreach ($headers as $header) {
                $val = $item[$header] ?? '';
                if (is_array($val) || is_object($val)) {
                    $val = json_encode($val, JSON_UNESCAPED_UNICODE);
                }
                $row[] = $val;
            }
            $rows[] = $row;
        }

        // 3. Write Data
        $response = Http::withToken($token)
            ->post("https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED", [
                'values' => $rows,
            ]);

        if ($response->failed()) {
            Log::error('Export failed: Could not append data', ['response' => $response->body()]);
            // We still return the URL because the sheet was created
        }

        return response()->json(['url' => $spreadsheetUrl]);
    }
}
