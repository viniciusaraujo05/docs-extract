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
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var react_2 = require("@inertiajs/react");
var react_i18next_1 = require("react-i18next");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function ForgotPassword(_a) {
    var _this = this;
    var status = _a.status;
    var _b = react_i18next_1.useTranslation(), t = _b.t, i18n = _b.i18n;
    var props = react_2.usePage().props;
    var locale = props.locale || 'en';
    var _c = react_1.useState(''), email = _c[0], setEmail = _c[1];
    var _d = react_1.useState(false), processing = _d[0], setProcessing = _d[1];
    var _e = react_1.useState({}), errors = _e[0], setErrors = _e[1];
    react_1.useEffect(function () {
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);
    react_1.useEffect(function () {
        if (status) {
            sonner_1.toast.success(status);
        }
    }, [status]);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            setProcessing(true);
            setErrors({});
            react_2.router.post("/" + locale + "/forgot-password", {
                email: email
            }, {
                onError: function (errors) {
                    setErrors(errors);
                    setProcessing(false);
                },
                onFinish: function () {
                    setProcessing(false);
                }
            });
            return [2 /*return*/];
        });
    }); };
    var benefits = [
        { icon: react_1["default"].createElement(lucide_react_1.Sparkles, { className: "h-5 w-5" }), text: t('AI-powered extraction') },
        { icon: react_1["default"].createElement(lucide_react_1.Zap, { className: "h-5 w-5" }), text: t('Process documents in seconds') },
        { icon: react_1["default"].createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), text: t('Bank-level security') },
    ];
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(react_2.Head, { title: t('Forgot Password') }),
        react_1["default"].createElement("div", { className: "min-h-screen flex" },
            react_1["default"].createElement("div", { className: "flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background" },
                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "w-full max-w-md" },
                    react_1["default"].createElement("div", { className: "mb-6 sm:mb-8" },
                        react_1["default"].createElement(framer_motion_1.motion.h1, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 }, className: "text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent" }, "DOCSET")),
                    react_1["default"].createElement("div", { className: "mb-6 sm:mb-8" },
                        react_1["default"].createElement("h2", { className: "text-2xl sm:text-3xl font-bold text-foreground mb-2" }, t('Reset your password')),
                        react_1["default"].createElement("p", { className: "text-sm sm:text-base text-muted-foreground" }, t('Tell us your email and we will send you a reset link'))),
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-4 sm:space-y-6" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "email", className: "text-sm font-medium" }, t('Email Address')),
                            react_1["default"].createElement("div", { className: "relative" },
                                react_1["default"].createElement(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" }),
                                react_1["default"].createElement(input_1.Input, { id: "email", type: "email", value: email, onChange: function (e) { return setEmail(e.target.value); }, placeholder: "you@example.com", className: "pl-10 h-11 sm:h-12 text-sm sm:text-base", required: true, autoComplete: "email", autoFocus: true })),
                            errors.email && (react_1["default"].createElement("p", { className: "text-sm text-red-600" }, errors.email))),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: processing, className: "w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm sm:text-base" }, processing ? (react_1["default"].createElement(lucide_react_1.LoaderCircle, { className: "h-5 w-5 animate-spin" })) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                            t('Send Reset Link'),
                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" }))))),
                    react_1["default"].createElement("div", { className: "mt-6 text-center" },
                        react_1["default"].createElement("button", { onClick: function () { return react_2.router.visit("/" + locale + "/login"); }, className: "text-sm text-muted-foreground hover:text-foreground font-medium" }, t('Back to login'))),
                    react_1["default"].createElement("div", { className: "mt-6 sm:mt-8 mb-4 sm:mb-6 flex items-center" },
                        react_1["default"].createElement("div", { className: "flex-1 border-t border-border" }),
                        react_1["default"].createElement("span", { className: "px-4 text-sm text-gray-500" }, t('or')),
                        react_1["default"].createElement("div", { className: "flex-1 border-t border-border" })),
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("button", { onClick: function () { return react_2.router.visit("/" + locale); }, className: "text-sm text-muted-foreground hover:text-foreground" },
                            "\u2190 ",
                            t('Back to home'))))),
            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, delay: 0.2 }, className: "hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-8 lg:p-12 items-center justify-center relative overflow-hidden" },
                react_1["default"].createElement("div", { className: "absolute inset-0" }, __spreadArrays(Array(20)).map(function (_, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: i, animate: {
                        y: [0, -100, 0],
                        x: [0, Math.random() * 100 - 50, 0],
                        opacity: [0, 1, 0]
                    }, transition: {
                        repeat: Infinity,
                        duration: Math.random() * 5 + 3,
                        delay: Math.random() * 5
                    }, className: "absolute w-2 h-2 bg-white rounded-full", style: {
                        left: Math.random() * 100 + "%",
                        top: Math.random() * 100 + "%"
                    } })); })),
                react_1["default"].createElement("div", { className: "relative z-10 max-w-md text-white" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 } },
                        react_1["default"].createElement("h2", { className: "text-4xl font-bold mb-6" }, t('Secure access to your data')),
                        react_1["default"].createElement("p", { className: "text-xl text-blue-100 mb-8" }, t('Don\'t worry, we\'ll help you get back to your account in no time.')),
                        react_1["default"].createElement("div", { className: "space-y-4" }, benefits.map(function (benefit, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: i, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.6 + i * 0.1 }, className: "flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4" },
                            react_1["default"].createElement("div", { className: "bg-white/20 rounded-full p-2" }, benefit.icon),
                            react_1["default"].createElement("span", { className: "font-medium" }, benefit.text))); })),
                        react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 1 }, className: "mt-8 flex items-center gap-6 text-sm" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5" }),
                                react_1["default"].createElement("span", null, t('256-bit encryption'))),
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5" }),
                                react_1["default"].createElement("span", null, t('Identity protection'))))))))));
}
exports["default"] = ForgotPassword;
