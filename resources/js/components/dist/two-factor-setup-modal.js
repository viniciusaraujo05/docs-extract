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
var input_error_1 = require("@/components/input-error");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var input_otp_1 = require("@/components/ui/input-otp");
var use_clipboard_1 = require("@/hooks/use-clipboard");
var use_two_factor_auth_1 = require("@/hooks/use-two-factor-auth");
var input_otp_2 = require("input-otp");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var alert_error_1 = require("./alert-error");
var spinner_1 = require("./ui/spinner");
function GridScanIcon() {
    return (React.createElement("div", { className: "mb-3 rounded-full border border-border bg-card p-0.5 shadow-sm" },
        React.createElement("div", { className: "relative overflow-hidden rounded-full border border-border bg-muted p-2.5" },
            React.createElement("div", { className: "absolute inset-0 grid grid-cols-5 opacity-50" }, Array.from({ length: 5 }, function (_, i) { return (React.createElement("div", { key: "col-" + (i + 1), className: "border-r border-border last:border-r-0" })); })),
            React.createElement("div", { className: "absolute inset-0 grid grid-rows-5 opacity-50" }, Array.from({ length: 5 }, function (_, i) { return (React.createElement("div", { key: "row-" + (i + 1), className: "border-b border-border last:border-b-0" })); })),
            React.createElement(lucide_react_1.ScanLine, { className: "relative z-20 size-6 text-foreground" }))));
}
function TwoFactorSetupStep(_a) {
    var qrCodeSvg = _a.qrCodeSvg, manualSetupKey = _a.manualSetupKey, buttonText = _a.buttonText, onNextStep = _a.onNextStep, errors = _a.errors;
    var _b = use_clipboard_1.useClipboard(), copiedText = _b[0], copy = _b[1];
    var IconComponent = copiedText === manualSetupKey ? lucide_react_1.Check : lucide_react_1.Copy;
    return (React.createElement(React.Fragment, null, (errors === null || errors === void 0 ? void 0 : errors.length) ? (React.createElement(alert_error_1["default"], { errors: errors })) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "mx-auto flex max-w-md overflow-hidden" },
            React.createElement("div", { className: "mx-auto aspect-square w-64 rounded-lg border border-border" },
                React.createElement("div", { className: "z-10 flex h-full w-full items-center justify-center p-5" }, qrCodeSvg ? (React.createElement("div", { className: "aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full", dangerouslySetInnerHTML: {
                        __html: qrCodeSvg
                    } })) : (React.createElement(spinner_1.Spinner, null))))),
        React.createElement("div", { className: "flex w-full space-x-5" },
            React.createElement(button_1.Button, { className: "w-full", onClick: onNextStep }, buttonText)),
        React.createElement("div", { className: "relative flex w-full items-center justify-center" },
            React.createElement("div", { className: "absolute inset-0 top-1/2 h-px w-full bg-border" }),
            React.createElement("span", { className: "relative bg-card px-2 py-1" }, "or, enter the code manually")),
        React.createElement("div", { className: "flex w-full space-x-2" },
            React.createElement("div", { className: "flex w-full items-stretch overflow-hidden rounded-xl border border-border" }, !manualSetupKey ? (React.createElement("div", { className: "flex h-full w-full items-center justify-center bg-muted p-3" },
                React.createElement(spinner_1.Spinner, null))) : (React.createElement(React.Fragment, null,
                React.createElement("input", { type: "text", readOnly: true, value: manualSetupKey, className: "h-full w-full bg-background p-3 text-foreground outline-none" }),
                React.createElement("button", { onClick: function () { return copy(manualSetupKey); }, className: "border-l border-border px-3 hover:bg-muted" },
                    React.createElement(IconComponent, { className: "w-4" }))))))))));
}
function TwoFactorVerificationStep(_a) {
    var onClose = _a.onClose, onBack = _a.onBack;
    var _b = react_1.useState(''), code = _b[0], setCode = _b[1];
    var pinInputContainerRef = react_1.useRef(null);
    react_1.useEffect(function () {
        setTimeout(function () {
            var _a, _b;
            (_b = (_a = pinInputContainerRef.current) === null || _a === void 0 ? void 0 : _a.querySelector('input')) === null || _b === void 0 ? void 0 : _b.focus();
        }, 0);
    }, []);
    return (React.createElement(Form, __assign({}, confirm.form(), { onSuccess: function () { return onClose(); }, resetOnError: true, resetOnSuccess: true }), function (_a) {
        var _b;
        var processing = _a.processing, errors = _a.errors;
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { ref: pinInputContainerRef, className: "relative w-full space-y-3" },
                React.createElement("div", { className: "flex w-full flex-col items-center space-y-3 py-2" },
                    React.createElement(input_otp_1.InputOTP, { id: "otp", name: "code", maxLength: use_two_factor_auth_1.OTP_MAX_LENGTH, onChange: setCode, disabled: processing, pattern: input_otp_2.REGEXP_ONLY_DIGITS },
                        React.createElement(input_otp_1.InputOTPGroup, null, Array.from({ length: use_two_factor_auth_1.OTP_MAX_LENGTH }, function (_, index) { return (React.createElement(input_otp_1.InputOTPSlot, { key: index, index: index })); }))),
                    React.createElement(input_error_1["default"], { message: (_b = errors === null || errors === void 0 ? void 0 : errors.confirmTwoFactorAuthentication) === null || _b === void 0 ? void 0 : _b.code })),
                React.createElement("div", { className: "flex w-full space-x-5" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", className: "flex-1", onClick: onBack, disabled: processing }, "Back"),
                    React.createElement(button_1.Button, { type: "submit", className: "flex-1", disabled: processing || code.length < use_two_factor_auth_1.OTP_MAX_LENGTH }, "Confirm")))));
    }));
}
function TwoFactorSetupModal(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, requiresConfirmation = _a.requiresConfirmation, twoFactorEnabled = _a.twoFactorEnabled, qrCodeSvg = _a.qrCodeSvg, manualSetupKey = _a.manualSetupKey, clearSetupData = _a.clearSetupData, fetchSetupData = _a.fetchSetupData, errors = _a.errors;
    var _b = react_1.useState(false), showVerificationStep = _b[0], setShowVerificationStep = _b[1];
    var modalConfig = react_1.useMemo(function () {
        if (twoFactorEnabled) {
            return {
                title: 'Two-Factor Authentication Enabled',
                description: 'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
                buttonText: 'Close'
            };
        }
        if (showVerificationStep) {
            return {
                title: 'Verify Authentication Code',
                description: 'Enter the 6-digit code from your authenticator app',
                buttonText: 'Continue'
            };
        }
        return {
            title: 'Enable Two-Factor Authentication',
            description: 'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
            buttonText: 'Continue'
        };
    }, [twoFactorEnabled, showVerificationStep]);
    var handleModalNextStep = react_1.useCallback(function () {
        if (requiresConfirmation) {
            setShowVerificationStep(true);
            return;
        }
        clearSetupData();
        onClose();
    }, [requiresConfirmation, clearSetupData, onClose]);
    var resetModalState = react_1.useCallback(function () {
        setShowVerificationStep(false);
        if (twoFactorEnabled) {
            clearSetupData();
        }
    }, [twoFactorEnabled, clearSetupData]);
    react_1.useEffect(function () {
        if (isOpen && !qrCodeSvg) {
            fetchSetupData();
        }
    }, [isOpen, qrCodeSvg, fetchSetupData]);
    var handleClose = react_1.useCallback(function () {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: function (open) { return !open && handleClose(); } },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            React.createElement(dialog_1.DialogHeader, { className: "flex items-center justify-center" },
                React.createElement(GridScanIcon, null),
                React.createElement(dialog_1.DialogTitle, null, modalConfig.title),
                React.createElement(dialog_1.DialogDescription, { className: "text-center" }, modalConfig.description)),
            React.createElement("div", { className: "flex flex-col items-center space-y-5" }, showVerificationStep ? (React.createElement(TwoFactorVerificationStep, { onClose: onClose, onBack: function () { return setShowVerificationStep(false); } })) : (React.createElement(TwoFactorSetupStep, { qrCodeSvg: qrCodeSvg, manualSetupKey: manualSetupKey, buttonText: modalConfig.buttonText, onNextStep: handleModalNextStep, errors: errors }))))));
}
exports["default"] = TwoFactorSetupModal;
