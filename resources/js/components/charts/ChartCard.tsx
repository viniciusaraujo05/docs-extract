import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    LineChart, 
    Line, 
    AreaChart, 
    Area,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    Cell
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Palette } from 'lucide-react';

export type ChartType = 'bar' | 'pie' | 'line' | 'area';

interface ChartCardProps {
    title: string;
    description?: string;
    data: Array<{ name: string; value: number }>;
    chartType: ChartType;
    onChartTypeChange: (type: ChartType) => void;
    color?: string;
    onColorChange?: (color: string) => void;
}

// Robust Palette using Hex values to ensure visibility
const COLORS = [
    '#3b82f6', // Blue-500
    '#ef4444', // Red-500
    '#10b981', // Emerald-500
    '#f59e0b', // Amber-500
    '#8b5cf6', // Violet-500
    '#ec4899', // Pink-500
    '#06b6d4', // Cyan-500
    '#84cc16', // Lime-500
    '#6366f1', // Indigo-500
    '#14b8a6', // Teal-500
];

const COLOR_PRESETS = [
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Verde', value: '#10b981' },
    { name: 'Laranja', value: '#f59e0b' },
    { name: 'Roxo', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Ciano', value: '#06b6d4' },
    { name: 'Lima', value: '#84cc16' },
    { name: 'Índigo', value: '#6366f1' },
    { name: 'Cinza', value: '#64748b' },
];

const chartTypeOptions = [
    { value: 'bar', label: 'Barras', icon: BarChart3 },
    { value: 'pie', label: 'Pizza', icon: PieChartIcon },
    { value: 'line', label: 'Linha', icon: LineChartIcon },
    { value: 'area', label: 'Área', icon: AreaChartIcon },
];

export function ChartCard({ 
    title, 
    description, 
    data, 
    chartType, 
    onChartTypeChange,
    color = '#3b82f6',
    onColorChange
}: ChartCardProps) {
    const renderChart = () => {
        if (!data || data.length === 0) {
            return (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Sem dados disponíveis
                </div>
            );
        }

        switch (chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                className="fill-muted-foreground"
                            />
                            <YAxis className="fill-muted-foreground" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill={color}
                                dataKey="value"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                className="fill-muted-foreground"
                            />
                            <YAxis className="fill-muted-foreground" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={color} 
                                strokeWidth={2}
                                dot={{ fill: color }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                className="fill-muted-foreground"
                            />
                            <YAxis className="fill-muted-foreground" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={color} 
                                fill={color}
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-base font-medium">{title}</CardTitle>
                    {description && (
                        <CardDescription className="text-xs">{description}</CardDescription>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {onColorChange && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Palette className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64" align="end">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Cor do Gráfico</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                onClick={() => onColorChange(preset.value)}
                                                className="group relative h-10 w-full rounded-md border-2 transition-all hover:scale-105"
                                                style={{ 
                                                    backgroundColor: preset.value,
                                                    borderColor: color === preset.value ? 'hsl(var(--primary))' : 'transparent'
                                                }}
                                                title={preset.name}
                                            >
                                                {color === preset.value && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-white shadow-md" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    <Select value={chartType} onValueChange={(v) => onChartTypeChange(v as ChartType)}>
                        <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {chartTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        <option.icon className="h-4 w-4" />
                                        {option.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {renderChart()}
            </CardContent>
        </Card>
    );
}
