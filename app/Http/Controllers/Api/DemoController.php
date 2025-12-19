<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExtractionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DemoController extends Controller
{
    public function __construct(
        private ExtractionService $extractionService
    ) {}

    /**
     * Demo extraction endpoint - LIMITED TO 1 USE PER IP
     *
     * Security measures:
     * - Rate limiting: 1 request per IP per day
     * - File validation: MIME type, size, extension
     * - Temporary storage: Files deleted after processing
     * - IP tracking: Prevents abuse
     */
    public function extract(Request $request)
    {
        $ip = $request->ip();
        $usageKey = $this->usageKey($ip);
        $maxRequests = (int) config('demo.max_requests_per_window', 1);
        $windowSeconds = (int) config('demo.window_seconds', 86400);

        if ($this->hasExceededLimit($usageKey, $maxRequests)) {
            return response()->json([
                'error' => 'Demo limit reached',
                'message' => 'You have reached the demo limit for today. Please register to continue.',
                'retry_after_seconds' => $this->secondsUntilReset($usageKey),
            ], 429);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120', // 5MB max
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('file');

            // Store file temporarily
            $path = $file->store('demo', 'local');

            $text = $this->extractTextFromUploadedFile($file);

            $schema = $this->inferSchemaFromText($text);

            $result = $this->extractionService->extract($text, $schema);
            $extractedData = $result['data'];

            if (isset($result['confidence']) && is_int($result['confidence'])) {
                $extractedData['confidence'] = $result['confidence'];
            }

            // Delete temporary file
            Storage::disk('local')->delete($path);

            $this->incrementUsage($usageKey, $windowSeconds);

            // Log demo usage
            Log::info('Demo extraction used', [
                'ip' => $ip,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $extractedData,
                'message' => 'Data extracted successfully! Register to continue using GetData.',
            ]);

        } catch (\Exception $e) {
            // Clean up file if exists
            if (isset($path)) {
                Storage::disk('local')->delete($path);
            }

            Log::error('Demo extraction failed', [
                'ip' => $ip,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Extraction failed',
                'message' => 'An error occurred while processing your document. Please try again.',
            ], 500);
        }
    }

    private function extractTextFromUploadedFile(\Illuminate\Http\UploadedFile $file): string
    {
        $mime = $file->getMimeType();

        if ($mime === 'application/pdf') {
            $extractor = app(\App\Services\Extractors\PdfTextExtractor::class);

            return $extractor->extract($file);
        }

        $extractor = app(\App\Services\Extractors\ImageTextExtractor::class);

        return $extractor->extract($file);
    }

    /**
     * Infere dinamicamente um schema (lista de campos) a partir do texto do documento.
     *
     * @return array{fields: array<int, array{name: string, type: string, label?: string}>}
     */
    private function inferSchemaFromText(string $text): array
    {
        $apiKey = config('services.openai.api_key', '');

        if ($apiKey === '') {
            throw new \RuntimeException('OpenAI API key não configurada. Configure OPENAI_API_KEY no .env');
        }

        $model = config('services.openai.model', 'gpt-4o-mini');

        $prompt = <<<PROMPT
            Analise o documento abaixo e devolva APENAS um JSON válido com um array "fields".

            Regras:
            1) Campo "name": snake_case, curto e descritivo
            2) Campo "type": um destes valores: string|number|date|boolean
            3) Campo "label": opcional (texto humano)
            4) Inclua SOMENTE campos que realmente existam no documento
            5) Não invente campos

            Documento:
            {$text}

            Formato:
            {"fields":[{"name":"invoice_number","type":"string","label":"Invoice number"}]}
            PROMPT;

        $response = Http::withToken($apiKey)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => 'Você é um assistente de extração de campos. Responda SEMPRE em JSON válido, sem markdown.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.1,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Falha ao inferir schema: '.$response->status());
        }

        $content = $response->json('choices.0.message.content');
        if (! is_string($content) || $content === '') {
            throw new \RuntimeException('Schema vazio retornado pela IA');
        }

        try {
            $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new \RuntimeException('Schema inválido retornado pela IA');
        }

        $fields = $decoded['fields'] ?? null;
        if (! is_array($fields) || $fields === []) {
            // fallback mínimo (evita quebrar frontend)
            return ['fields' => [['name' => 'document_type', 'type' => 'string', 'label' => 'Document type']]];
        }

        // Sanitização básica do schema
        $normalized = [];
        foreach ($fields as $field) {
            if (! is_array($field)) {
                continue;
            }
            $name = $field['name'] ?? null;
            $type = $field['type'] ?? null;
            if (! is_string($name) || ! preg_match('/^[a-z][a-z0-9_]*$/', $name)) {
                continue;
            }
            if (! is_string($type) || ! in_array($type, ['string', 'number', 'date', 'boolean'], true)) {
                $type = 'string';
            }
            $label = $field['label'] ?? null;
            $normalizedField = ['name' => $name, 'type' => $type];
            if (is_string($label) && $label !== '') {
                $normalizedField['label'] = $label;
            }
            $normalized[] = $normalizedField;
        }

        if ($normalized === []) {
            return ['fields' => [['name' => 'document_type', 'type' => 'string', 'label' => 'Document type']]];
        }

        return ['fields' => $normalized];
    }

    /**
     * Check if IP can use demo
     */
    public function checkAvailability(Request $request)
    {
        $ip = $request->ip();
        $usageKey = $this->usageKey($ip);
        $maxRequests = (int) config('demo.max_requests_per_window', 1);

        $remaining = max(0, $maxRequests - $this->currentUsage($usageKey));

        return response()->json([
            'available' => $remaining > 0,
            'remaining_requests' => $remaining,
            'reset_in_seconds' => $this->secondsUntilReset($usageKey),
        ]);
    }

    private function usageKey(string $ip): string
    {
        return "demo:usage:{$ip}";
    }

    private function currentUsage(string $key): int
    {
        return (int) Cache::get($key, 0);
    }

    private function hasExceededLimit(string $key, int $maxRequests): bool
    {
        return $this->currentUsage($key) >= $maxRequests;
    }

    private function incrementUsage(string $key, int $windowSeconds): void
    {
        $count = (int) Cache::increment($key);

        if ($count === 1) {
            Cache::put($key, $count, $windowSeconds);
        }
    }

    private function secondsUntilReset(string $key): ?int
    {
        $expiresAt = Cache::get($key.':expires_at');
        if (is_int($expiresAt)) {
            return max(0, $expiresAt - time());
        }

        return null;
    }
}
