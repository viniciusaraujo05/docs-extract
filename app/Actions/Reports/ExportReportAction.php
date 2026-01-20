<?php

declare(strict_types=1);

namespace App\Actions\Reports;

use App\Models\DocumentType;
use Illuminate\Database\Eloquent\Collection;

/**
 * Action para exportar relatório em CSV.
 *
 * Encapsula a lógica de geração de arquivo CSV.
 */
final readonly class ExportReportAction
{
    /**
     * Gera o conteúdo CSV do relatório.
     */
    public function execute(Collection $documents, array $fields): string
    {
        $output = fopen('php://temp', 'r+');
        $this->writeToHandle($output, $documents, $fields);
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Escreve os dados CSV num resource handle (para streaming).
     *
     * @param  resource  $handle
     */
    public function writeToHandle($handle, Collection $documents, array $fields): void
    {
        // Header row
        $headers = ['ID', 'Nome do Documento', 'Data de Criação'];
        foreach ($fields as $field) {
            $headers[] = $field['label'] ?? $field['name'];
        }
        fputcsv($handle, $headers);

        // Data rows
        foreach ($documents as $doc) {
            $row = [
                $doc->id,
                $doc->name,
                $doc->created_at?->format('d/m/Y H:i'),
            ];

            $extractedData = $doc->extracted_data ?? [];
            foreach ($fields as $field) {
                $value = $extractedData[$field['name']] ?? '';

                if (is_array($value) || is_object($value)) {
                    $value = json_encode($value, JSON_UNESCAPED_UNICODE);
                }

                $row[] = $value;
            }

            fputcsv($handle, $row);
        }
    }

    /**
     * Gera o nome do arquivo CSV.
     */
    public function generateFilename(DocumentType $documentType): string
    {
        return sprintf(
            '%s_export_%s.csv',
            str_replace(' ', '_', strtolower($documentType->name)),
            now()->format('Y-m-d_H-i-s')
        );
    }
}
