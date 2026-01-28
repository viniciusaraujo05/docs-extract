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
     * List files from Google Drive.
     */
    /**
     * List files from Google Drive.
     */
    public function listFiles(User $user, ?string $folderId = null)
    {
        $account = $this->getAccount($user);

        if (! $account) {
            throw new \Exception('Google account not connected');
        }

        $this->ensureTokenIsValid($account);

        $folderId = $folderId ?: 'root';
        $query = "'{$folderId}' in parents and trashed = false";

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::withToken($account->token)
            ->get(self::DRIVE_API_URL, [
                'q' => $query,
                'fields' => 'files(id, name, mimeType, iconLink, thumbnailLink)',
                'pageSize' => 50,
                'orderBy' => 'folder,name',
            ]);

        if ($response->failed()) {
            Log::error('Google Drive List Failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            // Handle 401 Unauthorized specifically to hint at re-auth
            if ($response->status() === 401) {
                throw new \Exception('Unauthorized: Please reconnect your Google account.');
            }

            throw new \Exception('Failed to fetch files from Google Drive: '.$response->body());
        }

        return $response->json();
    }

    /**
     * Download a file from Google Drive.
     */
    public function downloadFile(User $user, string $fileId)
    {
        $account = $this->getAccount($user);

        if (! $account) {
            throw new \Exception('Google account not connected');
        }

        $this->ensureTokenIsValid($account);

        // Get file metadata
        /** @var \Illuminate\Http\Client\Response $metaResponse */
        $metaResponse = Http::withToken($account->token)
            ->get(self::DRIVE_API_URL."/{$fileId}", [
                'fields' => 'name,mimeType',
            ]);

        if ($metaResponse->failed()) {
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
            Log::error('Google Drive Download Failed', [
                'status' => $response->status(),
                'body' => $response->body(),
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
