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
require("../css/app.css");
require("./i18n/config");
var react_1 = require("@inertiajs/react");
var inertia_helpers_1 = require("laravel-vite-plugin/inertia-helpers");
var react_2 = require("react");
var client_1 = require("react-dom/client");
var use_appearance_1 = require("./hooks/use-appearance");
var sonner_1 = require("./components/ui/sonner");
var theme_provider_1 = require("./components/theme-provider");
var CookieConsent_1 = require("./components/CookieConsent");
var appName = import.meta.env.VITE_APP_NAME || 'DOCSET';
react_1.createInertiaApp({
    title: function (title) { return (title ? title + " - " + appName : appName); },
    resolve: function (name) {
        return inertia_helpers_1.resolvePageComponent("./pages/" + name + ".tsx", import.meta.glob('./pages/**/*.tsx'));
    },
    setup: function (_a) {
        var el = _a.el, App = _a.App, props = _a.props;
        var root = client_1.createRoot(el);
        var locale = props.initialPage.props.locale || 'en';
        root.render(React.createElement(react_2.StrictMode, null,
            React.createElement(theme_provider_1.ThemeProvider, { defaultTheme: "dark", storageKey: "docset-theme" },
                React.createElement(App, __assign({}, props)),
                React.createElement(sonner_1.Toaster, { position: "top-right", richColors: true, closeButton: true }),
                React.createElement(CookieConsent_1["default"], { locale: locale }))));
    },
    progress: {
        color: '#4B5563'
    }
});
// This will set light / dark mode on load...
use_appearance_1.initializeTheme();
