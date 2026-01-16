<?php

declare(strict_types=1);

namespace App\Services\Extraction\Strategies;

use App\Models\Document;
use App\Services\Extraction\Contracts\ExtractionStrategyInterface;
use App\Services\AI\PromptFactory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use RuntimeException;
use Illuminate\Support\Facades\Log;

final class TextStrategy implements ExtractionStrategyInterface
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
        $text = $this->extractText($document);
        
        if (trim($text) === '') {
            throw new RuntimeException('No text could be extracted from the document.');
        }

        return $this->processWithLLM($text, $schema);
    }

    private function extractText(Document $document): string
    {
        $path = Storage::disk(config('filesystems.default'))->path($document->file_path);

        try {
            if (str_contains($document->mime_type, 'pdf')) {
                $parser = new Parser();
                $pdf = $parser->parseFile($path);
                return $pdf->getText();
            }
        } catch (\Exception $e) {
            Log::error("PDF Text extraction failed: " . $e->getMessage());
            // Fallback or rethrow? For now, rethrow as this is the TextStrategy
            throw $e;
        }

        return file_get_contents($path);
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

        if (!$response->successful()) {
            throw new RuntimeException('OpenAI API error: ' . $response->body());
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
