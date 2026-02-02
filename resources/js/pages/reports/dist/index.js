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
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var popover_1 = require("@/components/ui/popover");
var charts_1 = require("@/components/charts");
var ReportConfigurator_1 = require("@/components/reports/ReportConfigurator");
var CalculatedFieldBuilder_1 = require("@/components/reports/CalculatedFieldBuilder");
var ReportTableView_1 = require("@/components/reports/ReportTableView");
var AIAnalysisModal_1 = require("@/components/reports/AIAnalysisModal");
var TablesView_1 = require("@/components/reports/TablesView");
var export_charts_pdf_button_1 = require("@/components/export-charts-pdf-button");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
var react_i18next_1 = require("react-i18next");
var XLSX = require("xlsx");
var tableFieldProcessor_1 = require("@/utils/tableFieldProcessor");
var reportDataFlattener_1 = require("@/utils/reportDataFlattener");
var badge_1 = require("@/components/ui/badge");
var first_extraction_modal_1 = require("@/components/first-extraction-modal");
var react_3 = require("@inertiajs/react");
// Breadcrumbs will be translated in component
var COLOR_PRESETS = [
    { name: 'Azul', value: 'hsl(var(--chart-1))' },
    { name: 'Verde', value: 'hsl(var(--chart-2))' },
    { name: 'Laranja', value: 'hsl(var(--chart-3))' },
    { name: 'Roxo', value: 'hsl(var(--chart-4))' },
    { name: 'Rosa', value: 'hsl(var(--chart-5))' },
    { name: 'Azul Escuro', value: '#8884d8' },
    { name: 'Verde Água', value: '#82ca9d' },
    { name: 'Amarelo', value: '#ffc658' },
    { name: 'Laranja Forte', value: '#ff7300' },
    { name: 'Turquesa', value: '#00C49F' },
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Índigo', value: '#6366f1' },
];
function formatNumber(value) {
    return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value);
}
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
}
function getDefaultConfig(fields) {
    var fieldConfig = {};
    fields.forEach(function (field) {
        fieldConfig[field.name] = {
            visible: field.type !== 'array',
            aggregation: field.type === 'number' ? 'sum' : null,
            chartType: field.type === 'number' ? 'bar' : field.type === 'date' ? 'line' : 'pie'
        };
    });
    return {
        fieldConfig: fieldConfig,
        selectionMode: 'all',
        dateFrom: null,
        dateTo: null,
        selectedDocumentIds: [],
        dateGrouping: null,
        dateField: null,
        analysisMode: 'documents'
    };
}
function ReportsIndex(_a) {
    var _this = this;
    var documentTypes = _a.documentTypes;
    var t = react_i18next_1.useTranslation().t;
    var _b = react_3.usePage().props, auth = _b.auth, pageLocale = _b.locale;
    var currentLocale = pageLocale || 'en';
    // Check for pending subscription from registration
    react_2.useEffect(function () {
        var pendingPlan = localStorage.getItem('pending_plan');
        var pendingPriceId = localStorage.getItem('pending_price_id');
        var pendingPlanName = localStorage.getItem('pending_plan_name');
        if (pendingPlan) {
            // Clear immediately
            localStorage.removeItem('pending_plan');
            localStorage.removeItem('pending_price_id');
            localStorage.removeItem('pending_plan_name');
            if (pendingPlan !== 'free' && pendingPriceId) {
                var currentPath = window.location.pathname;
                var localeMatch = currentPath.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)/);
                var currentLocale_1 = localeMatch ? localeMatch[1] : 'en';
                sonner_1.toast.info(t('Continuing to checkout...'));
                react_1.router.visit("/" + currentLocale_1 + "/subscription/checkout?price_id=" + pendingPriceId + "&plan_name=" + (pendingPlanName || ''));
            }
        }
    }, [t]);
    var breadcrumbs = [
        { title: t('Reports'), href: '/dashboard' },
    ];
    var _c = react_2.useState(''), selectedTypeId = _c[0], setSelectedTypeId = _c[1];
    var _d = react_2.useState(null), reportData = _d[0], setReportData = _d[1];
    var _e = react_2.useState(false), loading = _e[0], setLoading = _e[1];
    var _f = react_2.useState({}), chartTypes = _f[0], setChartTypes = _f[1];
    var _g = react_2.useState({}), chartColors = _g[0], setChartColors = _g[1];
    var _h = react_2.useState(function () {
        // Load from localStorage
        return localStorage.getItem('report-global-color') || 'hsl(var(--chart-1))';
    }), globalColor = _h[0], setGlobalColor = _h[1];
    var _j = react_2.useState(false), showConfigurator = _j[0], setShowConfigurator = _j[1];
    var _k = react_2.useState(null), currentConfig = _k[0], setCurrentConfig = _k[1];
    var _l = react_2.useState('charts'), activeView = _l[0], setActiveView = _l[1];
    var _m = react_2.useState([]), calculatedFields = _m[0], setCalculatedFields = _m[1];
    var _o = react_2.useState(false), showAIAnalysis = _o[0], setShowAIAnalysis = _o[1];
    var _p = react_2.useState(null), aiAnalysis = _p[0], setAiAnalysis = _p[1];
    var _q = react_2.useState(false), analyzingAI = _q[0], setAnalyzingAI = _q[1];
    var _r = react_2.useState(''), aiInstructions = _r[0], setAiInstructions = _r[1];
    var _s = react_2.useState(false), hasSavedAnalysis = _s[0], setHasSavedAnalysis = _s[1];
    var _t = react_2.useState(false), loadingAnalysis = _t[0], setLoadingAnalysis = _t[1];
    var selectedType = documentTypes.find(function (t) { return t.id.toString() === selectedTypeId; });
    // Extract table fields from documents
    var tableFields = react_2.useMemo(function () {
        if (!reportData || !selectedType)
            return [];
        return tableFieldProcessor_1.extractTableFields(reportData.documents, selectedType.fields);
    }, [reportData, selectedType]);
    // Auto-save global color to localStorage
    react_2.useEffect(function () {
        localStorage.setItem('report-global-color', globalColor);
    }, [globalColor]);
    // Auto-save chart colors to localStorage
    react_2.useEffect(function () {
        if (selectedTypeId && Object.keys(chartColors).length > 0) {
            localStorage.setItem("report-colors-" + selectedTypeId, JSON.stringify(chartColors));
        }
    }, [chartColors, selectedTypeId]);
    // Load chart colors from localStorage when type changes
    react_2.useEffect(function () {
        if (selectedTypeId) {
            var saved = localStorage.getItem("report-colors-" + selectedTypeId);
            if (saved) {
                try {
                    setChartColors(JSON.parse(saved));
                }
                catch (_a) {
                    setChartColors({});
                }
            }
            else {
                setChartColors({});
            }
        }
    }, [selectedTypeId]);
    // Apply global color to all charts
    var handleApplyGlobalColor = react_2.useCallback(function () {
        if (!reportData)
            return;
        var newColors = {};
        Object.keys(reportData.aggregated).forEach(function (fieldName) {
            newColors[fieldName] = globalColor;
        });
        setChartColors(newColors);
        sonner_1.toast.success(t('Global color applied to all charts'));
    }, [reportData, globalColor]);
    // Open saved analysis or start new one
    var handleOpenAnalysis = react_2.useCallback(function () {
        if (hasSavedAnalysis && aiAnalysis) {
            setShowAIAnalysis(true);
        }
        else {
            // Just open modal, user will provide instructions there
            setShowAIAnalysis(true);
        }
    }, [hasSavedAnalysis, aiAnalysis]);
    // Analyze report with AI
    var handleAnalyzeWithAI = react_2.useCallback(function (instructionsToUse) { return __awaiter(_this, void 0, void 0, function () {
        var finalInstructions, csrfToken, response, result, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedTypeId || !reportData)
                        return [2 /*return*/];
                    finalInstructions = instructionsToUse !== undefined ? instructionsToUse : aiInstructions;
                    setAnalyzingAI(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    csrfToken = (_b = (_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : '';
                    return [4 /*yield*/, fetch("/api/reports/" + selectedTypeId + "/analyze-ai", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': csrfToken
                            },
                            body: JSON.stringify({
                                instructions: finalInstructions.trim() || null
                            })
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.ok) {
                        throw new Error('Falha ao analisar relatório');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _c.sent();
                    if (result.success) {
                        setAiAnalysis(result.analysis);
                        setHasSavedAnalysis(true);
                        sonner_1.toast.success(t('Analysis completed successfully!'));
                    }
                    else {
                        throw new Error(result.error || 'Erro desconhecido');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _c.sent();
                    sonner_1.toast.error(error_1.message || 'Erro ao analisar relatório com IA');
                    return [3 /*break*/, 6];
                case 5:
                    setAnalyzingAI(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [selectedTypeId, reportData, aiInstructions]);
    // Get visible fields from config
    var visibleFields = react_2.useMemo(function () {
        if (!currentConfig) {
            return (selectedType === null || selectedType === void 0 ? void 0 : selectedType.fields.map(function (f) { return f.name; })) || [];
        }
        return Object.entries(currentConfig.fieldConfig)
            .filter(function (_a) {
            var _ = _a[0], config = _a[1];
            return config.visible;
        })
            .map(function (_a) {
            var name = _a[0];
            return name;
        });
    }, [currentConfig, selectedType]);
    var reportExportPayload = react_2.useMemo(function () {
        if (!reportData)
            return null;
        var fieldLabelMap = reportData.documentType.fields.reduce(function (acc, field) {
            acc[field.name] = field.label;
            return acc;
        }, {});
        return {
            document_type: reportData.documentType.name,
            total_documents: reportData.totalDocuments,
            generated_at: new Date().toISOString(),
            filters: currentConfig
                ? {
                    date_from: currentConfig.dateFrom,
                    date_to: currentConfig.dateTo,
                    selection_mode: currentConfig.selectionMode,
                    date_grouping: currentConfig.dateGrouping,
                    date_field: currentConfig.dateField,
                    selected_document_ids: currentConfig.selectedDocumentIds
                }
                : null,
            aggregated: reportData.aggregated,
            documents: reportData.documents.map(function (doc) { return ({
                id: doc.id,
                name: doc.name,
                created_at: doc.created_at,
                data: visibleFields.reduce(function (acc, fieldName) {
                    var _a;
                    var label = fieldLabelMap[fieldName] || fieldName;
                    acc[label] = (_a = doc.data[fieldName]) !== null && _a !== void 0 ? _a : '';
                    return acc;
                }, {})
            }); })
        };
    }, [reportData, currentConfig, visibleFields]);
    var handleAddCalculatedField = react_2.useCallback(function (field) {
        setCalculatedFields(function (prev) { return __spreadArrays(prev, [field]); });
    }, []);
    var handleRemoveCalculatedField = react_2.useCallback(function (id) {
        setCalculatedFields(function (prev) { return prev.filter(function (f) { return f.id !== id; }); });
    }, []);
    var fetchReportData = react_2.useCallback(function (typeId, config) { return __awaiter(_this, void 0, void 0, function () {
        var url, options, response, data_1, transformedData_1, initialChartTypes_1, fieldsToProcess, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!typeId)
                        return [2 /*return*/];
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    url = "/api/reports/" + typeId + "/data";
                    options = {
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    };
                    // If we have a config, use preview endpoint with POST
                    if (config) {
                        url = "/api/reports/" + typeId + "/preview";
                        options = {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': ((_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || ''
                            },
                            body: JSON.stringify({
                                field_config: config.fieldConfig,
                                selection_mode: config.selectionMode,
                                date_from: config.dateFrom,
                                date_to: config.dateTo,
                                selected_document_ids: config.selectedDocumentIds.length > 0 ? config.selectedDocumentIds : null,
                                date_grouping: config.dateGrouping,
                                date_field: config.dateField
                            })
                        };
                    }
                    return [4 /*yield*/, fetch(url, options)];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error('Erro ao carregar dados');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data_1 = _b.sent();
                    // Transform preview data to match report data structure if needed
                    if (config && data_1.fields) {
                        transformedData_1 = {
                            documentType: {
                                id: parseInt(typeId),
                                name: (selectedType === null || selectedType === void 0 ? void 0 : selectedType.name) || '',
                                fields: (selectedType === null || selectedType === void 0 ? void 0 : selectedType.fields) || []
                            },
                            documents: data_1.sampleData || [],
                            aggregated: {},
                            totalDocuments: data_1.totalDocuments || 0
                        };
                        // Transform fields to aggregated format
                        Object.entries(data_1.fields).forEach(function (_a) {
                            var _b, _c, _d;
                            var fieldName = _a[0], fieldData = _a[1];
                            transformedData_1.aggregated[fieldName] = __assign(__assign({ label: fieldData.label, type: fieldData.type, count: ((_b = fieldData.sampleValues) === null || _b === void 0 ? void 0 : _b.length) || 0 }, (fieldData.preview || {})), { values: fieldData.sampleValues, distribution: (_c = fieldData.preview) === null || _c === void 0 ? void 0 : _c.topValues, uniqueCount: (_d = fieldData.preview) === null || _d === void 0 ? void 0 : _d.uniqueCount });
                        });
                        setReportData(transformedData_1);
                    }
                    else {
                        setReportData(data_1);
                    }
                    initialChartTypes_1 = {};
                    fieldsToProcess = config ? Object.keys(config.fieldConfig) : Object.keys(data_1.aggregated || {});
                    fieldsToProcess.forEach(function (fieldName) {
                        var _a;
                        if (config === null || config === void 0 ? void 0 : config.fieldConfig[fieldName]) {
                            initialChartTypes_1[fieldName] = config.fieldConfig[fieldName].chartType;
                        }
                        else {
                            var field = (_a = data_1.aggregated) === null || _a === void 0 ? void 0 : _a[fieldName];
                            if ((field === null || field === void 0 ? void 0 : field.type) === 'number') {
                                initialChartTypes_1[fieldName] = 'bar';
                            }
                            else if ((field === null || field === void 0 ? void 0 : field.type) === 'date') {
                                initialChartTypes_1[fieldName] = 'line';
                            }
                            else {
                                initialChartTypes_1[fieldName] = 'pie';
                            }
                        }
                    });
                    setChartTypes(initialChartTypes_1);
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _b.sent();
                    sonner_1.toast.error('Erro ao carregar relatório');
                    console.error(error_2);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [selectedType]);
    react_2.useEffect(function () {
        if (selectedTypeId && selectedType) {
            // Auto-initialize config to show charts immediately
            var defaultConfig = getDefaultConfig(selectedType.fields);
            setCurrentConfig(defaultConfig);
            fetchReportData(selectedTypeId, defaultConfig);
            fetchLatestAnalysis(selectedTypeId);
            setShowConfigurator(false);
        }
        else {
            setReportData(null);
            setAiAnalysis(null);
            setHasSavedAnalysis(false);
            setCurrentConfig(null);
        }
    }, [selectedTypeId, selectedType]);
    var fetchLatestAnalysis = react_2.useCallback(function (typeId) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoadingAnalysis(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch("/api/reports/" + typeId + "/latest-analysis", {
                            headers: {
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success && result.has_analysis) {
                        setHasSavedAnalysis(true);
                        setAiAnalysis(result.analysis);
                        if (result.instructions) {
                            setAiInstructions(result.instructions);
                        }
                    }
                    else {
                        setHasSavedAnalysis(false);
                        setAiAnalysis(null);
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_3 = _a.sent();
                    console.error(t('Error fetching saved analysis'), error_3);
                    return [3 /*break*/, 7];
                case 6:
                    setLoadingAnalysis(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleConfigChange = react_2.useCallback(function (config) {
        setCurrentConfig(config);
    }, []);
    var handlePreviewRequest = react_2.useCallback(function () {
        if (selectedTypeId && currentConfig) {
            fetchReportData(selectedTypeId, currentConfig);
        }
    }, [selectedTypeId, currentConfig, fetchReportData]);
    var handleExportExcel = react_2.useCallback(function () {
        if (!reportData)
            return;
        var worksheetData = reportData.documents.map(function (doc) {
            var row = {
                'ID': doc.id,
                'Nome': doc.name,
                'Data': new Date(doc.created_at).toLocaleDateString('pt-PT')
            };
            reportData.documentType.fields.forEach(function (field) {
                var _a;
                row[field.label] = (_a = doc.data[field.name]) !== null && _a !== void 0 ? _a : '';
            });
            return row;
        });
        var worksheet = XLSX.utils.json_to_sheet(worksheetData);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
        // Add summary sheet
        var summaryData = [];
        Object.entries(reportData.aggregated).forEach(function (_a) {
            var fieldName = _a[0], field = _a[1];
            var row = {
                'Campo': field.label,
                'Tipo': field.type,
                'Total Registos': field.count
            };
            if (field.type === 'number') {
                row['Soma'] = field.sum;
                row['Média'] = field.avg;
                row['Mínimo'] = field.min;
                row['Máximo'] = field.max;
            }
            else if (field.distribution) {
                row['Valores Únicos'] = field.uniqueCount;
            }
            summaryData.push(row);
        });
        var summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
        var filename = reportData.documentType.name.replace(/\s+/g, '_') + "_" + new Date().toISOString().split('T')[0] + ".xlsx";
        XLSX.writeFile(workbook, filename);
        sonner_1.toast.success('Ficheiro exportado com sucesso!');
    }, [reportData]);
    var handleChartTypeChange = react_2.useCallback(function (fieldName, type) {
        setChartTypes(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = type, _a)));
        });
    }, []);
    var getChartData = function (fieldName, field) {
        if (field.type === 'number' && field.values) {
            return (reportData === null || reportData === void 0 ? void 0 : reportData.documents.map(function (doc) { return ({
                name: doc.name.substring(0, 15) + (doc.name.length > 15 ? '...' : ''),
                value: Number(doc.data[fieldName]) || 0
            }); })) || [];
        }
        else if (field.type === 'date' && field.byMonth) {
            return Object.entries(field.byMonth)
                .sort(function (_a, _b) {
                var a = _a[0];
                var b = _b[0];
                return a.localeCompare(b);
            })
                .map(function (_a) {
                var month = _a[0], count = _a[1];
                return ({
                    name: month,
                    value: count
                });
            });
        }
        else if (field.distribution) {
            return Object.entries(field.distribution)
                .slice(0, 10)
                .map(function (_a) {
                var name = _a[0], value = _a[1];
                return ({
                    name: name.substring(0, 20) + (name.length > 20 ? '...' : ''),
                    value: value
                });
            });
        }
        return [];
    };
    // Unified Chart Data Adapter
    var displayCharts = react_2.useMemo(function () {
        var _a, _b;
        if (!reportData || !currentConfig)
            return [];
        // MODE 1: Deep Analysis (Table Items)
        if (currentConfig.analysisMode && currentConfig.analysisMode !== 'documents') {
            var arrayField_1 = reportData.documentType.fields.find(function (f) { return f.name === currentConfig.analysisMode; });
            if (!arrayField_1)
                return [];
            var flattened_1 = reportDataFlattener_1.flattenReportData(reportData.documents, arrayField_1.name);
            // Fields configured for charts
            // CRITICAL: We must filter specific fields for this table. 
            // The global config might contain fields from 'documents' or other tables.
            var validTableFields_1 = new Set(((_a = arrayField_1.items) === null || _a === void 0 ? void 0 : _a.map(function (f) { return f.name; })) || []);
            var chartConfigs = Object.entries(currentConfig.fieldConfig)
                .filter(function (_a) {
                var name = _a[0], config = _a[1];
                return config.visible && config.chartType && validTableFields_1.has(name);
            });
            if (chartConfigs.length === 0) {
                console.warn('[DisplayCharts] No visible chart configs match current table fields.');
                return [];
            }
            // Grouping: Determine X Axis
            // Try to find a string field in the table items to group by (e.g. Product Name)
            // Fallback to Document Name if no string field found in table items
            var itemStringFields = ((_b = arrayField_1.items) === null || _b === void 0 ? void 0 : _b.filter(function (f) { return f.type === 'string'; })) || [];
            var groupByField_1 = itemStringFields.length > 0 ? itemStringFields[0].name : '_docName';
            var operations = chartConfigs.map(function (_a) {
                var _ = _a[0], conf = _a[1];
                var agg = conf.aggregation || 'sum';
                return (agg === 'growth' ? 'sum' : agg);
            });
            var groupedData_1 = reportDataFlattener_1.groupFlattenedData(flattened_1, groupByField_1, operations);
            return chartConfigs.map(function (_a) {
                var _b, _c, _d;
                var fieldName = _a[0], config = _a[1];
                var fieldDef = (_b = arrayField_1.items) === null || _b === void 0 ? void 0 : _b.find(function (f) { return f.name === fieldName; });
                var fieldLabel = (fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.label) || fieldName;
                var groupByLabel = ((_d = (_c = arrayField_1.items) === null || _c === void 0 ? void 0 : _c.find(function (f) { return f.name === groupByField_1; })) === null || _d === void 0 ? void 0 : _d.label) || t('Document');
                // Determine metric to show:
                // 1. If field is the grouping key itself, show Count
                // 2. If field is non-numeric (string/date), show Count
                // 3. If field is numeric, show the Aggregated Sum (value property)
                var isNumeric = (fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.type) === 'number';
                var useCount = fieldName === groupByField_1 || !isNumeric;
                return {
                    id: fieldName,
                    title: fieldLabel + " " + t('by') + " " + groupByLabel,
                    description: t('Analysis of') + " " + flattened_1.length + " " + t('items'),
                    data: groupedData_1.map(function (d) { return ({
                        name: d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name,
                        value: useCount ? d.count : (d[fieldName] || 0)
                    }); }),
                    type: chartTypes[fieldName] || config.chartType || 'bar',
                    color: chartColors[fieldName] || '#3b82f6'
                };
            });
        }
        // MODE 2: Standard Document Analysis
        return Object.entries(reportData.aggregated).map(function (_a) {
            var fieldName = _a[0], field = _a[1];
            // Check visibility config
            var config = currentConfig.fieldConfig[fieldName];
            if (config && !config.visible)
                return null;
            var chartData = getChartData(fieldName, field);
            if (chartData.length === 0)
                return null;
            var description = '';
            if (field.type === 'number') {
                description = t('Sum:') + " " + formatNumber(field.sum) + " | " + t('Avg:') + " " + formatNumber(field.avg);
            }
            else if (field.uniqueCount) {
                description = field.uniqueCount + " " + t('unique values');
            }
            return {
                id: fieldName,
                title: field.label,
                description: description,
                data: chartData,
                type: chartTypes[fieldName] || (config === null || config === void 0 ? void 0 : config.chartType) || 'bar',
                color: chartColors[fieldName] || globalColor || '#3b82f6'
            };
        }).filter(function (chart) { return chart !== null; });
    }, [reportData, currentConfig, chartTypes, chartColors, globalColor, t]);
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: t('Reports') }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-6 p-4" },
            React.createElement(first_extraction_modal_1.FirstExtractionModal, { locale: currentLocale }),
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-2xl font-bold" }, t('Reports')),
                    React.createElement("p", { className: "text-muted-foreground" }, t('Manage and view your processed documents'))),
                React.createElement("div", { className: "flex items-center gap-2 flex-wrap justify-end" },
                    reportData && (React.createElement(popover_1.Popover, null,
                        React.createElement(popover_1.PopoverTrigger, { asChild: true },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm" },
                                React.createElement(lucide_react_1.Palette, { className: "mr-2 h-4 w-4" }),
                                t('Color'))),
                        React.createElement(popover_1.PopoverContent, { className: "w-80", align: "end" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", null,
                                    React.createElement("h4", { className: "font-medium text-sm mb-2" }, t('Chart Color')),
                                    React.createElement("p", { className: "text-xs text-muted-foreground mb-3" }, t('Select a color to apply to all charts'))),
                                React.createElement("div", { className: "grid grid-cols-4 gap-2" }, COLOR_PRESETS.map(function (preset) { return (React.createElement("button", { key: preset.value, onClick: function () { return setGlobalColor(preset.value); }, className: "group relative h-12 w-full rounded-md border-2 transition-all hover:scale-105", style: {
                                        backgroundColor: preset.value,
                                        borderColor: globalColor === preset.value ? 'hsl(var(--primary))' : 'transparent'
                                    }, title: preset.name }, globalColor === preset.value && (React.createElement("div", { className: "absolute inset-0 flex items-center justify-center" },
                                    React.createElement("div", { className: "h-3 w-3 rounded-full bg-white shadow-md" }))))); })),
                                React.createElement(button_1.Button, { onClick: handleApplyGlobalColor, className: "w-full", size: "sm" }, t('Apply to All Charts')))))),
                    selectedTypeId && (React.createElement(button_1.Button, { variant: showConfigurator ? 'default' : 'outline', size: "sm", onClick: function () { return setShowConfigurator(!showConfigurator); } },
                        React.createElement(lucide_react_1.Settings2, { className: "mr-2 h-4 w-4" }),
                        t('Configure'))),
                    reportData && (React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: handleOpenAnalysis, disabled: analyzingAI || loadingAnalysis },
                            analyzingAI || loadingAnalysis ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Sparkles, { className: "mr-2 h-4 w-4" })),
                            hasSavedAnalysis ? t('View AI Analysis') : t('AI Analysis')),
                        reportData && (React.createElement(export_charts_pdf_button_1.ExportChartsPDFButton, { filename: "charts_" + ((selectedType === null || selectedType === void 0 ? void 0 : selectedType.slug) || 'report'), variant: "outline", size: "sm" })))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, t('Select Document Model')),
                    React.createElement(card_1.CardDescription, null, t('Choose a document type to view the report'))),
                React.createElement(card_1.CardContent, null,
                    React.createElement(select_1.Select, { value: selectedTypeId, onValueChange: setSelectedTypeId },
                        React.createElement(select_1.SelectTrigger, { className: "w-full max-w-md" },
                            React.createElement(select_1.SelectValue, { placeholder: t('Select a document model...') })),
                        React.createElement(select_1.SelectContent, null, documentTypes.map(function (type) { return (React.createElement(select_1.SelectItem, { key: type.id, value: type.id.toString() },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                                type.name,
                                React.createElement("span", { className: "text-muted-foreground" },
                                    "(",
                                    type.documents_count,
                                    " ",
                                    t('documents'),
                                    ")")))); }))),
                    documentTypes.length === 0 && (React.createElement("p", { className: "text-sm text-muted-foreground mt-4" }, t('No document types found. Create documents first to generate reports.'))))),
            showConfigurator && selectedType && (React.createElement(ReportConfigurator_1.ReportConfigurator, { documentTypeId: selectedType.id, fields: selectedType.fields, calculatedFields: calculatedFields, onCalculatedFieldsChange: setCalculatedFields, onConfigChange: handleConfigChange, onPreviewRequest: handlePreviewRequest, loading: loading })),
            loading && (React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-primary" }))),
            reportData && !loading && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" },
                    React.createElement(charts_1.StatsCard, { title: t('Total Documents'), value: reportData.totalDocuments, icon: lucide_react_1.FileText }),
                    React.createElement(charts_1.StatsCard, { title: t('Visible Fields'), value: visibleFields.length, icon: lucide_react_1.BarChart3 }),
                    Object.entries(reportData.aggregated)
                        .filter(function (_a) {
                        var _ = _a[0], field = _a[1];
                        return field.type === 'number' && field.sum !== undefined;
                    })
                        .slice(0, 2)
                        .map(function (_a) {
                        var fieldName = _a[0], field = _a[1];
                        return (React.createElement(charts_1.StatsCard, { key: fieldName, title: "Total " + field.label, value: formatNumber(field.sum), description: "M\u00E9dia: " + formatNumber(field.avg), icon: lucide_react_1.Calculator }));
                    })),
                React.createElement(tabs_1.Tabs, { value: activeView, onValueChange: function (v) { return setActiveView(v); }, className: "w-full" },
                    React.createElement("div", { className: "flex items-center justify-between mb-4" },
                        React.createElement(tabs_1.TabsList, null,
                            React.createElement(tabs_1.TabsTrigger, { value: "charts", className: "gap-2" },
                                React.createElement(lucide_react_1.PieChart, { className: "h-4 w-4" }),
                                t('Charts')),
                            React.createElement(tabs_1.TabsTrigger, { value: "table", className: "gap-2" },
                                React.createElement(lucide_react_1.Table2, { className: "h-4 w-4" }),
                                t('Table')),
                            React.createElement(tabs_1.TabsTrigger, { value: "tables", className: "gap-2" },
                                React.createElement(lucide_react_1.Database, { className: "h-4 w-4" }),
                                t('Tables'),
                                tableFields.length > 0 && (React.createElement(badge_1.Badge, { variant: "secondary", className: "ml-1 h-5 px-1.5 text-xs" }, tableFields.length)))),
                        React.createElement("div", { className: "flex items-center gap-4" }, activeView === 'table' && selectedType && (React.createElement("div", { className: "text-sm text-muted-foreground" }, calculatedFields.length > 0 && (React.createElement("span", null,
                            calculatedFields.length,
                            " ",
                            t('calculated field(s)'))))))),
                    React.createElement(tabs_1.TabsContent, { value: "charts", className: "space-y-6 mt-0" }, displayCharts.length > 0 ? (React.createElement("div", { className: "grid gap-6 md:grid-cols-2", "data-charts-container": true }, displayCharts.map(function (chart) { return (React.createElement("div", { key: chart.id, "data-chart-card": true },
                        React.createElement(charts_1.ChartCard, { title: chart.title, description: chart.description, data: chart.data, chartType: chart.type, onChartTypeChange: function (type) { return handleChartTypeChange(chart.id, type); }, color: chart.color, onColorChange: function (color) { return setChartColors(function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), (_a = {}, _a[chart.id] = color, _a)));
                            }); } }))); }))) : (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center py-12" },
                            React.createElement(lucide_react_1.BarChart3, { className: "h-12 w-12 text-muted-foreground/50 mb-4" }),
                            React.createElement("p", { className: "text-muted-foreground" }, t('No data available to generate charts')))))),
                    React.createElement(tabs_1.TabsContent, { value: "table", className: "space-y-4 mt-0" },
                        React.createElement("div", { className: "grid gap-4 lg:grid-cols-4" },
                            React.createElement("div", { className: "lg:col-span-1" }, selectedType && (React.createElement(CalculatedFieldBuilder_1.CalculatedFieldBuilder, { fields: selectedType.fields, calculatedFields: calculatedFields, onAdd: handleAddCalculatedField, onRemove: handleRemoveCalculatedField }))),
                            React.createElement("div", { className: "lg:col-span-3" }, selectedType && (React.createElement(ReportTableView_1.ReportTableView, { documents: reportData.documents, fields: selectedType.fields, calculatedFields: calculatedFields, visibleFields: visibleFields }))))),
                    React.createElement(tabs_1.TabsContent, { value: "tables", className: "space-y-4 mt-0" }, selectedType && (React.createElement(TablesView_1.TablesView, { documents: reportData.documents, fields: selectedType.fields })))))),
            !selectedTypeId && !loading && documentTypes.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center py-16" },
                    React.createElement(lucide_react_1.BarChart3, { className: "h-16 w-16 text-muted-foreground/30 mb-4" }),
                    React.createElement("h3", { className: "text-lg font-medium mb-2" }, t('Select a document model')),
                    React.createElement("p", { className: "text-muted-foreground text-center max-w-md" }, t('Choose a document type above to view detailed reports with interactive charts and statistics from extracted data.'))))),
            React.createElement(AIAnalysisModal_1.AIAnalysisModal, { open: showAIAnalysis, onOpenChange: setShowAIAnalysis, analysis: aiAnalysis, documentTypeName: (selectedType === null || selectedType === void 0 ? void 0 : selectedType.name) || '', loading: analyzingAI, onReanalyze: function () {
                    setAiAnalysis(null);
                }, onAnalyze: function (instructions) {
                    setAiInstructions(instructions);
                    handleAnalyzeWithAI(instructions);
                }, instructions: aiInstructions }))));
}
exports["default"] = ReportsIndex;
