"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var extraction_1 = require("@/components/extraction");
var ErrorAlert_1 = require("@/components/ui/ErrorAlert");
var app_layout_1 = require("@/layouts/app-layout");
var extraction_2 = require("@/types/extraction");
var react_1 = require("@inertiajs/react");
var react_2 = require("react");
var sonner_1 = require("sonner");
var react_i18next_1 = require("react-i18next");
/**
 * Obtém o token CSRF do meta tag
 */
function getCsrfToken() {
    var _a, _b;
    return (_b = (_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : '';
}
/**
 * Cria URL de preview para ficheiro
 */
function getFilePreviewUrl(file) {
    if (!file)
        return null;
    return URL.createObjectURL(file);
}
/**
 * Página de criação de documento com wizard de 3 passos
 * Step 1: Upload do ficheiro
 * Step 2: Definição de campos a extrair
 * Step 3: Revisão e salvamento dos dados
 */
function DocumentsCreate(_a) {
    var _this = this;
    var _b = _a.documentTypes, documentTypes = _b === void 0 ? [] : _b;
    var t = react_i18next_1.useTranslation().t;
    var _c = react_2.useState('pt'), locale = _c[0], setLocale = _c[1];
    react_2.useEffect(function () {
        var savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);
    var BREADCRUMBS = [
        { title: t('Dashboard'), href: "/" + locale + "/dashboard" },
        { title: t('Documents'), href: "/" + locale + "/documents" },
        { title: t('New'), href: "/" + locale + "/documents/create" },
    ];
    var WIZARD_STEPS = [t('Upload'), t('Define Fields'), t('Review & Save')];
    // Estado do wizard
    var _d = react_2.useState(1), step = _d[0], setStep = _d[1];
    var _e = react_2.useState(null), file = _e[0], setFile = _e[1];
    var _f = react_2.useState(null), filePreview = _f[0], setFilePreview = _f[1];
    var _g = react_2.useState(null), selectedTypeId = _g[0], setSelectedTypeId = _g[1];
    // Estado dos campos
    var _h = react_2.useState([]), fields = _h[0], setFields = _h[1];
    var _j = react_2.useState([]), suggestedFields = _j[0], setSuggestedFields = _j[1];
    var _k = react_2.useState({}), extractedData = _k[0], setExtractedData = _k[1];
    var _l = react_2.useState(''), newTypeName = _l[0], setNewTypeName = _l[1];
    // Estado de loading
    var _m = react_2.useState(false), analyzing = _m[0], setAnalyzing = _m[1];
    var _o = react_2.useState(false), processing = _o[0], setProcessing = _o[1];
    var _p = react_2.useState(false), saving = _p[0], setSaving = _p[1];
    var _q = react_2.useState(false), checkingDuplicate = _q[0], setCheckingDuplicate = _q[1];
    var _r = react_2.useState(null), error = _r[0], setError = _r[1];
    var _s = react_2.useState(false), analysisCompleted = _s[0], setAnalysisCompleted = _s[1];
    var _t = react_2.useState(false), modelLimitReached = _t[0], setModelLimitReached = _t[1];
    var _u = react_2.useState(false), duplicateExists = _u[0], setDuplicateExists = _u[1];
    /**
     * Check model limit
     */
    react_2.useEffect(function () {
        var checkModelLimit = function () { return __awaiter(_this, void 0, void 0, function () {
            var usageResponse, usageData, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("/" + locale + "/api/usage", {
                                headers: {
                                    'Accept': 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'X-CSRF-TOKEN': getCsrfToken()
                                }
                            })];
                    case 1:
                        usageResponse = _a.sent();
                        return [4 /*yield*/, usageResponse.json()];
                    case 2:
                        usageData = _a.sent();
                        if (usageData.success && usageData.usage.models.is_reached) {
                            setModelLimitReached(true);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error('Error checking model limit:', err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        checkModelLimit();
    }, [locale]);
    /**
     * Analisa o documento com IA para detectar campos
     */
    var analyzeDocument = react_2.useCallback(function (fileToAnalyze) { return __awaiter(_this, void 0, void 0, function () {
        var formData, response, data, errorMsg, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setAnalyzing(true);
                    setError(null);
                    setAnalysisCompleted(false);
                    formData = new FormData();
                    formData.append('file', fileToAnalyze);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/documents/analyze', {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'X-CSRF-TOKEN': getCsrfToken(),
                                'Accept': 'application/json'
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        errorMsg = data.error || "Erro HTTP " + response.status;
                        setError(errorMsg);
                        return [2 /*return*/];
                    }
                    if (data.success && data.suggested_fields && data.suggested_fields.length > 0) {
                        setSuggestedFields(data.suggested_fields);
                        setAnalysisCompleted(true);
                    }
                    else if (data.error) {
                        setError(data.error);
                    }
                    else {
                        setError('Não foi possível detectar campos no documento. Tente outro ficheiro.');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _a.sent();
                    console.error('Analysis error:', err_2);
                    setError('Erro ao analisar documento. Verifique a conexão e tente novamente.');
                    return [3 /*break*/, 6];
                case 5:
                    setAnalyzing(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    /**
     * Handler para seleção de ficheiro
     * IMPORTANTE: Limpa todos os dados anteriores para evitar mistura de dados
     */
    var handleFileSelect = react_2.useCallback(function (selectedFile) { return __awaiter(_this, void 0, void 0, function () {
        var maxSize, fileExtension, allowedExtensions, arrayBuffer, view, pdfHeader, headerBytes, headerString, err_3, baseName, params, response, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                    if (!selectedFile) return [3 /*break*/, 4];
                    maxSize = extraction_2.MAX_FILE_SIZE_MB * 1024 * 1024;
                    if (selectedFile.size > maxSize) {
                        setError(t('File too large', { size: extraction_2.MAX_FILE_SIZE_MB }));
                        return [2 /*return*/];
                    }
                    fileExtension = selectedFile.name.toLowerCase().split('.').pop();
                    allowedExtensions = extraction_2.ACCEPTED_FILE_TYPES.split(',');
                    if (!fileExtension || !allowedExtensions.includes("." + fileExtension)) {
                        setError(t('Invalid file type', { types: extraction_2.ACCEPTED_FILE_TYPES }));
                        return [2 /*return*/];
                    }
                    if (!(fileExtension === 'pdf')) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, selectedFile.slice(0, 1024).arrayBuffer()];
                case 2:
                    arrayBuffer = _a.sent();
                    view = new Uint8Array(arrayBuffer);
                    pdfHeader = '%PDF-';
                    headerBytes = view.slice(0, 5);
                    headerString = String.fromCharCode.apply(String, headerBytes);
                    if (!headerString.startsWith(pdfHeader)) {
                        setError(t('Invalid PDF file', { fileName: selectedFile.name }));
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    setError(t('Error reading file', { fileName: selectedFile.name }));
                    return [2 /*return*/];
                case 4:
                    if (!selectedFile) return [3 /*break*/, 10];
                    setCheckingDuplicate(true);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 8, 9, 10]);
                    baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
                    params = new URLSearchParams({
                        name: selectedFile.name,
                        display_name: baseName
                    });
                    return [4 /*yield*/, fetch("/api/documents/check-name?" + params.toString(), {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': getCsrfToken()
                            },
                            credentials: 'same-origin'
                        })];
                case 6:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: " + response.status);
                    }
                    return [4 /*yield*/, response.json()];
                case 7:
                    data = _a.sent();
                    if (data.exists) {
                        setDuplicateExists(true);
                        setError(t('Duplicate filename warning', { fileName: selectedFile.name }));
                    }
                    else {
                        setDuplicateExists(false);
                        setError(null);
                    }
                    return [3 /*break*/, 10];
                case 8:
                    err_4 = _a.sent();
                    console.error('Error checking for duplicate name:', err_4);
                    // Em caso de erro na verificação, permite continuar
                    setDuplicateExists(false);
                    return [3 /*break*/, 10];
                case 9:
                    setCheckingDuplicate(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [filePreview, selectedTypeId]);
    /**
     * Handler para seleção de tipo de documento
     * IMPORTANTE: Limpa dados extraídos ao mudar tipo
     */
    var handleTypeSelect = react_2.useCallback(function (typeId) {
        setSelectedTypeId(typeId);
        setNewTypeName('');
        // RESET: Limpa dados extraídos ao mudar tipo
        setExtractedData({});
        setAnalysisCompleted(false);
        if (typeId) {
            // Se selecionou um tipo existente, usa os campos do tipo
            // Análise não é necessária para tipos existentes
            var selectedType = documentTypes.find(function (t) { return t.id === typeId; });
            if (selectedType === null || selectedType === void 0 ? void 0 : selectedType.fields) {
                setFields(selectedType.fields);
                setSuggestedFields([]);
                setAnalysisCompleted(true); // Tipo existente já tem campos
            }
        }
        else {
            // Se deselecionou, limpa campos
            setFields([]);
            setSuggestedFields([]);
        }
    }, [documentTypes]);
    /**
     * Handler para mudança do nome do novo tipo
     */
    var handleNewTypeNameChange = react_2.useCallback(function (name) {
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
    var handleAddField = react_2.useCallback(function (field) {
        if (!fields.some(function (f) { return f.name === field.name; })) {
            setFields(function (prev) { return __spreadArrays(prev, [field]); });
        }
    }, [fields]);
    /**
     * Remove um campo da lista
     */
    var handleRemoveField = react_2.useCallback(function (name) {
        setFields(function (prev) { return prev.filter(function (f) { return f.name !== name; }); });
        // Remove também dos dados extraídos
        setExtractedData(function (prev) {
            var newData = __assign({}, prev);
            delete newData[name];
            return newData;
        });
    }, []);
    /**
     * Renomeia o label de um campo
     */
    var handleRenameField = react_2.useCallback(function (fieldName, newLabel) {
        setFields(function (prev) { return prev.map(function (f) {
            return f.name === fieldName ? __assign(__assign({}, f), { label: newLabel }) : f;
        }); });
    }, []);
    /**
     * Atualiza a estrutura de um campo (e.g., items para array fields)
     */
    var handleUpdateFieldStructure = react_2.useCallback(function (updatedField) {
        setFields(function (prev) { return prev.map(function (f) {
            return f.name === updatedField.name ? updatedField : f;
        }); });
    }, []);
    /**
     * Adiciona todos os campos sugeridos
     */
    var handleAddAllSuggested = react_2.useCallback(function () {
        setFields(function (prev) {
            var newFields = __spreadArrays(prev);
            var _loop_1 = function (suggested) {
                if (!newFields.some(function (f) { return f.name === suggested.name; })) {
                    newFields.push(suggested);
                }
            };
            for (var _i = 0, suggestedFields_1 = suggestedFields; _i < suggestedFields_1.length; _i++) {
                var suggested = suggestedFields_1[_i];
                _loop_1(suggested);
            }
            return newFields;
        });
    }, [suggestedFields]);
    /**
     * Extrai dados do documento usando IA
     */
    var handleExtract = react_2.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var usageResponse, usageData, err_5, formData, response, data, suggestions, suggestions, suggestions, err_6, message;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!file || fields.length === 0)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/" + locale + "/api/usage", {
                            headers: {
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': getCsrfToken()
                            }
                        })];
                case 2:
                    usageResponse = _b.sent();
                    return [4 /*yield*/, usageResponse.json()];
                case 3:
                    usageData = _b.sent();
                    if (usageData.success && usageData.usage.documents.is_reached) {
                        setError(t('Document limit reached', {
                            used: usageData.usage.documents.used,
                            limit: usageData.usage.documents.limit
                        }));
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_5 = _b.sent();
                    console.error('Error checking usage:', err_5);
                    return [3 /*break*/, 5];
                case 5:
                    setProcessing(true);
                    setError(null);
                    formData = new FormData();
                    formData.append('file', file);
                    formData.append('fields', JSON.stringify(fields));
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 9, 10, 11]);
                    return [4 /*yield*/, fetch('/api/documents/extract', {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'X-CSRF-TOKEN': getCsrfToken(),
                                'Accept': 'application/json'
                            },
                            credentials: 'same-origin'
                        })];
                case 7:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + ": " + response.statusText);
                    }
                    return [4 /*yield*/, response.json()];
                case 8:
                    data = _b.sent();
                    if (data.success && data.extracted_data) {
                        setExtractedData(data.extracted_data);
                        // Mostra nota de conversão se houver
                        if (data.conversion_note) {
                            // Você pode mostrar isso como um toast ou notification
                            console.log('📌 ' + data.conversion_note);
                        }
                        setStep(3);
                    }
                    else {
                        // Trata erro amigável
                        if (data.error_type === 'protected_pdf') {
                            suggestions = Array.isArray(data.suggestions)
                                ? data.suggestions.map(function (s) { return "\u2022 " + s; }).join('\n')
                                : '';
                            setError("\uD83D\uDCC4 PDF Protegido\n\n" + data.error + "\n\nSugest\u00F5es:\n" + suggestions);
                        }
                        else if (data.error_type === 'corrupt_pdf') {
                            suggestions = Array.isArray(data.suggestions)
                                ? data.suggestions.map(function (s) { return "\u2022 " + s; }).join('\n')
                                : '';
                            setError("\u26A0\uFE0F PDF Corrompido\n\n" + data.error + "\n\nSugest\u00F5es:\n" + suggestions);
                        }
                        else if (data.error_type === 'processing_error') {
                            suggestions = Array.isArray(data.suggestions)
                                ? data.suggestions.map(function (s) { return "\u2022 " + s; }).join('\n')
                                : '';
                            setError("\u274C Erro no Processamento\n\n" + data.error + "\n\nSugest\u00F5es:\n" + suggestions);
                        }
                        else {
                            setError((_a = data.error) !== null && _a !== void 0 ? _a : 'Erro ao extrair dados');
                        }
                    }
                    return [3 /*break*/, 11];
                case 9:
                    err_6 = _b.sent();
                    message = err_6 instanceof Error ? err_6.message : t('Error processing document');
                    // Se for erro 500, mostra mensagem amigável
                    if (message.includes('500')) {
                        setError(t('document_processing_error'));
                    }
                    else {
                        setError(message);
                    }
                    console.error('Extraction error:', err_6);
                    return [3 /*break*/, 11];
                case 10:
                    setProcessing(false);
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    }); }, [file, fields]);
    /**
     * Atualiza um campo editado
     */
    var handleUpdateField = react_2.useCallback(function (fieldName, value) {
        setExtractedData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = value, _a)));
        });
    }, []);
    /**
     * Salva o documento
     */
    var checkAndSave = react_2.useCallback(function (forceOverwrite) {
        if (forceOverwrite === void 0) { forceOverwrite = false; }
        return __awaiter(_this, void 0, void 0, function () {
            var formData, locale;
            var _a;
            return __generator(this, function (_b) {
                if (!file)
                    return [2 /*return*/];
                if (!selectedTypeId && !newTypeName) {
                    sonner_1.toast.error('Selecione ou crie um modelo de documento');
                    return [2 /*return*/];
                }
                setSaving(true);
                formData = new FormData();
                formData.append('file', file);
                formData.append('type', selectedTypeId ? 'predefined' : 'new_type');
                formData.append('document_type_id', (_a = selectedTypeId === null || selectedTypeId === void 0 ? void 0 : selectedTypeId.toString()) !== null && _a !== void 0 ? _a : '');
                formData.append('new_type_name', newTypeName);
                formData.append('schema', JSON.stringify({ fields: fields }));
                formData.append('extracted_data', JSON.stringify(extractedData));
                formData.append('force_overwrite', forceOverwrite ? '1' : '0');
                locale = localStorage.getItem('selected-locale') || 'pt';
                react_1.router.post("/" + locale + "/documents", formData, {
                    forceFormData: true,
                    onSuccess: function (page) {
                        var _a;
                        sonner_1.toast.success('Documento salvo com sucesso!');
                        setSaving(false);
                        // Extrai o ID do documento da resposta
                        var documentId = (_a = page.props.document) === null || _a === void 0 ? void 0 : _a.id;
                        if (documentId) {
                            // Redireciona para a página do documento criado
                            react_1.router.visit("/" + locale + "/documents/" + documentId);
                        }
                        else {
                            // Fallback para lista se não conseguir obter o ID
                            react_1.router.visit("/" + locale + "/documents");
                        }
                    },
                    onError: function (errors) {
                        console.error('Save errors:', errors);
                        // Check if it's a limit error
                        if (errors.error && errors.error.includes('limit reached')) {
                            sonner_1.toast.error(errors.error);
                        }
                        else if (errors.file) {
                            sonner_1.toast.error(errors.file);
                        }
                        else {
                            sonner_1.toast.error('Erro ao salvar documento. Tente novamente.');
                        }
                        setSaving(false);
                    }
                });
                return [2 /*return*/];
            });
        });
    }, [file, selectedTypeId, newTypeName, fields, extractedData, locale]);
    /**
     * Descarta e volta à lista
     */
    var handleDiscard = react_2.useCallback(function () {
        react_1.router.visit("/" + locale + "/documents");
    }, [locale]);
    /**
     * Redireciona para a página de upgrade
     */
    var handleUpgradePlan = react_2.useCallback(function () {
        react_1.router.visit("/" + locale + "/settings/billing");
    }, [locale]);
    return (React.createElement(app_layout_1["default"], { breadcrumbs: BREADCRUMBS },
        React.createElement(react_1.Head, { title: t('New Document') }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-6 p-4" },
            React.createElement("div", { className: "text-center" },
                React.createElement("h1", { className: "text-2xl font-bold" }, t('Extract Document Data')),
                React.createElement("p", { className: "text-muted-foreground" }, t('Upload, define fields and let AI extract the data'))),
            error && (React.createElement(ErrorAlert_1.ErrorAlert, { error: error, onDismiss: function () { return setError(''); }, showReload: true })),
            React.createElement(extraction_1.WizardProgress, { currentStep: step, steps: WIZARD_STEPS }),
            step === 1 && (React.createElement(extraction_1.StepUpload, { file: file, documentTypes: documentTypes, selectedTypeId: selectedTypeId, newTypeName: newTypeName, analyzing: analyzing, analysisCompleted: analysisCompleted, suggestedFieldsCount: suggestedFields.length, error: error, locale: locale, checkingDuplicate: checkingDuplicate, duplicateExists: duplicateExists, modelLimitReached: modelLimitReached, onFileSelect: handleFileSelect, onTypeSelect: handleTypeSelect, onNewTypeNameChange: handleNewTypeNameChange, onAnalyzeDocument: function () { return file && analyzeDocument(file); }, onNext: function () { return setStep(2); }, onUpgradePlan: handleUpgradePlan })),
            step === 2 && (React.createElement(extraction_1.StepFields, { file: file, filePreview: filePreview, fields: fields, suggestedFields: suggestedFields, documentTypes: documentTypes, selectedTypeId: selectedTypeId, newTypeName: newTypeName, analyzing: analyzing, processing: processing, onAddField: handleAddField, onUpdateField: handleUpdateFieldStructure, onRemoveField: handleRemoveField, onAddAllSuggested: handleAddAllSuggested, onBack: function () { return setStep(1); }, onExtract: handleExtract })),
            step === 3 && (React.createElement(extraction_1.StepReview, { file: file, filePreview: filePreview, fields: fields, extractedData: extractedData, documentTypes: documentTypes, selectedTypeId: selectedTypeId, newTypeName: newTypeName, isSaving: saving, onUpdateField: handleUpdateField, onRemoveField: handleRemoveField, onRenameField: handleRenameField, onBack: function () { return setStep(2); }, onSave: checkAndSave, onDiscard: handleDiscard })))));
}
exports["default"] = DocumentsCreate;
