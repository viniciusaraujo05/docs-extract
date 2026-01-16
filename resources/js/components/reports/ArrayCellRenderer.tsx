import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Table2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatTableValue } from '@/utils/tableFieldProcessor';
import type { SchemaField } from '@/types/report';

interface ArrayCellRendererProps {
    value: unknown;
    field: SchemaField;
    docName: string;
}

export function ArrayCellRenderer({ value, field, docName }: ArrayCellRendererProps) {
    const { t } = useTranslation();
    
    // Ensure value is an array
    const items = Array.isArray(value) ? value : [];
    
    // If empty or not array, show dash
    if (items.length === 0) {
        return <span className="text-muted-foreground">-</span>;
    }

    // Get columns configuration from field items or infer from data
    const columns = field.items || [];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 font-normal"
                >
                    <Table2 className="mr-2 h-3.5 w-3.5" />
                    <span>{items.length} {items.length === 1 ? t('item') : t('items')}</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[800px] sm:max-w-[100vw] sm:w-[800px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <Table2 className="h-5 w-5 text-primary" />
                        {field.label}
                    </SheetTitle>
                    <SheetDescription>
                        {t('Viewing details for')} <span className="font-medium text-foreground">{docName}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                {columns.length > 0 ? (
                                    columns.map((col) => (
                                        <TableHead key={col.name}>{col.label}</TableHead>
                                    ))
                                ) : (
                                    // Fallback if no columns defined: show keys of first item
                                    items.length > 0 && Object.keys(items[0] || {}).map(key => (
                                        <TableHead key={key}>{key}</TableHead>
                                    ))
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell className="text-muted-foreground font-medium">
                                        {idx + 1}
                                    </TableCell>
                                    {columns.length > 0 ? (
                                        columns.map((col) => (
                                            <TableCell key={col.name}>
                                                {formatTableValue(item[col.name], col.type)}
                                            </TableCell>
                                        ))
                                    ) : (
                                        // Fallback rendering
                                        Object.keys(item || {}).map(key => (
                                            <TableCell key={key}>
                                                {String(item[key])}
                                            </TableCell>
                                        ))
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground text-center">
                    {t('Total of')} {items.length} {t('rows')}
                </div>
            </SheetContent>
        </Sheet>
    );
}
