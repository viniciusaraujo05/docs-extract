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
exports.__esModule = true;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var dialog_1 = require("@/components/ui/dialog");
var app_layout_1 = require("@/layouts/app-layout");
var batch_status_1 = require("@/utils/batch-status");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var react_i18next_1 = require("react-i18next");
var sonner_1 = require("sonner");
var DocumentEditForm_1 = require("@/components/documents/DocumentEditForm");
function BatchProgress(_a) {
    var _this = this;
    var initialBatch = _a.batch, initialDocuments = _a.documents, hasGoogleConnection = _a.hasGoogleConnection;
    var t = react_i18next_1.useTranslation().t;
    var props = react_1.usePage().props;
    var locale = props.locale || 'pt';
    var _b = react_2.useState(initialBatch), batch = _b[0], setBatch = _b[1];
    var _c = react_2.useState(initialDocuments), documents = _c[0], setDocuments = _c[1];
    var _d = react_2.useState(initialBatch.status === 'pending' || initialBatch.status === 'processing'), isPolling = _d[0], setIsPolling = _d[1];
    var _e = react_2.useState(false), isRefreshing = _e[0], setIsRefreshing = _e[1];
    // Quick View State
    var _f = react_2.useState(null), selectedDocId = _f[0], setSelectedDocId = _f[1];
    var _g = react_2.useState(false), isSavingDoc = _g[0], setIsSavingDoc = _g[1];
    // Derived State
    var selectedDocument = react_2.useMemo(function () {
        return documents.find(function (d) { return d.id === selectedDocId; });
    }, [documents, selectedDocId]);
    var stats = react_2.useMemo(function () {
        var total = documents.length;
        var completed = documents.filter(function (d) { return d.status === 'completed'; }).length;
        var failed = documents.filter(function (d) { return d.status === 'failed'; }).length;
        var processing = documents.filter(function (d) { return d.status === 'processing' || d.status === 'pending'; }).length;
        return { total: total, completed: completed, failed: failed, processing: processing };
    }, [documents]);
    var batchStatus = batch_status_1.getStatusConfig(batch.status, t);
    // Polling Logic
    react_2.useEffect(function () {
        if (!isPolling)
            return;
        var abortController = new AbortController();
        var interval = setInterval(function () {
            fetch("/" + locale + "/documents/batch/" + batch.id + "/progress?json=true", {
                signal: abortController.signal,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(function (res) {
                if (!res.ok)
                    throw new Error('Network response was not ok');
                return res.json();
            })
                .then(function (data) {
                setBatch(data.batch);
                setDocuments(data.documents);
                if (data.batch.status === 'completed' || data.batch.status === 'failed') {
                    setIsPolling(false);
                    sonner_1.toast.success(t('Batch processing finished'));
                }
            })["catch"](function (error) {
                if (error.name !== 'AbortError') {
                    console.error('Polling error:', error);
                }
            });
        }, 3000);
        return function () {
            clearInterval(interval);
            abortController.abort();
        };
    }, [isPolling, batch.id, locale, t]);
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsRefreshing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/" + locale + "/documents/batch/" + batch.id + "/progress?json=true")];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error('Refresh failed');
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    setBatch(data.batch);
                    setDocuments(data.documents);
                    if (data.batch.status === 'completed' || data.batch.status === 'failed') {
                        setIsPolling(false);
                    }
                    else {
                        setIsPolling(true);
                    }
                    sonner_1.toast.success(t('Refreshed successfully'));
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error(error_1);
                    sonner_1.toast.error(t('Failed to refresh data'));
                    return [3 /*break*/, 6];
                case 5:
                    setIsRefreshing(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Quick View Handlers
    var handleQuickView = function (docId) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, fullDoc_1, previewUrl_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSelectedDocId(docId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("/" + locale + "/documents/" + docId, {
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
                    data = _a.sent();
                    fullDoc_1 = data.document, previewUrl_1 = data.previewUrl;
                    setDocuments(function (prev) { return prev.map(function (d) { return d.id === docId ? __assign(__assign(__assign({}, d), fullDoc_1), { previewUrl: previewUrl_1 }) : d; }); });
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    console.error("Failed to load doc details", e_1);
                    sonner_1.toast.error(t('Failed to load document details'));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveQuickEdit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedDocId)
                        return [2 /*return*/];
                    setIsSavingDoc(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            react_1.router.put("/api/documents/" + selectedDocId + "/data", {
                                extracted_data: data
                            }, {
                                preserveScroll: true,
                                preserveState: true,
                                onSuccess: function () {
                                    sonner_1.toast.success(t('Data saved successfully!'));
                                    setDocuments(function (prev) { return prev.map(function (d) { return d.id === selectedDocId ? __assign(__assign({}, d), { extracted_data: data }) : d; }); });
                                    setSelectedDocId(null);
                                    resolve();
                                },
                                onError: function () {
                                    sonner_1.toast.error(t('Error saving data'));
                                    reject();
                                },
                                onFinish: function () { return setIsSavingDoc(false); }
                            });
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var breadcrumbs = [
        { title: t('Dashboard'), href: "/" + locale + "/dashboard" },
        { title: t('Documents'), href: "/" + locale + "/documents" },
        { title: t('Batch Processing'), href: '#' },
    ];
    var handleCancel = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm(t('Are you sure you want to cancel the batch processing? Pending documents will be skipped.'))) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, react_1.router.post("/api/documents/batch/" + batch.id + "/cancel", {}, {
                            preserveScroll: true,
                            onSuccess: function () {
                                sonner_1.toast.success(t('Batch processing cancelled'));
                                setIsPolling(false);
                                // Update local state immediately to reflect change
                                setBatch(function (prev) { return (__assign(__assign({}, prev), { status: 'cancelled' })); });
                            },
                            onError: function () {
                                sonner_1.toast.error(t('Failed to cancel batch'));
                            }
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error(error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleExportToSheets = function () { return __awaiter(_this, void 0, void 0, function () {
        var promise;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            try {
                promise = fetch("/api/integrations/batch/" + batch.id + "/export", {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': ((_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || '',
                        'Accept': 'application/json'
                    }
                });
                sonner_1.toast.promise(promise, {
                    loading: t('Starting export...'),
                    success: function (response) { return __awaiter(_this, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, response.json()];
                                case 1:
                                    data = _a.sent();
                                    if (response.ok && data.success) {
                                        return [2 /*return*/, t('Export started! Check your Google Drive soon.')];
                                    }
                                    else {
                                        throw new Error(data.error || 'Unknown error');
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); },
                    error: function (err) { return t('Export failed: ') + (err.message || t('Unknown error')); }
                });
            }
            catch (error) {
                console.error(error);
                sonner_1.toast.error(t('Export failed. Please try again.'));
            }
            return [2 /*return*/];
        });
    }); };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: t('Batch Processing') + " - " + batch.template_name }),
        React.createElement("div", { className: "flex h-[calc(100vh-4rem)] flex-col gap-6 p-4 lg:p-6 overflow-hidden" },
            React.createElement("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0" },
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return react_1.router.visit("/" + locale + "/documents"); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" })),
                    React.createElement("div", null,
                        React.createElement("h1", { className: "text-2xl font-bold tracking-tight flex items-center gap-2" },
                            batch.template_name,
                            React.createElement(badge_1.Badge, { variant: batchStatus.variant, className: batchStatus.color },
                                React.createElement(batchStatus.icon, { className: "mr-1 h-3 w-3" }),
                                batchStatus.label)),
                        React.createElement("p", { className: "text-muted-foreground text-sm" },
                            t('Started at'),
                            ": ",
                            new Date(batch.created_at).toLocaleString(locale)))),
                React.createElement("div", { className: "flex items-center gap-2" },
                    hasGoogleConnection && (batch.status === 'completed' || batch.status === 'processed') && (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExportToSheets, className: "text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mr-2" },
                            React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
                            React.createElement("line", { x1: "3", y1: "9", x2: "21", y2: "9" }),
                            React.createElement("line", { x1: "3", y1: "15", x2: "21", y2: "15" }),
                            React.createElement("line", { x1: "9", y1: "9", x2: "9", y2: "21" }),
                            React.createElement("line", { x1: "15", y1: "9", x2: "15", y2: "21" })),
                        t('Export to Sheets'))),
                    (batch.status === 'processing' || batch.status === 'pending') && (React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: handleCancel, disabled: isRefreshing }, t('Cancel Processing'))),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleRefresh, disabled: isRefreshing || isPolling },
                        React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4 " + (isRefreshing || isPolling ? 'animate-spin' : '') }),
                        isPolling ? t('Syncing...') : t('Refresh')))),
            React.createElement(card_1.Card, { className: "shrink-0 bg-muted/30" },
                React.createElement(card_1.CardContent, { className: "p-6" },
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex justify-between text-sm font-medium" },
                            React.createElement("span", null, t('Overall Progress')),
                            React.createElement("span", null,
                                batch.progress.percentage,
                                "%")),
                        React.createElement(progress_1.Progress, { value: batch.progress.percentage, className: "h-2" }),
                        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm pt-2" },
                            React.createElement("div", { className: "flex flex-col" },
                                React.createElement("span", { className: "text-muted-foreground" }, t('Total')),
                                React.createElement("span", { className: "font-bold text-lg" }, stats.total)),
                            React.createElement("div", { className: "flex flex-col" },
                                React.createElement("span", { className: "text-green-600 font-medium" }, t('Completed')),
                                React.createElement("span", { className: "font-bold text-lg" }, stats.completed)),
                            React.createElement("div", { className: "flex flex-col" },
                                React.createElement("span", { className: "text-blue-600 font-medium" }, t('Processing')),
                                React.createElement("span", { className: "font-bold text-lg" }, stats.processing)),
                            React.createElement("div", { className: "flex flex-col" },
                                React.createElement("span", { className: "text-red-600 font-medium" }, t('Failed')),
                                React.createElement("span", { className: "font-bold text-lg" }, stats.failed)))))),
            React.createElement(separator_1.Separator, null),
            React.createElement("div", { className: "flex-1 min-h-0 overflow-y-auto rounded-lg border bg-card" },
                React.createElement("div", { className: "divide-y" }, documents.map(function (doc) {
                    var status = batch_status_1.getStatusConfig(doc.status, t);
                    var StatusIcon = status.icon;
                    return (React.createElement("div", { key: doc.id, className: "p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group" },
                        React.createElement("div", { className: "flex items-center gap-4 overflow-hidden" },
                            React.createElement("div", { className: "p-2 rounded-full border shrink-0 " + status.color },
                                React.createElement(StatusIcon, { className: "h-4 w-4 " + (doc.status === 'processing' ? 'animate-spin' : '') })),
                            React.createElement("div", { className: "min-w-0" },
                                React.createElement("p", { className: "font-medium truncate" }, doc.name),
                                doc.error_message ? (React.createElement("p", { className: "text-xs text-red-500 truncate" }, doc.error_message)) : (React.createElement("p", { className: "text-xs text-muted-foreground" }, status.label)))),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleQuickView(doc.id); }, className: "opacity-0 group-hover:opacity-100 transition-opacity" },
                                React.createElement(lucide_react_1.Eye, { className: "mr-2 h-4 w-4" }),
                                t('Quick View')))));
                })))),
        React.createElement(dialog_1.Dialog, { open: !!selectedDocId, onOpenChange: function (open) { return !open && setSelectedDocId(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-[70rem] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden outline-none" },
                React.createElement(dialog_1.DialogHeader, { className: "px-6 py-4 border-b shrink-0 bg-background z-10" },
                    React.createElement(dialog_1.DialogTitle, null, selectedDocument === null || selectedDocument === void 0 ? void 0 : selectedDocument.name),
                    React.createElement(dialog_1.DialogDescription, null, (selectedDocument === null || selectedDocument === void 0 ? void 0 : selectedDocument.status) === 'completed'
                        ? t('Review and edit extracted data')
                        : t('Document details'))),
                React.createElement("div", { className: "flex-1 overflow-hidden" }, selectedDocument ? (selectedDocument.schema_used ? (React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 h-full" },
                    React.createElement("div", { className: "bg-muted/30 border-r h-full overflow-hidden flex flex-col relative p-4" },
                        React.createElement("div", { className: "absolute top-2 left-4 z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-muted-foreground border shadow-sm" }, t('Preview')),
                        selectedDocument.previewUrl ? (React.createElement("div", { className: "h-full w-full flex items-center justify-center overflow-auto rounded-lg border bg-background shadow-inner" }, selectedDocument.mime_type === 'application/pdf' ? (React.createElement("iframe", { src: selectedDocument.previewUrl, className: "h-full w-full", title: "Document Preview" })) : (React.createElement("img", { src: selectedDocument.previewUrl, alt: selectedDocument.name, className: "max-w-full max-h-full object-contain", loading: "lazy" })))) : (React.createElement("div", { className: "h-full flex items-center justify-center text-muted-foreground" },
                            React.createElement("div", { className: "flex flex-col items-center gap-2" },
                                React.createElement(lucide_react_1.Eye, { className: "h-8 w-8 opacity-20" }),
                                React.createElement("p", null, t('Preview not available')))))),
                    React.createElement("div", { className: "h-full overflow-y-auto p-6 bg-background" },
                        React.createElement(DocumentEditForm_1.DocumentEditForm, { document: selectedDocument, onSave: handleSaveQuickEdit, isSaving: isSavingDoc })))) : (selectedDocument.status === 'processing' || selectedDocument.status === 'pending' ? (React.createElement("div", { className: "flex flex-col items-center justify-center h-full gap-4" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-primary" }),
                    React.createElement("p", { className: "text-muted-foreground text-lg" }, t('Document is currently processing...')))) : (React.createElement("div", { className: "flex flex-col items-center justify-center h-full gap-4" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-muted-foreground" }),
                    React.createElement("p", { className: "text-muted-foreground" }, t('Loading document details...')))))) : null)))));
}
exports["default"] = BatchProgress;
