import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getStatusConfig } from '@/utils/batch-status';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DocumentEditForm } from '@/components/documents/DocumentEditForm';

interface BatchProgressProps {
    batch: {
        id: number;
        status: string;
        template_name: string;
        progress: {
            total: number;
            processed: number;
            successful: number;
            failed: number;
            percentage: number;
        };
        created_at: string;
        started_at: string | null;
        completed_at: string | null;
    };
    documents: Array<{
        id: number;
        name: string;
        status: string;
        error_message: string | null;
        created_at: string;
        // Fields needed for Quick View
        schema_used?: any;
        extracted_data?: any;
        type?: string;
        previewUrl?: string; // Add this
        mime_type?: string;  // Add this
    }>;
}

export default function BatchProgress({ batch: initialBatch, documents: initialDocuments }: BatchProgressProps) {
    const { t } = useTranslation();
    const { props } = usePage();
    const locale = (props as any).locale || 'pt';

    const [batch, setBatch] = useState(initialBatch);
    const [documents, setDocuments] = useState(initialDocuments);
    const [isPolling, setIsPolling] = useState(
        initialBatch.status === 'pending' || initialBatch.status === 'processing'
    );
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Quick View State
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [isSavingDoc, setIsSavingDoc] = useState(false);

    // Derived State
    const selectedDocument = useMemo(() => 
        documents.find(d => d.id === selectedDocId), 
    [documents, selectedDocId]);

    const stats = useMemo(() => {
        const total = documents.length;
        const completed = documents.filter(d => d.status === 'completed').length;
        const failed = documents.filter(d => d.status === 'failed').length;
        const processing = documents.filter(d => d.status === 'processing' || d.status === 'pending').length;
        
        return { total, completed, failed, processing };
    }, [documents]);

    const batchStatus = getStatusConfig(batch.status, t);

    // Polling Logic
    useEffect(() => {
        if (!isPolling) return;

        const abortController = new AbortController();

        const interval = setInterval(() => {
            fetch(`/${locale}/documents/batch/${batch.id}/progress?json=true`, {
                signal: abortController.signal,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    setBatch(data.batch);
                    setDocuments(data.documents);

                    if (data.batch.status === 'completed' || data.batch.status === 'failed') {
                        setIsPolling(false);
                        toast.success(t('Batch processing finished'));
                    }
                })
                .catch(error => {
                    if (error.name !== 'AbortError') {
                        console.error('Polling error:', error);
                    }
                });
        }, 3000);

        return () => {
            clearInterval(interval);
            abortController.abort();
        };
    }, [isPolling, batch.id, locale, t]); 

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch(`/${locale}/documents/batch/${batch.id}/progress?json=true`);
            if (!res.ok) throw new Error('Refresh failed');
            const data = await res.json();
            
            setBatch(data.batch);
            setDocuments(data.documents);
            
            if (data.batch.status === 'completed' || data.batch.status === 'failed') {
                setIsPolling(false);
            } else {
                setIsPolling(true); 
            }
            toast.success(t('Refreshed successfully'));
        } catch (error) {
            console.error(error);
            toast.error(t('Failed to refresh data'));
        } finally {
            setIsRefreshing(false);
        }
    };
    
    // Quick View Handlers
    const handleQuickView = async (docId: number) => {
        setSelectedDocId(docId);
        
        try {
             const response = await fetch(`/${locale}/documents/${docId}`, {
                 headers: { 
                     'Accept': 'application/json',
                     'X-Requested-With': 'XMLHttpRequest'
                 }
             });
             
             if(response.ok) {
                 const data = await response.json();
                 console.log('Quick View Data:', data); // DEBUG
                 
                 // backend returns { document: {...}, previewUrl: '...' }
                 const { document: fullDoc, previewUrl } = data;
                 
                 setDocuments(prev => prev.map(d => d.id === docId ? { ...d, ...fullDoc, previewUrl } : d));
             }
        } catch (e) {
            console.error("Failed to load doc details", e);
            toast.error(t('Failed to load document details'));
        }
    };

    const handleSaveQuickEdit = async (data: any) => {
        if (!selectedDocId) return;
        setIsSavingDoc(true);
        
        try {
            await new Promise<void>((resolve, reject) => {
                router.put(`/${locale}/documents/${selectedDocId}/data`, {
                    extracted_data: data,
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        toast.success(t('Data saved successfully!'));
                        setDocuments(prev => prev.map(d => d.id === selectedDocId ? { ...d, extracted_data: data } : d));
                        setSelectedDocId(null);
                        resolve();
                    },
                    onError: () => {
                        toast.error(t('Error saving data'));
                        reject();
                    },
                    onFinish: () => setIsSavingDoc(false),
                });
            });
        } catch (e) {
            // Error handled in callbacks
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: `/${locale}/dashboard` },
        { title: t('Documents'), href: `/${locale}/documents` },
        { title: t('Batch Processing'), href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('Batch Processing')} - ${batch.template_name}`} />
            <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-4 lg:p-6 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.visit(`/${locale}/documents`)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                {batch.template_name}
                                <Badge variant={batchStatus.variant} className={batchStatus.color}>
                                    <batchStatus.icon className="mr-1 h-3 w-3" />
                                    {batchStatus.label}
                                </Badge>
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {t('Started at')}: {new Date(batch.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                                    <div className="flex items-center gap-2">
                         <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRefresh}
                            disabled={isRefreshing || isPolling}
                         >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing || isPolling ? 'animate-spin' : ''}`} />
                            {isPolling ? t('Polling...') : t('Refresh')}
                        </Button>
                    </div>
                </div>

                {/* Progress Card */}
                <Card className="shrink-0 bg-muted/30">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                             <div className="flex justify-between text-sm font-medium">
                                <span>{t('Overall Progress')}</span>
                                <span>{batch.progress.percentage}%</span>
                            </div>
                            <Progress value={batch.progress.percentage} className="h-2" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm pt-2">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">{t('Total')}</span>
                                    <span className="font-bold text-lg">{stats.total}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-green-600 font-medium">{t('Completed')}</span>
                                    <span className="font-bold text-lg">{stats.completed}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-blue-600 font-medium">{t('Processing')}</span>
                                    <span className="font-bold text-lg">{stats.processing}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-red-600 font-medium">{t('Failed')}</span>
                                    <span className="font-bold text-lg">{stats.failed}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                 {/* Documents List - Scrollable Area */}
                <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border bg-card">
                    <div className="divide-y">
                        {documents.map((doc) => {
                             const status = getStatusConfig(doc.status, t);
                             const StatusIcon = status.icon;
                             
                             return (
                                <div key={doc.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={`p-2 rounded-full border shrink-0 ${status.color}`}>
                                             <StatusIcon className={`h-4 w-4 ${doc.status === 'processing' ? 'animate-spin' : ''}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{doc.name}</p>
                                            {doc.error_message ? (
                                                <p className="text-xs text-red-500 truncate">{doc.error_message}</p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">{status.label}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {/* Quick View Button */}
                                         <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleQuickView(doc.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('Quick View')}
                                        </Button>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick View Dialog */}
            <Dialog open={!!selectedDocId} onOpenChange={(open) => !open && setSelectedDocId(null)}>
                <DialogContent className="max-w-[70rem] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden outline-none">
                    <DialogHeader className="px-6 py-4 border-b shrink-0 bg-background z-10">
                        <DialogTitle>{selectedDocument?.name}</DialogTitle>
                        <DialogDescription>
                             {selectedDocument?.status === 'completed' 
                                ? t('Review and edit extracted data')
                                : t('Document details')
                             }
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-hidden">
                        {selectedDocument ? (
                            selectedDocument.schema_used ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                                    {/* Preview Panel (Left) */}
                                    <div className="bg-muted/30 border-r h-full overflow-hidden flex flex-col relative p-4">
                                        <div className="absolute top-2 left-4 z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-muted-foreground border shadow-sm">
                                            {t('Preview')}
                                        </div>
                                        
                                        {selectedDocument.previewUrl ? (
                                            <div className="h-full w-full flex items-center justify-center overflow-auto rounded-lg border bg-background shadow-inner">
                                                {selectedDocument.mime_type === 'application/pdf' ? (
                                                    <iframe
                                                        src={selectedDocument.previewUrl}
                                                        className="h-full w-full"
                                                        title="Document Preview"
                                                    />
                                                ) : (
                                                    <img
                                                        src={selectedDocument.previewUrl}
                                                        alt={selectedDocument.name}
                                                        className="max-w-full max-h-full object-contain"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                             <div className="h-full flex items-center justify-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Eye className="h-8 w-8 opacity-20" />
                                                    <p>{t('Preview not available')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Form Panel (Right) */}
                                    <div className="h-full overflow-y-auto p-6 bg-background">
                                         <DocumentEditForm 
                                            document={selectedDocument as any}
                                            onSave={handleSaveQuickEdit}
                                            isSaving={isSavingDoc}
                                        />
                                    </div>
                                </div>
                            ) : (
                                selectedDocument.status === 'processing' || selectedDocument.status === 'pending' ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <p className="text-muted-foreground text-lg">{t('Document is strictly processing...')}</p>
                                    </div>
                                ) : (
                                     <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                                        <p className="text-muted-foreground">{t('Loading document details...')}</p>
                                    </div>
                                )
                            )
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
