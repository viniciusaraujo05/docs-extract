"use strict";
exports.__esModule = true;
exports.FirstExtractionModal = void 0;
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var react_2 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var STORAGE_KEY = 'docset_onboarding_modal_dismissed';
function FirstExtractionModal(_a) {
    var _b = _a.locale, locale = _b === void 0 ? 'en' : _b, controlledOpen = _a.isOpen, onClose = _a.onClose;
    var t = react_i18next_1.useTranslation().t;
    var auth = react_2.usePage().props.auth;
    var _c = react_1.useState(false), open = _c[0], setOpen = _c[1];
    react_1.useEffect(function () {
        // Only show if user has no documents AND hasn't dismissed it in this session
        var wasDismissed = sessionStorage.getItem(STORAGE_KEY);
        if (!auth.hasDocuments && !wasDismissed && controlledOpen !== false) {
            // Small delay for smoother entrance after page load
            var timer_1 = setTimeout(function () { return setOpen(true); }, 500);
            return function () { return clearTimeout(timer_1); };
        }
    }, [auth.hasDocuments, controlledOpen]);
    var handleClose = function () {
        setOpen(false);
        // Use sessionStorage instead of localStorage - only dismiss for this session
        sessionStorage.setItem(STORAGE_KEY, 'true');
        onClose === null || onClose === void 0 ? void 0 : onClose();
    };
    var handleStartExtraction = function () {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        react_2.router.visit("/" + locale + "/documents/create");
    };
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: function (isOpen) { return !isOpen && handleClose(); } },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-md border-0 p-0 overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl" },
            React.createElement("div", { className: "relative h-32 bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-white/5" },
                React.createElement("div", { className: "absolute inset-0 bg-blue-500/10 radial-gradient-center" }),
                React.createElement("div", { className: "relative bg-white/5 backdrop-blur-md p-4 rounded-full border border-white/10 shadow-lg animate-in zoom-in duration-500" },
                    React.createElement(lucide_react_1.FileUp, { className: "h-8 w-8 text-blue-400 drop-shadow-md" }))),
            React.createElement("div", { className: "px-6 py-6 space-y-4 bg-zinc-950" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, { className: "text-center text-2xl font-bold text-white" }, t('onboarding.first_extraction.title')),
                    React.createElement(dialog_1.DialogDescription, { className: "text-center text-base text-zinc-400 pt-2" }, t('onboarding.first_extraction.description'))),
                React.createElement("div", { className: "grid grid-cols-2 gap-4 py-2" },
                    React.createElement("div", { className: "flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-white/10" },
                        React.createElement("div", { className: "p-2 rounded-full bg-blue-500/10 text-blue-400" },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
                                React.createElement("path", { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }),
                                React.createElement("polyline", { points: "14 2 14 8 20 8" }))),
                        React.createElement("span", { className: "text-xs font-medium text-center text-zinc-300" }, t('Upload PDF/Image'))),
                    React.createElement("div", { className: "flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-white/10" },
                        React.createElement("div", { className: "p-2 rounded-full bg-emerald-500/10 text-emerald-400" },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
                                React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
                                React.createElement("path", { d: "m9 12 2 2 4-4" }))),
                        React.createElement("span", { className: "text-xs font-medium text-center text-zinc-300" }, t('Extract Data')))),
                React.createElement("div", { className: "flex flex-col gap-3 pt-2" },
                    React.createElement(button_1.Button, { onClick: handleStartExtraction, className: "w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 h-11 text-base group border-0" },
                        t('onboarding.first_extraction.cta'),
                        React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" })),
                    React.createElement(button_1.Button, { variant: "ghost", onClick: handleClose, className: "w-full text-zinc-500 hover:text-white hover:bg-white/5" }, t('onboarding.first_extraction.later')))))));
}
exports.FirstExtractionModal = FirstExtractionModal;
