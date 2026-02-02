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
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var separator_1 = require("@/components/ui/separator");
var app_layout_1 = require("@/layouts/app-layout");
var extraction_1 = require("@/types/extraction");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
var react_i18next_1 = require("react-i18next");
/**
 * Página de criação de tipo de documento
 */
function DocumentTypesCreate() {
    var _this = this;
    var t = react_i18next_1.useTranslation().t;
    var _a = react_2.useState('pt'), locale = _a[0], setLocale = _a[1];
    var _b = react_2.useState(''), name = _b[0], setName = _b[1];
    var _c = react_2.useState(''), description = _c[0], setDescription = _c[1];
    var _d = react_2.useState([]), fields = _d[0], setFields = _d[1];
    var _e = react_2.useState(''), newFieldName = _e[0], setNewFieldName = _e[1];
    var _f = react_2.useState(''), newFieldLabel = _f[0], setNewFieldLabel = _f[1];
    var _g = react_2.useState('string'), newFieldType = _g[0], setNewFieldType = _g[1];
    var _h = react_2.useState(false), saving = _h[0], setSaving = _h[1];
    var formatFieldName = function (value) {
        return value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    };
    var handleAddField = react_2.useCallback(function () {
        if (!newFieldName.trim() || !newFieldLabel.trim())
            return;
        var fieldName = formatFieldName(newFieldName);
        if (fields.some(function (f) { return f.name === fieldName; }))
            return;
        setFields(function (prev) { return __spreadArrays(prev, [{ name: fieldName, label: newFieldLabel, type: newFieldType }]); });
        setNewFieldName('');
        setNewFieldLabel('');
        setNewFieldType('string');
    }, [fields, newFieldName, newFieldLabel, newFieldType]);
    var handleRemoveField = react_2.useCallback(function (fieldName) {
        setFields(function (prev) { return prev.filter(function (f) { return f.name !== fieldName; }); });
    }, []);
    var handleSubmit = react_2.useCallback(function (e) { return __awaiter(_this, void 0, void 0, function () {
        var usageResponse, usageData, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    if (!name.trim() || fields.length === 0)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/usage", {
                            headers: {
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': ((_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || ''
                            }
                        })];
                case 2:
                    usageResponse = _b.sent();
                    return [4 /*yield*/, usageResponse.json()];
                case 3:
                    usageData = _b.sent();
                    if (usageData.success && usageData.usage.models.is_reached) {
                        sonner_1.toast.error(t('Model limit reached', {
                            used: usageData.usage.models.used,
                            limit: usageData.usage.models.limit
                        }));
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _b.sent();
                    console.error('Error checking usage:', err_1);
                    return [3 /*break*/, 5];
                case 5:
                    setSaving(true);
                    react_1.router.post("/api/document-types", {
                        name: name,
                        description: description,
                        fields: JSON.stringify(fields)
                    }, {
                        onSuccess: function () {
                            sonner_1.toast.success(t('Document type created successfully!'));
                        },
                        onError: function (errors) {
                            // Check if it's a limit error
                            if (errors.error && errors.error.includes('limit reached')) {
                                sonner_1.toast.error(errors.error);
                            }
                            else {
                                sonner_1.toast.error(t('Error creating document type'));
                            }
                        },
                        onFinish: function () { return setSaving(false); }
                    });
                    return [2 /*return*/];
            }
        });
    }); }, [name, description, fields]);
    var breadcrumbs = react_2.useMemo(function () { return [
        { title: t('Dashboard'), href: '/dashboard' },
        { title: t('Document Types'), href: '/document-types' },
        { title: t('New'), href: '/document-types/create' },
    ]; }, [t]);
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: t('New Document Type') }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-6 p-4" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold" }, t('New Document Type')),
                React.createElement("p", { className: "text-muted-foreground" }, t('Create templates with pre-defined fields for faster extractions'))),
            React.createElement("form", { onSubmit: handleSubmit, className: "mx-auto w-full max-w-2xl space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, t('Basic Information')),
                        React.createElement(card_1.CardDescription, null, t('Name and description of the document type'))),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "name" }, t('Name *')),
                            React.createElement(input_1.Input, { id: "name", placeholder: t('e.g. Supplier Invoice'), value: name, onChange: function (e) { return setName(e.target.value); }, required: true })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "description" }, t('Description')),
                            React.createElement(textarea_1.Textarea, { id: "description", placeholder: t('Optional description'), value: description, onChange: function (e) { return setDescription(e.target.value); }, rows: 3 })))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, t('Fields to Extract')),
                        React.createElement(card_1.CardDescription, null, t('Define the fields that will be extracted automatically'))),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null,
                                t('Defined Fields'),
                                " (",
                                fields.length,
                                ")"),
                            fields.length === 0 ? (React.createElement("p", { className: "rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground" }, t('Add at least one field below'))) : (React.createElement("div", { className: "flex flex-wrap gap-2" }, fields.map(function (field) {
                                var _a;
                                return (React.createElement(badge_1.Badge, { key: field.name, variant: "secondary", className: "flex items-center gap-1 py-1.5 pl-3 pr-1" },
                                    field.label,
                                    React.createElement("span", { className: "ml-1 text-xs text-muted-foreground" },
                                        "(", (_a = extraction_1.FIELD_TYPES.find(function (t) { return t.value === field.type; })) === null || _a === void 0 ? void 0 :
                                        _a.label,
                                        ")"),
                                    React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", className: "h-5 w-5 hover:bg-destructive/20", onClick: function () { return handleRemoveField(field.name); } },
                                        React.createElement(lucide_react_1.X, { className: "h-3 w-3" }))));
                            })))),
                        React.createElement(separator_1.Separator, null),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement(label_1.Label, null, t('Add Field')),
                            React.createElement("div", { className: "grid gap-2" },
                                React.createElement(input_1.Input, { placeholder: t('Internal name (e.g. total_sales)'), value: newFieldName, onChange: function (e) { return setNewFieldName(e.target.value); } }),
                                React.createElement(input_1.Input, { placeholder: t('Label (ex: Total de Vendas)'), value: newFieldLabel, onChange: function (e) { return setNewFieldLabel(e.target.value); } }),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(select_1.Select, { value: newFieldType, onValueChange: function (v) { return setNewFieldType(v); } },
                                        React.createElement(select_1.SelectTrigger, { className: "w-32" },
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null, extraction_1.FIELD_TYPES.map(function (type) { return (React.createElement(select_1.SelectItem, { key: type.value, value: type.value }, type.label)); }))),
                                    React.createElement(button_1.Button, { type: "button", onClick: handleAddField, disabled: !newFieldName.trim() || !newFieldLabel.trim(), className: "flex-1" },
                                        React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                        t('Add'))))))),
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return react_1.router.visit('/document-types'); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                        t('Cancel')),
                    React.createElement(button_1.Button, { type: "submit", disabled: !name.trim() || fields.length === 0 || saving },
                        React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                        saving ? t('Creating...') : t('Create')))))));
}
exports["default"] = DocumentTypesCreate;
