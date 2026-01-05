"use strict";
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
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function VerifyEmail(_a) {
    var status = _a.status;
    var _b = react_i18next_1.useTranslation(), t = _b.t, i18n = _b.i18n;
    var props = react_2.usePage().props;
    var locale = props.locale || 'en';
    var _c = react_1.useState(false), processing = _c[0], setProcessing = _c[1];
    react_1.useEffect(function () {
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);
    react_1.useEffect(function () {
        if (status === 'verification-link-sent') {
            sonner_1.toast.success(t('A new verification link has been sent to your email address.'));
        }
    }, [status]);
    var handleResend = function (e) {
        e.preventDefault();
        setProcessing(true);
        react_2.router.post("/" + locale + "/email/verification-notification", {}, {
            onFinish: function () { return setProcessing(false); }
        });
    };
    var handleLogout = function () {
        react_2.router.post("/" + locale + "/logout");
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(react_2.Head, { title: "Verify Email - DOCSET" }),
        React.createElement("div", { className: "min-h-screen flex bg-black text-white" },
            React.createElement("div", { className: "flex-1 flex items-center justify-center p-6 lg:p-8 relative overflow-hidden" },
                React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-blue-950/20" }),
                React.createElement("div", { className: "absolute inset-0" },
                    React.createElement(framer_motion_1.motion.div, { className: "absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl", animate: {
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }, transition: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } }),
                    React.createElement(framer_motion_1.motion.div, { className: "absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl", animate: {
                            scale: [1.2, 1, 1.2],
                            opacity: [0.5, 0.3, 0.5]
                        }, transition: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        } })),
                React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "w-full max-w-md relative z-10" },
                    React.createElement("div", { className: "mb-8" },
                        React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 }, className: "flex items-center gap-2 mb-8", onClick: function () { return react_2.router.visit("/" + locale); } },
                            React.createElement("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer" },
                                React.createElement(lucide_react_1.FileJson, { className: "h-5 w-5 text-white" })),
                            React.createElement("span", { className: "font-bold text-lg cursor-pointer" }, "DOCSET")),
                        React.createElement("div", { className: "flex items-center justify-center mb-6" },
                            React.createElement("div", { className: "w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center" },
                                React.createElement(lucide_react_1.Mail, { className: "w-8 h-8 text-blue-400" }))),
                        React.createElement("h2", { className: "text-4xl font-bold mb-3 text-center" }, t('auth.verify_email.title')),
                        React.createElement("p", { className: "text-gray-400 text-center" }, t('auth.verify_email.description')),
                        React.createElement("p", { className: "text-gray-400 text-center mt-2" }, t('auth.verify_email.link_sent'))),
                    React.createElement("form", { onSubmit: handleResend, className: "space-y-6" },
                        React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } },
                            React.createElement(button_1.Button, { type: "submit", disabled: processing, className: "w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold" }, processing ? (React.createElement(lucide_react_1.LoaderCircle, { className: "h-5 w-5 animate-spin" })) : (React.createElement(React.Fragment, null,
                                t('Click here to resend verification email.'),
                                React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })))))),
                    React.createElement("div", { className: "mt-6 text-center" },
                        React.createElement("button", { onClick: handleLogout, className: "flex items-center justify-center gap-2 mx-auto text-sm text-gray-400 hover:text-white font-medium transition-colors" },
                            React.createElement(lucide_react_1.LogOut, { className: "h-4 w-4" }),
                            "Logout")),
                    React.createElement("div", { className: "mt-8 text-center" },
                        React.createElement("button", { onClick: function () { return react_2.router.visit("/" + locale); }, className: "text-sm text-gray-400 hover:text-white transition" },
                            "\u2190 ",
                            t('Back to home'))))),
            React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, delay: 0.2 }, className: "hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 items-center justify-center relative overflow-hidden" },
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
                    React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 } },
                        React.createElement("h2", { className: "text-5xl font-bold mb-6 leading-tight" }, "One step away from automation"),
                        React.createElement("p", { className: "text-xl text-blue-100 mb-10 leading-relaxed" }, "Verifying your email ensures the security of your account and enables full access to DOCSET."),
                        React.createElement("div", { className: "space-y-4" }, [
                            { icon: React.createElement(lucide_react_1.Sparkles, { className: "h-5 w-5" }), text: 'AI-powered extraction' },
                            { icon: React.createElement(lucide_react_1.Zap, { className: "h-5 w-5" }), text: 'Process in seconds' },
                            { icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), text: 'Bank-level security' },
                        ].map(function (benefit, i) { return (React.createElement(framer_motion_1.motion.div, { key: i, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.6 + i * 0.1 }, className: "flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10" },
                            React.createElement("div", { className: "bg-white/20 rounded-lg p-2" }, benefit.icon),
                            React.createElement("span", { className: "font-medium text-lg" }, benefit.text))); })),
                        React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 1 }, className: "mt-10 flex items-center gap-6 text-sm" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-400" }),
                                React.createElement("span", null, "Instant activation")),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-400" }),
                                React.createElement("span", null, "Secure access")))))))));
}
exports["default"] = VerifyEmail;
