import type { ArrayField } from './ArrayFieldInput';

interface ArrayFieldDisplayProps {
  field: ArrayField;
  value: Array<Record<string, any>>;
}

/**
 * Read-only table display for array-type fields.
 *
 * Used in reports and read-only views to show structured array data.
 */
export function ArrayFieldDisplay({ field, value = [] }: ArrayFieldDisplayProps) {
  if (value.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No {field.label.toLowerCase()} found
      </div>
    );
  }

  const formatValue = (val: any, type: string): string => {
    if (val === null || val === undefined) {
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

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">{field.label}</h4>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {field.items.map(item => (
                  <th 
                    key={item.name} 
                    className="px-3 py-2 text-left font-medium text-foreground"
                  >
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.map((row, idx) => (
                <tr key={idx} className="border-t border-border">
                  {field.items.map(item => (
                    <td 
                      key={item.name} 
                      className="px-3 py-2 text-foreground"
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
      <div className="text-xs text-muted-foreground">
        {value.length} {value.length === 1 ? 'item' : 'items'}
      </div>
    </div>
  );
}
