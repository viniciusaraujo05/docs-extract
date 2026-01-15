import { ArrayFieldInput, type ArrayField } from './ArrayFieldInput';
import { ArrayFieldDisplay } from './ArrayFieldDisplay';

interface FieldRendererProps {
  field: any;
  value: any;
  onChange?: (value: any) => void;
  readonly?: boolean;
}

/**
 * Example field renderer that detects array fields and uses appropriate components.
 *
 * This is a reference implementation showing how to integrate
 * ArrayFieldInput and ArrayFieldDisplay into your existing forms.
 */
export function FieldRenderer({ field, value, onChange, readonly = false }: FieldRendererProps) {
  // Handle array fields
  if (field.type === 'array') {
    const arrayField: ArrayField = {
      name: field.name,
      label: field.label || field.name,
      items: field.items || [],
    };

    if (readonly || !onChange) {
      return <ArrayFieldDisplay field={arrayField} value={value} />;
    }

    return (
      <ArrayFieldInput
        field={arrayField}
        value={value}
        onChange={onChange}
      />
    );
  }

  // Handle simple text fields
  if (field.type === 'string' || field.type === 'text') {
    if (readonly) {
      return <div className="text-sm">{value || '-'}</div>;
    }

    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
    );
  }

  // Handle number fields
  if (field.type === 'number') {
    if (readonly) {
      return <div className="text-sm">{value !== null ? value : '-'}</div>;
    }

    return (
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 border rounded"
      />
    );
  }

  // Handle date fields
  if (field.type === 'date') {
    if (readonly) {
      return <div className="text-sm">{value ? new Date(value).toLocaleDateString() : '-'}</div>;
    }

    return (
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
    );
  }

  // Fallback for unknown types
  return <div className="text-sm text-muted-foreground">Unknown field type: {field.type}</div>;
}

/**
 * Example usage in a document review form:
 *
 * ```tsx
 * function DocumentReviewForm({ schema, extractedData, onDataChange }) {
 *   return (
 *     <div className="space-y-6">
 *       {schema.fields.map((field) => (
 *         <div key={field.name}>
 *           <FieldRenderer
 *             field={field}
 *             value={extractedData[field.name]}
 *             onChange={(value) => onDataChange(field.name, value)}
 *           />
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
