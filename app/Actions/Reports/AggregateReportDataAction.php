<?php

declare(strict_types=1);

namespace App\Actions\Reports;

use Illuminate\Database\Eloquent\Collection;

/**
 * Action para agregar dados de relatório.
 *
 * Encapsula a lógica de agregação de dados por campos.
 */
final readonly class AggregateReportDataAction
{
    /**
     * Agrega dados por campos.
     */
    public function execute(Collection $documents, array $fields): array
    {
        $aggregated = [];

        foreach ($fields as $field) {
            $fieldName = $field['name'];
            $fieldType = $field['type'] ?? 'string';
            $fieldLabel = $field['label'] ?? $fieldName;

            // Skip array fields - they are handled separately on the frontend
            if ($fieldType === 'array') {
                continue;
            }

            $values = $documents
                ->pluck('extracted_data')
                ->map(fn ($data) => $data[$fieldName] ?? null)
                ->filter(fn ($v) => $v !== null && $v !== '' && !is_array($v)); // Filter out arrays

            if ($values->isEmpty()) {
                continue;
            }

            $aggregated[$fieldName] = [
                'label' => $fieldLabel,
                'type' => $fieldType,
                'count' => $values->count(),
            ];

            if ($fieldType === 'number') {
                $aggregated[$fieldName] = array_merge(
                    $aggregated[$fieldName],
                    $this->aggregateNumericField($values)
                );
            } elseif ($fieldType === 'date') {
                $aggregated[$fieldName] = array_merge(
                    $aggregated[$fieldName],
                    $this->aggregateDateField($values)
                );
            } else {
                $aggregated[$fieldName] = array_merge(
                    $aggregated[$fieldName],
                    $this->aggregateStringField($values)
                );
            }
        }

        return $aggregated;
    }

    /**
     * Agrega campo numérico.
     */
    private function aggregateNumericField($values): array
    {
        $numericValues = $values->map(fn ($v) => is_numeric($v) ? (float) $v : 0);

        return [
            'sum' => $numericValues->sum(),
            'avg' => $numericValues->avg(),
            'min' => $numericValues->min(),
            'max' => $numericValues->max(),
            'values' => $numericValues->values()->toArray(),
        ];
    }

    /**
     * Agrega campo de data.
     */
    private function aggregateDateField($values): array
    {
        $byMonth = $values->groupBy(function ($date) {
            try {
                return \Carbon\Carbon::parse($date)->format('Y-m');
            } catch (\Exception) {
                return 'unknown';
            }
        })->map->count();

        return [
            'values' => $values->values()->toArray(),
            'byMonth' => $byMonth->toArray(),
        ];
    }

    /**
     * Agrega campo de texto.
     */
    private function aggregateStringField($values): array
    {
        $grouped = $values->groupBy(fn ($v) => (string) $v)->map->count();

        return [
            'distribution' => $grouped->sortDesc()->take(10)->toArray(),
            'uniqueCount' => $grouped->count(),
        ];
    }
}
