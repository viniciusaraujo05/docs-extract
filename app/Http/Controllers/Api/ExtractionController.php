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
    private const MAX_FILE_SIZE = 10240; // 10MB

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

            // Aceita fields como array ou JSON string
            $fields = is_string($validated['fields'])
                ? json_decode($validated['fields'], true, 512, JSON_THROW_ON_ERROR)
                : $validated['fields'];

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
        } catch (\JsonException $e) {
            Log::error('Invalid JSON in fields', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Formato de campos inválido. Por favor, tente novamente.',
            ], 422);
        } catch (Throwable $e) {
            Log::error('Extraction failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Mensagens de erro mais amigáveis
            $userMessage = match (true) {
                str_contains($e->getMessage(), 'Secured pdf') || str_contains($e->getMessage(), 'protegido') => 'O PDF está protegido/encriptado. Por favor, remova a proteção antes de enviar.',
                str_contains($e->getMessage(), 'password') || str_contains($e->getMessage(), 'senha') => 'O PDF requer senha. Por favor, envie um PDF sem proteção.',
                str_contains($e->getMessage(), 'corrompido') || str_contains($e->getMessage(), 'corrupt') => 'O arquivo parece estar corrompido. Por favor, tente outro arquivo.',
                str_contains($e->getMessage(), 'Imagick') => 'Não foi possível processar este PDF. Tente converter para imagem (JPG/PNG) antes de enviar.',
                default => 'Erro ao processar documento. Por favor, verifique se o arquivo não está protegido ou corrompido.',
            };

            return response()->json([
                'success' => false,
                'error' => $userMessage,
                'message' => $userMessage,
            ], 500); // 500 para erros de processamento, não 422
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
            'fields' => 'required', // Aceita array ou JSON string
        ], [
            'file.required' => 'Por favor, envie um documento.',
            'file.mimes' => 'Apenas arquivos PDF e imagens (JPG, PNG, WEBP) são suportados.',
            'file.max' => 'O arquivo não pode exceder 10MB.',
            'fields.required' => 'É necessário definir pelo menos um campo para extrair.',
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
