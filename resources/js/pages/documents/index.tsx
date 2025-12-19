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
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Documentos', href: '/documents' },
];

const statusConfig = {
    pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    processing: { label: 'A processar', variant: 'default' as const, icon: Loader2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    completed: { label: 'Concluído', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
    failed: { label: 'Falhou', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
};

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

function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays < 7) return `Há ${diffDays} dias`;
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
}

function DocumentCard({ document, isSelected, onSelect, onDelete, index }: DocumentCardProps) {
    const status = statusConfig[document.status];
    const StatusIcon = status.icon;
    const FileIcon = getFileIcon(document.mime_type);

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on checkbox or buttons
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[role="checkbox"]')) {
            return;
        }
        router.visit(`/documents/${document.id}`);
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
                        {getRelativeTime(document.created_at)}
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
                                <Link href={`/documents/${document.id}`}>
                                    <Eye className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalhes</TooltipContent>
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
                        <TooltipContent>Eliminar</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

export default function DocumentsIndex({ documents, documentTypes = [] }: DocumentsIndexProps) {
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
        if (confirm('Tem a certeza que deseja eliminar este documento?')) {
            router.delete(`/documents/${id}`, {
                onSuccess: () => {
                    toast.success('Documento eliminado com sucesso!');
                    setSelectedIds(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    });
                },
                onError: () => {
                    toast.error('Erro ao eliminar documento');
                },
            });
        }
    }, []);

    const handleDeleteSelected = useCallback(() => {
        if (selectedIds.size === 0) return;
        
        if (confirm(`Tem a certeza que deseja eliminar ${selectedIds.size} documento(s)?`)) {
            // Delete one by one (could be optimized with batch endpoint)
            const ids = Array.from(selectedIds);
            let completed = 0;
            
            ids.forEach(id => {
                router.delete(`/documents/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        completed++;
                        if (completed === ids.length) {
                            toast.success(`${ids.length} documento(s) eliminado(s)!`);
                            setSelectedIds(new Set());
                        }
                    },
                });
            });
        }
    }, [selectedIds]);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedType('all');
        setSelectedStatus('all');
    }, []);

    const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedStatus !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentos" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in-0 slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
                        <p className="text-muted-foreground">
                            Gerir e visualizar os seus documentos processados
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                            <Link href="/document-types">
                                <Settings2 className="mr-2 h-4 w-4" />
                                Modelos
                            </Link>
                        </Button>
                        <Button asChild className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                            <Link href="/documents/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Documento
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
                                <p className="text-xs text-muted-foreground">Total</p>
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
                                <p className="text-xs text-muted-foreground">Concluídos</p>
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
                                <p className="text-xs text-muted-foreground">Pendentes</p>
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
                                <p className="text-xs text-muted-foreground">Modelos</p>
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
                                    placeholder="Pesquisar documentos..."
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
                                    <SelectValue placeholder="Modelo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os modelos</SelectItem>
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
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os estados</SelectItem>
                                    <SelectItem value="completed">Concluídos</SelectItem>
                                    <SelectItem value="pending">Pendentes</SelectItem>
                                    <SelectItem value="processing">A processar</SelectItem>
                                    <SelectItem value="failed">Falhados</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort */}
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <ArrowUpDown className="mr-2 h-4 w-4" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Data</SelectItem>
                                    <SelectItem value="name">Nome</SelectItem>
                                    <SelectItem value="size">Tamanho</SelectItem>
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                                    <X className="mr-2 h-4 w-4" />
                                    Limpar
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
                                        Desmarcar
                                    </>
                                ) : (
                                    <>
                                        <Square className="mr-2 h-4 w-4" />
                                        Selecionar
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
                                    Eliminar ({selectedIds.size})
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Results info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground animate-in fade-in-0 duration-300" style={{ animationDelay: '300ms' }}>
                    <span>
                        {filteredDocuments.length === documents.data.length 
                            ? `${documents.data.length} documento(s)`
                            : `${filteredDocuments.length} de ${documents.data.length} documento(s)`
                        }
                    </span>
                    {selectedIds.size > 0 && (
                        <span className="text-primary font-medium">
                            {selectedIds.size} selecionado(s)
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
                            {hasActiveFilters ? 'Nenhum resultado' : 'Sem documentos'}
                        </h3>
                        <p className="text-muted-foreground text-center max-w-sm mb-6">
                            {hasActiveFilters 
                                ? 'Tente ajustar os filtros para encontrar o que procura.'
                                : 'Comece por carregar o seu primeiro documento para extrair dados.'
                            }
                        </p>
                        {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Limpar filtros
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href="/documents/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Carregar Documento
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
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
