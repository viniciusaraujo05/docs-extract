import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type DocumentShowProps, type SchemaField } from '@/types/document';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Clock,
    FileText,
    Loader2,
    RefreshCw,
    Save,
    XCircle,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import { ExportDataButton } from '@/components/export-data-button';
import { ArrayFieldModal } from '@/components/fields/ArrayFieldModal';


function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getFieldLabel(field: SchemaField): string {
    return field.label || field.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function getInputType(fieldType: string): string {
    switch (fieldType) {
        case 'number':
            return 'number';
        case 'date':
            return 'date';
        default:
            return 'text';
    }
}

export default function DocumentShow({ document, previewUrl }: DocumentShowProps) {
    const { t } = useTranslation();
    const { props } = usePage();
    const locale = (props as any).locale || 'pt';

    const statusConfig = {
        pending: { label: t('Pending'), variant: 'secondary' as const, icon: Clock },
        processing: { label: t('Processing'), variant: 'default' as const, icon: Loader2 },
        completed: { label: t('Completed'), variant: 'default' as const, icon: CheckCircle },
        failed: { label: t('Failed'), variant: 'destructive' as const, icon: XCircle },
    };

    const typeLabels: Record<string, string> = {
        invoice: t('Invoice'),
        receipt: t('Receipt'),
        custom: t('Custom'),
    };

    const status = statusConfig[document.status];
    const StatusIcon = status.icon;
    const [isPolling, setIsPolling] = useState(document.status === 'processing' || document.status === 'pending');
    const [isSaving, setIsSaving] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: `/${locale}/dashboard` },
        { title: t('Documents'), href: `/${locale}/documents` },
        { title: document.name, href: `/${locale}/documents/${document.id}` },
    ];

    const schemaFields: SchemaField[] = document.schema_used?.fields || [];
    
    const getInitialData = () => {
        const data: Record<string, any> = {}; // Changed from Record<string, string>
        schemaFields.forEach((field) => {
            const value = document.extracted_data?.[field.name];
            // Preserve arrays and objects, don't convert to string
            if (field.type === 'array' && Array.isArray(value)) {
                data[field.name] = value;
            } else {
                data[field.name] = value ?? '';
            }
        });
        return data;
    };

    const [formData, setFormData] = useState<Record<string, any>>(getInitialData);

    const handleFieldChange = (fieldName: string, value: any) => { // Changed from value: string
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        router.put(`/api/documents/${document.id}/data`, {
            extracted_data: formData,
        }, {
            onSuccess: () => {
                toast.success(t('Data saved successfully!'));
            },
            onError: () => {
                toast.error(t('Error saving data'));
            },
            onFinish: () => setIsSaving(false),
        });
    };

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(() => {
            router.reload({
                only: ['document'],
                onSuccess: () => {
                    if (document.status !== 'processing' && document.status !== 'pending') {
                        setIsPolling(false);
                    }
                },
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isPolling, document.status]);

    useEffect(() => {
        if (document.status === 'completed' && document.extracted_data) {
            setFormData(getInitialData());
        }
    }, [document.extracted_data, document.status]);

    // Show success banner when arriving at a completed document
    useEffect(() => {
        if (document.status === 'completed' && document.extracted_data) {
            const timer = setTimeout(() => setShowSuccessBanner(true), 200);
            const hideTimer = setTimeout(() => setShowSuccessBanner(false), 5000);
            return () => { clearTimeout(timer); clearTimeout(hideTimer); };
        }
    }, []);

    // Cycle through processing step labels
    const PROCESSING_STEPS = [
        t('Reading your document...'),
        t('Identifying fields...'),
        t('Extracting values...'),
    ];
    useEffect(() => {
        if (document.status !== 'processing' && document.status !== 'pending') return;
        const timer = setInterval(() => {
            setProcessingStep(prev => (prev + 1) % PROCESSING_STEPS.length);
        }, 1800);
        return () => clearInterval(timer);
    }, [document.status]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={document.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* ✨ Success Banner */}
                {showSuccessBanner && (
                    <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 animate-in slide-in-from-top-2 duration-500">
                        <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-primary">
                                {t('Data extracted successfully')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {schemaFields.length} {t('fields ready — review and save when you\'re done')}
                            </p>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.visit(`/${locale}/documents`)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{document.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{typeLabels[document.type]}</span>
                                <span>•</span>
                                <span>{document.original_filename}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={status.variant} className="flex items-center gap-1">
                            <StatusIcon
                                className={`h-3 w-3 ${document.status === 'processing' ? 'animate-spin' : ''}`}
                            />
                            {status.label}
                        </Badge>
                    </div>
                </div>

                {/* Error Message */}
                {document.error_message && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t('Processing error')}</AlertTitle>
                        <AlertDescription>{document.error_message}</AlertDescription>
                    </Alert>
                )}

                {/* Main Content */}
                <div className="grid flex-1 gap-4 lg:grid-cols-2">
                    {/* Preview Panel */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {t('Preview')}
                            </CardTitle>
                            <CardDescription>
                                {t('Original uploaded document')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {previewUrl ? (
                                <>
                                    <div className="relative h-full min-h-[500px] overflow-auto rounded-lg border bg-muted">
                                        {document.mime_type === 'application/pdf' ? (
                                            <iframe
                                                src={previewUrl}
                                                className="h-full w-full"
                                                title="Document Preview"
                                            />
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt={document.name}
                                                className="w-full h-auto cursor-zoom-in hover:opacity-90 transition-opacity"
                                                style={{ imageRendering: 'high-quality' }}
                                                loading="eager"
                                                onClick={() => setIsZoomed(true)}
                                            />
                                        )}
                                    </div>
                                    
                                    {/* Modal de Zoom */}
                                    {isZoomed && document.mime_type !== 'application/pdf' && (
                                        <div 
                                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                                            onClick={() => setIsZoomed(false)}
                                        >
                                            <div className="relative max-h-[95vh] max-w-[95vw] overflow-auto">
                                                <img
                                                    src={previewUrl}
                                                    alt={document.name}
                                                    className="w-auto h-auto max-w-none cursor-zoom-out"
                                                    style={{ imageRendering: 'high-quality' }}
                                                />
                                                <button
                                                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsZoomed(false);
                                                    }}
                                                >
                                                    <XCircle className="h-6 w-6" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex h-full min-h-[500px] items-center justify-center rounded-lg border bg-muted">
                                    <p className="text-muted-foreground">
                                        {t('Preview not available')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Extracted Data Panel */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{t("Here's what we found")}</CardTitle>
                                    <CardDescription>
                                        {document.status === 'completed'
                                            ? t('Review your data — edit anything that looks off')
                                            : document.status === 'processing'
                                            ? t('AI is reading your document...')
                                            : document.status === 'pending'
                                            ? t('Waiting in queue...')
                                            : t('Processing failed')}
                                    </CardDescription>
                                </div>
                                {document.status === 'completed' && (
                                    <div className="flex items-center gap-2">
                                        <ExportDataButton
                                            data={formData}
                                            filename={document.name}
                                            variant="outline"
                                            size="sm"
                                            disabled={isSaving}
                                        />
            
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {document.status === 'processing' || document.status === 'pending' ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4">
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-primary animate-in fade-in duration-300" key={processingStep}>
                                            {PROCESSING_STEPS[processingStep]}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {document.status === 'processing'
                                                ? t('This usually takes a few seconds')
                                                : t('In queue — will start shortly')}
                                        </p>
                                    </div>
                                </div>
                            ) : document.status === 'failed' ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4">
                                    <XCircle className="h-12 w-12 text-destructive" />
                                    <p className="text-muted-foreground">
                                        {t('Could not process the document')}
                                    </p>
                                    <Button onClick={handleReprocess}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        {t('Try Again')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {schemaFields.length === 0 ? (
                                        <p className="text-muted-foreground">
                                            {t('No fields defined in schema')}
                                        </p>
                                    ) : (
                                        <>
                                            <div className="space-y-6">
                                                {schemaFields.map((field) => (
                                                    <div key={field.name} className="space-y-2">
                                                        <Label htmlFor={field.name}>
                                                            {getFieldLabel(field)}
                                                        </Label>
                                                        
                                                        {/* Render array fields with modal table display */}
                                                        {field.type === 'array' ? (
                                                            <ArrayFieldModal
                                                                field={{
                                                                    name: field.name,
                                                                    label: field.label || field.name,
                                                                    items: (field.items || []).map(item => ({
                                                                        name: item.name,
                                                                        label: item.label || item.name,
                                                                        type: item.type,
                                                                    })),
                                                                }}
                                                                value={formData[field.name] as Array<Record<string, any>> || []}
                                                                onChange={(newValue) => 
                                                                    handleFieldChange(field.name, newValue)
                                                                }
                                                                readOnly={false}
                                                            />
                                                        ) : (
                                                            <Input
                                                                id={field.name}
                                                                type={getInputType(field.type)}
                                                                value={String(formData[field.name] || '')}
                                                                onChange={(e) =>
                                                                    handleFieldChange(field.name, e.target.value)
                                                                }
                                                                step={field.type === 'number' ? '0.01' : undefined}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <Separator className="my-4" />

                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="shadow-md shadow-primary/20"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            {t('Saving...')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="mr-2 h-4 w-4" />
                                                            {t('Save & done')}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('Document Information')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="font-medium text-muted-foreground">{t('Created at')}</p>
                                <p>{formatDate(document.created_at)}</p>
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">{t('Processed at')}</p>
                                <p>{formatDate(document.processed_at)}</p>
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">{t('MIME type')}</p>
                                <p>{document.mime_type}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
