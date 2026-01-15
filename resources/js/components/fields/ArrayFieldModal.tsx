import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table as TableIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExportDataButton } from '@/components/export-data-button';
import { ArrayFieldInput } from './ArrayFieldInput';

interface ArrayFieldModalProps {
    field: {
        name: string;
        label: string;
        items: Array<{ name: string; label: string; type: string }>;
    };
    value: Array<Record<string, any>>;
    onChange?: (value: Array<Record<string, any>>) => void;
    readOnly?: boolean;
}

/**
 * Modal to display array field data in a table with export functionality.
 * Can be read-only (document view) or editable if onChange is provided.
 */
export function ArrayFieldModal({ field, value = [], onChange, readOnly = true }: ArrayFieldModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const isEditable = !readOnly && !!onChange;

    const formatValue = (val: any, type: string): string => {
        if (val === null || val === undefined || val === '') {
            return '-';
        }

        if (type === 'number') {
            return typeof val === 'number' ? val.toLocaleString() : String(val);
        }

        if (type === 'date') {
            try {
                return new Date(val).toLocaleDateString();
            } catch {
                return String(val);
            }
        }

        return String(val);
    };

    if (value.length === 0 && readOnly) {
        return (
            <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                {t('No items found')}
            </div>
        );
    }

    return (
        <>
            {/* Compact Button to Open Modal */}
            <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span>{value.length} {value.length === 1 ? 'item' : 'items'}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                    {isEditable ? t('Click to edit') : t('Click to view')}
                </span>
            </Button>

            {/* Modal with Full Table */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                <TableIcon className="h-5 w-5 text-primary" />
                                {field.label}
                            </DialogTitle>
                            <ExportDataButton
                                data={value}
                                filename={field.name}
                                variant="outline"
                                size="sm"
                            />
                        </div>
                    </DialogHeader>

                    <div className="mt-4">
                        {isEditable && onChange ? (
                            <ArrayFieldInput
                                field={field}
                                value={value}
                                onChange={onChange}
                            />
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                {field.items.map(item => (
                                                    <th
                                                        key={item.name}
                                                        className="px-4 py-3 text-left font-medium"
                                                    >
                                                        {item.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {value.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="border-t hover:bg-muted/30 transition-colors"
                                                >
                                                    {field.items.map(item => (
                                                        <td
                                                            key={item.name}
                                                            className="px-4 py-3"
                                                        >
                                                            {formatValue(row[item.name], item.type)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {!isEditable && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                {value.length} {value.length === 1 ? 'item' : 'items'} • {field.items.length} columns
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
