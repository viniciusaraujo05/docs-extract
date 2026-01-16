/**
 * TablesView - Component to display all table fields in a report
 */

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableFieldViewer } from './TableFieldViewer';
import { extractTableFields, aggregateTableRows, calculateAggregations } from '@/utils/tableFieldProcessor';
import type { DocumentData, SchemaField } from '@/types/report';
import { Download, Table2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface TablesViewProps {
    documents: DocumentData[];
    fields: SchemaField[];
}

export function TablesView({ documents, fields }: TablesViewProps) {
    const { t } = useTranslation();

    const tableFields = useMemo(() => {
        return extractTableFields(documents, fields);
    }, [documents, fields]);

    const handleExportAll = () => {
        if (tableFields.length === 0) return;

        const workbook = XLSX.utils.book_new();

        tableFields.forEach((table) => {
            const exportData = table.rows.map((row, index) => {
                const exportRow: Record<string, unknown> = {
                    '#': index + 1,
                };

                table.columns.forEach(column => {
                    const value = row[column.name];
                    exportRow[column.label] = value !== null && value !== undefined ? String(value) : '';
                });

                return exportRow;
            });

            // Add aggregations row
            if (Object.keys(table.aggregations).length > 0) {
                const totalsRow: Record<string, unknown> = {
                    '#': 'TOTAL',
                };

                table.columns.forEach(column => {
                    const agg = table.aggregations[column.name];
                    if (agg && agg.sum !== undefined) {
                        totalsRow[column.label] = agg.sum;
                    } else {
                        totalsRow[column.label] = '';
                    }
                });

                exportData.push(totalsRow);
            }

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const sheetName = table.label.substring(0, 31); // Excel limit
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        const filename = `Tables_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);

        toast.success(t('All tables exported successfully!'));
    };

    const totalRows = useMemo(() => {
        return tableFields.reduce((sum, table) => sum + table.rows.length, 0);
    }, [tableFields]);

    const tablesWithAggregations = useMemo(() => {
        return tableFields.filter(table => 
            table.columns.some(col => 
                col.type === 'number' && table.aggregations[col.name]?.sum !== undefined
            )
        ).length;
    }, [tableFields]);

    if (tableFields.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                        <Table2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">{t('No tables found')}</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                        {t('This document type does not have any array/table fields, or the documents do not contain table data.')}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Table2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">
                                    {t('Table Fields Overview')}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Table2 className="h-4 w-4" />
                                        <span>
                                            {tableFields.length} {tableFields.length === 1 ? t('table') : t('tables')}
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-2">
                                        <span>
                                            {totalRows} {t('total rows')}
                                        </span>
                                    </div>
                                    {tablesWithAggregations > 0 && (
                                        <>
                                            <span>•</span>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>
                                                    {tablesWithAggregations} {t('with calculations')}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleExportAll} size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            {t('Export All Tables')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table Fields List */}
            <div className="space-y-12">
                {tableFields.map((table, index) => {
                    const aggregatedRows = aggregateTableRows(table.rows, table.columns);
                    const aggregatedStats = calculateAggregations(aggregatedRows, table.columns);
                    const aggregatedTable = {
                        ...table,
                        rows: aggregatedRows,
                        aggregations: aggregatedStats,
                        label: `${table.label} (${t('Consolidated View')})`
                    };

                    const hasDuplicates = table.rows.length > aggregatedRows.length;

                    return (
                        <div key={table.fieldName} className="space-y-6">
                            {/* Aggregated View (If duplicates exist or just as default summary) */}
                            <div className="relative">
                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent rounded-full opacity-50" />
                                <div className="mb-2 px-1">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('Consolidated Data')} {hasDuplicates && <Badge variant="outline" className="ml-2 bg-primary/5 text-primary border-primary/20">{t('Duplicates Merged')}</Badge>}
                                    </h4>
                                </div>
                                <TableFieldViewer
                                    tableData={aggregatedTable}
                                    defaultExpanded={index === 0}
                                    variant="aggregated"
                                />
                            </div>

                            {/* Detailed View */}
                            <div className="relative pl-4 border-l-2 border-dashed border-muted ml-2">
                                <div className="mb-2 px-1">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        {t('Detailed Records')}
                                        <Badge variant="secondary" className="text-[10px] h-5">{table.rows.length} {t('rows')}</Badge>
                                    </h4>
                                </div>
                                <TableFieldViewer
                                    tableData={{ ...table, label: `${table.label} (${t('Full Detail')})` }}
                                    defaultExpanded={false}
                                />
                            </div>
                            
                            {index < tableFields.length - 1 && <div className="h-px bg-border my-8" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
