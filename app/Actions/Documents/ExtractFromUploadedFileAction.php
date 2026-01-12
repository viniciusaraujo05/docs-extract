<?php

declare(strict_types=1);

namespace App\Actions\Documents;

use App\Models\User;
use App\Services\Extraction\ExtractionStrategyFactory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Extract data from uploaded file without persisting to database.
 * 
 * Used for quick extractions in the frontend "Extract Data" flow.
 */
final readonly class ExtractFromUploadedFileAction
{
    public function __construct(
        private ExtractionStrategyFactory $strategyFactory,
    ) {}

    /**
     * Execute extraction from uploaded file.
     *
     * @param User $user Current user
     * @param UploadedFile $file Uploaded document file
     * @param array $fields Schema fields to extract
     * @return array{success: bool, extracted_data?: array, confidence?: int, raw_text_preview?: string, error?: string}
     */
    public function execute(User $user, UploadedFile $file, array $fields): array
    {
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $filePath = $file->storeAs("temp_extractions/{$user->id}", $filename, 'local');

        try {
            // Create temporary document model (not saved to DB)
            $tempDocument = new \App\Models\Document();
            $tempDocument->user_id = $user->id;
            $tempDocument->organization_id = $user->organization_id;
            $tempDocument->name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $tempDocument->original_filename = $file->getClientOriginalName();
            $tempDocument->file_path = $filePath;
            $tempDocument->mime_type = $file->getMimeType();
            $tempDocument->file_size = $file->getSize();
            $tempDocument->type = 'temp_extraction';
            $tempDocument->status = 'pending';
            $tempDocument->schema_used = ['fields' => $fields];

            Log::info('ExtractFromUploadedFileAction: Starting extraction', [
                'mime_type' => $tempDocument->mime_type,
                'file_size' => $tempDocument->file_size,
            ]);

            // Get strategy and extract
            $strategy = $this->strategyFactory->getStrategy($tempDocument);
            $result = $strategy->extract($tempDocument, ['fields' => $fields]);

            // Clean up temp file
            Storage::disk('local')->delete($filePath);

            Log::info('ExtractFromUploadedFileAction: Extraction completed', [
                'has_data' => !empty($result['data']),
            ]);

            if (!empty($result['data'])) {
                return [
                    'success' => true,
                    'extracted_data' => $result['data'],
                    'confidence' => $result['confidence'] ?? 0,
                    'raw_text_preview' => isset($result['raw_text']) ? substr($result['raw_text'], 0, 500) : '',
                ];
            }

            return [
                'success' => false,
                'error' => 'No data could be extracted from the document',
            ];

        } catch (\Throwable $e) {
            // Clean up temp file on error
            Storage::disk('local')->delete($filePath);

            Log::error('ExtractFromUploadedFileAction: Extraction failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to extract data: ' . $e->getMessage(),
            ];
        }
    }
}
