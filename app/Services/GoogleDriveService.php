<?php

namespace App\Services;

use App\Models\ConnectedAccount;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    private const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    public function __construct() {}

    /**
     * Get the connected Google account for a user.
     */
    public function getAccount(User $user): ?ConnectedAccount
    {
        return $user->connectedAccounts()->where('provider', 'google')->first();
    }

    /**
     * REMOVED: listFiles() method.
     * 
     * With drive.file scope, we cannot list arbitrary files from user's Drive.
     * Files must be explicitly selected by the user via Google Picker API.
     * 
     * To implement file selection:
     * 1. Use Google Picker API on frontend with the same OAuth token
     * 2. User explicitly selects files through Google's UI
     * 3. Picker returns fileId which can then be used with downloadFile()
     * 
     * This ensures compliance with Google's least privilege policy.
     */

    /**
     * Download a file from Google Drive.
     * 
     * IMPORTANT: With drive.file scope, this only works for:
     * - Files created by this application
     * - Files explicitly selected by user via Google Picker API
     * 
     * The fileId must come from user interaction (Google Picker), not from
     * programmatic listing or search operations.
     * 
     * @param User $user The authenticated user
     * @param string $fileId The Google Drive file ID (from Picker or app-created file)
     * @return array ['content' => string, 'filename' => string, 'mime_type' => string]
     * @throws \Exception
     */
    public function downloadFile(User $user, string $fileId)
    {
        $account = $this->getAccount($user);

        if (! $account) {
            throw new \Exception('Google account not connected');
        }

        $this->ensureTokenIsValid($account);

        // Get file metadata
        $metadataUrl = self::DRIVE_API_URL."/{$fileId}";
        
        /** @var \Illuminate\Http\Client\Response $metaResponse */
        $metaResponse = Http::withToken($account->token)
            ->get($metadataUrl, [
                'fields' => 'name,mimeType',
            ]);

        if ($metaResponse->failed()) {
            Log::error('Failed to fetch file metadata', [
                'file_id' => $fileId,
                'status' => $metaResponse->status(),
            ]);
            throw new \Exception('Failed to fetch file metadata');
        }

        $meta = $metaResponse->json();
        $filename = $meta['name'];
        $mimeType = $meta['mimeType'];
        $url = '';
        $params = [];

        // Handle Export logic
        if (str_starts_with($mimeType, 'application/vnd.google-apps.')) {
            $exportMimeType = match ($mimeType) {
                'application/vnd.google-apps.document' => 'application/pdf',
                'application/vnd.google-apps.spreadsheet' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.google-apps.presentation' => 'application/pdf',
                default => 'application/pdf',
            };

            $url = self::DRIVE_API_URL."/{$fileId}/export";
            $params = ['mimeType' => $exportMimeType];

            if ($exportMimeType === 'application/pdf') {
                $filename .= '.pdf';
            }
            if ($exportMimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                $filename .= '.xlsx';
            }
        } else {
            $url = self::DRIVE_API_URL."/{$fileId}";
            $params = ['alt' => 'media'];
        }

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::withToken($account->token)->get($url, $params);

        if ($response->failed()) {
            Log::error('Failed to download file', [
                'file_id' => $fileId,
                'status' => $response->status(),
            ]);
            throw new \Exception('Failed to download file');
        }

        return [
            'content' => $response->body(),
            'filename' => $filename,
            'mime_type' => $response->header('Content-Type'),
        ];
    }

    /**
     * Ensure the access token is valid, refreshing it if necessary.
     */
    protected function ensureTokenIsValid(ConnectedAccount $account)
    {
        // Add a buffer time (e.g., 60 seconds) to avoid edge cases
        if ($account->expires_at && $account->expires_at->subSeconds(60)->isPast()) {
            if (! $account->refresh_token) {
                // If we don't have a refresh token, we can't refresh.
                // The user must re-connect.
                throw new \Exception('Session expired. Please reconnect your Google Account.');
            }

            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::asForm()->post(self::TOKEN_URL, [
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
                Log::error('Google Token Refresh Failed', ['body' => $response->body()]);
                // If refresh fails (e.g. revoked), we might want to delete the account or mark it as disconnected
                // For now, duplicate the exception
                throw new \Exception('Failed to refresh Google token. Please reconnect your account.');
            }
        }
    }
}
