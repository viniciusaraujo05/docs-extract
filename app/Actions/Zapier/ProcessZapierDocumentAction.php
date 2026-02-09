<?php

declare(strict_types=1);

namespace App\Actions\Zapier;

use App\Models\Document;
use App\Models\DocumentType;
use App\Services\DocumentService;
use App\Services\ZapierTemplateService;
use Illuminate\Http\Request;

/**
 * Action for processing documents via Zapier.
 * Handles template management and document processing.
 */
class ProcessZapierDocumentAction
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly ZapierTemplateService $templateService
    ) {}

    /**
     * Execute the action.
     *
     * @return array{document: Document, template_created: bool, created_template: ?DocumentType}
     */
    public function execute(
        Request $request,
        Document $document,
        ?DocumentType $existingDocumentType,
        string $tempPath,
        string $filename,
        string $mimeType,
        string $fileContents,
        array $validated
    ): array {
        $createdTemplate = null;
        $documentType = $existingDocumentType; // Initialize with passed value

        // PRIORIDADE 1: Se já tem Document Type (selecionado no dropdown), usa ele e ignora o resto
        if ($existingDocumentType) {
            $this->associateDocumentWithTemplate($document, $documentType);
        }
        // PRIORIDADE 2: Se não tem, e pediu para salvar como template (ou usar pelo nome)
        elseif (($validated['save_as_template'] ?? false) && ! empty($validated['template_name'])) {
            // Check if template already exists by name
            $existingTemplate = $this->templateService->findByName(
                $request->user(),
                $validated['template_name']
            );

            if ($existingTemplate) {
                // Use existing template found by name
                $documentType = $existingTemplate;
                $this->associateDocumentWithTemplate($document, $documentType);
            } else {
                // Create new template using AI field detection
                $createdTemplate = $this->templateService->createFromDocument(
                    $request->user(),
                    $tempPath,
                    $filename,
                    $mimeType,
                    $fileContents,
                    $validated['template_name']
                );

                if ($createdTemplate) {
                    $documentType = $createdTemplate;
                    $this->associateDocumentWithTemplate($document, $documentType);
                }
            }
        }

        // Process document (with or without template)
        $processed = $this->documentService->processDocument($document);

        // If no template, create schema from extracted data
        if (! $documentType && $processed->extracted_data) {
            $detectedFields = $this->templateService->createFieldsFromExtractedData($processed->extracted_data);
            $processed->update([
                'schema_used' => ['fields' => $detectedFields],
            ]);
            $processed->refresh();
        }

        return [
            'document' => $processed,
            'template_created' => $createdTemplate !== null,
            'created_template' => $createdTemplate,
        ];
    }

    /**
     * Associate document with template.
     */
    private function associateDocumentWithTemplate(Document $document, DocumentType $template): void
    {
        $document->update([
            'document_type_id' => $template->id,
            'type' => 'predefined',
            'schema_used' => ['fields' => $template->fields],
        ]);
        $document->refresh();
    }
}
