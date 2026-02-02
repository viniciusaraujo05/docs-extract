import { StepUpload, StepFields, StepReview, WizardProgress } from '@/components/extraction';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
    type SchemaField, 
    type DocumentType,
    type AnalyzeResponse, 
    type ExtractionResponse,
    MAX_FILE_SIZE_MB,
    ACCEPTED_FILE_TYPES
} from '@/types/extraction';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/**
 * Obtém o token CSRF do meta tag
 */
function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

/**
 * Cria URL de preview para ficheiro
 */
function getFilePreviewUrl(file: File | null): string | null {
    if (!file) return null;
    return URL.createObjectURL(file);
}

// Breadcrumbs and steps will be translated in component

interface Props {
    documentTypes?: DocumentType[];
    hasTemplates?: boolean;  // NEW
    limitReached?: boolean;
    planName?: string;
    isFirstDocument?: boolean;
    modelLimitReached?: boolean;  // NEW
}

/**
 * Página de criação de documento com wizard de 3 passos
 * Step 1: Upload do ficheiro
 * Step 2: Definição de campos a extrair
 * Step 3: Revisão e salvamento dos dados
 */
export default function DocumentsCreate({ 
    documentTypes = [], 
    hasTemplates = false,
    limitReached = false, 
    planName = 'Free', 
    isFirstDocument = false,
    modelLimitReached: initialModelLimitReached = false 
}: Props) {
    const { t } = useTranslation();
    const [locale, setLocale] = useState('pt');

    useEffect(() => {
        const savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);

    // Effect to show limit error on mount if reached
    useEffect(() => {
        if (limitReached) {
            setError(t('Document limit reached', { plan: planName }));
        }
    }, [limitReached, planName, t]);
    
    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: `/${locale}/dashboard` },
        { title: t('Documents'), href: `/${locale}/documents` },
        { title: t('New'), href: `/${locale}/documents/create` },
    ];

    const WIZARD_STEPS = [t('Upload'), t('Define Fields'), t('Review & Save')];
    
    // Estado do wizard
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<File[]>([]);  // NEW: for batch mode
    const [batchMode, setBatchMode] = useState(false);  // NEW: toggle mode
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    
    // Estado dos campos
    const [fields, setFields] = useState<SchemaField[]>([]);
    const [suggestedFields, setSuggestedFields] = useState<SchemaField[]>([]);
    const [extractedData, setExtractedData] = useState<Record<string, unknown>>({});
    const [newTypeName, setNewTypeName] = useState('');
    
    // Estado de loading
    const [analyzing, setAnalyzing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisCompleted, setAnalysisCompleted] = useState(false);
    const [modelLimitReached, setModelLimitReached] = useState(initialModelLimitReached);
    const [duplicateExists, setDuplicateExists] = useState(false);
    const [duplicateFiles, setDuplicateFiles] = useState<string[]>([]);
    const [internalDuplicates, setInternalDuplicates] = useState<string[]>([]);

    /**
     * Check model limit
     */
    useEffect(() => {
        const checkModelLimit = async () => {
            try {
                const usageResponse = await fetch(`/api/usage`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                });
                const usageData = await usageResponse.json();
                
                if (usageData.success && usageData.usage.models.is_reached) {
                    setModelLimitReached(true);
                }
            } catch (err) {
                console.error('Error checking model limit:', err);
            }
        };
        
        checkModelLimit();
    }, [locale]);

    /**
     * Analisa o documento com IA para detectar campos
     */
    const analyzeDocument = useCallback(async (fileToAnalyze: File) => {
        setAnalyzing(true);
        setError(null);
        setAnalysisCompleted(false);

        const formData = new FormData();
        formData.append('file', fileToAnalyze);

        try {
            const response = await fetch('/api/documents/analyze', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
            });

            const data: AnalyzeResponse = await response.json();

            if (!response.ok) {
                // Mostra erro específico do servidor
                const errorMsg = data.error || `Erro HTTP ${response.status}`;
                setError(errorMsg);
                return;
            }

            if (data.success && data.suggested_fields && data.suggested_fields.length > 0) {
                setSuggestedFields(data.suggested_fields);
                setAnalysisCompleted(true);
            } else if (data.error) {
                setError(data.error);
            } else {
                setError('Não foi possível detectar campos no documento. Tente outro ficheiro.');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Erro ao analisar documento. Verifique a conexão e tente novamente.');
        } finally {
            setAnalyzing(false);
        }
    }, []);

    /**
     * Handler para seleção de ficheiro
     * IMPORTANTE: Limpa todos os dados anteriores para evitar mistura de dados
     */
    const handleFileSelect = useCallback(async (selectedFile: File | null) => {
        if (limitReached) {
             toast.error(t('Document limit reached', { plan: planName }));
             return;
        }

        // Limpa preview anterior
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
        }
        
        setFile(selectedFile);
        setFilePreview(getFilePreviewUrl(selectedFile));
        setError(null);
        setDuplicateExists(false);
        
        // RESET: Limpa dados extraídos do documento anterior
        setExtractedData({});
        setSuggestedFields([]);
        setAnalysisCompleted(false);
        
        // Se não tem tipo selecionado, limpa campos também
        if (!selectedTypeId) {
            setFields([]);
        }
        
        // Validação inicial do arquivo
        if (selectedFile) {
            // Verifica tamanho
            const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024;
            if (selectedFile.size > maxSize) {
                setError(t('File too large', { size: MAX_FILE_SIZE_MB }));
                return;
            }
            
            // Verifica tipo
            const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
            const allowedExtensions = ACCEPTED_FILE_TYPES.split(',');
            if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
                setError(t('Invalid file type', { types: ACCEPTED_FILE_TYPES }));
                return;
            }
            
            // Verifica se é PDF e tenta ler basic info
            if (fileExtension === 'pdf') {
                try {
                    // Tenta ler o arquivo para verificar se não está corrompido
                    const arrayBuffer = await selectedFile.slice(0, 1024).arrayBuffer();
                    const view = new Uint8Array(arrayBuffer);
                    
                    // Verifica header do PDF
                    const pdfHeader = '%PDF-';
                    const headerBytes = view.slice(0, 5);
                    const headerString = String.fromCharCode(...headerBytes);
                    
                    if (!headerString.startsWith(pdfHeader)) {
                        setError(t('Invalid PDF file', { fileName: selectedFile.name }));
                        return;
                    }
                } catch (err) {
                    setError(t('Error reading file', { fileName: selectedFile.name }));
                    return;
                }
            }
        }

        // Verifica se já existe documento com mesmo nome
        if (selectedFile) {
            setCheckingDuplicate(true);
            try {
                const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
                const params = new URLSearchParams({
                    name: selectedFile.name,
                    display_name: baseName,
                });

                const response = await fetch(`/api/documents/check-name?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.exists) {
                    setDuplicateExists(true);
                    setError(t('Duplicate filename warning', { fileName: selectedFile.name }));
                } else {
                    setDuplicateExists(false);
                    setError(null);
                }
            } catch (err) {
                console.error('Error checking for duplicate name:', err);
                // Em caso de erro na verificação, permite continuar
                setDuplicateExists(false);
            } finally {
                setCheckingDuplicate(false);
            }
        }
    }, [filePreview, selectedTypeId, limitReached, planName, t]);

    /**
     * Handler para seleção de tipo de documento
     * IMPORTANTE: Limpa dados extraídos ao mudar tipo
     */
    const handleTypeSelect = useCallback((typeId: number | null) => {
        setSelectedTypeId(typeId);
        setNewTypeName('');
        
        // RESET: Limpa dados extraídos ao mudar tipo
        setExtractedData({});
        setAnalysisCompleted(false);
        
        if (typeId) {
            // Se selecionou um tipo existente, usa os campos do tipo
            // Análise não é necessária para tipos existentes
            const selectedType = documentTypes.find(t => t.id === typeId);
            if (selectedType?.fields) {
                setFields(selectedType.fields);
                setSuggestedFields([]);
                setAnalysisCompleted(true); // Tipo existente já tem campos
            }
        } else {
            // Se deselecionou, limpa campos
            setFields([]);
            setSuggestedFields([]);
        }
    }, [documentTypes]);

    /**
     * Handler para mudança do nome do novo tipo
     */
    const handleNewTypeNameChange = useCallback((name: string) => {
        setNewTypeName(name);
        setSelectedTypeId(null);
        // Limpa campos para que a IA detecte no Step 2
        if (name && fields.length === 0) {
            // Analisa documento com IA quando criar novo tipo
            if (file) {
                analyzeDocument(file);
            }
        }
    }, [file, fields.length, analyzeDocument]);

    /**
     * Adiciona um campo à lista
     */
    const handleAddField = useCallback((field: SchemaField) => {
        if (!fields.some(f => f.name === field.name)) {
            setFields(prev => [...prev, field]);
        }
    }, [fields]);

    /**
     * Remove um campo da lista
     */
    const handleRemoveField = useCallback((name: string) => {
        setFields(prev => prev.filter(f => f.name !== name));
        // Remove também dos dados extraídos
        setExtractedData(prev => {
            const newData = { ...prev };
            delete newData[name];
            return newData;
        });
    }, []);

    /**
     * Renomeia o label de um campo
     */
    const handleRenameField = useCallback((fieldName: string, newLabel: string) => {
        setFields(prev => prev.map(f => 
            f.name === fieldName ? { ...f, label: newLabel } : f
        ));
    }, []);

    /**
     * Atualiza a estrutura de um campo (e.g., items para array fields)
     */
    const handleUpdateFieldStructure = useCallback((updatedField: SchemaField) => {
        setFields(prev => prev.map(f => 
            f.name === updatedField.name ? updatedField : f
        ));
    }, []);

    /**
     * Adiciona todos os campos sugeridos
     */
    const handleAddAllSuggested = useCallback(() => {
        setFields(prev => {
            const newFields = [...prev];
            for (const suggested of suggestedFields) {
                if (!newFields.some(f => f.name === suggested.name)) {
                    newFields.push(suggested);
                }
            }
            return newFields;
        });
    }, [suggestedFields]);

    /**
     * Extrai dados do documento usando IA
     */
    const handleExtract = useCallback(async () => {
        // In batch mode, skip sample extraction and go directly to processing
        if (batchMode) {
            if (files.length === 0) return;
            
            // Validate basic requirements before sending
            if (!selectedTypeId && !newTypeName) {
                setError(t('Please select or create a document template'));
                return;
            }
            if (fields.length === 0) {
                setError(t('Please define at least one field'));
                return;
            }

            // Immediately start batch processing
            await checkAndSave();
            return;
        }

        if (!file || fields.length === 0) return;
        
        // Final backend check before costly AI op
        if (limitReached) {
             setError(t('Document limit reached', { plan: planName }));
             return;
        }

        setProcessing(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fields', JSON.stringify(fields));
        
        try {
            const response = await fetch('/api/documents/extract', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data: ExtractionResponse = await response.json();
            
            if (data.success && data.extracted_data) {
                setExtractedData(data.extracted_data);
                
                setStep(3);
            } else {
                // Trata erro amigável
                if (data.error_type === 'protected_pdf') {
                    const suggestions = Array.isArray(data.suggestions) 
                        ? data.suggestions.map((s: string) => `• ${s}`).join('\n')
                        : '';
                    setError(`📄 PDF Protegido\n\n${data.error}\n\nSugestões:\n${suggestions}`);
                } else if (data.error_type === 'corrupt_pdf') {
                    const suggestions = Array.isArray(data.suggestions) 
                        ? data.suggestions.map((s: string) => `• ${s}`).join('\n')
                        : '';
                    setError(`⚠️ PDF Corrompido\n\n${data.error}\n\nSugestões:\n${suggestions}`);
                } else if (data.error_type === 'processing_error') {
                    const suggestions = Array.isArray(data.suggestions) 
                        ? data.suggestions.map((s: string) => `• ${s}`).join('\n')
                        : '';
                    setError(`❌ Erro no Processamento\n\n${data.error}\n\nSugestões:\n${suggestions}`);
                } else {
                    setError(data.error ?? 'Erro ao extrair dados');
                }
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t('Error processing document');
            
            // Se for erro 500, mostra mensagem amigável
            if (message.includes('500')) {
                setError(t('document_processing_error'));
            } else {
                setError(message);
            }
            console.error('Extraction error:', err);
        } finally {
            setProcessing(false);
        }
    }, [file, files, batchMode, fields, limitReached, planName, t]);

    /**
     * Atualiza um campo editado
     */
    const handleUpdateField = useCallback((fieldName: string, value: unknown) => {
        setExtractedData(prev => ({ ...prev, [fieldName]: value }));
    }, []);

    /**
     * Salva o documento
     */
    const checkAndSave = useCallback(async (forceOverwrite = false) => {
        if ((!batchMode && !file) || (batchMode && files.length === 0)) return;
        
        if (!selectedTypeId && !newTypeName) {
            toast.error(t(batchMode ? 'Batch Template Requirement' : 'Please select or create a document template'));
            return;
        }

        setSaving(true);
        
        const formData = new FormData();
        
        if (batchMode) {
            files.forEach(f => formData.append('files[]', f));
            // Batch request expects 'fields' directly, not inside schema object
            formData.append('fields', JSON.stringify(fields));
        } else {
            if (file) formData.append('file', file);
            // Single request expects 'schema' with fields inside
            formData.append('schema', JSON.stringify({ fields }));
            formData.append('extracted_data', JSON.stringify(extractedData));
        }
        
        if (selectedTypeId) {
            formData.append('document_type_id', selectedTypeId.toString());
        }
        
        if (newTypeName) {
            formData.append('new_type_name', newTypeName);
        }

        formData.append('type', selectedTypeId ? 'predefined' : 'new_type');
        formData.append('force_overwrite', forceOverwrite ? '1' : '0');
        
        const endpoint = batchMode ? `/api/documents/batch` : `/api/documents`;
        
        router.post(endpoint, formData, { 
            forceFormData: true,
            onSuccess: (page) => {
                const message = batchMode 
                    ? t('Documents uploaded for processing!') 
                    : t('Document saved successfully!');
                toast.success(message);
                setSaving(false);
                
                if (batchMode) {
                    // Backend redirects to batch progress page automatically
                } else {
                    // Extrai o ID do documento da resposta
                    const documentId = (page.props as any).document?.id;
                    if (documentId) {
                        // Redireciona para a página do documento criado
                        router.visit(`/${locale}/documents/${documentId}`);
                    } else {
                        // Fallback para lista se não conseguir obter o ID
                        router.visit(`/${locale}/documents`);
                    }
                }
            },
            onError: (errors) => {
                setSaving(false);
                console.error('Save error:', errors);
                toast.error(t('Error saving document'));
            }
        });
    }, [file, files, batchMode, selectedTypeId, newTypeName, fields, extractedData, t]);

    /**
     * Descarta e volta à lista
     */
    const handleDiscard = useCallback(() => {
        router.visit(`/${locale}/documents`);
    }, [locale]);

    /**
     * Redireciona para a página de upgrade
     */
    const handleUpgradePlan = useCallback(() => {
        router.visit(`/${locale}/settings/billing`);
    }, [locale]);

    /**
     * Toggle batch mode
     */
    const handleBatchModeToggle = useCallback(() => {
        setBatchMode(prev => !prev);
        // Clear files when switching modes
        if (batchMode) {
            setFiles([]);
        } else {
            setFile(null);
        }
    }, [batchMode]);

    /**
     * Handle multiple files selection
     */
    /**
     * Handle multiple files selection with duplicate checking
     */
    const handleFilesSelect = useCallback(async (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setDuplicateFiles([]);
        setInternalDuplicates([]);
        setError(null);
        
        if (selectedFiles.length === 0) return;

        // Check for internal duplicates (same name in the selected list)
        const fileNames = selectedFiles.map(f => f.name);
        const nameCounts = new Map<string, number>();
        const duplicateNames: string[] = [];
        
        fileNames.forEach(name => {
            const count = nameCounts.get(name) || 0;
            nameCounts.set(name, count + 1);
            if (count === 1) {
                duplicateNames.push(name);
            }
        });
        
        if (duplicateNames.length > 0) {
            setInternalDuplicates(duplicateNames);
            setError(t('Duplicate filenames detected. Please remove duplicate files to continue.'));
            return;
        }

        setCheckingDuplicate(true);
        try {
            const response = await fetch('/api/documents/check-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    names: selectedFiles.map(f => f.name)
                })
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.duplicates && Array.isArray(data.duplicates)) {
                setDuplicateFiles(data.duplicates);
                if (data.duplicates.length > 0) {
                     setError(t('Some files already exist. Please remove them to continue.'));
                }
            }
        } catch (error) {
            console.error('Error checking duplicates:', error);
        } finally {
            setCheckingDuplicate(false);
        }
    }, [t]);

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={t('New Document')} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">{t('Extract Document Data')}</h1>
                    <p className="text-muted-foreground">
                        {t('Upload, define fields and let AI extract the data')}
                    </p>
                    
                    {/* Batch Volume Indicator */}
                    {batchMode && files.length > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in-50 zoom-in-95 duration-300">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            {files.length} {files.length === 1 ? t('Document') : t('Documents')} {t('to analyze')}
                        </div>
                    )}
                </div>

                {/* Limit Reach Alert with CTA */}
                {limitReached && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full text-red-600 dark:text-red-200">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                             </div>
                             <div>
                                 <h4 className="font-semibold text-red-900 dark:text-red-300">{t('Plan Limit Reached')}</h4>
                                 <p className="text-sm text-red-700 dark:text-red-400">
                                     {t('You have reached the page limit for your plan', { plan: planName })}
                                 </p>
                             </div>
                        </div>
                        <button 
                            onClick={handleUpgradePlan}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                        >
                            {t('Upgrade Plan')}
                        </button>
                    </div>
                )}

                {/* Error Alert */}
                {error && !limitReached && (
                    <ErrorAlert 
                        error={error} 
                        onDismiss={() => setError('')}
                        showReload={true}
                    />
                )}

                {/* Progress Steps */}
                <WizardProgress currentStep={step} steps={WIZARD_STEPS} />

                {/* Step Content */}
                {step === 1 && (
                    <div className={limitReached ? 'opacity-50 pointer-events-none grayscale' : ''}>
                        <StepUpload
                            file={file}
                            files={files}
                            batchMode={batchMode}
                            hasTemplates={hasTemplates}
                            documentTypes={documentTypes}
                            selectedTypeId={selectedTypeId}
                            newTypeName={newTypeName}
                            analyzing={analyzing}
                            analysisCompleted={analysisCompleted}
                            suggestedFieldsCount={suggestedFields.length}
                            error={error}
                            locale={locale}
                            checkingDuplicate={checkingDuplicate}
                            duplicateExists={duplicateExists}
                            modelLimitReached={modelLimitReached}
                            isFirstDocument={isFirstDocument}
                            onFileSelect={handleFileSelect}
                            onFilesSelect={handleFilesSelect}
                            duplicateFiles={duplicateFiles}
                            internalDuplicates={internalDuplicates}
                            onBatchModeToggle={handleBatchModeToggle}
                            onTypeSelect={handleTypeSelect}
                            onNewTypeNameChange={handleNewTypeNameChange}
                            onAnalyzeDocument={() => file && analyzeDocument(file)}
                            onNext={() => setStep(2)}
                            onUpgradePlan={handleUpgradePlan}
                        />
                    </div>
                )}

                {step === 2 && (
                    <StepFields
                        file={file}
                        files={files}
                        batchMode={batchMode}
                        filePreview={filePreview}
                        fields={fields}
                        suggestedFields={suggestedFields}
                        documentTypes={documentTypes}
                        selectedTypeId={selectedTypeId}
                        newTypeName={newTypeName}
                        analyzing={analyzing}
                        processing={processing || saving}
                        isFirstDocument={isFirstDocument}
                        onAddField={handleAddField}
                        onUpdateField={handleUpdateFieldStructure}
                        onRemoveField={handleRemoveField}
                        onAddAllSuggested={handleAddAllSuggested}
                        onBack={() => setStep(1)}
                        onExtract={handleExtract}
                    />
                )}

                {step === 3 && (
                    <StepReview
                        file={file}
                        files={files}
                        batchMode={batchMode}
                        filePreview={filePreview}
                        fields={fields}
                        extractedData={extractedData}
                        documentTypes={documentTypes}
                        selectedTypeId={selectedTypeId}
                        newTypeName={newTypeName}
                        isSaving={saving}
                        isFirstDocument={isFirstDocument}
                        onUpdateField={handleUpdateField}
                        onRemoveField={handleRemoveField}
                        onRenameField={handleRenameField}
                        onBack={() => setStep(2)}
                        onSave={checkAndSave}
                        onDiscard={handleDiscard}
                    />
                )}
            </div>
        </AppLayout>
    );
}
