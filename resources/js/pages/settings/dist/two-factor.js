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
var heading_small_1 = require("@/components/heading-small");
var two_factor_recovery_codes_1 = require("@/components/two-factor-recovery-codes");
var two_factor_setup_modal_1 = require("@/components/two-factor-setup-modal");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var use_two_factor_auth_1 = require("@/hooks/use-two-factor-auth");
var app_layout_1 = require("@/layouts/app-layout");
var layout_1 = require("@/layouts/settings/layout");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var breadcrumbs = [
    {
        title: 'Two-Factor Authentication',
        href: '/settings/two-factor'
    },
];
function TwoFactor(_a) {
    var _b = _a.requiresConfirmation, requiresConfirmation = _b === void 0 ? false : _b, _c = _a.twoFactorEnabled, twoFactorEnabled = _c === void 0 ? false : _c;
    var _d = use_two_factor_auth_1.useTwoFactorAuth(), qrCodeSvg = _d.qrCodeSvg, hasSetupData = _d.hasSetupData, manualSetupKey = _d.manualSetupKey, clearSetupData = _d.clearSetupData, fetchSetupData = _d.fetchSetupData, recoveryCodesList = _d.recoveryCodesList, fetchRecoveryCodes = _d.fetchRecoveryCodes, errors = _d.errors;
    var _e = react_2.useState(false), showSetupModal = _e[0], setShowSetupModal = _e[1];
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Two-Factor Authentication" }),
        React.createElement(layout_1["default"], null,
            React.createElement("div", { className: "space-y-6" },
                React.createElement(heading_small_1["default"], { title: "Two-Factor Authentication", description: "Manage your two-factor authentication settings" }),
                twoFactorEnabled ? (React.createElement("div", { className: "flex flex-col items-start justify-start space-y-4" },
                    React.createElement(badge_1.Badge, { variant: "default" }, "Enabled"),
                    React.createElement("p", { className: "text-muted-foreground" }, "With two-factor authentication enabled, you will be prompted for a secure, random pin during login, which you can retrieve from the TOTP-supported application on your phone."),
                    React.createElement(two_factor_recovery_codes_1["default"], { recoveryCodesList: recoveryCodesList, fetchRecoveryCodes: fetchRecoveryCodes, errors: errors }),
                    React.createElement("div", { className: "relative inline" },
                        React.createElement(Form, __assign({}, disable.form()), function (_a) {
                            var processing = _a.processing;
                            return (React.createElement(button_1.Button, { variant: "destructive", type: "submit", disabled: processing },
                                React.createElement(lucide_react_1.ShieldBan, null),
                                " Disable 2FA"));
                        })))) : (React.createElement("div", { className: "flex flex-col items-start justify-start space-y-4" },
                    React.createElement(badge_1.Badge, { variant: "destructive" }, "Disabled"),
                    React.createElement("p", { className: "text-muted-foreground" }, "When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone."),
                    React.createElement("div", null, hasSetupData ? (React.createElement(button_1.Button, { onClick: function () { return setShowSetupModal(true); } },
                        React.createElement(lucide_react_1.ShieldCheck, null),
                        "Continue Setup")) : (React.createElement(Form, __assign({}, enable.form(), { onSuccess: function () {
                            return setShowSetupModal(true);
                        } }), function (_a) {
                        var processing = _a.processing;
                        return (React.createElement(button_1.Button, { type: "submit", disabled: processing },
                            React.createElement(lucide_react_1.ShieldCheck, null),
                            "Enable 2FA"));
                    }))))),
                React.createElement(two_factor_setup_modal_1["default"], { isOpen: showSetupModal, onClose: function () { return setShowSetupModal(false); }, requiresConfirmation: requiresConfirmation, twoFactorEnabled: twoFactorEnabled, qrCodeSvg: qrCodeSvg, manualSetupKey: manualSetupKey, clearSetupData: clearSetupData, fetchSetupData: fetchSetupData, errors: errors })))));
}
exports["default"] = TwoFactor;
