<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\AnalyzeDocument;
use App\Actions\Documents\ExtractFromUploadedFileAction;
use App\Http\Controllers\Controller;
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
        private readonly AnalyzeDocument $analyzeAction,
        private readonly ExtractFromUploadedFileAction $extractAction,
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
     * Uses Vision Strategy for images and Text Strategy for PDFs.
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
            $user = auth()->user();

            // Call the extraction action
            $result = $this->extractAction->execute($user, $file, $fields);

            if ($result['success']) {
                return response()->json($result);
            }

            return response()->json($result, 200);

        } catch (\App\Exceptions\ExtractionException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getTranslatedMessage(),
            ], 422);
        } catch (\JsonException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Formato de campos inválido. Por favor, tente novamente.',
            ], 422);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => __('extraction.failed'), // Generic translated error
                'debug' => config('app.debug') ? $e->getMessage() : null,
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
            'fields.*.type' => 'required|string|in:string,number,date,email,phone,currency,array,boolean',
            'fields.*.items' => 'array|nullable',  // For array fields
            'fields.*.items.*.name' => 'required_with:fields.*.items|string',
            'fields.*.items.*.label' => 'required_with:fields.*.items|string',
            'fields.*.items.*.type' => 'required_with:fields.*.items|string|in:string,number,date',
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
