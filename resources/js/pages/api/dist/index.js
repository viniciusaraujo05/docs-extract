"use strict";
exports.__esModule = true;
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var api_1 = require("@/routes/api");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var scroll_area_1 = require("@/components/ui/scroll-area");
var separator_1 = require("@/components/ui/separator");
var collapsible_1 = require("@/components/ui/collapsible");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
var react_i18next_1 = require("react-i18next");
var ApiDocumentation_1 = require("@/components/api/ApiDocumentation");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var utils_1 = require("@/lib/utils");
function ApiIndex() {
    var _a;
    var t = react_i18next_1.useTranslation().t;
    var page = react_1.usePage();
    var _b = page.props, clients = _b.clients, webhooks = _b.webhooks, flash = _b.flash;
    var locale = (_a = page.props.locale) !== null && _a !== void 0 ? _a : 'pt';
    var _c = react_2.useState('auth.token'), selectedEndpoint = _c[0], setSelectedEndpoint = _c[1];
    var _d = react_2.useState(200), selectedResponseCode = _d[0], setSelectedResponseCode = _d[1];
    var _e = ApiDocumentation_1.useApiDocumentation(), gettingStarted = _e.gettingStarted, endpoints = _e.endpoints, endpointCategories = _e.endpointCategories, securityNotes = _e.securityNotes, documentStatuses = _e.documentStatuses;
    var createForm = react_1.useForm({});
    var deleteForm = react_1.useForm({});
    var regenerateForm = react_1.useForm({});
    var createWebhookForm = react_1.useForm({ url: '' });
    var deleteWebhookForm = react_1.useForm({});
    var regenerateWebhookForm = react_1.useForm({});
    var newClient = flash === null || flash === void 0 ? void 0 : flash.newClient;
    var _f = react_2.useState(new Set()), shownSecrets = _f[0], setShownSecrets = _f[1];
    react_2.useEffect(function () {
        if (newClient && !shownSecrets.has(newClient.id)) {
            sonner_1.toast.success(t('API Client created successfully! The secret is displayed below.'), {
                duration: 5000
            });
            setShownSecrets(function (prev) { return new Set(prev).add(newClient.id); });
        }
    }, [newClient, shownSecrets, t]);
    var handleCreateClient = function () {
        createForm.post(api_1["default"].clients.store(locale).url, {
            onSuccess: function () {
                sonner_1.toast.success(t('API Client created successfully!'));
            },
            onError: function () { return sonner_1.toast.error(t('Failed to create API client.')); }
        });
    };
    var handleDeleteClient = react_2.useCallback(function (client) {
        sonner_1.toast.custom(function (toastId) { return (React.createElement("div", { className: "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-4 max-w-md" },
            React.createElement("div", { className: "flex flex-col gap-3" },
                React.createElement("p", { className: "text-sm text-slate-900 dark:text-slate-50" }, t('Are you sure you want to delete this API client? This action cannot be undone.')),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", { onClick: function () {
                            sonner_1.toast.dismiss(toastId);
                            deleteForm["delete"](api_1["default"].clients.destroy({ locale: locale, apiClient: client.id }).url, {
                                preserveScroll: true,
                                onSuccess: function () {
                                    sonner_1.toast.success(t('API Client deleted successfully!'));
                                },
                                onError: function () {
                                    sonner_1.toast.error(t('Failed to delete API client.'));
                                }
                            });
                        }, className: "px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors" }, t('Delete')),
                    React.createElement("button", { onClick: function () { return sonner_1.toast.dismiss(toastId); }, className: "px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 text-sm rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" }, t('Cancel')))))); });
    }, [deleteForm, locale, t]);
    var handleRegenerateClient = react_2.useCallback(function (clientId) {
        regenerateForm.post(api_1["default"].clients.regenerate({ locale: locale, apiClient: clientId }).url, {
            preserveScroll: true,
            onSuccess: function () { return sonner_1.toast.success(t('API Client secret regenerated successfully!')); },
            onError: function () { return sonner_1.toast.error(t('Failed to regenerate API client secret.')); }
        });
    }, [locale, regenerateForm, t]);
    var handleCreateWebhook = function (e) {
        e.preventDefault();
        createWebhookForm.post("/api/webhooks", {
            onSuccess: function () {
                sonner_1.toast.success(t('Webhook created successfully!'));
                createWebhookForm.reset();
            },
            onError: function () { return sonner_1.toast.error(t('Failed to create webhook.')); }
        });
    };
    var _g = react_2.useState(false), showDeleteDialog = _g[0], setShowDeleteDialog = _g[1];
    var _h = react_2.useState(false), showRegenerateDialog = _h[0], setShowRegenerateDialog = _h[1];
    var _j = react_2.useState(null), selectedWebhook = _j[0], setSelectedWebhook = _j[1];
    var checkDeleteWebhook = function (webhook) {
        setSelectedWebhook(webhook);
        setShowDeleteDialog(true);
    };
    var confirmDeleteWebhook = function () {
        if (!selectedWebhook)
            return;
        deleteWebhookForm["delete"]("/" + locale + "/api/webhooks/" + selectedWebhook.id, {
            preserveScroll: true,
            onSuccess: function () {
                sonner_1.toast.success(t('Webhook deleted successfully!'));
                setShowDeleteDialog(false);
                setSelectedWebhook(null);
            }
        });
    };
    var checkRegenerateSecret = function (webhook) {
        setSelectedWebhook(webhook);
        setShowRegenerateDialog(true);
    };
    var confirmRegenerateSecret = function () {
        if (!selectedWebhook)
            return;
        regenerateWebhookForm.post("/api/webhooks/" + selectedWebhook.id + "/regenerate", {
            preserveScroll: true,
            onSuccess: function () {
                sonner_1.toast.success(t('Webhook secret regenerated!'));
                setShowRegenerateDialog(false);
                setSelectedWebhook(null);
            }
        });
    };
    var copyToClipboard = function (text, label) {
        navigator.clipboard.writeText(text);
        sonner_1.toast.success(label + " " + t('copied to clipboard!'));
    };
    // @ts-ignore
    var api_url = react_1.usePage().props.api_url;
    var baseApiUrl = api_url || (typeof window !== 'undefined' ? window.location.origin + "/api/v1" : '/api/v1');
    var breadcrumbs = [{ title: t('API'), href: "/" + locale + "/api" }];
    var endpointKeys = Object.keys(endpoints);
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: t('API') }),
        React.createElement("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold tracking-tight" }, t('API')),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, t('Manage your API credentials and explore the documentation'))),
                React.createElement(tabs_1.Tabs, { defaultValue: "getting-started", className: "flex flex-col md:flex-row gap-8 items-start" },
                    React.createElement(tabs_1.TabsList, { className: "flex flex-row md:flex-col h-auto w-full md:w-64 shrink-0 rounded-none border-b md:border-b-0 md:border-r bg-transparent p-0 justify-start space-x-2 md:space-x-0 md:space-y-2 mb-6 md:mb-0" },
                        React.createElement(tabs_1.TabsTrigger, { value: "getting-started", className: "w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all" },
                            React.createElement(lucide_react_1.BookOpen, { className: "mr-2 h-4 w-4" }),
                            t('Getting Started')),
                        React.createElement(tabs_1.TabsTrigger, { value: "clients", className: "w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all" },
                            React.createElement(lucide_react_1.Key, { className: "mr-2 h-4 w-4" }),
                            t('API Clients')),
                        React.createElement(tabs_1.TabsTrigger, { value: "webhooks", className: "w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all" },
                            React.createElement(lucide_react_1.Radio, { className: "mr-2 h-4 w-4" }),
                            t('Webhooks')),
                        React.createElement(tabs_1.TabsTrigger, { value: "docs", className: "w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all" },
                            React.createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                            t('Documentation')),
                        React.createElement(tabs_1.TabsTrigger, { value: "security", className: "w-full justify-start rounded-md px-4 py-2 hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:shadow-none border-l-2 border-transparent data-[state=active]:border-primary transition-all" },
                            React.createElement(lucide_react_1.Shield, { className: "mr-2 h-4 w-4" }),
                            t('Security'))),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement(tabs_1.TabsContent, { value: "getting-started", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, gettingStarted.title),
                                    React.createElement(card_1.CardDescription, null, t('Follow these steps to start using the DOCSET API'))),
                                React.createElement(card_1.CardContent, { className: "space-y-6" },
                                    gettingStarted.steps.map(function (step) { return (React.createElement("div", { key: step.number, className: "flex gap-4" },
                                        React.createElement("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold" }, step.number),
                                        React.createElement("div", { className: "space-y-2 flex-1" },
                                            React.createElement("h3", { className: "font-semibold" }, step.title),
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, step.description),
                                            step.endpoint && React.createElement("div", { className: "rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm" }, step.endpoint)))); }),
                                    React.createElement(separator_1.Separator, null),
                                    React.createElement("div", { className: "space-y-3" },
                                        React.createElement("h3", { className: "font-semibold" }, t('Document Status')),
                                        React.createElement("div", { className: "grid gap-3 sm:grid-cols-2" }, documentStatuses.map(function (item) { return (React.createElement("div", { key: item.status, className: "rounded-lg border p-3" },
                                            React.createElement(badge_1.Badge, { variant: "outline", className: "mb-1" }, item.status),
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, item.description))); })))))),
                        React.createElement(tabs_1.TabsContent, { value: "clients", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, t('API Client')),
                                    React.createElement(card_1.CardDescription, null, t('Your credentials to access the DOCSET API'))),
                                React.createElement(card_1.CardContent, null, clients.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-12" },
                                    React.createElement("div", { className: "rounded-full bg-primary/10 p-4 mb-4" },
                                        React.createElement(lucide_react_1.Key, { className: "h-8 w-8 text-primary" })),
                                    React.createElement("h3", { className: "text-lg font-semibold mb-2" }, t('No API Client')),
                                    React.createElement("p", { className: "text-sm text-muted-foreground text-center mb-6 max-w-md" }, t('Create your API client to start integrating DOCSET with your applications')),
                                    React.createElement(button_1.Button, { onClick: handleCreateClient, disabled: createForm.processing, size: "lg" },
                                        React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                        createForm.processing ? t('Creating...') : t('Create API Client')))) : (React.createElement("div", { className: "rounded-lg border bg-card p-6 space-y-4" },
                                    React.createElement("div", { className: "flex items-start justify-between" },
                                        React.createElement("div", null,
                                            React.createElement("h3", { className: "text-lg font-semibold" }, clients[0].name),
                                            React.createElement("p", { className: "text-sm text-muted-foreground mt-1" },
                                                t('Created'),
                                                " ",
                                                new Date(clients[0].created_at).toLocaleDateString())),
                                        React.createElement(badge_1.Badge, { variant: clients[0].status === 'active' ? 'default' : 'secondary' }, clients[0].status)),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement("label", { className: "text-sm font-medium" }, t('Client ID')),
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("input", { type: "text", value: clients[0].client_id, readOnly: true, className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono" }),
                                            React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () { return copyToClipboard(clients[0].client_id, t('Client ID')); } },
                                                React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" })))),
                                    newClient && newClient.id === clients[0].id ? (React.createElement("div", { className: "rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3" },
                                        React.createElement("div", { className: "flex items-center gap-2 text-primary font-semibold" },
                                            React.createElement(lucide_react_1.Key, { className: "h-4 w-4" }),
                                            React.createElement("span", null, t('Save these credentials now!'))),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, t('The client secret will not be shown again.')),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement("label", { className: "text-sm font-medium" }, t('Client Secret')),
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("input", { type: "text", value: newClient.client_secret, readOnly: true, className: "flex h-10 w-full rounded-md border border-primary/30 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono" }),
                                                React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () { return copyToClipboard(newClient.client_secret, t('Client Secret')); } },
                                                    React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" })))))) : (React.createElement(alert_1.Alert, null,
                                        React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                                        React.createElement(alert_1.AlertDescription, null, t('The client secret was shown only once during creation. Keep it secure.')))),
                                    React.createElement(separator_1.Separator, null),
                                    clients[0].last_used_at && (React.createElement(React.Fragment, null,
                                        React.createElement("div", { className: "text-sm" },
                                            React.createElement("span", { className: "text-muted-foreground" }, t('Last Used')),
                                            React.createElement("p", { className: "font-medium mt-1" }, new Date(clients[0].last_used_at).toLocaleDateString())),
                                        React.createElement(separator_1.Separator, null))),
                                    React.createElement("div", { className: "flex gap-2 justify-end" },
                                        React.createElement(button_1.Button, { variant: "outline", size: "icon", onClick: function () { return handleRegenerateClient(clients[0].id); }, disabled: regenerateForm.processing, title: t('Regenerate Secret') },
                                            React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 " + (regenerateForm.processing ? 'animate-spin' : '') })),
                                        React.createElement(button_1.Button, { variant: "destructive", size: "icon", onClick: function () { return handleDeleteClient(clients[0]); }, disabled: deleteForm.processing, title: t('Delete API Client') },
                                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))))),
                        React.createElement(tabs_1.TabsContent, { value: "webhooks", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, t('Webhooks')),
                                    React.createElement(card_1.CardDescription, null, t('Receive real-time notifications when your documents are processed'))),
                                React.createElement(card_1.CardContent, { className: "space-y-6" },
                                    React.createElement("div", { className: "rounded-lg border bg-card p-6" },
                                        React.createElement("form", { onSubmit: handleCreateWebhook, className: "flex gap-4 items-end" },
                                            React.createElement("div", { className: "flex-1 space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "webhook-url" }, t('Webhook URL')),
                                                React.createElement("input", { id: "webhook-url", type: "url", placeholder: "https://your-api.com/webhooks/docset", className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", value: createWebhookForm.data.url, onChange: function (e) { return createWebhookForm.setData('url', e.target.value); }, required: true })),
                                            React.createElement(button_1.Button, { type: "submit", disabled: createWebhookForm.processing },
                                                React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                                createWebhookForm.processing ? t('Adding...') : t('Add Webhook')))),
                                    React.createElement("div", { className: "space-y-4" },
                                        React.createElement("h3", { className: "font-semibold text-lg" }, t('Active Webhooks')),
                                        webhooks.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground border rounded-lg border-dashed" }, t('No webhooks configured yet.'))) : (React.createElement("div", { className: "grid gap-4" }, webhooks.map(function (webhook) { return (React.createElement("div", { key: webhook.id, className: "rounded-lg border p-4 flex flex-col gap-4" },
                                            React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4" },
                                                React.createElement("div", { className: "space-y-1" },
                                                    React.createElement("div", { className: "flex items-center gap-2" },
                                                        React.createElement("div", { className: "font-mono text-sm break-all" }, webhook.url),
                                                        webhook.is_active && (React.createElement("div", { className: "flex items-center gap-1.5 ml-2" },
                                                            React.createElement("span", { className: "relative flex h-2.5 w-2.5" },
                                                                React.createElement("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" }),
                                                                React.createElement("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" })),
                                                            React.createElement("span", { className: "text-xs text-muted-foreground" }, t('Active'))))),
                                                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                                                        t('Created'),
                                                        " ",
                                                        new Date(webhook.created_at).toLocaleDateString())),
                                                React.createElement("div", { className: "flex gap-2" },
                                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return checkRegenerateSecret(webhook); }, disabled: regenerateWebhookForm.processing },
                                                        React.createElement(lucide_react_1.RefreshCw, { className: utils_1.cn("h-4 w-4 mr-2", regenerateWebhookForm.processing && "animate-spin") }),
                                                        t('Regenerate Secret')),
                                                    React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return checkDeleteWebhook(webhook); }, disabled: deleteWebhookForm.processing },
                                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))),
                                            React.createElement("div", { className: "space-y-2 bg-muted/30 p-3 rounded-md" },
                                                React.createElement("label", { className: "text-sm font-medium flex items-center gap-2" },
                                                    t('Signing Secret'),
                                                    React.createElement(badge_1.Badge, { variant: "outline", className: "text-[10px] h-5" }, "HMAC-SHA256")),
                                                React.createElement("div", { className: "flex items-center gap-2" },
                                                    React.createElement("input", { type: "text", value: webhook.secret, readOnly: true, className: "flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm font-mono text-muted-foreground" }),
                                                    React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "h-9 w-9", onClick: function () { return copyToClipboard(webhook.secret, t('Secret')); } },
                                                        React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" }))),
                                                React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Use this secret to verify the X-Webhook-Signature header.'))))); })))),
                                    React.createElement(separator_1.Separator, null),
                                    React.createElement("div", { className: "space-y-4" },
                                        React.createElement("h3", { className: "font-semibold text-lg" }, t('Integration Guide')),
                                        React.createElement("div", { className: "prose prose-sm dark:prose-invert max-w-none" },
                                            React.createElement("div", { className: "rounded-lg border bg-muted/30 p-4 space-y-3" },
                                                React.createElement("h4", { className: "font-medium flex items-center gap-2" },
                                                    React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
                                                    t('Verifying Signatures')),
                                                React.createElement("p", { className: "text-sm text-muted-foreground" }, t('Secure your webhook endpoint by verifying the signature included in the request headers.')),
                                                React.createElement("div", { className: "space-y-2" },
                                                    React.createElement(label_1.Label, null, t('PHP (Laravel) Example')),
                                                    React.createElement("div", { className: "rounded-md bg-stone-900 border border-stone-800 p-3 overflow-x-auto" },
                                                        React.createElement("pre", { className: "text-xs font-mono text-stone-50 leading-relaxed" }, "$payload = $request->getContent();\n$signature = $request->header('X-Webhook-Signature');\n$secret = 'whsec_...'; // Your signing secret\n\n$computedSignature = hash_hmac('sha256', $payload, $secret);\n\nif (!hash_equals($signature, $computedSignature)) {\n    abort(403, 'Invalid signature');\n}"))),
                                                React.createElement("div", { className: "space-y-2" },
                                                    React.createElement(label_1.Label, null, t('Node.js (Express) Example')),
                                                    React.createElement("div", { className: "rounded-md bg-stone-900 border border-stone-800 p-3 overflow-x-auto" },
                                                        React.createElement("pre", { className: "text-xs font-mono text-stone-50 leading-relaxed" }, "const crypto = require('crypto');\n\nconst payload = JSON.stringify(req.body);\nconst signature = req.headers['x-webhook-signature'];\nconst secret = 'whsec_...';\n\nconst computed = crypto\n  .createHmac('sha256', secret)\n  .update(payload)\n  .digest('hex');\n\nif (signature !== computed) {\n  throw new Error('Invalid signature');\n}"))),
                                                React.createElement(separator_1.Separator, { className: "my-6 border-stone-800" }),
                                                React.createElement("div", { className: "space-y-3" },
                                                    React.createElement("h4", { className: "font-medium flex items-center gap-2" },
                                                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                                                        t('Events & Payload Reference')),
                                                    React.createElement("div", { className: "grid gap-3 sm:grid-cols-3 my-4" },
                                                        React.createElement("div", { className: "rounded border border-stone-800 bg-stone-900/50 p-3" },
                                                            React.createElement(badge_1.Badge, { variant: "outline", className: "mb-2 border-stone-700 text-stone-300" }, "document.created"),
                                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Fired immediately when a new document is uploaded.'))),
                                                        React.createElement("div", { className: "rounded border border-stone-800 bg-stone-900/50 p-3" },
                                                            React.createElement(badge_1.Badge, { variant: "outline", className: "mb-2 border-stone-700 text-stone-300" }, "document.updated"),
                                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Fired when status marks as completed or data is extracted.'))),
                                                        React.createElement("div", { className: "rounded border border-stone-800 bg-stone-900/50 p-3" },
                                                            React.createElement(badge_1.Badge, { variant: "outline", className: "mb-2 border-stone-700 text-stone-300" }, "document.deleted"),
                                                            React.createElement("p", { className: "text-xs text-muted-foreground" }, t('Fired when a document is permanently deleted.')))),
                                                    React.createElement("div", { className: "space-y-2" },
                                                        React.createElement(label_1.Label, null, t('Payload Structure')),
                                                        React.createElement("div", { className: "rounded-md bg-stone-900 border border-stone-800 p-3 overflow-x-auto" },
                                                            React.createElement("pre", { className: "text-xs font-mono text-stone-50 leading-relaxed" }, "{\n  \"event\": \"document.updated\",\n  \"created_at\": \"2024-03-20T10:00:00Z\",\n  \"data\": {\n    \"id\": 12345, // Document ID\n    \"type\": \"document\",\n    \"status\": \"completed\" // processing, completed, failed\n  }\n}"))))))))),
                            React.createElement(alert_dialog_1.AlertDialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog },
                                React.createElement(alert_dialog_1.AlertDialogContent, null,
                                    React.createElement(alert_dialog_1.AlertDialogHeader, null,
                                        React.createElement(alert_dialog_1.AlertDialogTitle, null, t('Are you sure?')),
                                        React.createElement(alert_dialog_1.AlertDialogDescription, null, t('This action cannot be undone. This will permanently delete the webhook endpoint.'))),
                                    React.createElement(alert_dialog_1.AlertDialogFooter, null,
                                        React.createElement(alert_dialog_1.AlertDialogCancel, null, t('Cancel')),
                                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: confirmDeleteWebhook, className: "bg-destructive hover:bg-destructive/90" }, t('Delete'))))),
                            React.createElement(alert_dialog_1.AlertDialog, { open: showRegenerateDialog, onOpenChange: setShowRegenerateDialog },
                                React.createElement(alert_dialog_1.AlertDialogContent, null,
                                    React.createElement(alert_dialog_1.AlertDialogHeader, null,
                                        React.createElement(alert_dialog_1.AlertDialogTitle, null, t('Regenerate Secret')),
                                        React.createElement(alert_dialog_1.AlertDialogDescription, null, t('This will invalidate the current secret key immediately. Any active integrations will stop working until updated with the new secret.'))),
                                    React.createElement(alert_dialog_1.AlertDialogFooter, null,
                                        React.createElement(alert_dialog_1.AlertDialogCancel, null, t('Cancel')),
                                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: confirmRegenerateSecret }, t('Regenerate')))))),
                        React.createElement(tabs_1.TabsContent, { value: "docs", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, t('API Documentation')),
                                    React.createElement(card_1.CardDescription, null, t('Complete reference for DOCSET API v1'))),
                                React.createElement(card_1.CardContent, { className: "space-y-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, t('Base URL')),
                                        React.createElement("div", { className: "flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 font-mono text-sm" },
                                            React.createElement("span", null, baseApiUrl),
                                            React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return copyToClipboard(baseApiUrl, t('Base URL')); } },
                                                React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" })))),
                                    React.createElement(separator_1.Separator, null),
                                    React.createElement("div", { className: "space-y-6" }, Object.entries(endpointCategories).map(function (_a) {
                                        var categoryKey = _a[0], category = _a[1];
                                        return (React.createElement("div", { key: categoryKey, className: "space-y-3" },
                                            React.createElement("div", null,
                                                React.createElement("h3", { className: "text-lg font-semibold" }, category.title),
                                                React.createElement("p", { className: "text-sm text-muted-foreground" }, category.description)),
                                            React.createElement("div", { className: "space-y-3" }, category.endpoints.map(function (key) {
                                                var _a;
                                                var endpoint = endpoints[key];
                                                if (!endpoint)
                                                    return null;
                                                var isSelected = selectedEndpoint === key;
                                                return (React.createElement(collapsible_1.Collapsible, { key: key, open: isSelected, onOpenChange: function (open) { return open && setSelectedEndpoint(key); } },
                                                    React.createElement(card_1.Card, null,
                                                        React.createElement(collapsible_1.CollapsibleTrigger, { asChild: true },
                                                            React.createElement("button", { className: "flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors" },
                                                                React.createElement("div", { className: "flex items-center gap-3" },
                                                                    React.createElement(badge_1.Badge, { variant: endpoint.method === 'GET' ? 'secondary' : endpoint.method === 'POST' ? 'default' : endpoint.method === 'PUT' ? 'default' : 'destructive' }, endpoint.method),
                                                                    React.createElement("div", null,
                                                                        React.createElement("div", { className: "flex items-center gap-2" },
                                                                            React.createElement("span", { className: "font-mono font-semibold" }, endpoint.path),
                                                                            endpoint.requiresAuth && React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, "JWT")),
                                                                        React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, endpoint.description))),
                                                                React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4 text-muted-foreground transition-transform " + (isSelected ? 'rotate-180' : '') }))),
                                                        React.createElement(collapsible_1.CollapsibleContent, null,
                                                            React.createElement("div", { className: "space-y-4 px-4 pb-4" },
                                                                React.createElement(separator_1.Separator, null),
                                                                ((_a = endpoint.requestBody) === null || _a === void 0 ? void 0 : _a.fields) && (React.createElement("div", { className: "space-y-2" },
                                                                    React.createElement(label_1.Label, null,
                                                                        t('Request Body'),
                                                                        " (",
                                                                        endpoint.requestBody.type,
                                                                        ")"),
                                                                    React.createElement("div", { className: "rounded-md border overflow-hidden" },
                                                                        React.createElement("table", { className: "w-full text-sm" },
                                                                            React.createElement("thead", { className: "border-b bg-muted/30" },
                                                                                React.createElement("tr", null,
                                                                                    React.createElement("th", { className: "px-3 py-2 text-left font-medium" }, t('Field')),
                                                                                    React.createElement("th", { className: "px-3 py-2 text-left font-medium" }, t('Type')),
                                                                                    React.createElement("th", { className: "px-3 py-2 text-left font-medium" }, t('Required')),
                                                                                    React.createElement("th", { className: "px-3 py-2 text-left font-medium" }, t('Description')))),
                                                                            React.createElement("tbody", null, endpoint.requestBody.fields.map(function (field) { return (React.createElement("tr", { key: field.name, className: "border-b last:border-0" },
                                                                                React.createElement("td", { className: "px-3 py-2 font-mono" }, field.name),
                                                                                React.createElement("td", { className: "px-3 py-2 text-muted-foreground" }, field.type),
                                                                                React.createElement("td", { className: "px-3 py-2" },
                                                                                    React.createElement(badge_1.Badge, { variant: field.required ? 'destructive' : 'secondary', className: "text-xs" }, field.required ? t('Yes') : t('No'))),
                                                                                React.createElement("td", { className: "px-3 py-2 text-muted-foreground" }, field.description))); })))))),
                                                                endpoint.queryParams && endpoint.queryParams.length > 0 && (React.createElement("div", { className: "space-y-2" },
                                                                    React.createElement(label_1.Label, null, t('Query Parameters')),
                                                                    React.createElement("div", { className: "rounded-md border overflow-hidden" },
                                                                        React.createElement("table", { className: "w-full text-sm" },
                                                                            React.createElement("thead", { className: "border-b bg-muted/30" },
                                                                                React.createElement("tr", null,
                                                                                    React.createElement("th", { className: "px-3 py-2 text-left font-medium" }, t('Parameter')),
                                                                                    React.createElement("th", { className: "px-3 py-2 text-left font-medium" }, t('Type')),
                                                                                    React.createElement("th", { className: "px-3 py-2 text-left font-medium" }, t('Required')),
                                                                                    React.createElement("th", { className: "px-3 py-2 text-left font-medium" }, t('Description')))),
                                                                            React.createElement("tbody", null, endpoint.queryParams.map(function (param) { return (React.createElement("tr", { key: param.name, className: "border-b last:border-0" },
                                                                                React.createElement("td", { className: "px-3 py-2 font-mono" }, param.name),
                                                                                React.createElement("td", { className: "px-3 py-2 text-muted-foreground" }, param.type),
                                                                                React.createElement("td", { className: "px-3 py-2" },
                                                                                    React.createElement(badge_1.Badge, { variant: param.required ? 'destructive' : 'secondary', className: "text-xs" }, param.required ? t('Yes') : t('No'))),
                                                                                React.createElement("td", { className: "px-3 py-2 text-muted-foreground" }, param.description))); })))))),
                                                                React.createElement("div", { className: "space-y-2" },
                                                                    React.createElement(label_1.Label, null, t('Responses')),
                                                                    React.createElement(tabs_1.Tabs, { value: selectedResponseCode.toString(), onValueChange: function (v) { return setSelectedResponseCode(parseInt(v)); } },
                                                                        React.createElement(tabs_1.TabsList, { className: "grid w-full", style: { gridTemplateColumns: "repeat(" + endpoint.responses.length + ", 1fr)" } }, endpoint.responses.map(function (response) { return (React.createElement(tabs_1.TabsTrigger, { key: response.status, value: response.status.toString() },
                                                                            React.createElement(badge_1.Badge, { variant: response.status === 200 || response.status === 201 ? 'default' : 'destructive', className: "mr-2" }, response.status),
                                                                            response.status === 200 || response.status === 201 ? t('Success') : t('Error'))); })),
                                                                        endpoint.responses.map(function (response) { return (React.createElement(tabs_1.TabsContent, { key: response.status, value: response.status.toString(), className: "space-y-2" },
                                                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, response.description),
                                                                            React.createElement("div", { className: "relative" },
                                                                                React.createElement(scroll_area_1.ScrollArea, { className: "h-[200px] rounded-md border bg-muted/30 p-3" },
                                                                                    React.createElement("pre", { className: "font-mono text-xs" }, JSON.stringify(response.example, null, 2))),
                                                                                React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "absolute top-2 right-2", onClick: function () { return copyToClipboard(JSON.stringify(response.example, null, 2), t('Response')); } },
                                                                                    React.createElement(lucide_react_1.Copy, { className: "h-3 w-3" }))))); }))))))));
                                            }))));
                                    }))))),
                        React.createElement(tabs_1.TabsContent, { value: "security", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, t('Security & Best Practices')),
                                    React.createElement(card_1.CardDescription, null, t('Important security considerations for using the DOCSET API'))),
                                React.createElement(card_1.CardContent, { className: "space-y-4" }, securityNotes.map(function (note, index) { return (React.createElement("div", { key: index, className: "rounded-lg border p-4" },
                                    React.createElement("div", { className: "flex items-start gap-3" },
                                        React.createElement("div", { className: "rounded-full bg-primary/10 p-2 mt-0.5" },
                                            React.createElement(lucide_react_1.Shield, { className: "h-4 w-4 text-primary" })),
                                        React.createElement("div", { className: "flex-1" },
                                            React.createElement("h3", { className: "font-semibold mb-1" }, note.title),
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, note.description))))); }))))))))));
}
exports["default"] = ApiIndex;
