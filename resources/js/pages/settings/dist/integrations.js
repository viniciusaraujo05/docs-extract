"use strict";
exports.__esModule = true;
var react_1 = require("@inertiajs/react");
var app_layout_1 = require("@/layouts/app-layout");
var layout_1 = require("@/layouts/settings/layout");
var react_i18next_1 = require("react-i18next");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
var sonner_1 = require("sonner");
var react_2 = require("@inertiajs/react");
function Integrations(_a) {
    var _b, _c;
    var integrations = _a.integrations;
    var t = react_i18next_1.useTranslation().t;
    var page = react_1.usePage();
    var auth = page.props.auth;
    var locale = page.props.locale || 'pt';
    var BREADCRUMBS = [
        { title: t('Dashboard'), href: "/" + locale + "/dashboard" },
        { title: t('Settings'), href: "/" + locale + "/settings/billing" },
        { title: t('Integrations'), href: "/" + locale + "/settings/integrations" },
    ];
    var handleConnect = function (provider) {
        window.location.href = "/" + locale + "/integrations/" + provider + "/connect";
    };
    var handleDisconnect = function (provider) {
        if (!confirm(t('Are you sure you want to disconnect this account?')))
            return;
        react_2.router.post("/api/integrations/" + provider + "/disconnect", {}, {
            preserveScroll: true,
            onSuccess: function () {
                sonner_1.toast.success(t('Account disconnected successfully'));
                // router.reload({ only: ['integrations'] }); // Optional optimized reload
            },
            onError: function () {
                sonner_1.toast.error(t('Failed to disconnect account'));
            }
        });
    };
    var googleAccount = integrations.find(function (i) { return i.provider === 'google'; });
    return (React.createElement(app_layout_1["default"], { breadcrumbs: BREADCRUMBS },
        React.createElement(react_1.Head, { title: t('Integrations') }),
        React.createElement(layout_1["default"], null,
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium" }, t('Integrations')),
                    React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, t('Connect external services to import documents and export data.'))),
                ((_b = page.props.flash) === null || _b === void 0 ? void 0 : _b.success) && (React.createElement(alert_1.Alert, { className: "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300" },
                    React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4" }),
                    React.createElement(alert_1.AlertTitle, null, t('Success')),
                    React.createElement(alert_1.AlertDescription, null, page.props.flash.success))),
                ((_c = page.props.flash) === null || _c === void 0 ? void 0 : _c.error) && (React.createElement(alert_1.Alert, { variant: "destructive" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                    React.createElement(alert_1.AlertTitle, null, t('Error')),
                    React.createElement(alert_1.AlertDescription, null, page.props.flash.error))),
                React.createElement("div", { className: "grid gap-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "p-2 bg-white rounded-full shadow-sm" },
                                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", role: "img" },
                                        React.createElement("path", { d: "M23.49,12.275 C23.49,11.485 23.425,10.73 23.295,10 H12 V14.51 H18.46 C18.18,15.99 17.335,17.245 16.08,18.09 L16.08,21.09 L19.905,21.09 C22.145,19.03 23.49,15.98 23.49,12.275 Z", fill: "#4285F4" }),
                                        React.createElement("path", { d: "M12,24 C15.24,24 17.965,22.935 19.91,21.09 L16.08,18.09 C15.005,18.815 13.62,19.25 12,19.25 C8.865,19.25 6.215,17.135 5.265,14.29 L1.3,14.29 L1.3,17.385 C3.26,21.275 7.315,24 12,24 Z", fill: "#34A853" }),
                                        React.createElement("path", { d: "M5.265,14.29 C5.025,13.565 4.9,12.795 4.9,12 C4.9,11.205 5.025,10.435 5.265,9.71 L5.265,6.62 L1.3,6.62 C0.47,8.28 0,10.09 0,12 C0,13.91 0.47,15.72 1.3,17.385 L5.265,14.29 Z", fill: "#FBBC05" }),
                                        React.createElement("path", { d: "M12,4.75 C13.77,4.75 15.355,5.36 16.605,6.55 L20.02,3.135 C17.96,1.215 15.235,0 12,0 C7.315,0 3.26,2.725 1.3,6.62 L5.265,9.71 C6.215,6.865 8.865,4.75 12,4.75 Z", fill: "#EA4335" }))),
                                React.createElement("div", null,
                                    React.createElement(card_1.CardTitle, null, "Google Drive & Sheets"),
                                    React.createElement(card_1.CardDescription, null, t('Import documents from Drive and export data to Sheets.'))))),
                        React.createElement(card_1.CardContent, null, googleAccount ? (React.createElement("div", { className: "flex items-center justify-between p-4 bg-muted/50 rounded-lg" },
                            React.createElement("div", { className: "flex items-center gap-3" },
                                googleAccount.avatar && (React.createElement("img", { src: googleAccount.avatar, alt: googleAccount.name, className: "w-10 h-10 rounded-full" })),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium text-sm" }, googleAccount.name),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, googleAccount.email),
                                    React.createElement("div", { className: "flex items-center gap-1 mt-1 text-green-600" },
                                        React.createElement(lucide_react_1.CheckCircle, { className: "h-3 w-3" }),
                                        React.createElement("span", { className: "text-xs font-medium" }, t('Connected'))))),
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleDisconnectClick('google'); }, className: "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" }, t('Disconnect')))) : (React.createElement("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" },
                            React.createElement("p", { className: "text-sm text-muted-foreground max-w-md" }, t('Connect your Google account to access your Drive files directly within the app and export extracted data to Google Sheets.')),
                            React.createElement(button_1.Button, { onClick: function () { return handleConnect('google'); } }, t('Connect Google'))))))))),
        React.createElement(AlertDialog, { open: disconnectDialogOpen, onOpenChange: setDisconnectDialogOpen },
            React.createElement(AlertDialogContent, null,
                React.createElement(AlertDialogHeader, null,
                    React.createElement(AlertDialogTitle, null, t('Disconnect Account')),
                    React.createElement(AlertDialogDescription, null, t('Are you sure you want to disconnect this account? You will need to reconnect to access your files again.'))),
                React.createElement(AlertDialogFooter, null,
                    React.createElement(AlertDialogCancel, null, t('Cancel')),
                    React.createElement(AlertDialogAction, { onClick: handleDisconnectConfirm, className: "bg-red-500 hover:bg-red-600 focus:ring-red-500" }, t('Disconnect')))))));
}
exports["default"] = Integrations;
