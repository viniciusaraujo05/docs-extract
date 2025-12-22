import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { type Document, type DocumentsIndexProps } from '@/types/document';
import { Head, Link, router } from '@inertiajs/react';
import { 
    FileText, 
    Plus, 
    Eye, 
    Trash2, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Loader2, 
    Settings2,
    Search,
    Filter,
    Calendar,
    FileImage,
    File,
    MoreHorizontal,
    Download,
    FolderOpen,
    ArrowUpDown,
    X,
    CheckSquare,
    Square
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Breadcrumbs will be translated in the component

// Status config will use translations

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getRelativeTime(dateString: string, t: (key: string) => string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('Just now');
    if (diffMins < 60) return `${diffMins} ${t('min ago')}`;
    if (diffHours < 24) return `${diffHours} ${t('h ago')}`;
    if (diffDays < 7) return `${diffDays} ${t('days ago')}`;
    return formatDate(dateString);
}

function getFileIcon(mimeType: string | null) {
    if (!mimeType) return FileText;
    if (mimeType === 'application/pdf') return File;
    if (mimeType.startsWith('image/')) return FileImage;
    return FileText;
}

interface DocumentCardProps {
    document: Document;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onDelete: (id: number) => void;
    index: number;
    locale: string;
}

function DocumentCard({ document, isSelected, onSelect, onDelete, index, locale }: DocumentCardProps) {
    const { t } = useTranslation();
    
    const statusConfig = {
        pending: { label: t('Pending'), variant: 'secondary' as const, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        processing: { label: t('Processing'), variant: 'default' as const, icon: Loader2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        completed: { label: t('Completed'), variant: 'default' as const, icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
        failed: { label: t('Failed'), variant: 'destructive' as const, icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
    };
    
    const status = statusConfig[document.status];
    const StatusIcon = status.icon;
    const FileIcon = getFileIcon(document.mime_type);

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on checkbox or buttons
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[role="checkbox"]')) {
            return;
        }
        router.visit(`/${locale}/documents/${document.id}`);
    };

    return (
        <div 
            className={cn(
                "group relative rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer",
                "animate-in fade-in-0 slide-in-from-bottom-4",
                isSelected && "ring-2 ring-primary border-primary bg-primary/5"
            )}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            onClick={handleCardClick}
        >
            {/* Selection checkbox */}
            <div className={cn(
                "absolute top-3 left-3 z-10 transition-all duration-200",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
                <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onSelect(document.id)}
                    className="h-5 w-5"
                />
            </div>

            {/* Status badge */}
            <div className="absolute top-3 right-3 z-10">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className={cn(
                                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
                                status.color
                            )}>
                                <StatusIcon className={cn(
                                    "h-3 w-3",
                                    document.status === 'processing' && "animate-spin"
                                )} />
                                <span className="hidden sm:inline">{status.label}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{status.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* File icon and info */}
            <div className="flex flex-col items-center pt-6 pb-4">
                <div className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110",
                    document.mime_type === 'application/pdf' 
                        ? "bg-red-100 text-red-600" 
                        : document.mime_type?.startsWith('image/') 
                            ? "bg-blue-100 text-blue-600"
                            : "bg-primary/10 text-primary"
                )}>
                    <FileIcon className="h-8 w-8" />
                </div>
                
                <span className="font-semibold text-center hover:text-primary transition-colors line-clamp-2 px-2">
                    {document.name}
                </span>
                
                {document.document_type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                        {document.document_type.name}
                    </Badge>
                )}
            </div>

            {/* Meta info */}
            <div className="border-t pt-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {getRelativeTime(document.created_at, t)}
                    </span>
                    <span className="text-[10px]">{formatFileSize(document.file_size)}</span>
                </div>
            </div>

            {/* Actions - positioned above meta info */}
            <div className={cn(
                "absolute bottom-12 right-3 z-10 flex items-center gap-1 rounded-lg bg-background/95 backdrop-blur-sm border shadow-sm px-1 transition-all duration-200",
                "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
            )}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                <Link href={`/${locale}/documents/${document.id}`}>
                                    <Eye className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('View details')}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(document.id);
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('Delete')}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

export default function DocumentsIndex({ documents, documentTypes = [] }: DocumentsIndexProps) {
    const { t } = useTranslation();
    const [locale, setLocale] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selected-locale') || 'pt';
        }
        return 'pt';
    });

    useEffect(() => {
        const savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: `/${locale}/dashboard` },
        { title: t('Documents'), href: `/${locale}/documents` },
    ];
    
    const statusConfig = {
        pending: { label: t('Pending'), variant: 'secondary' as const, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        processing: { label: t('Processing'), variant: 'default' as const, icon: Loader2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        completed: { label: t('Completed'), variant: 'default' as const, icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
        failed: { label: t('Failed'), variant: 'destructive' as const, icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
    };
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Get unique document types from documents
    const types = useMemo(() => {
        if (documentTypes.length > 0) {
            return documentTypes.map(type => ({
                id: type.id,
                name: type.name,
                description: type.description ?? null,
            }));
        }

        const typeSet = new Map<number, string>();
        documents.data.forEach(doc => {
            if (doc.document_type) {
                typeSet.set(doc.document_type.id, doc.document_type.name);
            }
        });
        return Array.from(typeSet, ([id, name]) => ({ id, name, description: null }));
    }, [documentTypes, documents.data]);

    // Filter and sort documents
    const filteredDocuments = useMemo(() => {
        let result = [...documents.data];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(doc => 
                doc.name.toLowerCase().includes(query) ||
                doc.document_type?.name.toLowerCase().includes(query)
            );
        }

        // Type filter
        if (selectedType !== 'all') {
            result = result.filter(doc => doc.document_type?.id === parseInt(selectedType));
        }

        // Status filter
        if (selectedStatus !== 'all') {
            result = result.filter(doc => doc.status === selectedStatus);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return b.file_size - a.file_size;
                case 'date':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        return result;
    }, [documents.data, searchQuery, selectedType, selectedStatus, sortBy]);

    // Selection handlers
    const handleSelect = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredDocuments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredDocuments.map(d => d.id)));
        }
    }, [filteredDocuments, selectedIds.size]);

    const handleDelete = useCallback((id: number) => {
        toast((toastId) => (
            <div className="flex flex-col gap-2">
                <p>{t('Are you sure you want to delete this document?')}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(toastId);
                            router.delete(`/${locale}/documents/${id}`, {
                                onSuccess: () => {
                                    toast.success(t('Document deleted successfully!'));
                                    setSelectedIds(prev => {
                                        const next = new Set(prev);
                                        next.delete(id);
                                        return next;
                                    });
                                },
                                onError: () => {
                                    toast.error(t('Error deleting document'));
                                },
                            });
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        {t('Delete')}
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
    }, [locale, t]);

    const handleDeleteSelected = useCallback(() => {
        if (selectedIds.size === 0) return;
        
        toast((toastId) => (
            <div className="flex flex-col gap-2">
                <p>{t('Are you sure you want to delete {{count}} document(s)?', { count: selectedIds.size })}</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(toastId);
                            const ids = Array.from(selectedIds);
                            
                            // Deleta todos os documentos em paralelo
                            const deletePromises = ids.map(id => 
                                new Promise<void>((resolve, reject) => {
                                    router.delete(`/${locale}/documents/${id}`, {
                                        preserveScroll: true,
                                        preserveState: false,
                                        onSuccess: () => resolve(),
                                        onError: () => reject(new Error(`Failed to delete document ${id}`)),
                                    });
                                })
                            );
                            
                            try {
                                await Promise.all(deletePromises);
                                toast.success(t('{{count}} document(s) deleted!', { count: ids.length }));
                                setSelectedIds(new Set());
                                // Força reload da página para atualizar a lista
                                router.reload({ only: ['documents'] });
                            } catch (error) {
                                toast.error(t('Some documents could not be deleted'));
                            }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        {t('Delete')}
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
    }, [selectedIds, locale, t]);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedType('all');
        setSelectedStatus('all');
    }, []);

    const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedStatus !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Documents')} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in-0 slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('Documents')}</h1>
                        <p className="text-muted-foreground">
                            {t('Manage and view your processed documents')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                            <Link href={`/${locale}/document-types`}>
                                <Settings2 className="mr-2 h-4 w-4" />
                                {t('Models')}
                            </Link>
                        </Button>
                        <Button asChild className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                            <Link href={`/${locale}/documents/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('New Document')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <FolderOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{documents.data.length}</p>
                                <p className="text-xs text-muted-foreground">{t('Total')}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{documents.data.filter(d => d.status === 'completed').length}</p>
                                <p className="text-xs text-muted-foreground">{t('Completed')}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{documents.data.filter(d => d.status === 'pending' || d.status === 'processing').length}</p>
                                <p className="text-xs text-muted-foreground">{t('Pending')}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{types.length}</p>
                                <p className="text-xs text-muted-foreground">{t('Models')}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters Bar */}
                <Card className="p-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={t('Search documents...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-9"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Model Filter */}
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder={t('Model')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All models')}</SelectItem>
                                    {types.map(type => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <SelectValue placeholder={t('State')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All states')}</SelectItem>
                                    <SelectItem value="completed">{t('Completed')}</SelectItem>
                                    <SelectItem value="pending">{t('Pending')}</SelectItem>
                                    <SelectItem value="processing">{t('Processing')}</SelectItem>
                                    <SelectItem value="failed">{t('Failed')}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort */}
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <ArrowUpDown className="mr-2 h-4 w-4" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">{t('Date')}</SelectItem>
                                    <SelectItem value="name">{t('Name')}</SelectItem>
                                    <SelectItem value="size">{t('Size')}</SelectItem>
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                                    <X className="mr-2 h-4 w-4" />
                                    {t('Clear')}
                                </Button>
                            )}
                        </div>

                        {/* Selection actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                                className="shrink-0"
                            >
                                {selectedIds.size === filteredDocuments.length && filteredDocuments.length > 0 ? (
                                    <>
                                        <CheckSquare className="mr-2 h-4 w-4" />
                                        {t('Deselect')}
                                    </>
                                ) : (
                                    <>
                                        <Square className="mr-2 h-4 w-4" />
                                        {t('Select')}
                                    </>
                                )}
                            </Button>
                            
                            {selectedIds.size > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteSelected}
                                    className="shrink-0 animate-in fade-in-0 zoom-in-95"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('Delete')} ({selectedIds.size})
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Results info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground animate-in fade-in-0 duration-300" style={{ animationDelay: '300ms' }}>
                    <span>
                        {filteredDocuments.length === documents.data.length 
                            ? `${documents.data.length} ${t('document(s)')}`
                            : `${filteredDocuments.length} ${t('of')} ${documents.data.length} ${t('document(s)')}`
                        }
                    </span>
                    {selectedIds.size > 0 && (
                        <span className="text-primary font-medium">
                            {selectedIds.size} {t('selected')}
                        </span>
                    )}
                </div>

                {/* Documents Grid */}
                {filteredDocuments.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-16 animate-in fade-in-0 zoom-in-95 duration-500">
                        <div className="rounded-full bg-muted p-6 mb-4">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {hasActiveFilters ? t('No results') : t('No documents')}
                        </h3>
                        <p className="text-muted-foreground text-center max-w-sm mb-6">
                            {hasActiveFilters 
                                ? t('Try adjusting the filters to find what you\'re looking for.')
                                : t('Start by uploading your first document to extract data.')}
                        </p>
                        {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                {t('Clear filters')}
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href={`/${locale}/documents/create`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('Upload Document')}
                                </Link>
                            </Button>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredDocuments.map((doc, index) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                isSelected={selectedIds.has(doc.id)}
                                onSelect={handleSelect}
                                onDelete={handleDelete}
                                index={index}
                                locale={locale}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
