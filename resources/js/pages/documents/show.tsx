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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';


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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: `/${locale}/dashboard` },
        { title: t('Documents'), href: `/${locale}/documents` },
        { title: document.name, href: `/${locale}/documents/${document.id}` },
    ];

    const schemaFields: SchemaField[] = document.schema_used?.fields || [];
    
    const getInitialData = () => {
        const data: Record<string, string> = {};
        schemaFields.forEach((field) => {
            data[field.name] = String(document.extracted_data?.[field.name] ?? '');
        });
        return data;
    };

    const [formData, setFormData] = useState<Record<string, string>>(getInitialData);

    const handleFieldChange = (fieldName: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        router.put(`/${locale}/documents/${document.id}/data`, {
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

    const handleReprocess = () => {
        toast((toastId) => (
            <div className="flex flex-col gap-2">
                <p>{t('Reprocessing the document will consume 1 credit. Continue?')}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(toastId);
                            router.post(`/${locale}/documents/${document.id}/reprocess`, {}, {
                                onSuccess: () => {
                                    toast.success(t('Document sent for reprocessing!'));
                                },
                                onError: () => {
                                    toast.error(t('Error reprocessing document'));
                                },
                            });
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {t('Continue')}
                    </button>
                    <button
                        onClick={() => toast.dismiss(toastId)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        {t('Cancel')}
                    </button>
                </div>
            </div>
        ));
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={document.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
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
                                    <CardTitle>{t('Extracted Data')}</CardTitle>
                                    <CardDescription>
                                        {document.status === 'completed'
                                            ? t('Edit the fields below if necessary')
                                            : document.status === 'processing'
                                            ? t('Processing document...')
                                            : document.status === 'pending'
                                            ? t('Waiting for processing...')
                                            : t('Processing failed')}
                                    </CardDescription>
                                </div>
                                {document.status === 'completed' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReprocess}
                                        disabled={isSaving}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        {t('Reprocess')}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {document.status === 'processing' || document.status === 'pending' ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-muted-foreground">
                                        {document.status === 'processing'
                                            ? t('Extracting data from document...')
                                            : t('In processing queue...')}
                                    </p>
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
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {schemaFields.map((field) => (
                                                    <div key={field.name} className="space-y-2">
                                                        <Label htmlFor={field.name}>
                                                            {getFieldLabel(field)}
                                                        </Label>
                                                        <Input
                                                            id={field.name}
                                                            type={getInputType(field.type)}
                                                            value={formData[field.name] || ''}
                                                            onChange={(e) =>
                                                                handleFieldChange(field.name, e.target.value)
                                                            }
                                                            step={field.type === 'number' ? '0.01' : undefined}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <Separator className="my-4" />

                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    {t('Save Changes')}
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
                                <p className="font-medium text-muted-foreground">{t('Credits used')}</p>
                                <p>{document.credits_used}</p>
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
