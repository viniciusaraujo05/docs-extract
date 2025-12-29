<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\AnalyzeDocument;
use App\Actions\ExtractDocumentData;
use App\Actions\FormatErrorMessage;
use App\Http\Controllers\Controller;
use App\Services\DocumentExtractionService;
use App\Services\FieldDetectorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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
        private readonly FieldDetectorService $fieldDetector,
        private readonly DocumentExtractionService $extractionService,
        private readonly AnalyzeDocument $analyzeAction,
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
            
            $result = $this->analyzeAction->execute($file);
            
            return $this->successResponse(
                $result['fields'],
                $result['text'],
                $result['message']
            );
            
        } catch (Throwable $e) {
            return $this->successResponse(
                $this->fieldDetector->getDefaultFields(),
                '',
                $e->getMessage()
            );
        }
    }

    /**
     * Extracts structured data from a document.
     * 
     * Attempts normal extraction first, then tries PDF to image conversion
     * if the initial extraction fails and the file is a PDF.
     */
    public function extract(Request $request): JsonResponse
    {
        // Parse fields before validation
        $fields = $request->get('fields');
        if (is_string($fields)) {
            $fields = json_decode($fields, true, 512, JSON_THROW_ON_ERROR);
            $request->merge(['fields' => $fields]);
        }
        
        $validated = $this->validateFileAndFields($request);
        
        try {
            /** @var UploadedFile $file */
            $file = $request->file('file');
            $fields = $validated['fields'];
            
            $result = $this->extractionService->extract($file, $fields);
            
            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'extracted_data' => $result['data'],
                    'confidence' => $result['confidence'],
                    'raw_text_preview' => $result['raw_text_preview'] ?? '',
                    'conversion_note' => $result['conversion_note'] ?? null,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => $result['error'],
                    'error_type' => $result['error_type'] ?? 'processing_error',
                    'suggestions' => $result['suggestions'] ?? [],
                ], 200);
            }
            
        } catch (\JsonException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Formato de campos inválido. Por favor, tente novamente.',
            ], 422);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erro ao processar documento. Tente novamente.',
            ], 500);
        }
    }

    /**
     * Parses fields from request data.
     */
    private function parseFields(mixed $fields): array
    {
        return is_string($fields)
            ? json_decode($fields, true, 512, JSON_THROW_ON_ERROR)
            : $fields;
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
            'fields' => 'required|array',
            'fields.*.name' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|string|in:string,number,date,email,phone,currency',
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
