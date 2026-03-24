/**
 * TableFieldViewer - Component to display and interact with a single table field
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ExportDataButton } from '@/components/export-data-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table';
import { ChevronDown, ChevronUp, Download, Table as TableIcon, TrendingUp } from 'lucide-react';
import type { TableFieldData } from '@/types/report';
import { formatTableValue } from '@/utils/tableFieldProcessor';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface TableFieldViewerProps {
    tableData: TableFieldData;
    defaultExpanded?: boolean;
    variant?: 'default' | 'aggregated';
}

export function TableFieldViewer({ tableData, defaultExpanded = false, variant = 'default' }: TableFieldViewerProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(defaultExpanded);

    const exportData = useMemo(() => {
        const rows = tableData.rows.map((row, index) => {
            const exportRow: Record<string, unknown> = {
                '#': index + 1,
            };

            tableData.columns.forEach(column => {
                exportRow[column.label] = formatTableValue(row[column.name], column.type);
            });

            return exportRow;
        });

        // Add aggregations row
        if (Object.keys(tableData.aggregations).length > 0) {
            const totalsRow: Record<string, unknown> = {
                '#': 'TOTAL',
            };

            tableData.columns.forEach(column => {
                const agg = tableData.aggregations[column.name];
                if (agg && agg.sum !== undefined) {
                    totalsRow[column.label] = formatTableValue(agg.sum, column.type);
                } else if (agg) {
                    totalsRow[column.label] = '-';
                } else {
                    totalsRow[column.label] = '';
                }
            });

            rows.push(totalsRow);
        }
        
        return rows;
    }, [tableData]);

    const hasNumericAggregations = tableData.columns.some(
        col => col.type === 'number' && tableData.aggregations[col.name]?.sum !== undefined
    );

    return (
        <Card className={variant === 'aggregated' ? 'border-primary/50 shadow-md' : ''}>
            <CardHeader 
                className={`cursor-pointer ${
                    variant === 'aggregated' 
                        ? 'bg-primary/5 rounded-t-lg border-b border-primary/10' 
                        : ''
                }`} 
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            variant === 'aggregated' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                            {variant === 'aggregated' ? <TrendingUp className="h-5 w-5" /> : <TableIcon className="h-5 w-5" />}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{tableData.label}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <span>{tableData.rows.length} {t('rows')}</span>
                                <span>•</span>
                                <span>{tableData.columns.length} {t('columns')}</span>
                                <span>•</span>
                                <span>{tableData.documentCount} {t('documents')}</span>
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportDataButton
                            data={exportData}
                            filename={`${tableData.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`}
                            variant="outline"
                            size="sm"
                        />
                        {expanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                </div>
            </CardHeader>

            {expanded && (
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    {tableData.columns.map((column) => (
                                        <TableHead key={column.name}>
                                            <div className="flex items-center gap-2">
                                                <span>{column.label}</span>
                                                {column.type === 'number' && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {t('Number')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableData.rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={tableData.columns.length + 1}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            {t('No data available')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tableData.rows.slice(0, 100).map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            {tableData.columns.map((column) => (
                                                <TableCell key={column.name}>
                                                    {formatTableValue(row[column.name], column.type)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>

                            {hasNumericAggregations && tableData.rows.length > 0 && (
                                <TableFooter>
                                    <TableRow className="bg-muted/50 font-semibold">
                                        <TableCell>{t('Total')}</TableCell>
                                        {tableData.columns.map((column) => {
                                            const agg = tableData.aggregations[column.name];
                                            if (column.type === 'number' && agg?.sum !== undefined) {
                                                return (
                                                    <TableCell key={column.name}>
                                                        <div className="space-y-1">
                                                            <div>{formatTableValue(agg.sum, 'number')}</div>
                                                            {agg.avg !== undefined && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {t('Avg')}: {formatTableValue(agg.avg, 'number')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                );
                                            }
                                            return <TableCell key={column.name}>-</TableCell>;
                                        })}
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </div>

                    {tableData.rows.length > 100 && (
                        <p className="text-sm text-muted-foreground mt-4 text-center">
                            {t('Showing first 100 rows of')} {tableData.rows.length}.{' '}
                            {t('Export to see all data')}.
                        </p>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
