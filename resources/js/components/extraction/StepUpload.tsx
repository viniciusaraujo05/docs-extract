import { Button } from '@/components/ui/button';
import { GooglePickerWrapper } from './GooglePickerWrapper';
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
    Info,
    Image as ImageIcon,
    Copy,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface StepUploadProps {
    file: File | null;
    files?: File[];  // NEW: for batch mode
    batchMode?: boolean;  // NEW: toggle between single/multiple
    hasTemplates?: boolean;
    documentTypes?: DocumentType[];
    selectedTypeId: number | null;
    newTypeName: string;
    analyzing: boolean;
    analysisCompleted: boolean;
    suggestedFieldsCount: number;
    error: string | null;
    locale: string;
    checkingDuplicate?: boolean;
    duplicateExists?: boolean;
    duplicateFiles?: string[]; // NEW: List of duplicate filenames (from backend)
    internalDuplicates?: string[]; // NEW: List of duplicate filenames (within selected files)
    modelLimitReached?: boolean;
    isFirstDocument?: boolean;
    onFileSelect: (file: File | null) => void;
    onFilesSelect?: (files: File[]) => void;  // NEW: for batch mode
    onBatchModeToggle?: (enabled: boolean) => void;  // NEW
    onTypeSelect: (typeId: number | null) => void;
    onNewTypeNameChange: (name: string) => void;
    onAnalyzeDocument: () => void;
    onNext: () => void;
    onUpgradePlan?: () => void;
}

/**
 * Componente do Step 1 - Upload de documento
 * Permite arrastar/soltar ou clicar para selecionar ficheiros
 * e escolher o tipo de documento para extração
 */
export function StepUpload({
    file,
    files = [],
    batchMode = false,
    hasTemplates = false,
    documentTypes,
    selectedTypeId,
    newTypeName,
    analyzing,
    analysisCompleted,
    suggestedFieldsCount,
    error,
    locale,
    checkingDuplicate = false,
    duplicateExists = false,
    duplicateFiles = [],
    internalDuplicates = [],
    modelLimitReached = false,
    isFirstDocument = false,
    onFileSelect,
    onFilesSelect,
    onBatchModeToggle,
    onTypeSelect,
    onNewTypeNameChange,
    onAnalyzeDocument,
    onNext,
    onUpgradePlan,
}: StepUploadProps) {
    const { t } = useTranslation();
    const [dragActive, setDragActive] = useState(false);
    const [showNewType, setShowNewType] = useState(documentTypes.length === 0);
    const [showDrivePicker, setShowDrivePicker] = useState(false);
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
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        if (batchMode) {
            // Multiple files mode
            const newFiles = Array.from(selectedFiles);
            
            // Merge with existing files, avoiding duplicates by name
            const existingNames = new Set(files.map(f => f.name));
            const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
            
            if (uniqueNewFiles.length > 0) {
                onFilesSelect?.([...files, ...uniqueNewFiles]);
            }
        } else {
            // Single file mode
            const selectedFile = selectedFiles[0] ?? null;
            if (selectedFile) {
                onFileSelect(selectedFile);
            }
        }
    }, [batchMode, files, onFileSelect, onFilesSelect]);

    const handleClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const handleDriveFileSelect = useCallback((fileOrFiles: File | File[]) => {
        if (batchMode) {
             const newFiles = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
             
             // Filter duplicates
             const existingNames = new Set(files.map(f => f.name));
             const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));

             if (uniqueNewFiles.length > 0) {
                onFilesSelect?.([...files, ...uniqueNewFiles]);
             }
        } else {
            // Single mode: take first if array
            const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;
            onFileSelect(file);
        }
    }, [batchMode, files, onFilesSelect, onFileSelect]);

    const handleRemoveFile = useCallback((index?: number) => {
        if (batchMode && typeof index === 'number' && onFilesSelect) {
            // Remove specific file from batch
            const newFiles = files.filter((_, i) => i !== index);
            onFilesSelect(newFiles);
        } else {
            // Remove single file
            onFileSelect(null);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    }, [batchMode, files, onFileSelect, onFilesSelect]);

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
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Upload className="h-5 w-5" />
                            {t('New Document')}{batchMode && 's'}
                        </CardTitle>
                        <CardDescription>
                            {batchMode 
                                ? t('Upload multiple files using the same template')
                                : t('First select the template, then upload the document')}
                        </CardDescription>
                    </div>
                    {hasTemplates && onBatchModeToggle && (
                        <div className="flex bg-muted rounded-lg p-1 gap-1">
                            <Button
                                type="button"
                                variant={!batchMode ? "secondary" : "ghost"}
                                size="sm"
                                onClick={batchMode ? onBatchModeToggle : undefined}
                                className={cn(
                                    "flex-1 gap-2 text-xs",
                                    !batchMode && "bg-background shadow-sm hover:bg-background"
                                )}
                            >
                                <File className="h-3.5 w-3.5" />
                                {t('Single')}
                            </Button>
                            <Button
                                type="button"
                                variant={batchMode ? "secondary" : "ghost"}
                                size="sm"
                                onClick={!batchMode ? onBatchModeToggle : undefined}
                                className={cn(
                                    "flex-1 gap-2 text-xs",
                                    batchMode && "bg-background shadow-sm hover:bg-background"
                                )}
                            >
                                <Copy className="h-3.5 w-3.5" />
                                {t('Multiple')}
                            </Button>
                        </div>
                    )}
                </div>
                
                {/* Info message for first-time users */}
                {!hasTemplates && isFirstDocument && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                {t('Your first upload will create a template')}
                            </p>
                        </div>
                    </div>
                )}
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
                            {modelLimitReached && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                                    <div className="flex items-start gap-3">
                                        <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                {t('Model limit reached')}
                                            </p>
                                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                                {t('You have reached the limit of models in your plan. You can still use existing models or upgrade to create more.')}
                                            </p>
                                        </div>
                                    </div>
                                    {onUpgradePlan && (
                                        <Button
                                            type="button"
                                            onClick={onUpgradePlan}
                                            size="sm"
                                            className="mt-2"
                                        >
                                            {t('Upgrade Plan')}
                                        </Button>
                                    )}
                                </div>
                            )}
                            {documentTypes.length > 0 ? (
                                <>
                                    <Select
                                        value={selectedTypeId?.toString() || ''}
                                        onValueChange={(value) => onTypeSelect(value ? parseInt(value) : null)}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder={t('Select a template')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4" />
                                                        <span>{type.name}</span>
                                                        <Badge variant="secondary" className="ml-2 text-xs">
                                                            {type.fields?.length || 0} {t('fields')}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs text-muted-foreground">ou</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>
                                </>
                            ) : null}
                            <div className="space-y-2">
                                <Button
                                    type="button"
                                    variant={documentTypes.length === 0 ? 'default' : 'outline'}
                                    onClick={() => {
                                        setShowNewType(true);
                                        onTypeSelect(null);
                                    }}
                                    className="w-full"
                                    disabled={(modelLimitReached && documentTypes.length > 0) || batchMode}
                                >
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    {documentTypes.length === 0 ? t('Create First Template') : t('Create New Template')}
                                </Button>
                                {batchMode && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                {t('In multiple mode, you must select an existing template. All files will use the same template for consistency.')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                            {/* Tutorial Helper Text for Template Name */}
                            {isFirstDocument && (
                                <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-500">
                                    💡 {t('first_document_template_hint')}
                                </p>
                            )}
                            {newTypeName && (
                                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
                                    <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-amber-700 dark:text-amber-300">
                                        {t('AI will analyze the document and detect fields automatically.')}
                                    </span>
                                </div>
                            )}
                            {/* Tutorial Helper Text for AI Analysis */}
                            {isFirstDocument && newTypeName && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/30 animate-in fade-in slide-in-from-top-1 duration-500">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-blue-700 dark:text-blue-300">
                                            {t('first_document_ai_hint')}
                                        </span>
                                    </div>
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
                            multiple={batchMode}
                        />

                        {/* Google Drive Import - Disabled for now to simplify verification (removing drive.readonly scope)
                                        <div className="mt-4 flex items-center justify-center">
                                            <div className="relative w-full text-center">
                                                <div className="absolute inset-0 flex items-center">
                                                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                                                        {t('Or import from')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDrivePicker(true);
                                                }}
                                                className="w-full max-w-sm flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" role="img">
                                                    <path d="M23.49,12.275 C23.49,11.485 23.425,10.73 23.295,10 H12 V14.51 H18.46 C18.18,15.99 17.335,17.245 16.08,18.09 L16.08,21.09 L19.905,21.09 C22.145,19.03 23.49,15.98 23.49,12.275 Z" fill="#4285F4"/>
                                                    <path d="M12,24 C15.24,24 17.965,22.935 19.91,21.09 L16.08,18.09 C15.005,18.815 13.62,19.25 12,19.25 C8.865,19.25 6.215,17.135 5.265,14.29 L1.3,14.29 L1.3,17.385 C3.26,21.275 7.315,24 12,24 Z" fill="#34A853"/>
                                                    <path d="M5.265,14.29 C5.025,13.565 4.9,12.795 4.9,12 C4.9,11.205 5.025,10.435 5.265,9.71 L5.265,6.62 L1.3,6.62 C0.47,8.28 0,10.09 0,12 C0,13.91 0.47,15.72 1.3,17.385 L5.265,14.29 Z" fill="#FBBC05"/>
                                                    <path d="M12,4.75 C13.77,4.75 15.355,5.36 16.605,6.55 L20.02,3.135 C17.96,1.215 15.235,0 12,0 C7.315,0 3.26,2.725 1.3,6.62 L5.265,9.71 C6.215,6.865 8.865,4.75 12,4.75 Z" fill="#EA4335"/>
                                                </svg>
                                                {t('Drive')}
                                            </Button>
                                        </div>
                                        */}                {!file ? (
                            <div className="flex flex-col items-center gap-6 p-8 text-center">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">{t('How would you like to upload?')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('Choose the source of your document')}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                                    {/* Option 1: Computer */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClick();
                                        }}
                                        disabled={!hasTypeSelected}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                                            hasTypeSelected 
                                                ? "border-muted hover:border-primary/50 hover:bg-muted/50 cursor-pointer" 
                                                : "border-muted opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <Upload className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-medium block">{t('From Computer')}</span>
                                            <span className="text-xs text-muted-foreground block">{t('Click to browse')}</span>
                                        </div>
                                    </button>

                                    {/* Option 2: Google Drive */}
                                    <GooglePickerWrapper
                                        locale={locale}
                                        onFileSelect={handleDriveFileSelect}
                                        multiple={batchMode}
                                        disabled={!hasTypeSelected}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 h-full",
                                            hasTypeSelected 
                                                ? "border-muted hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20" 
                                                : "border-muted opacity-50"
                                        )}
                                    />
                                </div>
                                
                                {!hasTypeSelected && (
                                     <p className="text-xs text-muted-foreground mt-2">{t('Select the template first')}</p>
                                )}
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

                    {/* Batch Mode: File List */}
                    {batchMode && files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                    {t('Selected files')} ({files.length})
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClick}
                                    disabled={!hasTypeSelected}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {t('Add more files')}
                                </Button>
                            </div>
                            <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-3">
                                {files.map((f, index) => {
                                    const isBackendDuplicate = duplicateFiles.some(d => d.toLowerCase() === f.name.toLowerCase());
                                    const isInternalDuplicate = internalDuplicates.some(d => d.toLowerCase() === f.name.toLowerCase());
                                    const isDuplicate = isBackendDuplicate || isInternalDuplicate;
                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex items-center justify-between rounded-md border p-3 transition-colors",
                                                isInternalDuplicate
                                                    ? "bg-red-50 border-red-300 dark:bg-red-950/20 dark:border-red-800"
                                                    : isBackendDuplicate 
                                                        ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" 
                                                        : "bg-card hover:bg-muted/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex-shrink-0">
                                                    {f.type.includes('pdf') ? (
                                                        <FileText className="h-5 w-5 text-red-500" />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-blue-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium truncate">{f.name}</p>
                                                        {isInternalDuplicate && (
                                                            <Badge variant="outline" className="h-5 gap-1 border-red-500 text-red-600 dark:text-red-400 bg-transparent text-[10px] px-1.5">
                                                                <Info className="h-3 w-3" />
                                                                {t('Duplicate in list')}
                                                            </Badge>
                                                        )}
                                                        {isBackendDuplicate && !isInternalDuplicate && (
                                                            <Badge variant="outline" className="h-5 gap-1 border-amber-500 text-amber-600 dark:text-amber-400 bg-transparent text-[10px] px-1.5">
                                                                <Info className="h-3 w-3" />
                                                                {t('Already exists')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(f.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(index)}
                                                className="flex-shrink-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Empty state for batch mode */}
                    {batchMode && files.length === 0 && hasTypeSelected && (
                        <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/25 p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                {t('No files selected')}. {t('Click or drag the document')}.
                            </p>
                        </div>
                    )}
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

                {checkingDuplicate && (
                    <div className="flex items-center justify-center gap-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {t('Checking for duplicate documents...')}
                        </span>
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
                        disabled={
                            (!batchMode && !file) || 
                            (batchMode && files.length === 0) || 
                            analyzing || 
                            checkingDuplicate || 
                            duplicateExists ||
                            (batchMode && duplicateFiles.length > 0) || 
                            (batchMode && internalDuplicates.length > 0) || 
                            !hasTypeSelected || 
                            (isNewType && !analysisCompleted)
                        }
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
