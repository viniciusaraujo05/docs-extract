"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var react_2 = require("react");
var react_i18next_1 = require("react-i18next");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
/**
 * Página de listagem de tipos de documentos
 */
function DocumentTypesIndex(_a) {
    var documentTypes = _a.documentTypes;
    var t = react_i18next_1.useTranslation().t;
    var _b = react_2.useState('pt'), locale = _b[0], setLocale = _b[1];
    var breadcrumbs = react_2.useMemo(function () { return [
        { title: t('Dashboard'), href: '/dashboard' },
        { title: t('Document Types'), href: '/document-types' },
    ]; }, [t]);
    react_2.useEffect(function () {
        var savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);
    var handleDelete = function (id) {
        sonner_1.toast.warning(t('Are you sure you want to delete this document type?'), {
            action: {
                label: t('Delete'),
                onClick: function () {
                    react_1.router["delete"]("/api/document-types/" + id, {
                        preserveScroll: true,
                        onSuccess: function () {
                            sonner_1.toast.success(t('Document type deleted successfully!'));
                        },
                        onError: function () {
                            sonner_1.toast.error(t('Error deleting document type'));
                        }
                    });
                }
            },
            cancel: {
                label: t('Cancel')
            }
        });
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: t('Document Types') }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-6 p-4" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-2xl font-bold" }, t('Document Types')),
                    React.createElement("p", { className: "text-muted-foreground" }, t('Create templates with pre-defined fields for faster extractions'))),
                React.createElement(button_1.Button, { asChild: true },
                    React.createElement(react_1.Link, { href: "/" + locale + "/document-types/create" },
                        React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                        t('New Type')))),
            documentTypes.length === 0 ? (React.createElement(card_1.Card, { className: "mx-auto w-full max-w-lg" },
                React.createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center py-12" },
                    React.createElement("div", { className: "rounded-full bg-muted p-4" },
                        React.createElement(lucide_react_1.FileType, { className: "h-8 w-8 text-muted-foreground" })),
                    React.createElement("h3", { className: "mt-4 text-lg font-semibold" }, t('No types created')),
                    React.createElement("p", { className: "mt-2 text-center text-sm text-muted-foreground" }, t('Create document types to speed up data extraction')),
                    React.createElement(button_1.Button, { asChild: true, className: "mt-4" },
                        React.createElement(react_1.Link, { href: "/" + locale + "/document-types/create" },
                            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                            t('Create First Type')))))) : (React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, documentTypes.map(function (type) { return (React.createElement(card_1.Card, { key: type.id, className: "group transition-shadow hover:shadow-md" },
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement("div", { className: "flex items-start justify-between" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "rounded-lg bg-primary/10 p-2" },
                                React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-primary" })),
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, { className: "text-base" }, type.name),
                                type.description && (React.createElement(card_1.CardDescription, { className: "line-clamp-1" }, type.description)))),
                        React.createElement(badge_1.Badge, { variant: type.is_active ? 'default' : 'secondary' }, type.is_active ? t('Active') : t('Inactive')))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-medium text-muted-foreground mb-2" },
                                t('Fields'),
                                " (",
                                type.fields.length,
                                ")"),
                            React.createElement("div", { className: "flex flex-wrap gap-1" },
                                type.fields.slice(0, 5).map(function (field) { return (React.createElement(badge_1.Badge, { key: field.name, variant: "outline", className: "text-xs" }, field.label)); }),
                                type.fields.length > 5 && (React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" },
                                    "+",
                                    type.fields.length - 5)))),
                        React.createElement("div", { className: "flex gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "flex-1", asChild: true },
                                React.createElement(react_1.Link, { href: "/" + locale + "/document-types/" + type.id + "/edit" },
                                    React.createElement(lucide_react_1.Pencil, { className: "mr-2 h-3 w-3" }),
                                    t('Edit'))),
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "text-destructive hover:bg-destructive/10", onClick: function () { return handleDelete(type.id); } },
                                React.createElement(lucide_react_1.Trash2, { className: "h-3 w-3" }))))))); }))))));
}
exports["default"] = DocumentTypesIndex;
