<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DocumentType;
use App\Models\ReportConfiguration;
use App\Repositories\DocumentRepository;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Serviço para processamento de relatórios.
 *
 * Responsável por agregar dados, calcular métricas
 * e gerar visualizações baseadas nas configurações.
 *
 * Refatorado para usar Repository Pattern.
 */
final class ReportService
{
    public function __construct(
        private readonly DocumentRepository $documentRepository,
    ) {}

    /**
     * Gera dados do relatório baseado na configuração.
     */
    public function generateReport(ReportConfiguration $config): array
    {
        $documents = $config->getDocumentsQuery()->get();
        $documentType = $config->documentType;
        $fields = $documentType->fields ?? [];
        $fieldConfig = $config->field_config ?? [];

        $result = [
            'config' => [
                'id' => $config->id,
                'name' => $config->name,
                'description' => $config->description,
                'selection_mode' => $config->selection_mode,
                'date_grouping' => $config->date_grouping,
            ],
            'documentType' => [
                'id' => $documentType->id,
                'name' => $documentType->name,
                'fields' => $fields,
            ],
            'totalDocuments' => $documents->count(),
            'fields' => [],
            'rawData' => [],
            'groupedData' => [],
        ];

        // Process each field
        foreach ($fields as $field) {
            $fieldName = $field['name'];
            $fieldType = $field['type'] ?? 'string';
            $fieldLabel = $field['label'] ?? $fieldName;

            $fieldSettings = $fieldConfig[$fieldName] ?? [
                'visible' => true,
                'aggregation' => null,
                'chartType' => $this->getDefaultChartType($fieldType),
            ];

            if (! ($fieldSettings['visible'] ?? true)) {
                continue;
            }

            $values = $documents
                ->pluck('extracted_data')
                ->map(fn ($data) => $data[$fieldName] ?? null)
                ->filter(fn ($v) => $v !== null && $v !== '');

            $fieldResult = [
                'name' => $fieldName,
                'label' => $fieldLabel,
                'type' => $fieldType,
                'config' => $fieldSettings,
                'count' => $values->count(),
            ];

            // Apply aggregations based on field type
            if ($fieldType === 'number') {
                $numericValues = $values->map(fn ($v) => is_numeric($v) ? (float) $v : 0);
                $fieldResult['values'] = $numericValues->values()->toArray();
                $fieldResult['aggregations'] = $this->calculateNumericAggregations(
                    $numericValues,
                    $fieldSettings['aggregation'] ?? null
                );
            } elseif ($fieldType === 'date') {
                $fieldResult['values'] = $values->values()->toArray();
                $fieldResult['grouped'] = $this->groupByDate(
                    $values,
                    $config->date_grouping ?? 'month'
                );
            } else {
                // String/text fields
                $fieldResult['values'] = $values->values()->toArray();
                $fieldResult['distribution'] = $values
                    ->groupBy(fn ($v) => (string) $v)
                    ->map->count()
                    ->sortDesc()
                    ->take(15)
                    ->toArray();
                $fieldResult['uniqueCount'] = $values->unique()->count();
            }

            $result['fields'][$fieldName] = $fieldResult;
        }

        // Raw data for table view
        $result['rawData'] = $documents->map(fn ($doc) => [
            'id' => $doc->id,
            'name' => $doc->name,
            'data' => $doc->extracted_data,
            'created_at' => $doc->created_at?->toISOString(),
        ])->toArray();

        // Grouped data for time-series charts
        if ($config->date_grouping && $config->date_field) {
            $result['groupedData'] = $this->groupDataByDateField(
                $documents,
                $config->date_field,
                $config->date_grouping,
                $fields,
                $fieldConfig
            );
        }

        return $result;
    }

    /**
     * Gera preview com dados de amostra.
     */
    public function generatePreview(
        DocumentType $documentType,
        array $fieldConfig,
        string $selectionMode = 'all',
        ?string $dateFrom = null,
        ?string $dateTo = null,
        ?array $selectedDocumentIds = null,
        ?string $dateGrouping = null,
        ?string $dateField = null,
        int $limit = 10
    ): array {
        // Use repository to get completed documents
        $allDocuments = $this->documentRepository->getCompletedByDocumentType($documentType->id);

        // Apply filters
        if ($selectionMode === 'filtered') {
            $allDocuments = $allDocuments->filter(function ($doc) use ($dateFrom, $dateTo) {
                if ($dateFrom && $doc->created_at < $dateFrom) {
                    return false;
                }
                if ($dateTo && $doc->created_at > $dateTo) {
                    return false;
                }

                return true;
            });
        } elseif ($selectionMode === 'manual' && ! empty($selectedDocumentIds)) {
            $allDocuments = $allDocuments->whereIn('id', $selectedDocumentIds);
        }

        $documents = $allDocuments->take($limit);
        $totalCount = $allDocuments->count();
        $fields = $documentType->fields ?? [];

        $result = [
            'totalDocuments' => $totalCount,
            'previewCount' => $documents->count(),
            'fields' => [],
            'sampleData' => [],
        ];

        foreach ($fields as $field) {
            $fieldName = $field['name'];
            $fieldType = $field['type'] ?? 'string';
            $fieldLabel = $field['label'] ?? $fieldName;

            $fieldSettings = $fieldConfig[$fieldName] ?? ['visible' => true];

            if (! ($fieldSettings['visible'] ?? true)) {
                continue;
            }

            $values = $documents
                ->pluck('extracted_data')
                ->map(fn ($data) => $data[$fieldName] ?? null)
                ->filter(fn ($v) => $v !== null && $v !== '');

            $fieldResult = [
                'name' => $fieldName,
                'label' => $fieldLabel,
                'type' => $fieldType,
                'sampleValues' => $values->take(5)->values()->toArray(),
            ];

            if ($fieldType === 'number') {
                $numericValues = $values->map(fn ($v) => is_numeric($v) ? (float) $v : 0);
                $fieldResult['preview'] = [
                    'sum' => $numericValues->sum(),
                    'avg' => $numericValues->avg(),
                    'count' => $numericValues->count(),
                ];
            } elseif ($fieldType === 'string') {
                $fieldResult['preview'] = [
                    'uniqueCount' => $values->unique()->count(),
                    'topValues' => $values->groupBy(fn ($v) => (string) $v)
                        ->map->count()
                        ->sortDesc()
                        ->take(3)
                        ->toArray(),
                ];
            }

            $result['fields'][$fieldName] = $fieldResult;
        }

        $result['sampleData'] = $documents->map(fn ($doc) => [
            'id' => $doc->id,
            'name' => $doc->name,
            'data' => $doc->extracted_data,
            'created_at' => $doc->created_at?->format('d/m/Y'),
        ])->toArray();

        return $result;
    }

    private function calculateNumericAggregations(Collection $values, ?string $aggregationType): array
    {
        $result = [
            'sum' => $values->sum(),
            'avg' => $values->avg(),
            'min' => $values->min(),
            'max' => $values->max(),
            'count' => $values->count(),
        ];

        // Calculate growth if requested
        if ($aggregationType === 'growth' && $values->count() >= 2) {
            $sorted = $values->values();
            $first = $sorted->first();
            $last = $sorted->last();

            if ($first != 0) {
                $result['growth'] = (($last - $first) / abs($first)) * 100;
            } else {
                $result['growth'] = $last > 0 ? 100 : 0;
            }
        }

        return $result;
    }

    private function groupByDate(Collection $values, string $grouping): array
    {
        return $values->groupBy(function ($date) use ($grouping) {
            try {
                $carbon = Carbon::parse($date);

                return match ($grouping) {
                    'day' => $carbon->format('Y-m-d'),
                    'month' => $carbon->format('Y-m'),
                    'year' => $carbon->format('Y'),
                    default => $carbon->format('Y-m'),
                };
            } catch (\Exception $e) {
                return 'unknown';
            }
        })->map->count()->sortKeys()->toArray();
    }

    private function groupDataByDateField(
        Collection $documents,
        string $dateField,
        string $grouping,
        array $fields,
        array $fieldConfig
    ): array {
        $grouped = $documents->groupBy(function ($doc) use ($dateField, $grouping) {
            $date = $doc->extracted_data[$dateField] ?? $doc->created_at;
            try {
                $carbon = Carbon::parse($date);

                return match ($grouping) {
                    'day' => $carbon->format('Y-m-d'),
                    'month' => $carbon->format('Y-m'),
                    'year' => $carbon->format('Y'),
                    default => $carbon->format('Y-m'),
                };
            } catch (\Exception $e) {
                return 'unknown';
            }
        });

        $result = [];
        foreach ($grouped as $period => $docs) {
            $periodData = ['period' => $period, 'count' => $docs->count()];

            foreach ($fields as $field) {
                $fieldName = $field['name'];
                $fieldType = $field['type'] ?? 'string';
                $settings = $fieldConfig[$fieldName] ?? [];

                if (! ($settings['visible'] ?? true)) {
                    continue;
                }

                if ($fieldType === 'number') {
                    $values = $docs->pluck('extracted_data')
                        ->map(fn ($data) => is_numeric($data[$fieldName] ?? null) ? (float) $data[$fieldName] : 0);

                    $aggregation = $settings['aggregation'] ?? 'sum';
                    $periodData[$fieldName] = match ($aggregation) {
                        'sum' => $values->sum(),
                        'avg' => $values->avg(),
                        'count' => $values->count(),
                        default => $values->sum(),
                    };
                }
            }

            $result[] = $periodData;
        }

        return collect($result)->sortBy('period')->values()->toArray();
    }

    private function getDefaultChartType(string $fieldType): string
    {
        return match ($fieldType) {
            'number' => 'bar',
            'date' => 'line',
            default => 'pie',
        };
    }
}
