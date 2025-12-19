import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { type DocumentType, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from '@/types/extraction';
import { router } from '@inertiajs/react';
import { 
    ArrowRight, 
    FileText, 
    Upload,
    X,
    Loader2,
    FileImage,
    File,
    Tag,
    FolderPlus,
    CheckCircle2,
    Sparkles,
    Info
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface StepUploadProps {
    file: File | null;
    documentTypes: DocumentType[];
    selectedTypeId: number | null;
    newTypeName: string;
    analyzing: boolean;
    analysisCompleted: boolean;
    suggestedFieldsCount: number;
    error: string | null;
    locale: string;
    onFileSelect: (file: File | null) => void;
    onTypeSelect: (typeId: number | null) => void;
    onNewTypeNameChange: (name: string) => void;
    onAnalyzeDocument: () => void;
    onNext: () => void;
}

/**
 * Componente do Step 1 - Upload de documento
 * Permite arrastar/soltar ou clicar para selecionar ficheiros
 * e escolher o tipo de documento para extração
 */
export function StepUpload({
    file,
    documentTypes,
    selectedTypeId,
    newTypeName,
    analyzing,
    analysisCompleted,
    suggestedFieldsCount,
    error,
    locale,
    onFileSelect,
    onTypeSelect,
    onNewTypeNameChange,
    onAnalyzeDocument,
    onNext,
}: StepUploadProps) {
    const { t } = useTranslation();
    const [dragActive, setDragActive] = useState(false);
    const [showNewType, setShowNewType] = useState(documentTypes.length === 0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files?.[0] ?? null;
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    }, [onFileSelect]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] ?? null;
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    }, [onFileSelect]);

    const handleClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const handleRemoveFile = useCallback(() => {
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [onFileSelect]);

    const getFileIcon = useCallback(() => {
        if (!file) return <Upload className="h-12 w-12 text-primary" />;
        if (file.type === 'application/pdf') return <File className="h-12 w-12 text-red-500" />;
        if (file.type.startsWith('image/')) return <FileImage className="h-12 w-12 text-blue-500" />;
        return <FileText className="h-12 w-12 text-primary" />;
    }, [file]);

    const formatFileSize = useCallback((bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }, []);

    // Verifica se o tipo está configurado
    const hasTypeSelected = selectedTypeId !== null || newTypeName.trim() !== '';
    const selectedType = selectedTypeId ? documentTypes.find(t => t.id === selectedTypeId) : null;
    const isNewType = newTypeName.trim() !== '';

    return (
        <Card className="mx-auto w-full max-w-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    <Upload className="h-5 w-5" />
                    {t('New Document')}
                </CardTitle>
                <CardDescription>
                    {t('First select the template, then upload the document')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* PASSO 1: Modelo de Documento - PRIMEIRO! */}
                <div className={cn(
                    "space-y-4 rounded-xl border-2 p-5 transition-all",
                    hasTypeSelected 
                        ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" 
                        : "border-primary/30 bg-primary/5"
                )}>
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            <div className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                hasTypeSelected 
                                    ? "bg-green-500 text-white" 
                                    : "bg-primary text-primary-foreground"
                            )}>
                                {hasTypeSelected ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                            </div>
                            {t('Document Template')}
                        </Label>
                        {hasTypeSelected && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                {isNewType ? t('New Template') : `${selectedType?.fields?.length || 0} ${t('fields')}`}
                            </Badge>
                        )}
                    </div>
                    
                    {!showNewType ? (
                        <div className="space-y-3">
                            {documentTypes.length > 0 ? (
                                <>
                                    <Select
                                        value={selectedTypeId?.toString() ?? ''}
                                        onValueChange={(v) => onTypeSelect(v ? parseInt(v) : null)}
                                    >
                                        <SelectTrigger className={cn(
                                            "h-11",
                                            selectedTypeId && "border-green-500 bg-white dark:bg-background"
                                        )}>
                                            <SelectValue placeholder={t('Select an existing template...')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4" />
                                                        {type.name}
                                                        <Badge variant="secondary" className="ml-2 text-xs">
                                                            {type.fields?.length || 0} {t('fields')}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    {selectedType && (
                                        <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-sm">
                                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-blue-700 dark:text-blue-300">
                                                {t('Fields are already defined. Document will be extracted using these fields.')}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs text-muted-foreground">ou</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>
                                </>
                            ) : null}
                            <Button
                                type="button"
                                variant={documentTypes.length === 0 ? 'default' : 'outline'}
                                onClick={() => {
                                    setShowNewType(true);
                                    onTypeSelect(null);
                                }}
                                className="w-full"
                            >
                                <FolderPlus className="mr-2 h-4 w-4" />
                                {documentTypes.length === 0 ? t('Create First Template') : t('Create New Template')}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Input
                                placeholder={t('Template name (e.g. Invoice, Payslip)')}
                                value={newTypeName}
                                onChange={(e) => onNewTypeNameChange(e.target.value)}
                                className={cn(
                                    "h-11",
                                    newTypeName ? 'border-green-500' : ''
                                )}
                                autoFocus
                            />
                            {newTypeName && (
                                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
                                    <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-amber-700 dark:text-amber-300">
                                        {t('AI will analyze the document and detect fields automatically.')}
                                    </span>
                                </div>
                            )}
                            {documentTypes.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowNewType(false);
                                        onNewTypeNameChange('');
                                    }}
                                >
                                    ← {t('Use existing template')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* PASSO 2: Upload do Documento */}
                <div className={cn(
                    "space-y-4 rounded-xl border-2 p-5 transition-all",
                    !hasTypeSelected && "opacity-50 pointer-events-none",
                    file 
                        ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" 
                        : hasTypeSelected 
                            ? "border-primary/30 bg-primary/5"
                            : "border-muted"
                )}>
                    <Label className="flex items-center gap-2 text-base font-semibold">
                        <div className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                            file 
                                ? "bg-green-500 text-white" 
                                : hasTypeSelected 
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                        )}>
                            {file ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                        </div>
                        Upload do Documento
                    </Label>

                    <div
                        onClick={hasTypeSelected && !file ? handleClick : undefined}
                        onDragEnter={hasTypeSelected ? handleDrag : undefined}
                        onDragLeave={hasTypeSelected ? handleDrag : undefined}
                        onDragOver={hasTypeSelected ? handleDrag : undefined}
                        onDrop={hasTypeSelected ? handleDrop : undefined}
                        className={cn(
                            'relative flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300',
                            !hasTypeSelected && 'cursor-not-allowed',
                            hasTypeSelected && !file && 'cursor-pointer border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
                            dragActive && 'border-primary bg-primary/5 scale-[1.01]',
                            file && 'cursor-default border-green-500/30 bg-green-50/50 dark:bg-green-950/20'
                        )}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept={ACCEPTED_FILE_TYPES}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={!hasTypeSelected}
                        />

                        {!file ? (
                            <div className="flex flex-col items-center gap-3 p-6 text-center">
                                <div className={cn(
                                    'rounded-full p-4 transition-transform duration-300',
                                    hasTypeSelected ? 'bg-primary/10' : 'bg-muted',
                                    dragActive && 'scale-110'
                                )}>
                                    {getFileIcon()}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        {hasTypeSelected ? (
                                            <span className="text-primary">{t('Click or drag the document')}</span>
                                        ) : (
                                            <span className="text-muted-foreground">{t('Select the template first')}</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PDF, JPG, PNG, WebP (máx. {MAX_FILE_SIZE_MB}MB)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex w-full flex-col items-center gap-3 p-6">
                                <div className="rounded-full bg-green-500/10 p-3">
                                    {getFileIcon()}
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile();
                                    }}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    {t('Change file')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Análise obrigatória para novo modelo */}
                {isNewType && file && !analyzing && !analysisCompleted && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center">
                            <Button
                                onClick={onAnalyzeDocument}
                                className="gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                {t('Analyze document with AI')}
                            </Button>
                        </div>
                        <p className="text-center text-xs text-muted-foreground">
                            {t('For new templates, it is mandatory to analyze the document to detect fields')}
                        </p>
                    </div>
                )}

                {/* Resultado da análise */}
                {isNewType && file && analysisCompleted && suggestedFieldsCount > 0 && (
                    <div className="flex items-center justify-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 p-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {t('Analysis complete!')} {suggestedFieldsCount} {t('fields detected.')}
                        </span>
                    </div>
                )}

                {/* Erro de análise */}
                {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive font-medium">{error}</p>
                        {error.includes('protegido') && (
                            <p className="text-xs text-destructive/80 mt-2">
                                💡 Dica: Abra o PDF num editor e salve sem proteção, ou converta para imagem.
                            </p>
                        )}
                    </div>
                )}

                {analyzing && (
                    <div className="flex items-center justify-center gap-3 rounded-lg bg-primary/5 p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm font-medium text-primary">
                            {t('Analyzing document and detecting fields...')}
                        </span>
                    </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(`/${locale}/documents`)}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        onClick={onNext}
                        disabled={!file || analyzing || !hasTypeSelected || (isNewType && !analysisCompleted)}
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                A analisar...
                            </>
                        ) : isNewType && !analysisCompleted ? (
                            <>
                                Analise primeiro
                                <Sparkles className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                            <>
                                {t('Continue')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
