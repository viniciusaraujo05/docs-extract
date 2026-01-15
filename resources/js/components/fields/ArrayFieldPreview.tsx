import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrayFieldInput } from './ArrayFieldInput';
import { Table as TableIcon, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ArrayFieldPreviewProps {
    field: {
        name: string;
        label: string;
        items: Array<{ name: string; label: string; type: string }>;
    };
    value: Array<Record<string, any>>;
    onChange: (value: Array<Record<string, any>>) => void;
}

/**
 * Compact preview of array field with modal editor.
 * 
 * Shows just a summary (e.g., "3 rows") and opens a modal
 * with the full table editor when clicked.
 */
export function ArrayFieldPreview({ field, value, onChange }: ArrayFieldPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);
    const rowCount = value?.length || 0;
    const colCount = field.items?.length || 0;

    return (
        <>
            {/* Compact Preview Button */}
            <Button
                variant="outline"
                className="w-full justify-between h-auto py-2 px-3"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                        {rowCount === 0 
                            ? 'Empty table' 
                            : `${rowCount} row${rowCount !== 1 ? 's' : ''}`}
                    </span>
                    {colCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {colCount} column{colCount !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>

            {/* Full Table Editor Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TableIcon className="h-5 w-5 text-primary" />
                            {field.label}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <ArrayFieldInput
                            field={field}
                            value={value}
                            onChange={(newValue) => {
                                onChange(newValue);
                                // Don't close modal on change, let user continue editing
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
