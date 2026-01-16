"use strict";
exports.__esModule = true;
exports.StepReview = void 0;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var DocumentPreview_1 = require("./DocumentPreview");
var ArrayFieldPreview_1 = require("@/components/fields/ArrayFieldPreview");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
/**
 * Componente do Step 3 - Revisão e salvamento
 * Permite editar os dados extraídos antes de salvar
 */
function StepReview(_a) {
    var _b;
    var file = _a.file, filePreview = _a.filePreview, fields = _a.fields, extractedData = _a.extractedData, documentTypes = _a.documentTypes, selectedTypeId = _a.selectedTypeId, newTypeName = _a.newTypeName, _c = _a.isSaving, isSaving = _c === void 0 ? false : _c, onUpdateField = _a.onUpdateField, onRemoveField = _a.onRemoveField, onRenameField = _a.onRenameField, onBack = _a.onBack, onSave = _a.onSave, onDiscard = _a.onDiscard;
    var t = react_i18next_1.useTranslation().t;
    var _d = react_1.useState(null), editingLabel = _d[0], setEditingLabel = _d[1];
    var _e = react_1.useState(''), tempLabel = _e[0], setTempLabel = _e[1];
    var getInputType = function (fieldType) {
        switch (fieldType) {
            case 'number': return 'number';
            case 'date': return 'date';
            default: return 'text';
        }
    };
    var handleFieldChange = function (field, value) {
        if (field.type === 'number') {
            onUpdateField(field.name, parseFloat(value) || 0);
        }
        else {
            onUpdateField(field.name, value);
        }
    };
    return (React.createElement("div", { className: "mx-auto grid w-full max-w-5xl gap-6 animate-in fade-in-50 slide-in-from-right-4 duration-500 lg:grid-cols-2" },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Check, { className: "h-5 w-5 text-green-500" }),
                    t('Extracted Data')),
                React.createElement(card_1.CardDescription, null, t('Review and edit the extracted data before saving'))),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                fields.map(function (field) {
                    var _a;
                    return (React.createElement("div", { key: field.name, className: "space-y-1.5 animate-in fade-in-50 group" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            editingLabel === field.name ? (React.createElement("div", { className: "flex items-center gap-2 flex-1" },
                                React.createElement(input_1.Input, { value: tempLabel, onChange: function (e) { return setTempLabel(e.target.value); }, className: "h-7 text-sm", autoFocus: true, onKeyDown: function (e) {
                                        if (e.key === 'Enter') {
                                            onRenameField(field.name, tempLabel);
                                            setEditingLabel(null);
                                        }
                                        else if (e.key === 'Escape') {
                                            setEditingLabel(null);
                                        }
                                    } }),
                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: function () {
                                        onRenameField(field.name, tempLabel);
                                        setEditingLabel(null);
                                    } },
                                    React.createElement(lucide_react_1.Check, { className: "h-3 w-3" })))) : (React.createElement(label_1.Label, { htmlFor: field.name, className: "flex items-center gap-2" },
                                field.label,
                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity", onClick: function () {
                                        setEditingLabel(field.name);
                                        setTempLabel(field.label);
                                    } },
                                    React.createElement(lucide_react_1.Pencil, { className: "h-3 w-3" })))),
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity", onClick: function () { return onRemoveField(field.name); } },
                                React.createElement(lucide_react_1.X, { className: "h-3 w-3" }))),
                        field.type === 'array' ? (React.createElement(ArrayFieldPreview_1.ArrayFieldPreview, { field: {
                                name: field.name,
                                label: field.label,
                                items: field.items || []
                            }, value: Array.isArray(extractedData[field.name])
                                ? extractedData[field.name]
                                : [], onChange: function (value) { return onUpdateField(field.name, value); } })) : (React.createElement(input_1.Input, { id: field.name, type: getInputType(field.type), value: String((_a = extractedData[field.name]) !== null && _a !== void 0 ? _a : ''), onChange: function (e) { return handleFieldChange(field, e.target.value); }, className: "transition-all focus:ring-2 focus:ring-primary/20" }))));
                }),
                React.createElement(separator_1.Separator, { className: "my-4" }),
                React.createElement("div", { className: "flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3" },
                    React.createElement(lucide_react_1.Tag, { className: "h-4 w-4 text-primary" }),
                    React.createElement(label_1.Label, null,
                        t('Extracted Data'),
                        " (",
                        fields.length,
                        " ",
                        t('fields'),
                        ")"),
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Edit the extracted values if needed')),
                    React.createElement("span", { className: "text-sm font-medium" }, "Tipo:"),
                    React.createElement("span", { className: "text-sm text-muted-foreground" }, selectedTypeId
                        ? (_b = documentTypes.find(function (t) { return t.id === selectedTypeId; })) === null || _b === void 0 ? void 0 : _b.name : newTypeName
                        ? newTypeName + " (novo)"
                        : t('Not defined'))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "pt-6" },
                React.createElement(DocumentPreview_1.DocumentPreview, { file: file, filePreview: filePreview }))),
        React.createElement("div", { className: "flex justify-between lg:col-span-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: onBack },
                React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                t('Back')),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: "outline", onClick: onDiscard },
                    React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                    t('Discard')),
                React.createElement(button_1.Button, { onClick: onSave, disabled: (!selectedTypeId && !newTypeName) || isSaving }, isSaving ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    t('Saving...'))) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Check, { className: "mr-2 h-4 w-4" }),
                    t('Save Document'))))))));
}
exports.StepReview = StepReview;
