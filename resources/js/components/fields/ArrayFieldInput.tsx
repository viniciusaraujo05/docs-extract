import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export interface FieldItem {
  name: string;
  type: string;
  label: string;
}

export interface ArrayField {
  name: string;
  label: string;
  items: FieldItem[];
}

interface ArrayFieldInputProps {
  field: ArrayField;
  value: Array<Record<string, any>>;
  onChange: (value: Array<Record<string, any>>) => void;
  disabled?: boolean;
}

/**
 * Editable table component for array-type fields.
 *
 * Allows users to add, remove, and edit rows of structured data
 * (e.g., invoice line items, receipt items).
 */
export function ArrayFieldInput({ 
  field, 
  value = [], 
  onChange, 
  disabled = false 
}: ArrayFieldInputProps) {
  const addRow = () => {
    const newRow: Record<string, any> = {};
    field.items.forEach(item => {
      newRow[item.name] = item.type === 'number' ? 0 : '';
    });
    onChange([...value, newRow]);
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, itemName: string, itemValue: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [itemName]: itemValue };
    onChange(updated);
  };

  const getInputType = (type: string): string => {
    switch (type) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      default:
        return 'text';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {field.label}
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={disabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {field.items.map(item => (
                    <th 
                      key={item.name} 
                      className="px-4 py-2 text-left text-sm font-medium text-foreground"
                    >
                      {item.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {value.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-border">
                    {field.items.map(item => (
                      <td key={item.name} className="px-4 py-2">
                        <input
                          type={getInputType(item.type)}
                          value={row[item.name] ?? ''}
                          onChange={(e) => {
                            const val = item.type === 'number' 
                              ? parseFloat(e.target.value) || 0
                              : e.target.value;
                            updateRow(rowIndex, item.name, val);
                          }}
                          className="w-full px-2 py-1.5 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          disabled={disabled}
                          step={item.type === 'number' ? '0.01' : undefined}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(rowIndex)}
                        disabled={disabled}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                        <span className="sr-only">Remove row</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No items yet. Click "Add Row" to start.
          </p>
        </div>
      )}
    </div>
  );
}
