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

        // Check if Zapier is connected
        $zapierClientId = config('services.zapier.client_id');

        $isZapierConnected = false;
        if ($zapierClientId) {
            $isZapierConnected = \Illuminate\Support\Facades\DB::table('oauth_access_tokens')
                ->where('user_id', $user->id)
                ->where('client_id', $zapierClientId)
                ->where('revoked', false)
                ->exists();
        }

        return \Inertia\Inertia::render('settings/integrations', [
            'integrations' => $user->connectedAccounts()->get()->map(fn ($account) => [
                'provider' => $account->provider,
                'name' => $account->name,
                // SECURITY: Mask email to protect privacy (show only first char and domain)
                'email' => $this->maskEmail($account->email),
                'avatar' => $account->avatar,
                'created_at' => $account->created_at,
            ]),
            'isZapierConnected' => $isZapierConnected,
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
        // Using drive.file scope: only access files created by this app or explicitly selected by user
        return Socialite::driver('google')
            ->scopes([
                'https://www.googleapis.com/auth/drive.file',
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

            // SECURITY: Encrypt OAuth tokens before storing
            $data = [
                'provider_id' => $socialUser->getId(),
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'avatar' => $socialUser->getAvatar(),
                'token' => encrypt($socialUser->token),
                'expires_at' => now()->addSeconds($socialUser->expiresIn),
            ];

            if ($socialUser->refreshToken) {
                $data['refresh_token'] = encrypt($socialUser->refreshToken);
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

    public function disconnect(Request $request, string $provider)
    {
        /** @var User $user */
        $user = $request->user();

        $user->connectedAccounts()->where('provider', $provider)->delete();

        return back()->with('success', 'Account disconnected.');
    }

    /**
     * Get OAuth token for Google Picker API.
     * Returns the current user's Google OAuth token for use in the Picker API.
     */
    public function getOAuthToken(Request $request, \App\Services\GoogleDriveService $driveService)
    {
        /** @var User $user */
        $user = $request->user();
        $account = $user->connectedAccounts()->where('provider', 'google')->first();

        if (! $account) {
            return response()->json(['connected' => false, 'error' => 'Google account not connected'], 400);
        }

        try {
            // This will automatically refresh the token if needed
            // The ensureTokenIsValid method is called internally
            $reflection = new \ReflectionClass($driveService);
            $method = $reflection->getMethod('ensureTokenIsValid');
            $method->setAccessible(true);
            $method->invoke($driveService, $account);

            // Reload account to get updated token
            $account->refresh();

            // SECURITY: Decrypt token before sending to frontend
            // The frontend needs the plain token to use with Google Picker API
            return response()->json([
                'token' => decrypt($account->token),
                'connected' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json(['connected' => false, 'error' => $e->getMessage()], 401);
        }
    }

    /**
     * Process a file selected via Google Picker API.
     * The fileId must be explicitly provided by the user through the Picker.
     * This complies with drive.file scope: only access files explicitly selected by user.
     */
    public function processPickedFile(Request $request, \App\Services\GoogleDriveService $driveService)
    {
        $request->validate([
            'fileId' => 'required|string',
        ]);

        /** @var User $user */
        $user = $request->user();
        $fileId = $request->input('fileId');

        try {
            $file = $driveService->downloadFile($user, $fileId);

            return response($file['content'])
                ->header('Content-Type', $file['mime_type'])
                ->header('Content-Disposition', "attachment; filename=\"{$file['filename']}\"");

        } catch (\Exception $e) {
            Log::error('Failed to process picked file', [
                'user_id' => $user->id,
                'file_id' => $fileId,
                'error' => $e->getMessage(),
            ]);

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
            if (! $account->refresh_token) {
                return response()->json(['error' => 'No refresh token available. Please reconnect your Google account.'], 401);
            }

            try {
                // SECURITY: Decrypt refresh token before use
                $decryptedRefreshToken = decrypt($account->refresh_token);

                $response = Http::timeout(10)->asForm()->post('https://oauth2.googleapis.com/token', [
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'grant_type' => 'refresh_token',
                    'refresh_token' => $decryptedRefreshToken,
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    // Validate response data
                    if (empty($data['access_token']) || empty($data['expires_in'])) {
                        Log::error('Invalid Google token refresh response', ['response' => $data]);

                        return response()->json(['error' => 'Invalid token refresh response'], 500);
                    }

                    // SECURITY: Encrypt new token before storing
                    $account->update([
                        'token' => encrypt($data['access_token']),
                        'expires_at' => now()->addSeconds($data['expires_in']),
                    ]);
                } else {
                    Log::error('Google token refresh failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);

                    return response()->json(['error' => 'Could not refresh Google token. Please reconnect your account.'], 401);
                }
            } catch (\Exception $e) {
                Log::error('Exception during Google token refresh', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                ]);

                return response()->json(['error' => 'Failed to refresh token. Please try again.'], 500);
            }
        }

        // SECURITY: Decrypt token before use
        $decryptedToken = decrypt($account->token);
        $title = $request->input('filename', 'Export').' - '.now()->format('Y-m-d H:i');

        // 1. Create Spreadsheet
        $response = Http::withToken($decryptedToken)
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
        $response = Http::withToken($decryptedToken)
            ->post("https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED", [
                'values' => $rows,
            ]);

        if ($response->failed()) {
            Log::error('Export failed: Could not append data', ['response' => $response->body()]);
            // We still return the URL because the sheet was created
        }

        return response()->json(['url' => $spreadsheetUrl]);
    }

    /**
     * Mask email address for privacy protection
     *
     * Example: john.doe@example.com -> j***@example.com
     */
    private function maskEmail(?string $email): ?string
    {
        if (! $email || ! str_contains($email, '@')) {
            return $email;
        }

        [$local, $domain] = explode('@', $email, 2);

        if (strlen($local) <= 1) {
            return $email;
        }

        return substr($local, 0, 1).'***@'.$domain;
    }
}
