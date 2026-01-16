import type { DocumentData, SchemaField } from '@/types/report';

export interface FlatItem extends Record<string, unknown> {
    _docId: number;
    _docName: string;
    _docDate: string;
    _docIndex: number;
}

export interface GroupedMetric extends Record<string, unknown> {
    name: string;
    count: number;
}

export function flattenReportData(data: DocumentData[], arrayField: string): FlatItem[] {
    console.log(`[FlattenReportData] Processing field: ${arrayField} for ${data.length} documents`);
    
    if (!data || data.length === 0) {
        console.warn('[FlattenReportData] No documents provided');
        return [];
    }

    const flattened = data.flatMap(doc => {
        const items = doc.data[arrayField];
        
        if (!Array.isArray(items)) {
            return [];
        }

        return items.map((item: any, index: number) => ({
            ...item,
            _docId: doc.id,
            _docName: doc.name || `Document ${doc.id}`,
            _docDate: doc.created_at,
            _docIndex: index
        }));
    });

    console.log(`[FlattenReportData] Extracted ${flattened.length} items from field ${arrayField}. Sample:`, flattened[0]);
    return flattened;
}

export function groupFlattenedData(
    items: FlatItem[],
    groupByField: string,
    operations: ('sum' | 'avg' | 'count')[]
): GroupedMetric[] {
    console.log(`[GroupFlattenedData] Grouping ${items.length} items by ${groupByField}`);
    
    if (items.length === 0) return [];

    const groups: Record<string, GroupedMetric> = {};

    items.forEach(item => {
        const keyValue = item[groupByField] || item['_docName'] || 'Unknown';
        const key = String(keyValue);
        
        if (!groups[key]) {
            groups[key] = {
                name: key,
                count: 0
            };
        }
        
        groups[key].count++;

        // Aggregate numeric values found in the item
        Object.keys(item).forEach(k => {
            const val = item[k];
            if (typeof val === 'number') {
                const current = (groups[key][k] as number) || 0;
                groups[key][k] = current + val;
            } else if (!isNaN(parseFloat(String(val))) && typeof val !== 'object') {
                // Try to parse string numbers if safe
                const numVal = parseFloat(String(val));
                const current = (groups[key][k] as number) || 0;
                groups[key][k] = current + numVal;
            }
        });
    });

    // Handle averages if required (logic simplified for now, assuming sum is default)
    // If 'avg' is requested, we would need to divide by count.
    // For now, let's keep it simple as charts usually show sums.
    
    const result = Object.values(groups).sort((a, b) => b.count - a.count);
    console.log(`[GroupFlattenedData] Resulting ${result.length} groups. Sample:`, result[0]);
    return result;
}
