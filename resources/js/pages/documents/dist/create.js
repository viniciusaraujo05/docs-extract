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
    var _b = _a.documentTypes, documentTypes = _b === void 0 ? [] : _b, _c = _a.hasTemplates, hasTemplates = _c === void 0 ? false : _c, _d = _a.limitReached, limitReached = _d === void 0 ? false : _d, _e = _a.planName, planName = _e === void 0 ? 'Free' : _e, _f = _a.isFirstDocument, isFirstDocument = _f === void 0 ? false : _f, _g = _a.modelLimitReached, initialModelLimitReached = _g === void 0 ? false : _g;
    var t = react_i18next_1.useTranslation().t;
    var _h = react_2.useState('pt'), locale = _h[0], setLocale = _h[1];
    react_2.useEffect(function () {
        var savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);
    // Effect to show limit error on mount if reached
    react_2.useEffect(function () {
        if (limitReached) {
            setError(t('Document limit reached', { plan: planName }));
        }
    }, [limitReached, planName, t]);
    var BREADCRUMBS = [
        { title: t('Dashboard'), href: "/" + locale + "/dashboard" },
        { title: t('Documents'), href: "/" + locale + "/documents" },
        { title: t('New'), href: "/" + locale + "/documents/create" },
    ];
    var WIZARD_STEPS = [t('Upload'), t('Define Fields'), t('Review & Save')];
    // Estado do wizard
    var _j = react_2.useState(1), step = _j[0], setStep = _j[1];
    var _k = react_2.useState(null), file = _k[0], setFile = _k[1];
    var _l = react_2.useState([]), files = _l[0], setFiles = _l[1]; // NEW: for batch mode
    var _m = react_2.useState(false), batchMode = _m[0], setBatchMode = _m[1]; // NEW: toggle mode
    var _o = react_2.useState(null), filePreview = _o[0], setFilePreview = _o[1];
    var _p = react_2.useState(null), selectedTypeId = _p[0], setSelectedTypeId = _p[1];
    // Estado dos campos
    var _q = react_2.useState([]), fields = _q[0], setFields = _q[1];
    var _r = react_2.useState([]), suggestedFields = _r[0], setSuggestedFields = _r[1];
    var _s = react_2.useState({}), extractedData = _s[0], setExtractedData = _s[1];
    var _t = react_2.useState(''), newTypeName = _t[0], setNewTypeName = _t[1];
    // Estado de loading
    var _u = react_2.useState(false), analyzing = _u[0], setAnalyzing = _u[1];
    var _v = react_2.useState(false), processing = _v[0], setProcessing = _v[1];
    var _w = react_2.useState(false), saving = _w[0], setSaving = _w[1];
    var _x = react_2.useState(false), checkingDuplicate = _x[0], setCheckingDuplicate = _x[1];
    var _y = react_2.useState(null), error = _y[0], setError = _y[1];
    var _z = react_2.useState(false), analysisCompleted = _z[0], setAnalysisCompleted = _z[1];
    var _0 = react_2.useState(initialModelLimitReached), modelLimitReached = _0[0], setModelLimitReached = _0[1];
    var _1 = react_2.useState(false), duplicateExists = _1[0], setDuplicateExists = _1[1];
    var _2 = react_2.useState([]), duplicateFiles = _2[0], setDuplicateFiles = _2[1];
    var _3 = react_2.useState([]), internalDuplicates = _3[0], setInternalDuplicates = _3[1];
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
                        return [4 /*yield*/, fetch("/api/usage", {
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
                    if (limitReached) {
                        sonner_1.toast.error(t('Document limit reached', { plan: planName }));
                        return [2 /*return*/];
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
    }); }, [filePreview, selectedTypeId, limitReached, planName, t]);
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
        var formData, response, data, suggestions, suggestions, suggestions, err_5, message;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!batchMode) return [3 /*break*/, 2];
                    if (files.length === 0)
                        return [2 /*return*/];
                    // Validate basic requirements before sending
                    if (!selectedTypeId && !newTypeName) {
                        setError(t('Please select or create a document template'));
                        return [2 /*return*/];
                    }
                    if (fields.length === 0) {
                        setError(t('Please define at least one field'));
                        return [2 /*return*/];
                    }
                    // Immediately start batch processing
                    return [4 /*yield*/, checkAndSave()];
                case 1:
                    // Immediately start batch processing
                    _b.sent();
                    return [2 /*return*/];
                case 2:
                    if (!file || fields.length === 0)
                        return [2 /*return*/];
                    // Final backend check before costly AI op
                    if (limitReached) {
                        setError(t('Document limit reached', { plan: planName }));
                        return [2 /*return*/];
                    }
                    setProcessing(true);
                    setError(null);
                    formData = new FormData();
                    formData.append('file', file);
                    formData.append('fields', JSON.stringify(fields));
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 6, 7, 8]);
                    return [4 /*yield*/, fetch('/api/documents/extract', {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'X-CSRF-TOKEN': getCsrfToken(),
                                'Accept': 'application/json'
                            },
                            credentials: 'same-origin'
                        })];
                case 4:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + ": " + response.statusText);
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _b.sent();
                    if (data.success && data.extracted_data) {
                        setExtractedData(data.extracted_data);
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
                    return [3 /*break*/, 8];
                case 6:
                    err_5 = _b.sent();
                    message = err_5 instanceof Error ? err_5.message : t('Error processing document');
                    // Se for erro 500, mostra mensagem amigável
                    if (message.includes('500')) {
                        setError(t('document_processing_error'));
                    }
                    else {
                        setError(message);
                    }
                    console.error('Extraction error:', err_5);
                    return [3 /*break*/, 8];
                case 7:
                    setProcessing(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [file, files, batchMode, fields, limitReached, planName, t]);
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
            var formData, endpoint;
            return __generator(this, function (_a) {
                if ((!batchMode && !file) || (batchMode && files.length === 0))
                    return [2 /*return*/];
                if (!selectedTypeId && !newTypeName) {
                    sonner_1.toast.error(t(batchMode ? 'Batch Template Requirement' : 'Please select or create a document template'));
                    return [2 /*return*/];
                }
                setSaving(true);
                formData = new FormData();
                if (batchMode) {
                    files.forEach(function (f) { return formData.append('files[]', f); });
                    // Batch request expects 'fields' directly, not inside schema object
                    formData.append('fields', JSON.stringify(fields));
                }
                else {
                    if (file)
                        formData.append('file', file);
                    // Single request expects 'schema' with fields inside
                    formData.append('schema', JSON.stringify({ fields: fields }));
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
                endpoint = batchMode ? "/api/documents/batch" : "/api/documents";
                react_1.router.post(endpoint, formData, {
                    forceFormData: true,
                    onSuccess: function (page) {
                        var _a;
                        var message = batchMode
                            ? t('Documents uploaded for processing!')
                            : t('Document saved successfully!');
                        sonner_1.toast.success(message);
                        setSaving(false);
                        if (batchMode) {
                            // Backend redirects to batch progress page automatically
                        }
                        else {
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
                        }
                    },
                    onError: function (errors) {
                        setSaving(false);
                        console.error('Save error:', errors);
                        sonner_1.toast.error(t('Error saving document'));
                    }
                });
                return [2 /*return*/];
            });
        });
    }, [file, files, batchMode, selectedTypeId, newTypeName, fields, extractedData, t]);
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
    /**
     * Toggle batch mode
     */
    var handleBatchModeToggle = react_2.useCallback(function () {
        setBatchMode(function (prev) { return !prev; });
        // Clear files when switching modes
        if (batchMode) {
            setFiles([]);
        }
        else {
            setFile(null);
        }
    }, [batchMode]);
    /**
     * Handle multiple files selection
     */
    /**
     * Handle multiple files selection with duplicate checking
     */
    var handleFilesSelect = react_2.useCallback(function (selectedFiles) { return __awaiter(_this, void 0, void 0, function () {
        var fileNames, nameCounts, duplicateNames, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setFiles(selectedFiles);
                    setDuplicateFiles([]);
                    setInternalDuplicates([]);
                    setError(null);
                    if (selectedFiles.length === 0)
                        return [2 /*return*/];
                    fileNames = selectedFiles.map(function (f) { return f.name; });
                    nameCounts = new Map();
                    duplicateNames = [];
                    fileNames.forEach(function (name) {
                        var count = nameCounts.get(name) || 0;
                        nameCounts.set(name, count + 1);
                        if (count === 1) {
                            duplicateNames.push(name);
                        }
                    });
                    if (duplicateNames.length > 0) {
                        setInternalDuplicates(duplicateNames);
                        setError(t('Duplicate filenames detected. Please remove duplicate files to continue.'));
                        return [2 /*return*/];
                    }
                    setCheckingDuplicate(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/documents/check-name', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': getCsrfToken()
                            },
                            body: JSON.stringify({
                                names: selectedFiles.map(function (f) { return f.name; })
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Network response was not ok');
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.duplicates && Array.isArray(data.duplicates)) {
                        setDuplicateFiles(data.duplicates);
                        if (data.duplicates.length > 0) {
                            setError(t('Some files already exist. Please remove them to continue.'));
                        }
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error checking duplicates:', error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setCheckingDuplicate(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [t]);
    return (React.createElement(app_layout_1["default"], { breadcrumbs: BREADCRUMBS },
        React.createElement(react_1.Head, { title: t('New Document') }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-6 p-4" },
            React.createElement("div", { className: "text-center space-y-2" },
                React.createElement("h1", { className: "text-2xl font-bold" }, t('Extract Document Data')),
                React.createElement("p", { className: "text-muted-foreground" }, t('Upload, define fields and let AI extract the data')),
                batchMode && files.length > 0 && (React.createElement("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in-50 zoom-in-95 duration-300" },
                    React.createElement("span", { className: "relative flex h-2 w-2" },
                        React.createElement("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" }),
                        React.createElement("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-primary" })),
                    files.length,
                    " ",
                    files.length === 1 ? t('Document') : t('Documents'),
                    " ",
                    t('to analyze')))),
            limitReached && (React.createElement("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement("div", { className: "p-2 bg-red-100 dark:bg-red-800 rounded-full text-red-600 dark:text-red-200" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
                            React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
                            React.createElement("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
                            React.createElement("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" }))),
                    React.createElement("div", null,
                        React.createElement("h4", { className: "font-semibold text-red-900 dark:text-red-300" }, t('Plan Limit Reached')),
                        React.createElement("p", { className: "text-sm text-red-700 dark:text-red-400" }, t('You have reached the page limit for your plan', { plan: planName })))),
                React.createElement("button", { onClick: handleUpgradePlan, className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm" }, t('Upgrade Plan')))),
            error && !limitReached && (React.createElement(ErrorAlert_1.ErrorAlert, { error: error, onDismiss: function () { return setError(''); }, showReload: true })),
            React.createElement(extraction_1.WizardProgress, { currentStep: step, steps: WIZARD_STEPS }),
            step === 1 && (React.createElement("div", { className: limitReached ? 'opacity-50 pointer-events-none grayscale' : '' },
                React.createElement(extraction_1.StepUpload, { file: file, files: files, batchMode: batchMode, hasTemplates: hasTemplates, documentTypes: documentTypes, selectedTypeId: selectedTypeId, newTypeName: newTypeName, analyzing: analyzing, analysisCompleted: analysisCompleted, suggestedFieldsCount: suggestedFields.length, error: error, locale: locale, checkingDuplicate: checkingDuplicate, duplicateExists: duplicateExists, modelLimitReached: modelLimitReached, isFirstDocument: isFirstDocument, onFileSelect: handleFileSelect, onFilesSelect: handleFilesSelect, duplicateFiles: duplicateFiles, internalDuplicates: internalDuplicates, onBatchModeToggle: handleBatchModeToggle, onTypeSelect: handleTypeSelect, onNewTypeNameChange: handleNewTypeNameChange, onAnalyzeDocument: function () { return file && analyzeDocument(file); }, onNext: function () { return setStep(2); }, onUpgradePlan: handleUpgradePlan }))),
            step === 2 && (React.createElement(extraction_1.StepFields, { file: file, files: files, batchMode: batchMode, filePreview: filePreview, fields: fields, suggestedFields: suggestedFields, documentTypes: documentTypes, selectedTypeId: selectedTypeId, newTypeName: newTypeName, analyzing: analyzing, processing: processing || saving, isFirstDocument: isFirstDocument, onAddField: handleAddField, onUpdateField: handleUpdateFieldStructure, onRemoveField: handleRemoveField, onAddAllSuggested: handleAddAllSuggested, onBack: function () { return setStep(1); }, onExtract: handleExtract })),
            step === 3 && (React.createElement(extraction_1.StepReview, { file: file, files: files, batchMode: batchMode, filePreview: filePreview, fields: fields, extractedData: extractedData, documentTypes: documentTypes, selectedTypeId: selectedTypeId, newTypeName: newTypeName, isSaving: saving, isFirstDocument: isFirstDocument, onUpdateField: handleUpdateField, onRemoveField: handleRemoveField, onRenameField: handleRenameField, onBack: function () { return setStep(2); }, onSave: checkAndSave, onDiscard: handleDiscard })))));
}
exports["default"] = DocumentsCreate;
