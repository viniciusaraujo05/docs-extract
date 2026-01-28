<?php

namespace App\Jobs;

use App\Models\Batch;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExportToGoogleSheetsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected Batch $batch,
        protected User $user
    ) {}

    public function handle(): void
    {
        $account = $this->user->connectedAccounts()->where('provider', 'google')->first();

        if (! $account) {
            Log::error("Export failed: No Google account connected for user {$this->user->id}");

            return;
        }

        // Refresh token if needed
        if ($account->expires_at && $account->expires_at->isPast()) {
            // Logic duplicated from Controller, locally handled here or ideally in a Service
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
                Log::error("Export failed: Could not refresh token for user {$this->user->id}");

                return;
            }
        }

        $token = $account->token;

        // 1. Create Spreadsheet
        $response = Http::withToken($token)
            ->post('https://sheets.googleapis.com/v4/spreadsheets', [
                'properties' => [
                    'title' => "Export - {$this->batch->name} - ".now()->format('Y-m-d H:i'),
                ],
            ]);

        if ($response->failed()) {
            Log::error('Export failed: Could not create spreadsheet', ['response' => $response->body()]);

            return;
        }

        $spreadsheetId = $response->json('spreadsheetId');
        $spreadsheetUrl = $response->json('spreadsheetUrl');

        // 2. Prepare Data
        $documents = $this->batch->documents()->where('status', 'completed')->get();
        if ($documents->isEmpty()) {
            return;
        }

        // Collect all possible headers from all documents to ensure consistency
        // (Some docs might have extra fields or missing ones)
        $allHeaders = [];
        foreach ($documents as $doc) {
            if (is_array($doc->extracted_data)) {
                $allHeaders = array_merge($allHeaders, array_keys($doc->extracted_data));
            }
        }
        $headers = array_unique($allHeaders);
        sort($headers);

        // Add standard columns
        array_unshift($headers, 'Document Name', 'Created At');

        $rows = [$headers];

        foreach ($documents as $doc) {
            $row = [
                $doc->name,
                $doc->created_at->toDateTimeString(),
            ];

            foreach (array_slice($headers, 2) as $header) {
                $val = $doc->extracted_data[$header] ?? '';
                // Handle arrays or objects if any
                if (is_array($val)) {
                    $val = json_encode($val, JSON_UNESCAPED_UNICODE);
                }
                $row[] = $val;
            }
            $rows[] = $row;
        }

        // 3. Write Data
        $response = Http::withToken($token)
            ->post("https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/A1:append", [
                'range' => 'A1',
                'valueInputOption' => 'USER_ENTERED',
                'values' => $rows,
            ]);

        if ($response->failed()) {
            Log::error('Export failed: Could not append data', ['response' => $response->body()]);
            // Retry logic could go here
        }

        // Optional: Notify user (e.g. database notification)
        // For now, we assume the user can check Drive.
        // Ideally we'd send an email or in-app notification with $spreadsheetUrl
    }
}
