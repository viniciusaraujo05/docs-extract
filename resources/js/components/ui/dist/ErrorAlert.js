"use strict";
exports.__esModule = true;
exports.ErrorAlert = void 0;
var useTranslation_1 = require("@/hooks/useTranslation");
var lucide_react_1 = require("lucide-react");
function ErrorAlert(_a) {
    var error = _a.error, onDismiss = _a.onDismiss, _b = _a.showReload, showReload = _b === void 0 ? true : _b;
    var t = useTranslation_1.useTranslation().t;
    return (React.createElement("div", { className: "mx-auto w-full max-w-2xl animate-in fade-in-50" },
        React.createElement("div", { className: "rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-left text-destructive" },
            React.createElement("div", { className: "flex gap-3" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }),
                React.createElement("div", { className: "flex-1" },
                    React.createElement("div", { className: "whitespace-pre-wrap text-sm leading-relaxed" }, error),
                    React.createElement("div", { className: "mt-3 flex gap-2" },
                        onDismiss && (React.createElement("button", { onClick: onDismiss, className: "text-xs underline hover:no-underline" }, t('common.close'))),
                        showReload && (React.createElement("button", { onClick: function () { return window.location.reload(); }, className: "text-xs underline hover:no-underline" }, t('common.reload_page')))))))));
}
exports.ErrorAlert = ErrorAlert;
