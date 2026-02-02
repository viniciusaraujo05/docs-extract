"use strict";
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
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var tooltip_1 = require("@/components/ui/tooltip");
var app_layout_1 = require("@/layouts/app-layout");
var utils_1 = require("@/lib/utils");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
var react_i18next_1 = require("react-i18next");
var dialog_1 = require("@/components/ui/dialog");
function formatFileSize(bytes) {
    if (bytes < 1024)
        return bytes + ' B';
    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function getRelativeTime(dateString, t) {
    var date = new Date(dateString);
    var now = new Date();
    var diffMs = now.getTime() - date.getTime();
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1)
        return t('Just now');
    if (diffMins < 60)
        return diffMins + " " + t('min ago');
    if (diffHours < 24)
        return diffHours + " " + t('h ago');
    if (diffDays < 7)
        return diffDays + " " + t('days ago');
    return formatDate(dateString);
}
function getFileIcon(mimeType) {
    if (!mimeType)
        return lucide_react_1.FileText;
    if (mimeType === 'application/pdf')
        return lucide_react_1.File;
    if (mimeType.startsWith('image/'))
        return lucide_react_1.FileImage;
    return lucide_react_1.FileText;
}
function DocumentCard(_a) {
    var _b;
    var document = _a.document, isSelected = _a.isSelected, onSelect = _a.onSelect, onDelete = _a.onDelete, index = _a.index, locale = _a.locale;
    var t = react_i18next_1.useTranslation().t;
    var statusConfig = {
        pending: { label: t('Pending'), variant: 'secondary', icon: lucide_react_1.Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        processing: { label: t('Processing'), variant: 'default', icon: lucide_react_1.Loader2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        completed: { label: t('Completed'), variant: 'default', icon: lucide_react_1.CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
        failed: { label: t('Failed'), variant: 'destructive', icon: lucide_react_1.XCircle, color: 'text-red-600 bg-red-50 border-red-200' }
    };
    var status = statusConfig[document.status];
    var StatusIcon = status.icon;
    var FileIcon = getFileIcon(document.mime_type);
    var handleCardClick = function (e) {
        // Don't navigate if clicking on checkbox or buttons
        var target = e.target;
        if (target.closest('button') || target.closest('[role="checkbox"]')) {
            return;
        }
        react_1.router.visit("/" + locale + "/documents/" + document.id);
    };
    return (React.createElement("div", { className: utils_1.cn("group relative rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer", "animate-in fade-in-0 slide-in-from-bottom-4", isSelected && "ring-2 ring-primary border-primary bg-primary/5"), style: { animationDelay: index * 50 + "ms", animationFillMode: 'backwards' }, onClick: handleCardClick },
        React.createElement("div", { className: utils_1.cn("absolute top-3 left-3 z-10 transition-all duration-200", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100") },
            React.createElement(checkbox_1.Checkbox, { checked: isSelected, onCheckedChange: function () { return onSelect(document.id); }, className: "h-5 w-5" })),
        React.createElement("div", { className: "absolute top-3 right-3 z-10" },
            React.createElement(tooltip_1.TooltipProvider, null,
                React.createElement(tooltip_1.Tooltip, null,
                    React.createElement(tooltip_1.TooltipTrigger, null,
                        React.createElement("div", { className: utils_1.cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border", status.color) },
                            React.createElement(StatusIcon, { className: utils_1.cn("h-3 w-3", document.status === 'processing' && "animate-spin") }),
                            React.createElement("span", { className: "hidden sm:inline" }, status.label))),
                    React.createElement(tooltip_1.TooltipContent, null,
                        React.createElement("p", null, status.label))))),
        React.createElement("div", { className: "flex flex-col items-center pt-6 pb-4" },
            React.createElement("div", { className: utils_1.cn("flex h-16 w-16 items-center justify-center rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110", document.mime_type === 'application/pdf'
                    ? "bg-red-100 text-red-600"
                    : ((_b = document.mime_type) === null || _b === void 0 ? void 0 : _b.startsWith('image/')) ? "bg-blue-100 text-blue-600"
                        : "bg-primary/10 text-primary") },
                React.createElement(FileIcon, { className: "h-8 w-8" })),
            React.createElement("span", { className: "font-semibold text-center hover:text-primary transition-colors line-clamp-2 px-2" }, document.name),
            document.document_type && (React.createElement(badge_1.Badge, { variant: "outline", className: "mt-2 text-xs" }, document.document_type.name))),
        React.createElement("div", { className: "border-t pt-3 mt-2 text-xs text-muted-foreground" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("span", { className: "flex items-center gap-1" },
                    React.createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                    getRelativeTime(document.created_at, t)),
                React.createElement("span", { className: "text-[10px]" }, formatFileSize(document.file_size)))),
        React.createElement("div", { className: utils_1.cn("absolute bottom-12 right-3 z-10 flex items-center gap-1 rounded-lg bg-background/95 backdrop-blur-sm border shadow-sm px-1 transition-all duration-200", "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0") },
            React.createElement(tooltip_1.TooltipProvider, null,
                React.createElement(tooltip_1.Tooltip, null,
                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7", asChild: true },
                            React.createElement(react_1.Link, { href: "/" + locale + "/documents/" + document.id },
                                React.createElement(lucide_react_1.Eye, { className: "h-3.5 w-3.5" })))),
                    React.createElement(tooltip_1.TooltipContent, null, t('View details')))),
            React.createElement(tooltip_1.TooltipProvider, null,
                React.createElement(tooltip_1.Tooltip, null,
                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10", onClick: function (e) {
                                e.stopPropagation();
                                onDelete(document.id);
                            } },
                            React.createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }))),
                    React.createElement(tooltip_1.TooltipContent, null, t('Delete')))))));
}
function DocumentsIndex(_a) {
    var _this = this;
    var documents = _a.documents, _b = _a.documentTypes, documentTypes = _b === void 0 ? [] : _b, _c = _a.recentBatches, recentBatches = _c === void 0 ? [] : _c;
    var t = react_i18next_1.useTranslation().t;
    // Force re-render
    var _d = react_2.useState(function () {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selected-locale') || 'pt';
        }
        return 'pt';
    }), locale = _d[0], setLocale = _d[1];
    react_2.useEffect(function () {
        var savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);
    var breadcrumbs = [
        { title: t('Dashboard'), href: "/" + locale + "/dashboard" },
        { title: t('Documents'), href: "/" + locale + "/documents" },
    ];
    var statusConfig = {
        pending: { label: t('Pending'), variant: 'secondary', icon: lucide_react_1.Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        processing: { label: t('Processing'), variant: 'default', icon: lucide_react_1.Loader2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        completed: { label: t('Completed'), variant: 'default', icon: lucide_react_1.CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
        failed: { label: t('Failed'), variant: 'destructive', icon: lucide_react_1.XCircle, color: 'text-red-600 bg-red-50 border-red-200' }
    };
    // State
    var _e = react_2.useState(''), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = react_2.useState('all'), selectedType = _f[0], setSelectedType = _f[1];
    var _g = react_2.useState('all'), selectedStatus = _g[0], setSelectedStatus = _g[1];
    var _h = react_2.useState('date'), sortBy = _h[0], setSortBy = _h[1];
    var _j = react_2.useState(new Set()), selectedIds = _j[0], setSelectedIds = _j[1];
    // Get unique document types from documents
    var types = react_2.useMemo(function () {
        if (documentTypes.length > 0) {
            return documentTypes.map(function (type) {
                var _a;
                return ({
                    id: type.id,
                    name: type.name,
                    description: (_a = type.description) !== null && _a !== void 0 ? _a : null
                });
            });
        }
        var typeSet = new Map();
        documents.data.forEach(function (doc) {
            if (doc.document_type) {
                typeSet.set(doc.document_type.id, doc.document_type.name);
            }
        });
        return Array.from(typeSet, function (_a) {
            var id = _a[0], name = _a[1];
            return ({ id: id, name: name, description: null });
        });
    }, [documentTypes, documents.data]);
    // Filter and sort documents
    var filteredDocuments = react_2.useMemo(function () {
        var result = __spreadArrays(documents.data);
        // Search filter
        if (searchQuery) {
            var query_1 = searchQuery.toLowerCase();
            result = result.filter(function (doc) {
                var _a;
                return doc.name.toLowerCase().includes(query_1) || ((_a = doc.document_type) === null || _a === void 0 ? void 0 : _a.name.toLowerCase().includes(query_1));
            });
        }
        // Type filter
        if (selectedType !== 'all') {
            result = result.filter(function (doc) { var _a; return ((_a = doc.document_type) === null || _a === void 0 ? void 0 : _a.id) === parseInt(selectedType); });
        }
        // Status filter
        if (selectedStatus !== 'all') {
            result = result.filter(function (doc) { return doc.status === selectedStatus; });
        }
        // Sort
        result.sort(function (a, b) {
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
    var handleSelect = react_2.useCallback(function (id) {
        setSelectedIds(function (prev) {
            var next = new Set(prev);
            if (next.has(id)) {
                next["delete"](id);
            }
            else {
                next.add(id);
            }
            return next;
        });
    }, []);
    var handleSelectAll = react_2.useCallback(function () {
        if (selectedIds.size === filteredDocuments.length) {
            setSelectedIds(new Set());
        }
        else {
            setSelectedIds(new Set(filteredDocuments.map(function (d) { return d.id; })));
        }
    }, [filteredDocuments, selectedIds.size]);
    var handleDelete = react_2.useCallback(function (id) {
        sonner_1.toast((function (toastId) { return (React.createElement("div", { className: "flex flex-col gap-2" },
            React.createElement("p", null, t('Are you sure you want to delete this document?')),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", { onClick: function () {
                        sonner_1.toast.dismiss(toastId);
                        react_1.router["delete"]("/api/documents/" + id, {
                            onSuccess: function () {
                                sonner_1.toast.success(t('Document deleted successfully!'));
                                setSelectedIds(function (prev) {
                                    var next = new Set(prev);
                                    next["delete"](id);
                                    return next;
                                });
                            },
                            onError: function () {
                                sonner_1.toast.error(t('Error deleting document'));
                            }
                        });
                    }, className: "px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" }, t('Delete')),
                React.createElement("button", { onClick: function () { return sonner_1.toast.dismiss(toastId); }, className: "px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600" }, t('Cancel'))))); }));
    }, [locale, t]);
    var handleDeleteSelected = react_2.useCallback(function () {
        if (selectedIds.size === 0)
            return;
        sonner_1.toast((function (toastId) { return (React.createElement("div", { className: "flex flex-col gap-2" },
            React.createElement("p", null, t('Are you sure you want to delete {{count}} document(s)?', { count: selectedIds.size })),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", { onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                        var ids, deletePromises, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    sonner_1.toast.dismiss(toastId);
                                    ids = Array.from(selectedIds);
                                    deletePromises = ids.map(function (id) {
                                        return new Promise(function (resolve, reject) {
                                            react_1.router["delete"]("/api/documents/" + id, {
                                                preserveScroll: true,
                                                preserveState: false,
                                                onSuccess: function () { return resolve(); },
                                                onError: function () { return reject(new Error("Failed to delete document " + id)); }
                                            });
                                        });
                                    });
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, Promise.all(deletePromises)];
                                case 2:
                                    _a.sent();
                                    sonner_1.toast.success(t('{{count}} document(s) deleted!', { count: ids.length }));
                                    setSelectedIds(new Set());
                                    // Força reload da página para atualizar a lista
                                    react_1.router.reload({ only: ['documents'] });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    sonner_1.toast.error(t('Some documents could not be deleted'));
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }, className: "px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" }, t('Delete')),
                React.createElement("button", { onClick: function () { return sonner_1.toast.dismiss(toastId); }, className: "px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600" }, t('Cancel'))))); }));
    }, [selectedIds, locale, t]);
    var clearFilters = react_2.useCallback(function () {
        setSearchQuery('');
        setSelectedType('all');
        setSelectedStatus('all');
    }, []);
    var hasActiveFilters = searchQuery || selectedType !== 'all' || selectedStatus !== 'all';
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: t('Documents') }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-6 p-4 lg:p-6" },
            React.createElement("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in-0 slide-in-from-top-4 duration-500" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-2xl font-bold tracking-tight" }, t('Documents')),
                    React.createElement("p", { className: "text-muted-foreground" }, t('Manage and view your processed documents'))),
                React.createElement("div", { className: "flex items-center gap-2" },
                    recentBatches && recentBatches.length > 0 && (React.createElement(dialog_1.Dialog, null,
                        React.createElement(dialog_1.DialogTrigger, { asChild: true },
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-foreground" },
                                React.createElement(lucide_react_1.History, { className: "h-5 w-5" }))),
                        React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto" },
                            React.createElement(dialog_1.DialogHeader, null,
                                React.createElement(dialog_1.DialogTitle, null, t('Upload History')),
                                React.createElement(dialog_1.DialogDescription, null, t('Recent batch processing tasks'))),
                            React.createElement("div", { className: "space-y-2 py-4" }, recentBatches.map(function (batch) { return (React.createElement("div", { key: batch.id, className: "flex items-center justify-between p-3 rounded-lg border border-transparent hover:bg-muted/50 hover:border-border cursor-pointer transition-all group", onClick: function () { return react_1.router.visit("/" + locale + "/documents/batch/" + batch.id + "/progress"); } },
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement("div", { className: utils_1.cn("flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 border", batch.status === 'completed' && "bg-green-100/50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400", batch.status === 'processing' && "bg-blue-100/50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400", batch.status === 'failed' && "bg-red-100/50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400") }, batch.status === 'completed' ? React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4" }) :
                                        batch.status === 'processing' ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) :
                                            batch.status === 'failed' ? React.createElement(lucide_react_1.XCircle, { className: "h-4 w-4" }) :
                                                React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" })),
                                    React.createElement("div", { className: "flex flex-col" },
                                        React.createElement("span", { className: "font-medium text-sm text-foreground group-hover:text-primary transition-colors" }, batch.template_name),
                                        React.createElement("span", { className: "text-xs text-muted-foreground" }, getRelativeTime(batch.created_at, t)))),
                                React.createElement("div", { className: "flex items-center gap-4" },
                                    React.createElement("div", { className: "hidden sm:flex flex-col items-end gap-1 min-w-[5rem]" },
                                        React.createElement("div", { className: "flex items-center justify-between w-full text-xs" },
                                            React.createElement("span", { className: "text-muted-foreground" },
                                                batch.progress.processed,
                                                "/",
                                                batch.progress.total),
                                            React.createElement("span", { className: "font-medium" },
                                                batch.progress.percentage,
                                                "%")),
                                        React.createElement("div", { className: "h-1.5 w-full bg-secondary rounded-full overflow-hidden" },
                                            React.createElement("div", { className: utils_1.cn("h-full transition-all duration-500", batch.status === 'failed' ? "bg-destructive" :
                                                    batch.status === 'completed' ? "bg-green-500" : "bg-primary"), style: { width: batch.progress.percentage + "%" } }))),
                                    React.createElement(badge_1.Badge, { variant: batch.status === 'completed' ? 'default' : 'secondary', className: "capitalize" }, batch.status)))); }))))),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", asChild: true, className: "hidden sm:flex" },
                        React.createElement(react_1.Link, { href: "/" + locale + "/document-types" },
                            React.createElement(lucide_react_1.Settings2, { className: "mr-2 h-4 w-4" }),
                            t('Models'))),
                    React.createElement(button_1.Button, { asChild: true, className: "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" },
                        React.createElement(react_1.Link, { href: "/" + locale + "/documents/create" },
                            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                            t('New Document'))))),
            React.createElement("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500", style: { animationDelay: '100ms' } },
                React.createElement(card_1.Card, { className: "p-4 hover:shadow-md transition-shadow" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10" },
                            React.createElement(lucide_react_1.FolderOpen, { className: "h-5 w-5 text-primary" })),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-2xl font-bold" }, documents.data.length),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Total'))))),
                React.createElement(card_1.Card, { className: "p-4 hover:shadow-md transition-shadow" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-green-100" },
                            React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-600" })),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-2xl font-bold" }, documents.data.filter(function (d) { return d.status === 'completed'; }).length),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Completed'))))),
                React.createElement(card_1.Card, { className: "p-4 hover:shadow-md transition-shadow" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100" },
                            React.createElement(lucide_react_1.Clock, { className: "h-5 w-5 text-amber-600" })),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-2xl font-bold" }, documents.data.filter(function (d) { return d.status === 'pending' || d.status === 'processing'; }).length),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Pending'))))),
                React.createElement(card_1.Card, { className: "p-4 hover:shadow-md transition-shadow" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100" },
                            React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-blue-600" })),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-2xl font-bold" }, types.length),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Models')))))),
            React.createElement(card_1.Card, { className: "p-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500", style: { animationDelay: '200ms' } },
                React.createElement("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" },
                    React.createElement("div", { className: "flex flex-1 flex-col gap-3 sm:flex-row sm:items-center" },
                        React.createElement("div", { className: "relative flex-1 max-w-md" },
                            React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: t('Search documents...'), value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 pr-9" }),
                            searchQuery && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2", onClick: function () { return setSearchQuery(''); } },
                                React.createElement(lucide_react_1.X, { className: "h-4 w-4" })))),
                        React.createElement(select_1.Select, { value: selectedType, onValueChange: setSelectedType },
                            React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-[180px]" },
                                React.createElement(lucide_react_1.Filter, { className: "mr-2 h-4 w-4" }),
                                React.createElement(select_1.SelectValue, { placeholder: t('Model') })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, t('All models')),
                                types.map(function (type) { return (React.createElement(select_1.SelectItem, { key: type.id, value: type.id.toString() }, type.name)); }))),
                        React.createElement(select_1.Select, { value: selectedStatus, onValueChange: setSelectedStatus },
                            React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-[160px]" },
                                React.createElement(select_1.SelectValue, { placeholder: t('State') })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, t('All states')),
                                React.createElement(select_1.SelectItem, { value: "completed" }, t('Completed')),
                                React.createElement(select_1.SelectItem, { value: "pending" }, t('Pending')),
                                React.createElement(select_1.SelectItem, { value: "processing" }, t('Processing')),
                                React.createElement(select_1.SelectItem, { value: "failed" }, t('Failed')))),
                        React.createElement(select_1.Select, { value: sortBy, onValueChange: function (v) { return setSortBy(v); } },
                            React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-[140px]" },
                                React.createElement(lucide_react_1.ArrowUpDown, { className: "mr-2 h-4 w-4" }),
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "date" }, t('Date')),
                                React.createElement(select_1.SelectItem, { value: "name" }, t('Name')),
                                React.createElement(select_1.SelectItem, { value: "size" }, t('Size')))),
                        hasActiveFilters && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearFilters, className: "shrink-0" },
                            React.createElement(lucide_react_1.X, { className: "mr-2 h-4 w-4" }),
                            t('Clear')))),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleSelectAll, className: "shrink-0" }, selectedIds.size === filteredDocuments.length && filteredDocuments.length > 0 ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.CheckSquare, { className: "mr-2 h-4 w-4" }),
                            t('Deselect'))) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Square, { className: "mr-2 h-4 w-4" }),
                            t('Select')))),
                        selectedIds.size > 0 && (React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: handleDeleteSelected, className: "shrink-0 animate-in fade-in-0 zoom-in-95" },
                            React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                            t('Delete'),
                            " (",
                            selectedIds.size,
                            ")"))))),
            React.createElement("div", { className: "flex items-center justify-between text-sm text-muted-foreground animate-in fade-in-0 duration-300", style: { animationDelay: '300ms' } },
                React.createElement("span", null, filteredDocuments.length === documents.data.length
                    ? documents.data.length + " " + t('document(s)')
                    : filteredDocuments.length + " " + t('of') + " " + documents.data.length + " " + t('document(s)')),
                selectedIds.size > 0 && (React.createElement("span", { className: "text-primary font-medium" },
                    selectedIds.size,
                    " ",
                    t('selected')))),
            filteredDocuments.length === 0 ? (React.createElement(card_1.Card, { className: "flex flex-col items-center justify-center py-16 animate-in fade-in-0 zoom-in-95 duration-500" },
                React.createElement("div", { className: "rounded-full bg-muted p-6 mb-4" },
                    React.createElement(lucide_react_1.FileText, { className: "h-12 w-12 text-muted-foreground/50" })),
                React.createElement("h3", { className: "text-lg font-semibold mb-2" }, hasActiveFilters ? t('No results') : t('No documents')),
                React.createElement("p", { className: "text-muted-foreground text-center max-w-sm mb-6" }, hasActiveFilters
                    ? t('Try adjusting the filters to find what you\'re looking for.')
                    : t('Start by uploading your first document to extract data.')),
                hasActiveFilters ? (React.createElement(button_1.Button, { variant: "outline", onClick: clearFilters },
                    React.createElement(lucide_react_1.X, { className: "mr-2 h-4 w-4" }),
                    t('Clear filters'))) : (React.createElement(button_1.Button, { asChild: true },
                    React.createElement(react_1.Link, { href: "/" + locale + "/documents/create" },
                        React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                        t('Upload Document')))))) : (React.createElement("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" }, filteredDocuments.map(function (doc, index) { return (React.createElement(DocumentCard, { key: doc.id, document: doc, isSelected: selectedIds.has(doc.id), onSelect: handleSelect, onDelete: handleDelete, index: index, locale: locale })); }))))));
}
exports["default"] = DocumentsIndex;
