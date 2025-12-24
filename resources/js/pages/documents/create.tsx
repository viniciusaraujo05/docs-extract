import { StepUpload, StepFields, StepReview, WizardProgress } from '@/components/extraction';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
    type SchemaField, 
    type DocumentType,
    type AnalyzeResponse, 
    type ExtractionResponse 
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
}

/**
 * Página de criação de documento com wizard de 3 passos
 * Step 1: Upload do ficheiro
 * Step 2: Definição de campos a extrair
 * Step 3: Revisão e salvamento dos dados
 */
export default function DocumentsCreate({ documentTypes = [] }: Props) {
    const { t } = useTranslation();
    const [locale, setLocale] = useState('pt');

    useEffect(() => {
        const savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);
    
    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: `/${locale}/dashboard` },
        { title: t('Documents'), href: `/${locale}/documents` },
        { title: t('New'), href: `/${locale}/documents/create` },
    ];

    const WIZARD_STEPS = [t('Upload'), t('Define Fields'), t('Review & Save')];
    
    // Estado do wizard
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
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
    const [duplicateExists, setDuplicateExists] = useState(false);

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
    }, [filePreview, selectedTypeId]);

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
        if (!file || fields.length === 0) return;
        
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
                setError(data.error ?? 'Erro ao extrair dados');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao processar documento';
            setError(message);
            console.error('Extraction error:', err);
        } finally {
            setProcessing(false);
        }
    }, [file, fields]);

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
        if (!file) return;
        if (!selectedTypeId && !newTypeName) {
            toast.error('Selecione ou crie um modelo de documento');
            return;
        }

        setSaving(true);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', selectedTypeId ? 'predefined' : 'new_type');
        formData.append('document_type_id', selectedTypeId?.toString() ?? '');
        formData.append('new_type_name', newTypeName);
        formData.append('schema', JSON.stringify({ fields }));
        formData.append('extracted_data', JSON.stringify(extractedData));
        if (forceOverwrite) {
            formData.append('force_overwrite', 'true');
        }
        
        const locale = localStorage.getItem('selected-locale') || 'pt';
        router.post(`/${locale}/documents`, formData, { 
            forceFormData: true,
            onSuccess: (page) => {
                toast.success('Documento salvo com sucesso!');
                setSaving(false);
                // Extrai o ID do documento da resposta
                const documentId = (page.props as any).document?.id;
                if (documentId) {
                    // Redireciona para a página do documento criado
                    router.visit(`/${locale}/documents/${documentId}`);
                } else {
                    // Fallback para lista se não conseguir obter o ID
                    router.visit(`/${locale}/documents`);
                }
            },
            onError: (errors) => {
                console.error('Save errors:', errors);
                setSaving(false);
                toast.error('Erro ao salvar documento');
            },
        });
    }, [file, selectedTypeId, newTypeName, fields, extractedData]);

    /**
     * Salva o documento (wrapper para checkAndSave)
     */
    const handleSave = useCallback(() => {
        checkAndSave(false);
    }, [checkAndSave]);

    /**
     * Descarta e volta à lista
     */
    const handleDiscard = useCallback(() => {
        router.visit(`/${locale}/documents`);
    }, [locale]);

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={t('New Document')} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{t('Extract Document Data')}</h1>
                    <p className="text-muted-foreground">
                        {t('Upload, define fields and let AI extract the data')}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mx-auto w-full max-w-2xl animate-in fade-in-50">
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                            {error}
                        </div>
                    </div>
                )}

                {/* Progress Steps */}
                <WizardProgress currentStep={step} steps={WIZARD_STEPS} />

                {/* Step Content */}
                {step === 1 && (
                    <StepUpload
                        file={file}
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
                        onFileSelect={handleFileSelect}
                        onTypeSelect={handleTypeSelect}
                        onNewTypeNameChange={handleNewTypeNameChange}
                        onAnalyzeDocument={() => file && analyzeDocument(file)}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <StepFields
                        file={file}
                        filePreview={filePreview}
                        fields={fields}
                        suggestedFields={suggestedFields}
                        documentTypes={documentTypes}
                        selectedTypeId={selectedTypeId}
                        newTypeName={newTypeName}
                        analyzing={analyzing}
                        processing={processing}
                        onAddField={handleAddField}
                        onRemoveField={handleRemoveField}
                        onAddAllSuggested={handleAddAllSuggested}
                        onBack={() => setStep(1)}
                        onExtract={handleExtract}
                    />
                )}

                {step === 3 && (
                    <StepReview
                        file={file}
                        filePreview={filePreview}
                        fields={fields}
                        extractedData={extractedData}
                        documentTypes={documentTypes}
                        selectedTypeId={selectedTypeId}
                        newTypeName={newTypeName}
                        isSaving={saving}
                        onUpdateField={handleUpdateField}
                        onRemoveField={handleRemoveField}
                        onRenameField={handleRenameField}
                        onBack={() => setStep(2)}
                        onSave={handleSave}
                        onDiscard={handleDiscard}
                    />
                )}
            </div>
        </AppLayout>
    );
}
