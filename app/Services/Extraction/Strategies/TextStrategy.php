<?php

declare(strict_types=1);

namespace App\Services\Extraction\Strategies;

use App\Models\Document;
use App\Services\AI\PromptFactory;
use App\Services\Extraction\Contracts\ExtractionStrategyInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Smalot\PdfParser\Parser;

class TextStrategy implements ExtractionStrategyInterface
{
    public function __construct(
        private readonly PromptFactory $promptFactory
    ) {}

    public function supports(Document $document): bool
    {
        // This is the fallback strategy, so it supports everything that has text
        return str_contains($document->mime_type, 'pdf') || str_contains($document->mime_type, 'text/');
    }

    public function extract(Document $document, array $schema): array
    {
        Log::info('TextStrategy: Starting extraction', ['document_id' => $document->id]);

        $text = $this->extractText($document);

        Log::info('TextStrategy: Extracted text', ['length' => strlen($text)]);

        if (trim($text) === '') {
            Log::warning('TextStrategy: Extracted text is empty', ['document_id' => $document->id]);
            throw new \App\Exceptions\ExtractionException('extraction.empty_text');
        }

        return $this->processWithLLM($text, $schema);
    }

    private function extractText(Document $document): string
    {
        // Use document's storage_disk if set (for temp files), otherwise use default
        $diskName = $document->storage_disk ?? config('filesystems.default');
        $disk = Storage::disk($diskName);

        // For remote storage (R2, S3), download to temp location first
        $isRemote = ! in_array($diskName, ['local', 'public']);

        if ($isRemote) {
            $tempPath = storage_path('app/temp/'.basename($document->file_path));
            $tempDir = dirname($tempPath);

            if (! is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $content = $disk->get($document->file_path);
            if ($content === false || $content === null) {
                Log::error('TextStrategy: Failed to download file', ['path' => $document->file_path, 'disk' => $diskName]);
                throw new RuntimeException('Failed to download file from remote storage');
            }

            $written = file_put_contents($tempPath, $content);
            if ($written === false) {
                Log::error('TextStrategy: Failed to write temp file', ['path' => $tempPath]);
                throw new RuntimeException("Failed to write temp file: {$tempPath}");
            }

            chmod($tempPath, 0644);
            $path = $tempPath;
        } else {
            $path = $disk->path($document->file_path);
        }

        Log::info('TextStrategy: Processing file', [
            'path' => $path,
            'is_remote' => $isRemote,
            'exists' => file_exists($path),
            'size' => file_exists($path) ? filesize($path) : 0,
            'mime_type' => $document->mime_type,
        ]);

        try {
            if (str_contains($document->mime_type, 'pdf')) {
                $parser = new Parser;
                $pdf = $parser->parseFile($path);
                $text = $pdf->getText();
            } else {
                $text = file_get_contents($path);
            }

            return $text;
        } catch (\Exception $e) {
            Log::error('TextStrategy: Exception during parsing', ['error' => $e->getMessage()]);
            throw $e;
        } finally {
            // Cleanup temp file if we downloaded from remote storage
            if ($isRemote && isset($tempPath) && file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }
    }

    private function processWithLLM(string $text, array $schema): array
    {
        $apiKey = config('services.openai.api_key');
        $model = config('services.openai.model', 'gpt-4o-mini');

        $prompt = $this->promptFactory->createExtractionPrompt($text, $schema);

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::withToken($apiKey)
            ->timeout(120)
            ->withoutVerifying()
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $this->promptFactory->getSystemPrompt()],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.0,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('OpenAI API error: '.$response->body());
        }

        $content = $response->json('choices.0.message.content');
        $data = json_decode($content, true);

        return [
            'data' => $data['extracted_data'] ?? $data,
            'confidence' => $data['confidence'] ?? null,
            'raw_text' => $text,
        ];
    }
}
