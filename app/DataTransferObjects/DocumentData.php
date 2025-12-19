<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

/**
 * DTO para transferência de dados de documento.
 *
 * Encapsula os dados necessários para criar/atualizar documentos.
 */
final readonly class DocumentData
{
    public function __construct(
        public string $type,
        public ?int $documentTypeId,
        public ?string $newTypeName,
        public ?array $schema,
        public ?array $extractedData,
    ) {
    }

    /**
     * Cria DTO a partir de request.
     */
    public static function fromRequest(array $data): self
    {
        $documentTypeId = $data['document_type_id'] ?? null;

        return new self(
            type: $data['type'] ?? 'custom',
            documentTypeId: $documentTypeId !== null && $documentTypeId !== '' ? (int) $documentTypeId : null,
            newTypeName: $data['new_type_name'] ?? null,
            schema: isset($data['schema']) ? self::parseJson($data['schema']) : null,
            extractedData: isset($data['extracted_data']) ? self::parseJson($data['extracted_data']) : null,
        );
    }

    /**
     * Parse JSON com fallback.
     */
    private static function parseJson(?string $json): ?array
    {
        if ($json === null || $json === '') {
            return null;
        }

        try {
            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }
    }
}
