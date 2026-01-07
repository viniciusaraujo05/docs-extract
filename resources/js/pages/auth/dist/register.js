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
function Register(_a) {
    var _this = this;
    var canRegister = _a.canRegister;
    var _b = react_i18next_1.useTranslation(), t = _b.t, i18n = _b.i18n;
    var props = react_2.usePage().props;
    var locale = props.locale || 'en';
    var _c = react_1.useState(''), name = _c[0], setName = _c[1];
    var _d = react_1.useState(''), email = _d[0], setEmail = _d[1];
    var _e = react_1.useState(''), password = _e[0], setPassword = _e[1];
    var _f = react_1.useState(''), passwordConfirmation = _f[0], setPasswordConfirmation = _f[1];
    var _g = react_1.useState(false), showPassword = _g[0], setShowPassword = _g[1];
    var _h = react_1.useState(false), showPasswordConfirmation = _h[0], setShowPasswordConfirmation = _h[1];
    var _j = react_1.useState(false), processing = _j[0], setProcessing = _j[1];
    var _k = react_1.useState({}), errors = _k[0], setErrors = _k[1];
    var _l = react_1.useState(0), passwordStrength = _l[0], setPasswordStrength = _l[1];
    react_1.useEffect(function () {
        var _a;
        if ((_a = props.auth) === null || _a === void 0 ? void 0 : _a.user) {
            react_2.router.visit("/" + locale + "/dashboard");
            return;
        }
    }, [props.auth, locale]);
    react_1.useEffect(function () {
        // Sincronizar idioma com i18n
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);
    react_1.useEffect(function () {
        var strength = 0;
        if (password.length >= 8)
            strength += 25;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/))
            strength += 25;
        if (password.match(/[0-9]/))
            strength += 25;
        if (password.match(/[^a-zA-Z0-9]/))
            strength += 25;
        setPasswordStrength(strength);
    }, [password]);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            setProcessing(true);
            setErrors({});
            react_2.router.post("/" + locale + "/register", {
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            }, {
                onError: function (errors) {
                    setErrors(errors);
                    sonner_1.toast.error('Please check the form for errors');
                    setProcessing(false);
                },
                onSuccess: function () {
                    sonner_1.toast.success(t('Account created successfully!'));
                },
                onFinish: function () {
                    setProcessing(false);
                }
            });
            return [2 /*return*/];
        });
    }); };
    var getPasswordStrengthColor = function () {
        if (passwordStrength < 25)
            return 'bg-red-500';
        if (passwordStrength < 50)
            return 'bg-orange-500';
        if (passwordStrength < 75)
            return 'bg-yellow-500';
        return 'bg-green-500';
    };
    var getPasswordStrengthText = function () {
        if (passwordStrength < 25)
            return 'Weak';
        if (passwordStrength < 50)
            return 'Fair';
        if (passwordStrength < 75)
            return 'Good';
        return 'Strong';
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(react_2.Head, { title: "Register - DOCSET" }),
        React.createElement("div", { className: "min-h-screen flex bg-black text-white" },
            React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5 }, className: "hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 items-center justify-center relative overflow-hidden" },
                React.createElement("div", { className: "absolute inset-0" }, __spreadArrays(Array(30)).map(function (_, i) { return (React.createElement(framer_motion_1.motion.div, { key: i, animate: {
                        y: [0, -150, 0],
                        x: [0, Math.random() * 100 - 50, 0],
                        opacity: [0, 0.8, 0]
                    }, transition: {
                        repeat: Infinity,
                        duration: Math.random() * 8 + 5,
                        delay: Math.random() * 5
                    }, className: "absolute w-1 h-1 bg-white rounded-full", style: {
                        left: Math.random() * 100 + "%",
                        top: Math.random() * 100 + "%"
                    } })); })),
                React.createElement("div", { className: "relative z-10 max-w-md text-white" },
                    React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 } },
                        React.createElement("h2", { className: "text-5xl font-bold mb-6 leading-tight" }, "Start extracting data today"),
                        React.createElement("p", { className: "text-xl text-blue-100 mb-10 leading-relaxed" }, "No credit card required. Get full access to all features with our free plan."),
                        React.createElement("div", { className: "space-y-4" }, [
                            { icon: React.createElement(lucide_react_1.Sparkles, { className: "h-5 w-5" }), text: 'AI-powered extraction' },
                            { icon: React.createElement(lucide_react_1.Zap, { className: "h-5 w-5" }), text: 'Process documents instantly' },
                            { icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), text: 'Analytics & reports' },
                            { icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), text: 'Enterprise security' },
                        ].map(function (feature, i) { return (React.createElement(framer_motion_1.motion.div, { key: i, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.4 + i * 0.1 }, className: "flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10" },
                            React.createElement("div", { className: "bg-white/20 rounded-lg p-2" }, feature.icon),
                            React.createElement("span", { className: "font-medium text-lg" }, feature.text))); }))))),
            React.createElement("div", { className: "flex-1 flex items-center justify-center p-6 lg:p-8 relative overflow-hidden" },
                React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-blue-950/20" }),
                React.createElement("div", { className: "absolute inset-0" },
                    React.createElement(framer_motion_1.motion.div, { className: "absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl", animate: {
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }, transition: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } }),
                    React.createElement(framer_motion_1.motion.div, { className: "absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl", animate: {
                            scale: [1.2, 1, 1.2],
                            opacity: [0.5, 0.3, 0.5]
                        }, transition: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        } })),
                React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.2 }, className: "w-full max-w-md relative z-10" },
                    React.createElement("div", { className: "mb-8" },
                        React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.4 }, className: "flex items-center gap-2 mb-8", onClick: function () { return react_2.router.visit("/" + locale); } },
                            React.createElement("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer" },
                                React.createElement(lucide_react_1.FileJson, { className: "h-5 w-5 text-white" })),
                            React.createElement("span", { className: "font-bold text-lg cursor-pointer" }, "DOCSET")),
                        React.createElement("h2", { className: "text-4xl font-bold mb-3" }, t('Create your account')),
                        React.createElement("p", { className: "text-gray-400" }, t('Start extracting data from documents in minutes'))),
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-5" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "name", className: "text-sm font-medium text-gray-300" }, t('Full Name')),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" }),
                                React.createElement(input_1.Input, { id: "name", type: "text", value: name, onChange: function (e) { return setName(e.target.value); }, placeholder: "John Doe", className: "pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500", required: true, autoComplete: "name" })),
                            errors.name && (React.createElement("p", { className: "text-sm text-red-400" }, errors.name))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "email", className: "text-sm font-medium text-gray-300" }, t('Email Address')),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" }),
                                React.createElement(input_1.Input, { id: "email", type: "email", value: email, onChange: function (e) { return setEmail(e.target.value); }, placeholder: "you@example.com", className: "pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500", required: true, autoComplete: "email" })),
                            errors.email && (React.createElement("p", { className: "text-sm text-red-400" }, errors.email))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "password", className: "text-sm font-medium text-gray-300" }, t('Password')),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" }),
                                React.createElement(input_1.Input, { id: "password", type: showPassword ? 'text' : 'password', value: password, onChange: function (e) { return setPassword(e.target.value); }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500", required: true, autoComplete: "new-password" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white" }, showPassword ? (React.createElement(lucide_react_1.EyeOff, { className: "h-5 w-5" })) : (React.createElement(lucide_react_1.Eye, { className: "h-5 w-5" })))),
                            password && (React.createElement("div", { className: "space-y-1" },
                                React.createElement("div", { className: "h-2 bg-white/5 rounded-full overflow-hidden" },
                                    React.createElement(framer_motion_1.motion.div, { initial: { width: 0 }, animate: { width: passwordStrength + "%" }, className: "h-full " + getPasswordStrengthColor() + " transition-all" })),
                                React.createElement("p", { className: "text-xs text-gray-400" },
                                    "Password strength: ",
                                    React.createElement("span", { className: passwordStrength >= 75 ? 'text-green-400' : 'text-gray-300' }, getPasswordStrengthText())))),
                            errors.password && (React.createElement("p", { className: "text-sm text-red-400" }, errors.password))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "password_confirmation", className: "text-sm font-medium text-gray-300" }, t('Confirm Password')),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" }),
                                React.createElement(input_1.Input, { id: "password_confirmation", type: showPasswordConfirmation ? 'text' : 'password', value: passwordConfirmation, onChange: function (e) { return setPasswordConfirmation(e.target.value); }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500", required: true, autoComplete: "new-password" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowPasswordConfirmation(!showPasswordConfirmation); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white" }, showPasswordConfirmation ? (React.createElement(lucide_react_1.EyeOff, { className: "h-5 w-5" })) : (React.createElement(lucide_react_1.Eye, { className: "h-5 w-5" }))))),
                        React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } },
                            React.createElement(button_1.Button, { type: "submit", disabled: processing, className: "w-full h-12 bg-white text-black hover:bg-gray-200 font-semibold" }, processing ? (React.createElement(framer_motion_1.motion.div, { animate: { rotate: 360 }, transition: { repeat: Infinity, duration: 1 } },
                                React.createElement(lucide_react_1.Sparkles, { className: "h-5 w-5" }))) : (React.createElement(React.Fragment, null,
                                t('Create account'),
                                React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" }))))),
                        React.createElement("p", { className: "text-xs text-center text-gray-400" },
                            "By creating an account, you agree to our",
                            ' ',
                            React.createElement("a", { href: "/" + locale + "/terms", className: "text-blue-400 hover:text-blue-300" }, "Terms of Service"),
                            ' ',
                            "and",
                            ' ',
                            React.createElement("a", { href: "/" + locale + "/privacy", className: "text-blue-400 hover:text-blue-300" }, "Privacy Policy"))),
                    React.createElement("div", { className: "mt-6 text-center" },
                        React.createElement("p", { className: "text-sm text-gray-400" },
                            t('Already have an account?'),
                            " ",
                            ' ',
                            React.createElement("button", { onClick: function () { return react_2.router.visit("/" + locale + "/login"); }, className: "text-blue-400 hover:text-blue-300 font-semibold" }, t('Sign in')))),
                    React.createElement("div", { className: "mt-8 text-center" },
                        React.createElement("button", { onClick: function () { return react_2.router.visit("/" + locale); }, className: "text-sm text-gray-400 hover:text-white transition" },
                            "\u2190 ",
                            t('Back to home'))))))));
}
exports["default"] = Register;
