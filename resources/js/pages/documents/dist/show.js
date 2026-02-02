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
exports.__esModule = true;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
var react_i18next_1 = require("react-i18next");
var react_3 = require("@inertiajs/react");
var export_data_button_1 = require("@/components/export-data-button");
var ArrayFieldModal_1 = require("@/components/fields/ArrayFieldModal");
function formatDate(dateString) {
    if (!dateString)
        return '-';
    return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function getFieldLabel(field) {
    return field.label || field.name.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); });
}
function getInputType(fieldType) {
    switch (fieldType) {
        case 'number':
            return 'number';
        case 'date':
            return 'date';
        default:
            return 'text';
    }
}
function DocumentShow(_a) {
    var _b;
    var document = _a.document, previewUrl = _a.previewUrl;
    var t = react_i18next_1.useTranslation().t;
    var props = react_3.usePage().props;
    var locale = props.locale || 'pt';
    var statusConfig = {
        pending: { label: t('Pending'), variant: 'secondary', icon: lucide_react_1.Clock },
        processing: { label: t('Processing'), variant: 'default', icon: lucide_react_1.Loader2 },
        completed: { label: t('Completed'), variant: 'default', icon: lucide_react_1.CheckCircle },
        failed: { label: t('Failed'), variant: 'destructive', icon: lucide_react_1.XCircle }
    };
    var typeLabels = {
        invoice: t('Invoice'),
        receipt: t('Receipt'),
        custom: t('Custom')
    };
    var status = statusConfig[document.status];
    var StatusIcon = status.icon;
    var _c = react_2.useState(document.status === 'processing' || document.status === 'pending'), isPolling = _c[0], setIsPolling = _c[1];
    var _d = react_2.useState(false), isSaving = _d[0], setIsSaving = _d[1];
    var _e = react_2.useState(false), isZoomed = _e[0], setIsZoomed = _e[1];
    var breadcrumbs = [
        { title: t('Dashboard'), href: "/" + locale + "/dashboard" },
        { title: t('Documents'), href: "/" + locale + "/documents" },
        { title: document.name, href: "/" + locale + "/documents/" + document.id },
    ];
    var schemaFields = ((_b = document.schema_used) === null || _b === void 0 ? void 0 : _b.fields) || [];
    var getInitialData = function () {
        var data = {}; // Changed from Record<string, string>
        schemaFields.forEach(function (field) {
            var _a;
            var value = (_a = document.extracted_data) === null || _a === void 0 ? void 0 : _a[field.name];
            // Preserve arrays and objects, don't convert to string
            if (field.type === 'array' && Array.isArray(value)) {
                data[field.name] = value;
            }
            else {
                data[field.name] = value !== null && value !== void 0 ? value : '';
            }
        });
        return data;
    };
    var _f = react_2.useState(getInitialData), formData = _f[0], setFormData = _f[1];
    var handleFieldChange = function (fieldName, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = value, _a)));
        });
    };
    var handleSave = function () {
        setIsSaving(true);
        react_1.router.put("/api/documents/" + document.id + "/data", {
            extracted_data: formData
        }, {
            onSuccess: function () {
                sonner_1.toast.success(t('Data saved successfully!'));
            },
            onError: function () {
                sonner_1.toast.error(t('Error saving data'));
            },
            onFinish: function () { return setIsSaving(false); }
        });
    };
    react_2.useEffect(function () {
        if (!isPolling)
            return;
        var interval = setInterval(function () {
            react_1.router.reload({
                only: ['document'],
                onSuccess: function () {
                    if (document.status !== 'processing' && document.status !== 'pending') {
                        setIsPolling(false);
                    }
                }
            });
        }, 3000);
        return function () { return clearInterval(interval); };
    }, [isPolling, document.status]);
    react_2.useEffect(function () {
        if (document.status === 'completed' && document.extracted_data) {
            setFormData(getInitialData());
        }
    }, [document.extracted_data, document.status]);
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: document.name }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 p-4" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return react_1.router.visit("/" + locale + "/documents"); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" })),
                    React.createElement("div", null,
                        React.createElement("h1", { className: "text-2xl font-bold" }, document.name),
                        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                            React.createElement("span", null, typeLabels[document.type]),
                            React.createElement("span", null, "\u2022"),
                            React.createElement("span", null, document.original_filename)))),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(badge_1.Badge, { variant: status.variant, className: "flex items-center gap-1" },
                        React.createElement(StatusIcon, { className: "h-3 w-3 " + (document.status === 'processing' ? 'animate-spin' : '') }),
                        status.label))),
            document.error_message && (React.createElement(alert_1.Alert, { variant: "destructive" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertTitle, null, t('Processing error')),
                React.createElement(alert_1.AlertDescription, null, document.error_message))),
            React.createElement("div", { className: "grid flex-1 gap-4 lg:grid-cols-2" },
                React.createElement(card_1.Card, { className: "flex flex-col" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                            t('Preview')),
                        React.createElement(card_1.CardDescription, null, t('Original uploaded document'))),
                    React.createElement(card_1.CardContent, { className: "flex-1" }, previewUrl ? (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "relative h-full min-h-[500px] overflow-auto rounded-lg border bg-muted" }, document.mime_type === 'application/pdf' ? (React.createElement("iframe", { src: previewUrl, className: "h-full w-full", title: "Document Preview" })) : (React.createElement("img", { src: previewUrl, alt: document.name, className: "w-full h-auto cursor-zoom-in hover:opacity-90 transition-opacity", style: { imageRendering: 'high-quality' }, loading: "eager", onClick: function () { return setIsZoomed(true); } }))),
                        isZoomed && document.mime_type !== 'application/pdf' && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4", onClick: function () { return setIsZoomed(false); } },
                            React.createElement("div", { className: "relative max-h-[95vh] max-w-[95vw] overflow-auto" },
                                React.createElement("img", { src: previewUrl, alt: document.name, className: "w-auto h-auto max-w-none cursor-zoom-out", style: { imageRendering: 'high-quality' } }),
                                React.createElement("button", { className: "absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm", onClick: function (e) {
                                        e.stopPropagation();
                                        setIsZoomed(false);
                                    } },
                                    React.createElement(lucide_react_1.XCircle, { className: "h-6 w-6" }))))))) : (React.createElement("div", { className: "flex h-full min-h-[500px] items-center justify-center rounded-lg border bg-muted" },
                        React.createElement("p", { className: "text-muted-foreground" }, t('Preview not available')))))),
                React.createElement(card_1.Card, { className: "flex flex-col" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, null, t('Extracted Data')),
                                React.createElement(card_1.CardDescription, null, document.status === 'completed'
                                    ? t('Edit the fields below if necessary')
                                    : document.status === 'processing'
                                        ? t('Processing document...')
                                        : document.status === 'pending'
                                            ? t('Waiting for processing...')
                                            : t('Processing failed'))),
                            document.status === 'completed' && (React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(export_data_button_1.ExportDataButton, { data: formData, filename: document.name, variant: "outline", size: "sm", disabled: isSaving }))))),
                    React.createElement(card_1.CardContent, { className: "flex-1" }, document.status === 'processing' || document.status === 'pending' ? (React.createElement("div", { className: "flex h-full flex-col items-center justify-center gap-4" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-primary" }),
                        React.createElement("p", { className: "text-muted-foreground" }, document.status === 'processing'
                            ? t('Extracting data from document...')
                            : t('In processing queue...')))) : document.status === 'failed' ? (React.createElement("div", { className: "flex h-full flex-col items-center justify-center gap-4" },
                        React.createElement(lucide_react_1.XCircle, { className: "h-12 w-12 text-destructive" }),
                        React.createElement("p", { className: "text-muted-foreground" }, t('Could not process the document')),
                        React.createElement(button_1.Button, { onClick: handleReprocess },
                            React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4" }),
                            t('Try Again')))) : (React.createElement("div", { className: "space-y-4" }, schemaFields.length === 0 ? (React.createElement("p", { className: "text-muted-foreground" }, t('No fields defined in schema'))) : (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "space-y-6" }, schemaFields.map(function (field) { return (React.createElement("div", { key: field.name, className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: field.name }, getFieldLabel(field)),
                            field.type === 'array' ? (React.createElement(ArrayFieldModal_1.ArrayFieldModal, { field: {
                                    name: field.name,
                                    label: field.label || field.name,
                                    items: (field.items || []).map(function (item) { return ({
                                        name: item.name,
                                        label: item.label || item.name,
                                        type: item.type
                                    }); })
                                }, value: formData[field.name] || [], onChange: function (newValue) {
                                    return handleFieldChange(field.name, newValue);
                                }, readOnly: false })) : (React.createElement(input_1.Input, { id: field.name, type: getInputType(field.type), value: String(formData[field.name] || ''), onChange: function (e) {
                                    return handleFieldChange(field.name, e.target.value);
                                }, step: field.type === 'number' ? '0.01' : undefined })))); })),
                        React.createElement(separator_1.Separator, { className: "my-4" }),
                        React.createElement("div", { className: "flex justify-end gap-2" },
                            React.createElement(button_1.Button, { onClick: handleSave, disabled: isSaving },
                                React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                                t('Save Changes')))))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, t('Document Information'))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-muted-foreground" }, t('Created at')),
                            React.createElement("p", null, formatDate(document.created_at))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-muted-foreground" }, t('Processed at')),
                            React.createElement("p", null, formatDate(document.processed_at))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-muted-foreground" }, t('MIME type')),
                            React.createElement("p", null, document.mime_type))))))));
}
exports["default"] = DocumentShow;
