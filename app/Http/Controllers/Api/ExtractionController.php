<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExtractionService;
use App\Services\FieldDetectorService;
use App\Services\TextExtractorManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Controller para API de extração de dados de documentos.
 *
 * Fornece endpoints para análise e extração de dados
 * de documentos PDF e imagens usando IA.
 */
final class ExtractionController extends Controller
{
    private const MAX_FILE_SIZE = 10240;

    private const ALLOWED_MIMES = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

    public function __construct(
        private readonly TextExtractorManager $textExtractor,
        private readonly FieldDetectorService $fieldDetector,
        private readonly ExtractionService $extractionService,
    ) {}

    /**
     * Analisa um documento e detecta campos extraíveis.
     *
     * @param  Request  $request  Request com o ficheiro
     * @return JsonResponse Campos sugeridos e preview do texto
     */
    public function analyze(Request $request): JsonResponse
    {
        $this->validateFile($request);

        try {
            /** @var UploadedFile $file */
            $file = $request->file('file');
            $text = $this->textExtractor->extract($file);

            if ($text === '') {
                return $this->successResponse(
                    $this->fieldDetector->getDefaultFields(),
                    ''
                );
            }

            $suggestedFields = $this->fieldDetector->detect($text);

            return $this->successResponse(
                $suggestedFields,
                mb_substr($text, 0, 1000)
            );
        } catch (Throwable $e) {
            Log::error('Document analysis failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return $this->successResponse(
                $this->fieldDetector->getDefaultFields(),
                '',
                $e->getMessage()
            );
        }
    }

    /**
     * Extrai dados estruturados de um documento.
     *
     * @param  Request  $request  Request com ficheiro e campos
     * @return JsonResponse Dados extraídos
     */
    public function extract(Request $request): JsonResponse
    {
        $validated = $this->validateFileAndFields($request);

        try {
            /** @var UploadedFile $file */
            $file = $request->file('file');
            $fields = json_decode($validated['fields'], true, 512, JSON_THROW_ON_ERROR);

            $text = $this->textExtractor->extract($file);

            if ($text === '') {
                $text = "Documento: {$file->getClientOriginalName()}";
            }

            $result = $this->extractionService->extract($text, ['fields' => $fields]);

            return response()->json([
                'success' => true,
                'extracted_data' => $result['data'] ?? $result,
                'confidence' => $result['confidence'] ?? null,
                'raw_text_preview' => mb_substr($text, 0, 500),
            ]);
        } catch (Throwable $e) {
            Log::error('Extraction failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            // Mensagens de erro mais amigáveis
            $userMessage = match (true) {
                str_contains($e->getMessage(), 'Secured pdf') => 'O PDF está protegido/encriptado. Por favor, remova a proteção antes de enviar.',
                str_contains($e->getMessage(), 'password') => 'O PDF requer senha. Por favor, envie um PDF sem proteção.',
                default => "Erro ao extrair dados: {$e->getMessage()}",
            };

            return response()->json([
                'success' => false,
                'error' => $userMessage,
            ], 422); // 422 Unprocessable Entity em vez de 500
        }
    }

    /**
     * Valida o ficheiro do request.
     */
    private function validateFile(Request $request): array
    {
        return $request->validate([
            'file' => sprintf(
                'required|file|mimes:%s|max:%d',
                implode(',', self::ALLOWED_MIMES),
                self::MAX_FILE_SIZE
            ),
        ]);
    }

    /**
     * Valida o ficheiro e campos do request.
     */
    private function validateFileAndFields(Request $request): array
    {
        return $request->validate([
            'file' => sprintf(
                'required|file|mimes:%s|max:%d',
                implode(',', self::ALLOWED_MIMES),
                self::MAX_FILE_SIZE
            ),
            'fields' => 'required|json',
        ]);
    }

    /**
     * Retorna resposta de sucesso para análise.
     *
     * @param  array  $fields  Campos detectados
     * @param  string  $textPreview  Preview do texto
     * @param  string|null  $error  Mensagem de erro opcional
     */
    private function successResponse(array $fields, string $textPreview, ?string $error = null): JsonResponse
    {
        $response = [
            'success' => true,
            'suggested_fields' => $fields,
            'raw_text_preview' => $textPreview,
        ];

        if ($error !== null) {
            $response['error'] = $error;
        }

        return response()->json($response);
    }
}
