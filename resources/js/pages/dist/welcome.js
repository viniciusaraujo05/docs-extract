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
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var react_2 = require("@inertiajs/react");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var config_1 = require("@/i18n/config");
var SEOHead_1 = require("@/components/seo/SEOHead");
var seo_1 = require("@/utils/seo");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
// Fallbacks removed to use direct translation keys
function Welcome() {
    var _a;
    var _b = react_i18next_1.useTranslation(), t = _b.t, i18n = _b.i18n;
    var props = react_2.usePage().props;
    var isAuthenticated = !!((_a = props.auth) === null || _a === void 0 ? void 0 : _a.user);
    var _c = react_1.useState(function () {
        if (typeof window !== 'undefined') {
            var saved = localStorage.getItem('selected-locale');
            if (saved)
                return saved;
        }
        // Idioma padrão: inglês
        return props.locale === 'pt' ? 'pt' : 'en';
    }), locale = _c[0], setLocale = _c[1];
    var _d = react_1.useState(function () {
        if (typeof window !== 'undefined') {
            var saved = localStorage.getItem('pt-variant');
            return saved !== null && saved !== void 0 ? saved : 'pt-PT';
        }
        return 'pt-PT';
    }), ptVariant = _d[0], setPtVariant = _d[1];
    var _e = react_1.useState('dark'), theme = _e[0], setTheme = _e[1];
    var _f = react_1.useState(false), showDemo = _f[0], setShowDemo = _f[1];
    react_1.useEffect(function () {
        var savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }
        else {
            document.documentElement.classList.add('dark');
        }
        var currentUrlLocale = props.locale;
        var savedLocale = localStorage.getItem('selected-locale');
        // Se estamos na rota raiz (/) e temos preferência salva diferente do padrão
        if (window.location.pathname === '/' && savedLocale && savedLocale !== currentUrlLocale) {
            // Redirecionar para a URL com o idioma preferido
            window.location.href = "/" + savedLocale;
            return;
        }
        if (currentUrlLocale && currentUrlLocale !== locale) {
            setLocale(currentUrlLocale);
            i18n.changeLanguage(currentUrlLocale);
        }
    }, [props.locale]);
    var toggleTheme = react_1.useCallback(function () {
        var newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }, [theme]);
    react_1.useEffect(function () {
        if (locale === 'pt') {
            config_1.setPortugueseVariant(ptVariant);
        }
    }, [locale, ptVariant]);
    var handleLocaleChange = react_1.useCallback(function (value) {
        if (value === 'en') {
            setLocale('en');
            localStorage.setItem('selected-locale', 'en');
            i18n.changeLanguage('en');
            window.location.href = "/en";
        }
        else if (value === 'pt-BR') {
            setLocale('pt');
            setPtVariant('pt-BR');
            config_1.setPortugueseVariant('pt-BR');
            localStorage.setItem('selected-locale', 'pt');
            localStorage.setItem('pt-variant', 'pt-BR');
            i18n.changeLanguage('pt');
            window.location.href = "/pt";
        }
        else if (value === 'pt-PT') {
            setLocale('pt');
            setPtVariant('pt-PT');
            config_1.setPortugueseVariant('pt-PT');
            localStorage.setItem('selected-locale', 'pt');
            localStorage.setItem('pt-variant', 'pt-PT');
            i18n.changeLanguage('pt');
            window.location.href = "/pt";
        }
    }, [i18n]);
    var getCurrentLocaleValue = function () {
        if (locale === 'en')
            return 'en';
        return locale === 'pt' && ptVariant === 'pt-BR' ? 'pt-BR' : 'pt-PT';
    };
    var getFullLocale = function () {
        if (locale === 'en')
            return 'en';
        return locale === 'pt' && ptVariant === 'pt-BR' ? 'pt-BR' : 'pt-PT';
    };
    var fullLocale = getFullLocale();
    var seoContent = seo_1.getSEOContent(fullLocale);
    var structuredData = seo_1.generateStructuredData(fullLocale);
    var alternateLocales = seo_1.getAlternateLocales(fullLocale);
    return (react_1["default"].createElement("div", { className: "bg-black text-white antialiased" },
        react_1["default"].createElement(SEOHead_1["default"], { title: seoContent.title, description: seoContent.description, keywords: seoContent.keywords, locale: fullLocale, alternateLocales: alternateLocales, structuredData: structuredData, ogType: "website" }),
        react_1["default"].createElement(Header, { locale: getCurrentLocaleValue(), onLocaleChange: handleLocaleChange, theme: theme, onToggleTheme: toggleTheme, isAuthenticated: isAuthenticated }),
        react_1["default"].createElement(Hero, { locale: fullLocale, onOpenDemo: function () { return setShowDemo(true); } }),
        react_1["default"].createElement(TrustSignals, null),
        react_1["default"].createElement(UseCases, null),
        react_1["default"].createElement(ProductFlow, { locale: fullLocale }),
        react_1["default"].createElement(GoogleIntegrations, { locale: fullLocale }),
        react_1["default"].createElement(Features, { locale: fullLocale }),
        react_1["default"].createElement(CodeExample, { locale: fullLocale, onOpenDemo: function () { return setShowDemo(true); } }),
        react_1["default"].createElement(Pricing, { locale: fullLocale, isAuthenticated: isAuthenticated, localeShort: locale, plans: props.plans }),
        react_1["default"].createElement(FinalCTA, { locale: fullLocale }),
        react_1["default"].createElement(Footer, { locale: locale }),
        showDemo && (react_1["default"].createElement(DemoModal, { onClose: function () { return setShowDemo(false); }, locale: locale, onDemoComplete: function () {
                setShowDemo(false);
                react_2.router.visit("/" + locale + "/register");
            } }))));
}
exports["default"] = Welcome;
function Header(_a) {
    var locale = _a.locale, onLocaleChange = _a.onLocaleChange, theme = _a.theme, onToggleTheme = _a.onToggleTheme, isAuthenticated = _a.isAuthenticated;
    var _b = react_1.useState(false), scrolled = _b[0], setScrolled = _b[1];
    var _c = react_1.useState(false), mobileMenuOpen = _c[0], setMobileMenuOpen = _c[1];
    var t = react_i18next_1.useTranslation().t;
    var getHeaderText = function () {
        return {
            features: t('landing.nav.product'),
            pricing: t('landing.nav.pricing'),
            api: t('API'),
            login: t('Login'),
            startFree: t('Get Started'),
            dashboard: t('Dashboard')
        };
    };
    var headerText = getHeaderText();
    react_1.useEffect(function () {
        var handleScroll = function () { return setScrolled(window.scrollY > 20); };
        window.addEventListener("scroll", handleScroll);
        return function () { return window.removeEventListener("scroll", handleScroll); };
    }, []);
    var getLocaleFlag = function (loc) {
        if (loc === 'en')
            return '🇬🇧';
        if (loc === 'pt-BR')
            return '🇧🇷';
        return '🇵🇹';
    };
    var getLocaleLabel = function (loc) {
        if (loc === 'en')
            return 'English';
        if (loc === 'pt-BR')
            return 'Português (BR)';
        return 'Português (PT)';
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(framer_motion_1.motion.header, { initial: { y: 0, opacity: 1 }, animate: { y: 0, opacity: 1 }, className: "fixed top-0 w-full z-50 transition-all duration-300 " + (scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent") },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-8" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.05 }, className: "flex items-center gap-2 cursor-pointer", onClick: function () { return react_2.router.visit("/" + locale.split('-')[0]); } },
                        react_1["default"].createElement("div", { className: "w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/10" },
                            react_1["default"].createElement("img", { src: "/docset.png", alt: "Docset", className: "h-full w-full object-contain" })),
                        react_1["default"].createElement("span", { className: "font-bold text-lg" }, "DOCSET")),
                    react_1["default"].createElement("nav", { className: "hidden md:flex gap-6 text-sm" },
                        react_1["default"].createElement("a", { href: "#features", className: "text-gray-400 hover:text-white transition" }, headerText.features),
                        react_1["default"].createElement("a", { href: "#pricing", className: "text-gray-400 hover:text-white transition" }, headerText.pricing),
                        react_1["default"].createElement("a", { href: "#api", className: "text-gray-400 hover:text-white transition" }, headerText.api))),
                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                    react_1["default"].createElement("div", { className: "hidden md:flex items-center gap-3" },
                        react_1["default"].createElement(select_1.Select, { value: locale, onValueChange: onLocaleChange },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[160px] bg-white/5 border-white/10 text-white" },
                                react_1["default"].createElement(select_1.SelectValue, null,
                                    react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                                        react_1["default"].createElement("span", null, getLocaleFlag(locale)),
                                        react_1["default"].createElement("span", { className: "text-sm" }, getLocaleLabel(locale).split(' ')[0])))),
                            react_1["default"].createElement(select_1.SelectContent, { className: "bg-zinc-900 border-white/10" },
                                react_1["default"].createElement(select_1.SelectItem, { value: "en", className: "text-white" },
                                    react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                                        "\uD83C\uDDEC\uD83C\uDDE7 ",
                                        react_1["default"].createElement("span", null, "English"))),
                                react_1["default"].createElement(select_1.SelectItem, { value: "pt-BR", className: "text-white" },
                                    react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                                        "\uD83C\uDDE7\uD83C\uDDF7 ",
                                        react_1["default"].createElement("span", null, "Portugu\u00EAs (BR)"))),
                                react_1["default"].createElement(select_1.SelectItem, { value: "pt-PT", className: "text-white" },
                                    react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                                        "\uD83C\uDDF5\uD83C\uDDF9 ",
                                        react_1["default"].createElement("span", null, "Portugu\u00EAs (PT)"))))),
                        isAuthenticated ? (react_1["default"].createElement(button_1.Button, { onClick: function () { return react_2.router.visit("/" + locale.split('-')[0] + "/dashboard"); }, className: "bg-blue-500 hover:bg-blue-600 text-white" }, headerText.dashboard)) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: function () { return react_2.router.visit("/" + locale.split('-')[0] + "/login"); }, className: "text-white hover:bg-white/10" }, headerText.login),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return react_2.router.visit("/" + locale.split('-')[0] + "/register"); }, className: "bg-white text-black hover:bg-gray-200" }, headerText.startFree)))),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "md:hidden text-white", onClick: function () { return setMobileMenuOpen(true); } },
                        react_1["default"].createElement(lucide_react_1.Menu, { className: "h-6 w-6" }))))),
        react_1["default"].createElement(framer_motion_1.AnimatePresence, null, mobileMenuOpen && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1, x: "100%" }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: "100%" }, transition: { type: "spring", damping: 25, stiffness: 200 }, className: "fixed inset-0 z-[60] bg-zinc-950 flex flex-col md:hidden" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between p-6 border-b border-white/10" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center" },
                        react_1["default"].createElement(lucide_react_1.FileJson, { className: "h-5 w-5 text-white" })),
                    react_1["default"].createElement("span", { className: "font-bold text-lg" }, "DOCSET")),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setMobileMenuOpen(false); }, className: "text-white" },
                    react_1["default"].createElement(lucide_react_1.X, { className: "h-6 w-6" }))),
            react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto p-6 space-y-8" },
                react_1["default"].createElement("nav", { className: "flex flex-col gap-6 text-xl" },
                    react_1["default"].createElement("a", { href: "#features", onClick: function () { return setMobileMenuOpen(false); }, className: "text-gray-400 hover:text-white transition" }, headerText.features),
                    react_1["default"].createElement("a", { href: "#pricing", onClick: function () { return setMobileMenuOpen(false); }, className: "text-gray-400 hover:text-white transition" }, headerText.pricing),
                    react_1["default"].createElement("a", { href: "#api", onClick: function () { return setMobileMenuOpen(false); }, className: "text-gray-400 hover:text-white transition" }, headerText.api)),
                react_1["default"].createElement("div", { className: "space-y-6 pt-8 border-t border-white/10" },
                    react_1["default"].createElement("div", { className: "space-y-3" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 uppercase tracking-wider" }, "Language"),
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 gap-2" }, ['en', 'pt-BR', 'pt-PT'].map(function (loc) { return (react_1["default"].createElement("button", { key: loc, onClick: function () {
                                onLocaleChange(loc);
                                setMobileMenuOpen(false);
                            }, className: "flex items-center gap-3 p-3 rounded-lg transition " + (locale === loc ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5') },
                            react_1["default"].createElement("span", { className: "text-xl" }, getLocaleFlag(loc)),
                            react_1["default"].createElement("span", null, getLocaleLabel(loc)),
                            locale === loc && react_1["default"].createElement(lucide_react_1.Check, { className: "ml-auto h-4 w-4" }))); }))),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-3 pt-4" }, isAuthenticated ? (react_1["default"].createElement(button_1.Button, { onClick: function () { return react_2.router.visit("/" + locale.split('-')[0] + "/dashboard"); }, className: "w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-lg" }, headerText.dashboard)) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return react_2.router.visit("/" + locale.split('-')[0] + "/login"); }, className: "w-full text-white border-white/10 hover:bg-white/5 h-12 text-lg" }, headerText.login),
                        react_1["default"].createElement(button_1.Button, { onClick: function () { return react_2.router.visit("/" + locale.split('-')[0] + "/register"); }, className: "w-full bg-white text-black hover:bg-gray-200 h-12 text-lg" }, headerText.startFree)))))))))));
}
function Hero(_a) {
    var locale = _a.locale, onOpenDemo = _a.onOpenDemo;
    var t = react_i18next_1.useTranslation().t;
    var scrollY = framer_motion_1.useScroll().scrollY;
    var rotateX = framer_motion_1.useTransform(scrollY, [0, 500], [20, 0]);
    var scale = framer_motion_1.useTransform(scrollY, [0, 500], [1, 0.9]);
    var _b = react_1.useState(0), step = _b[0], setStep = _b[1];
    var _c = react_1.useState(0), formatIndex = _c[0], setFormatIndex = _c[1];
    react_1.useEffect(function () {
        // Step 2 animation no longer uses cycling formatIndex
        // We can remove the formatIndex logic if it's not used elsewhere
        // Keeping step cycle logic
    }, [step]);
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            setStep(function (prev) { return (prev + 1) % 3; });
        }, 4000); // Slower cycle to let users appreciate the animations
        return function () { return clearInterval(interval); };
    }, []);
    var getHeroText = function () {
        return {
            title: t('landing.hero.title'),
            highlight: t('landing.hero.highlight'),
            subtitle: t('landing.hero.subtitle'),
            cta_primary: t('landing.hero.cta_primary'),
            cta_demo: t('landing.hero.cta_secondary'),
            eyebrow: t('landing.hero.eyebrow')
        };
    };
    var heroRaw = getHeroText();
    return (react_1["default"].createElement("section", { className: "relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-24 bg-black selection:bg-blue-500/30" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950" }),
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" }),
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" }),
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 relative z-10" },
            react_1["default"].createElement("div", { className: "flex flex-col items-center text-center" },
                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } },
                    react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-3 py-1 text-xs backdrop-blur-md" },
                        react_1["default"].createElement(lucide_react_1.Sparkles, { className: "w-3 h-3 mr-2 text-blue-400" }),
                        heroRaw.eyebrow)),
                react_1["default"].createElement(framer_motion_1.motion.h1, { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.1 }, className: "text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/70 max-w-4xl" },
                    heroRaw.title,
                    " ",
                    react_1["default"].createElement("br", { className: "hidden md:block" }),
                    react_1["default"].createElement("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500" }, heroRaw.highlight)),
                react_1["default"].createElement(framer_motion_1.motion.p, { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.2 }, className: "text-lg md:text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto" }, heroRaw.subtitle),
                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.3 }, className: "flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, className: "w-full sm:w-auto" },
                        react_1["default"].createElement(button_1.Button, { size: "lg", onClick: function () { return react_2.router.visit("/" + locale + "/register"); }, className: "w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 text-base font-semibold shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] border border-blue-500/20 rounded-xl" },
                            heroRaw.cta_primary,
                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))),
                    react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, className: "w-full sm:w-auto" },
                        react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", onClick: onOpenDemo, className: "w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white px-8 h-12 text-base font-semibold backdrop-blur-sm rounded-xl" },
                            react_1["default"].createElement(lucide_react_1.Play, { className: "mr-2 h-4 w-4 fill-current" }),
                            heroRaw.cta_demo)))),
            react_1["default"].createElement(framer_motion_1.motion.div, { style: { rotateX: rotateX, scale: scale, perspective: 1000 }, initial: { opacity: 1, y: 100, rotateX: 20 }, animate: { opacity: 1, y: 0, rotateX: 20 }, transition: { duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }, className: "mt-20 relative perspective-1000 mx-auto max-w-5xl" },
                react_1["default"].createElement("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-blue-500/20 rounded-[100px] blur-[80px] pointer-events-none" }),
                react_1["default"].createElement("div", { className: "relative z-10 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 overflow-hidden ring-1 ring-white/10 group" },
                    react_1["default"].createElement("div", { className: "flex border-b border-white/10 bg-white/5 px-4 py-3 items-center gap-3 relative z-20" },
                        react_1["default"].createElement("div", { className: "flex gap-1.5" },
                            react_1["default"].createElement("div", { className: "w-3 h-3 rounded-full bg-red-500/50" }),
                            react_1["default"].createElement("div", { className: "w-3 h-3 rounded-full bg-yellow-500/50" }),
                            react_1["default"].createElement("div", { className: "w-3 h-3 rounded-full bg-green-500/50" })),
                        react_1["default"].createElement("div", { className: "flex-1 flex justify-center gap-2" }, ['Upload', 'Process', 'Export'].map(function (label, i) { return (react_1["default"].createElement("div", { key: label, className: "flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 " + (step === i
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                : 'bg-transparent border-transparent text-gray-600') },
                            react_1["default"].createElement("div", { className: "w-1.5 h-1.5 rounded-full " + (step === i ? 'bg-blue-500 animate-pulse' : 'bg-gray-700') }),
                            react_1["default"].createElement("span", { className: "text-[10px] font-mono uppercase tracking-wider" }, label))); })),
                        react_1["default"].createElement("div", { className: "w-16" }),
                        " "),
                    react_1["default"].createElement("div", { className: "relative aspect-[16/9] bg-zinc-900/50 flex items-center justify-center overflow-hidden" },
                        react_1["default"].createElement(framer_motion_1.AnimatePresence, { mode: "wait" },
                            step === 0 && (react_1["default"].createElement(framer_motion_1.motion.div, { key: "step-upload", initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "flex flex-col items-center justify-center w-full h-full relative" },
                                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.5 }, className: "w-64 h-80 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center bg-white/5" },
                                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.8, type: "spring" } },
                                        react_1["default"].createElement(lucide_react_1.FileText, { className: "w-16 h-16 text-blue-400 mb-4" })),
                                    react_1["default"].createElement("div", { className: "space-y-2 text-center" },
                                        react_1["default"].createElement("div", { className: "w-32 h-2 bg-white/10 rounded-full overflow-hidden mx-auto" },
                                            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { width: "0%" }, animate: { width: "100%" }, transition: { duration: 2, ease: "easeInOut" }, className: "h-full bg-blue-500" })),
                                        react_1["default"].createElement("p", { className: "text-xs text-gray-400 font-mono" }, "Uploading..."))),
                                __spreadArrays(Array(5)).map(function (_, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: i, className: "absolute w-1 h-1 bg-blue-400 rounded-full", initial: {
                                        x: (Math.random() - 0.5) * 300,
                                        y: 100,
                                        opacity: 0
                                    }, animate: {
                                        y: -200,
                                        opacity: [0, 1, 0]
                                    }, transition: {
                                        duration: 2 + Math.random(),
                                        repeat: Infinity,
                                        delay: Math.random() * 2
                                    } })); }))),
                            step === 1 && (react_1["default"].createElement(framer_motion_1.motion.div, { key: "step-process", className: "relative w-64 h-80 bg-white rounded-xl shadow-2xl overflow-hidden", initial: { scale: 0.9, opacity: 0, rotateX: 20 }, animate: { scale: 1, opacity: 1, rotateX: 0 }, exit: { scale: 0.9, opacity: 0 } },
                                react_1["default"].createElement("div", { className: "p-6 space-y-4 opacity-50 blur-[0.5px]" },
                                    react_1["default"].createElement("div", { className: "w-16 h-4 bg-gray-200 rounded" }),
                                    react_1["default"].createElement("div", { className: "space-y-2" },
                                        react_1["default"].createElement("div", { className: "w-full h-2 bg-gray-100 rounded" }),
                                        react_1["default"].createElement("div", { className: "w-full h-2 bg-gray-100 rounded" }),
                                        react_1["default"].createElement("div", { className: "w-2/3 h-2 bg-gray-100 rounded" })),
                                    react_1["default"].createElement("div", { className: "flex justify-between pt-8" },
                                        react_1["default"].createElement("div", { className: "w-20 h-2 bg-gray-100 rounded" }),
                                        react_1["default"].createElement("div", { className: "w-10 h-2 bg-gray-200 rounded" })),
                                    react_1["default"].createElement("div", { className: "space-y-2 pt-4" },
                                        react_1["default"].createElement("div", { className: "w-full h-2 bg-gray-100 rounded" }),
                                        react_1["default"].createElement("div", { className: "w-full h-2 bg-gray-100 rounded" }))),
                                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { top: "-10%" }, animate: { top: "120%" }, transition: { duration: 2, ease: "linear", repeat: Infinity }, className: "absolute left-0 w-full h-20 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 border-b border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10" }),
                                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, className: "absolute top-[20%] left-6 right-6 h-8 border-2 border-green-500/50 bg-green-500/10 rounded flex items-center justify-center" },
                                    react_1["default"].createElement("span", { className: "text-[10px] text-green-700 font-bold bg-white/80 px-1 rounded" }, "INVOICE #9923")),
                                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { delay: 1 }, className: "absolute bottom-20 right-6 w-24 h-8 border-2 border-green-500/50 bg-green-500/10 rounded flex items-center justify-center" },
                                    react_1["default"].createElement("span", { className: "text-[10px] text-green-700 font-bold bg-white/80 px-1 rounded" }, "$2,450.00")))),
                            step === 2 && (react_1["default"].createElement(framer_motion_1.motion.div, { key: "step-export", initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "w-full h-full p-6 relative flex items-center justify-center" },
                                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: -140, y: -80, opacity: 0, scale: 0.9 }, animate: { x: -140, y: -80, opacity: 1, scale: 1 }, transition: { delay: 0.2 }, className: "absolute bg-zinc-900 border border-blue-500/30 p-4 rounded-xl shadow-2xl w-48 z-10" },
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-400 font-mono mb-2 flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.FileJson, { className: "w-4 h-4 text-blue-400" }),
                                        react_1["default"].createElement("span", { className: "text-blue-100" }, "data.json")),
                                    react_1["default"].createElement("div", { className: "text-[10px] font-mono text-blue-300 bg-zinc-950/50 p-2 rounded border border-blue-500/10" },
                                        react_1["default"].createElement("div", { className: "flex gap-1" },
                                            react_1["default"].createElement("span", { className: "text-blue-500" }, "\"id\""),
                                            ": ",
                                            react_1["default"].createElement("span", { className: "text-orange-300" }, "\"INV-001\""),
                                            ","),
                                        react_1["default"].createElement("div", { className: "flex gap-1" },
                                            react_1["default"].createElement("span", { className: "text-blue-500" }, "\"total\""),
                                            ": ",
                                            react_1["default"].createElement("span", { className: "text-orange-300" }, "1250.00"),
                                            ","),
                                        react_1["default"].createElement("div", { className: "flex gap-1" },
                                            react_1["default"].createElement("span", { className: "text-blue-500" }, "\"status\""),
                                            ": ",
                                            react_1["default"].createElement("span", { className: "text-green-400" }, "\"paid\"")))),
                                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: 80, y: -40, opacity: 0, scale: 0.9 }, animate: { x: 80, y: -40, opacity: 1, scale: 1 }, transition: { delay: 0.4 }, className: "absolute bg-zinc-900 border border-emerald-500/30 p-4 rounded-xl shadow-2xl w-56 z-20" },
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-400 font-mono mb-2 flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.FileSpreadsheet, { className: "w-4 h-4 text-emerald-400" }),
                                        react_1["default"].createElement("span", { className: "text-emerald-100" }, "export.xlsx")),
                                    react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded overflow-hidden text-[10px] font-mono" },
                                        react_1["default"].createElement("div", { className: "bg-zinc-800/80 p-1.5 text-center text-gray-400" }, "ID"),
                                        react_1["default"].createElement("div", { className: "bg-zinc-800/80 p-1.5 text-center text-gray-400" }, "Date"),
                                        react_1["default"].createElement("div", { className: "bg-zinc-800/80 p-1.5 text-right text-gray-400" }, "Total"),
                                        react_1["default"].createElement("div", { className: "bg-zinc-950 p-1.5 text-gray-300" }, "001"),
                                        react_1["default"].createElement("div", { className: "bg-zinc-950 p-1.5 text-gray-500" }, "Oct 24"),
                                        react_1["default"].createElement("div", { className: "bg-zinc-950 p-1.5 text-right text-emerald-400" }, "$1,250"),
                                        react_1["default"].createElement("div", { className: "bg-zinc-950 p-1.5 text-gray-300" }, "002"),
                                        react_1["default"].createElement("div", { className: "bg-zinc-950 p-1.5 text-gray-500" }, "Oct 25"),
                                        react_1["default"].createElement("div", { className: "bg-zinc-950 p-1.5 text-right text-emerald-400" }, "$850"))),
                                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: 160, y: 70, opacity: 0, scale: 0.9 }, animate: { x: 160, y: 70, opacity: 1, scale: 1 }, transition: { delay: 0.6 }, className: "absolute bg-zinc-900 border border-purple-500/30 p-4 rounded-xl shadow-2xl w-44 z-10" },
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-400 font-mono mb-2 flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.FileCode, { className: "w-4 h-4 text-purple-400" }),
                                        react_1["default"].createElement("span", { className: "text-purple-100" }, "data.xml")),
                                    react_1["default"].createElement("div", { className: "text-[10px] font-mono text-purple-300 bg-zinc-950/50 p-2 rounded border border-purple-500/10" },
                                        "<invoice>",
                                        react_1["default"].createElement("br", null),
                                        "\u00A0\u00A0<id>001</id>",
                                        react_1["default"].createElement("br", null),
                                        "\u00A0\u00A0<total>1250</total>",
                                        react_1["default"].createElement("br", null),
                                        "</invoice>")),
                                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: -100, y: 80, opacity: 0, scale: 0.9 }, animate: { x: -100, y: 80, opacity: 1, scale: 1 }, transition: { delay: 0.8 }, className: "absolute bg-zinc-900 border border-indigo-500/30 p-4 rounded-xl shadow-2xl w-48 z-10" },
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-400 font-mono mb-2 flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4 text-indigo-400" }),
                                        react_1["default"].createElement("span", { className: "text-indigo-100" }, "data.csv")),
                                    react_1["default"].createElement("div", { className: "text-[10px] font-mono text-indigo-300 bg-zinc-950/50 p-2 rounded border border-indigo-500/10 whitespace-pre" },
                                        "id,date,total,status",
                                        react_1["default"].createElement("br", null),
                                        "001,2024-10-24,1250,paid",
                                        react_1["default"].createElement("br", null),
                                        "002,2024-10-25,850,paid")))))),
                    react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" }))))));
}
function TrustSignals() {
    var _a, _b, _c;
    var t = react_i18next_1.useTranslation().t;
    var trust = t('landing.trust', { returnObjects: true });
    var iconMap = {
        shield: lucide_react_1.Shield,
        lock: lucide_react_1.Lock,
        server: lucide_react_1.Server
    };
    return (react_1["default"].createElement("section", { className: "py-10 border-y border-white/5 bg-black/50 backdrop-blur-sm relative z-20" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6" },
            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 0 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "flex flex-col md:flex-row items-center justify-between gap-8 ssr-fade-in" },
                react_1["default"].createElement("div", { className: "flex flex-wrap justify-center gap-4 md:gap-8" }, trust.badges && Array.isArray(trust.badges) ? (trust.badges.map(function (badge, i) {
                    var Icon = iconMap[badge.icon] || lucide_react_1.Shield;
                    var colors = ['text-green-400', 'text-blue-400', 'text-purple-400'];
                    return (react_1["default"].createElement("div", { key: i, className: "flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5" },
                        react_1["default"].createElement(Icon, { className: "w-4 h-4 " + (colors[i] || 'text-gray-400') }),
                        react_1["default"].createElement("span", { className: "text-sm font-medium" }, badge.title)));
                })) : (
                /* Fallback for old structure */
                react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5" },
                        react_1["default"].createElement(lucide_react_1.Shield, { className: "w-4 h-4 text-green-400" }),
                        react_1["default"].createElement("span", { className: "text-sm font-medium" }, ((_a = trust.badges) === null || _a === void 0 ? void 0 : _a.gdpr) || 'GDPR Compliant')),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5" },
                        react_1["default"].createElement(lucide_react_1.Lock, { className: "w-4 h-4 text-blue-400" }),
                        react_1["default"].createElement("span", { className: "text-sm font-medium" }, ((_b = trust.badges) === null || _b === void 0 ? void 0 : _b.encrypted) || 'Encrypted Data')),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5" },
                        react_1["default"].createElement(lucide_react_1.Server, { className: "w-4 h-4 text-purple-400" }),
                        react_1["default"].createElement("span", { className: "text-sm font-medium" }, ((_c = trust.badges) === null || _c === void 0 ? void 0 : _c.no_training) || 'Privacy Protected'))))),
                react_1["default"].createElement("div", { className: "flex items-center gap-4 text-gray-500 font-mono text-sm" },
                    react_1["default"].createElement("span", { className: "hidden lg:block opacity-50" },
                        (trust.exports || 'Export:').split(':')[0],
                        ":"),
                    react_1["default"].createElement("div", { className: "flex flex-wrap gap-3 md:gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500" },
                        react_1["default"].createElement("span", { className: "font-bold flex items-center gap-2", title: "Excel / CSV" },
                            react_1["default"].createElement(lucide_react_1.FileSpreadsheet, { className: "w-4 h-4" }),
                            " XLS/CSV"),
                        react_1["default"].createElement("span", { className: "font-bold flex items-center gap-2", title: "Google Sheets" },
                            react_1["default"].createElement(lucide_react_1.FileSpreadsheet, { className: "w-4 h-4 text-emerald-400" }),
                            " Sheets"),
                        react_1["default"].createElement("span", { className: "font-bold flex items-center gap-2", title: "JSON" },
                            react_1["default"].createElement(lucide_react_1.FileJson, { className: "w-4 h-4" }),
                            " JSON"),
                        react_1["default"].createElement("span", { className: "font-bold flex items-center gap-2", title: "XML" },
                            react_1["default"].createElement(lucide_react_1.FileCode, { className: "w-4 h-4" }),
                            " XML")))))));
}
function UseCases() {
    var t = react_i18next_1.useTranslation().t;
    var content = t('landing.useCases', { returnObjects: true });
    var icons = [lucide_react_1.FileText, lucide_react_1.Receipt, lucide_react_1.IdCard, lucide_react_1.Sparkles];
    return (react_1["default"].createElement("section", { className: "py-24 bg-zinc-950 relative overflow-hidden" },
        react_1["default"].createElement("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" }),
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 relative z-10" },
            react_1["default"].createElement("div", { className: "text-center mb-16" },
                react_1["default"].createElement("h2", { className: "text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70" }, content.title),
                react_1["default"].createElement("p", { className: "text-xl text-gray-400 max-w-2xl mx-auto" }, content.subtitle)),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" }, content.items.map(function (item, i) {
                var Icon = icons[i] || lucide_react_1.FileText;
                return (react_1["default"].createElement(framer_motion_1.motion.div, { key: i, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.1 }, className: "bg-zinc-900/50 border border-white/10 p-6 rounded-2xl hover:bg-white/5 transition duration-300 group hover:border-blue-500/30 flex flex-col ssr-fade-in" },
                    react_1["default"].createElement("div", { className: "w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors" },
                        react_1["default"].createElement(Icon, { className: "w-6 h-6 text-blue-400" })),
                    react_1["default"].createElement("h3", { className: "text-lg font-bold mb-3" }, item.title),
                    item.problem && (react_1["default"].createElement("div", { className: "mb-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm text-red-200/80" }, item.problem))),
                    item.solution && (react_1["default"].createElement("p", { className: "text-sm text-gray-400 leading-relaxed mb-3" }, item.solution)),
                    item.benefit && (react_1["default"].createElement("div", { className: "mt-auto p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm font-medium text-emerald-200/90" },
                            "\u2713 ",
                            item.benefit))),
                    !item.problem && !item.solution && item.desc && (react_1["default"].createElement("p", { className: "text-gray-400 leading-relaxed" }, item.desc))));
            })))));
}
function ProductFlow(_a) {
    var locale = _a.locale;
    var t = react_i18next_1.useTranslation().t;
    var getProductFlowText = function () {
        return {
            badge: t('landing.howItWorks.title'),
            title: t('landing.howItWorks.subtitle'),
            steps: [
                { step: "01", title: t('landing.howItWorks.steps.0.title'), description: t('landing.howItWorks.steps.0.desc') },
                { step: "02", title: t('landing.howItWorks.steps.2.title'), description: t('landing.howItWorks.steps.2.desc') },
                { step: "03", title: t('landing.howItWorks.steps.3.title'), description: t('landing.howItWorks.steps.3.desc') },
            ]
        };
    };
    var flowText = getProductFlowText();
    var iconMap = [lucide_react_1.Upload, lucide_react_1.Eye, lucide_react_1.Database];
    return (react_1["default"].createElement("section", { className: "py-20 md:py-32 relative overflow-hidden" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6" },
            react_1["default"].createElement("div", { className: "text-center mb-20" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-blue-500/10 text-blue-300 border-blue-500/20" }, flowText.badge),
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-bold" }, flowText.title)),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8" }, flowText.steps.map(function (item, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: item.step, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.1 }, className: "relative ssr-fade-in" },
                react_1["default"].createElement("div", { className: "bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300" },
                    react_1["default"].createElement("div", { className: "text-5xl font-bold text-white/10 mb-4" }, item.step),
                    react_1["default"].createElement("div", { className: "w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6" }, react_1["default"].createElement(iconMap[i], { className: "w-6 h-6 text-blue-400" })),
                    react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-3" }, item.title),
                    react_1["default"].createElement("p", { className: "text-gray-400 leading-relaxed" }, item.description)))); })))));
}
function GoogleIntegrations(_a) {
    var locale = _a.locale;
    var t = react_i18next_1.useTranslation().t;
    return (react_1["default"].createElement("section", { className: "py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-blue-950/10 to-zinc-950" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" }),
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" }),
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 relative z-10" },
            react_1["default"].createElement("div", { className: "text-center mb-16" },
                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm" },
                    react_1["default"].createElement(lucide_react_1.Cloud, { className: "w-4 h-4 text-blue-400" }),
                    react_1["default"].createElement("span", { className: "text-sm font-medium text-blue-300" }, locale.startsWith('pt') ? 'Integrações Poderosas' : 'Powerful Integrations')),
                react_1["default"].createElement(framer_motion_1.motion.h2, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.1 }, className: "text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70" }, locale.startsWith('pt')
                    ? 'Integração Nativa com Google'
                    : 'Native Google Integration'),
                react_1["default"].createElement(framer_motion_1.motion.p, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.2 }, className: "text-xl text-gray-400 max-w-3xl mx-auto" }, locale.startsWith('pt')
                    ? 'Conecte-se diretamente ao Google Drive e exporte para Google Sheets com apenas alguns cliques. Automatize seu fluxo de trabalho sem esforço.'
                    : 'Connect directly to Google Drive and export to Google Sheets with just a few clicks. Automate your workflow effortlessly.')),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto" },
                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { delay: 0.3 }, className: "group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10" },
                    react_1["default"].createElement("div", { className: "absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all duration-500" }),
                    react_1["default"].createElement("div", { className: "relative z-10" },
                        react_1["default"].createElement("div", { className: "mb-6 inline-flex rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 text-blue-400 ring-1 ring-inset ring-blue-500/30 group-hover:scale-110 transition-transform duration-300" },
                            react_1["default"].createElement(lucide_react_1.Cloud, { className: "w-8 h-8" })),
                        react_1["default"].createElement("h3", { className: "text-2xl font-bold mb-4 text-white group-hover:text-blue-100 transition-colors" }, "Google Drive"),
                        react_1["default"].createElement("p", { className: "text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors" }, locale.startsWith('pt')
                            ? 'Importe documentos diretamente do seu Google Drive. Acesse e processe seus arquivos sem precisar fazer download manual.'
                            : 'Import documents directly from your Google Drive. Access and process your files without manual downloads.'),
                        react_1["default"].createElement("ul", { className: "space-y-3" },
                            react_1["default"].createElement("li", { className: "flex items-start gap-3 text-sm text-gray-300" },
                                react_1["default"].createElement(lucide_react_1.Check, { className: "w-5 h-5 text-green-400 shrink-0 mt-0.5" }),
                                react_1["default"].createElement("span", null, locale.startsWith('pt')
                                    ? 'Acesso direto aos seus arquivos'
                                    : 'Direct access to your files')),
                            react_1["default"].createElement("li", { className: "flex items-start gap-3 text-sm text-gray-300" },
                                react_1["default"].createElement(lucide_react_1.Check, { className: "w-5 h-5 text-green-400 shrink-0 mt-0.5" }),
                                react_1["default"].createElement("span", null, locale.startsWith('pt')
                                    ? 'Processamento em lote de múltiplos documentos'
                                    : 'Batch processing of multiple documents')),
                            react_1["default"].createElement("li", { className: "flex items-start gap-3 text-sm text-gray-300" },
                                react_1["default"].createElement(lucide_react_1.Check, { className: "w-5 h-5 text-green-400 shrink-0 mt-0.5" }),
                                react_1["default"].createElement("span", null, locale.startsWith('pt')
                                    ? 'Sincronização automática'
                                    : 'Automatic synchronization'))))),
                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: 20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { delay: 0.4 }, className: "group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10" },
                    react_1["default"].createElement("div", { className: "absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-500" }),
                    react_1["default"].createElement("div", { className: "relative z-10" },
                        react_1["default"].createElement("div", { className: "mb-6 inline-flex rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-4 text-emerald-400 ring-1 ring-inset ring-emerald-500/30 group-hover:scale-110 transition-transform duration-300" },
                            react_1["default"].createElement(lucide_react_1.FileSpreadsheet, { className: "w-8 h-8" })),
                        react_1["default"].createElement("h3", { className: "text-2xl font-bold mb-4 text-white group-hover:text-emerald-100 transition-colors" }, "Google Sheets"),
                        react_1["default"].createElement("p", { className: "text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors" }, locale.startsWith('pt')
                            ? 'Exporte dados extraídos diretamente para Google Sheets. Organize e analise suas informações em tempo real.'
                            : 'Export extracted data directly to Google Sheets. Organize and analyze your information in real-time.'),
                        react_1["default"].createElement("ul", { className: "space-y-3" },
                            react_1["default"].createElement("li", { className: "flex items-start gap-3 text-sm text-gray-300" },
                                react_1["default"].createElement(lucide_react_1.Check, { className: "w-5 h-5 text-green-400 shrink-0 mt-0.5" }),
                                react_1["default"].createElement("span", null, locale.startsWith('pt')
                                    ? 'Exportação com um clique'
                                    : 'One-click export')),
                            react_1["default"].createElement("li", { className: "flex items-start gap-3 text-sm text-gray-300" },
                                react_1["default"].createElement(lucide_react_1.Check, { className: "w-5 h-5 text-green-400 shrink-0 mt-0.5" }),
                                react_1["default"].createElement("span", null, locale.startsWith('pt')
                                    ? 'Formatação automática de dados'
                                    : 'Automatic data formatting')),
                            react_1["default"].createElement("li", { className: "flex items-start gap-3 text-sm text-gray-300" },
                                react_1["default"].createElement(lucide_react_1.Check, { className: "w-5 h-5 text-green-400 shrink-0 mt-0.5" }),
                                react_1["default"].createElement("span", null, locale.startsWith('pt')
                                    ? 'Colaboração em equipe facilitada'
                                    : 'Easy team collaboration')))))),
            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.5 }, className: "mt-16 text-center" },
                react_1["default"].createElement("div", { className: "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm" },
                    react_1["default"].createElement(lucide_react_1.Link, { className: "w-4 h-4 text-blue-400" }),
                    react_1["default"].createElement("span", { className: "text-sm text-gray-300" }, locale.startsWith('pt')
                        ? 'Conecte sua conta Google em segundos'
                        : 'Connect your Google account in seconds'),
                    react_1["default"].createElement(lucide_react_1.Sparkles, { className: "w-4 h-4 text-yellow-400" }))))));
}
function Features(_a) {
    var locale = _a.locale;
    var t = react_i18next_1.useTranslation().t;
    var getFeaturesText = function () {
        return {
            title: t('landing.features.title'),
            subtitle: t('landing.features.subtitle'),
            items: [
                { icon: lucide_react_1.Upload, title: t('landing.features.sections.0.title'), desc: t('landing.features.sections.0.items.0'), className: "md:col-span-2" },
                { icon: lucide_react_1.Settings, title: t('landing.features.sections.1.title'), desc: t('landing.features.sections.1.items.0'), className: "" },
                { icon: lucide_react_1.Eye, title: t('landing.features.sections.3.title'), desc: t('landing.features.sections.3.items.0'), className: "" },
                { icon: lucide_react_1.Database, title: t('landing.features.sections.4.title'), desc: t('landing.features.sections.4.items.0'), className: "md:col-span-2" },
                { icon: lucide_react_1.Code, title: t('landing.features.sections.5.title'), desc: t('landing.features.sections.5.items.0'), className: "md:col-span-2" },
                { icon: lucide_react_1.Shield, title: t('landing.features.sections.6.title'), desc: t('landing.features.sections.6.items.0'), className: "" },
            ]
        };
    };
    var featuresText = getFeaturesText();
    return (react_1["default"].createElement("section", { id: "features", className: "py-24 md:py-32 relative bg-zinc-950/50" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" }),
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 relative" },
            react_1["default"].createElement("div", { className: "text-center mb-20 max-w-3xl mx-auto" },
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70" }, featuresText.title),
                react_1["default"].createElement("p", { className: "text-xl text-gray-400" }, featuresText.subtitle)),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" }, featuresText.items.map(function (feature, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: feature.title, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.05 }, whileHover: { y: -5 }, className: "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10 " + feature.className + " ssr-fade-in" },
                react_1["default"].createElement("div", { className: "absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all duration-500" }),
                react_1["default"].createElement("div", { className: "relative z-10" },
                    react_1["default"].createElement("div", { className: "mb-6 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400 ring-1 ring-inset ring-blue-500/20" },
                        react_1["default"].createElement(feature.icon, { className: "w-6 h-6" })),
                    react_1["default"].createElement("h3", { className: "text-xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors" }, feature.title),
                    react_1["default"].createElement("p", { className: "text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors" }, feature.desc)))); })))));
}
function CodeExample(_a) {
    var locale = _a.locale, onOpenDemo = _a.onOpenDemo;
    var t = react_i18next_1.useTranslation().t;
    var getCodeExampleText = function () {
        return {
            badge: t('landing.integration.title'),
            title: t('landing.integration.title'),
            subtitle: t('landing.integration.subtitle'),
            cta: t('landing.hero.cta_secondary'),
            tabs: { upload: t('landing.howItWorks.steps.0.title'), retrieve: t('landing.integration.cards.2.title').split(' ')[0] }
        };
    };
    var codeText = getCodeExampleText();
    var _b = react_1.useState('upload'), activeTab = _b[0], setActiveTab = _b[1];
    var codeExamples = {
        upload: "curl -X POST https://api.docset.app/v1/documents \\\n  -H \"Authorization: Bearer YOUR_API_KEY\" \\\n  -F \"file=@invoice.pdf\" \\\n  -F \"template=invoice_template\"\n  \n// Response\n{\n  \"id\": \"doc_abc123\",\n  \"status\": \"processing\",\n  \"template\": \"invoice_template\"\n}",
        retrieve: "curl https://api.docset.app/v1/documents/doc_abc123 \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"\n  \n// Response\n{\n  \"id\": \"doc_abc123\",\n  \"status\": \"completed\",\n  \"data\": {\n    \"invoice_number\": \"#INV-2024-001\",\n    \"amount\": 12450.00,\n    \"date\": \"2024-01-05\"\n  }\n}"
    };
    return (react_1["default"].createElement("section", { id: "api", className: "py-20 md:py-32 relative overflow-hidden" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" }),
        react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-6 relative" },
            react_1["default"].createElement("div", { className: "text-center mb-16" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-blue-500/10 text-blue-300 border-blue-500/20" },
                    react_1["default"].createElement(lucide_react_1.Code, { className: "w-3 h-3 mr-1" }),
                    codeText.badge),
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-bold mb-6" }, codeText.title),
                react_1["default"].createElement("p", { className: "text-xl text-gray-400 max-w-2xl mx-auto" }, codeText.subtitle)),
            react_1["default"].createElement("div", { className: "bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl" },
                react_1["default"].createElement("div", { className: "border-b border-white/10 p-4 flex gap-4" },
                    react_1["default"].createElement("button", { onClick: function () { return setActiveTab('upload'); }, className: "px-4 py-2 rounded-lg text-sm font-medium transition " + (activeTab === 'upload'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-400 hover:text-white') }, codeText.tabs.upload),
                    react_1["default"].createElement("button", { onClick: function () { return setActiveTab('retrieve'); }, className: "px-4 py-2 rounded-lg text-sm font-medium transition " + (activeTab === 'retrieve'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-400 hover:text-white') }, codeText.tabs.retrieve)),
                react_1["default"].createElement("div", { className: "p-6" },
                    react_1["default"].createElement("pre", { className: "text-sm font-mono text-gray-300 overflow-x-auto" },
                        react_1["default"].createElement("code", null, codeExamples[activeTab])))),
            react_1["default"].createElement("div", { className: "mt-12 text-center" },
                react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } },
                    react_1["default"].createElement(button_1.Button, { variant: "outline", size: "lg", onClick: onOpenDemo, className: "border-white/20 text-white hover:bg-white/10" },
                        react_1["default"].createElement(lucide_react_1.Play, { className: "mr-2 h-4 w-4" }),
                        codeText.cta))))));
}
function Pricing(_a) {
    var locale = _a.locale, isAuthenticated = _a.isAuthenticated, localeShort = _a.localeShort, plans = _a.plans;
    var t = react_i18next_1.useTranslation().t;
    // Use server-provided plans directly
    var plansData = plans || [];
    return (react_1["default"].createElement("section", { className: "py-24 bg-zinc-950 relative overflow-hidden", id: "pricing" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" }),
        react_1["default"].createElement("div", { className: "container mx-auto px-4 relative z-10" },
            react_1["default"].createElement("div", { className: "text-center max-w-2xl mx-auto mb-16" },
                react_1["default"].createElement(framer_motion_1.motion.h2, { viewport: { once: true }, initial: { opacity: 0, y: 0 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "text-3xl md:text-4xl font-bold text-white mb-6 ssr-fade-in" }, t('landing.pricing.title')),
                react_1["default"].createElement(framer_motion_1.motion.p, { initial: { opacity: 0, y: 0 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.2 }, className: "text-lg text-zinc-400 ssr-fade-in" }, t('landing.pricing.subtitle'))),
            react_1["default"].createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto" }, plansData.length === 0 ? (
            // Fallback skeleton if no plans - though SSR should provide them
            Array.from({ length: 4 }).map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "bg-white/5 h-[500px] rounded-2xl animate-pulse" })); })) : (plansData.map(function (plan, index) {
                var recommended = plan.recommended || plan.is_popular;
                return (react_1["default"].createElement(framer_motion_1.motion.div, { key: plan.id, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: index * 0.1 }, className: "relative p-8 rounded-2xl border " + (recommended
                        ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20') + " backdrop-blur-sm transition-all duration-300 group hover:-translate-y-1 flex flex-col ssr-fade-in" },
                    react_1["default"].createElement("div", { className: "mb-8" },
                        react_1["default"].createElement("h3", { className: "text-lg font-semibold text-white mb-2" }, plan.display_name || plan.name),
                        react_1["default"].createElement("p", { className: "text-zinc-400 text-sm h-10" }, plan.tagline || plan.description)),
                    react_1["default"].createElement("div", { className: "mb-8" },
                        react_1["default"].createElement("div", { className: "flex items-baseline gap-1" },
                            react_1["default"].createElement("span", { className: "text-4xl font-bold text-white" }, plan.price === null || plan.price === 0 || parseFloat(String(plan.price)) === 0
                                ? new Intl.NumberFormat(locale, { style: 'currency', currency: plan.currency || 'EUR' }).format(0)
                                : new Intl.NumberFormat(locale, { style: 'currency', currency: plan.currency }).format(plan.price)),
                            (plan.price !== null || plan.interval) && (react_1["default"].createElement("span", { className: "text-zinc-500" },
                                "/",
                                t(plan.interval || 'month'))))),
                    react_1["default"].createElement("div", { className: "space-y-4 mb-8 flex-1" }, plan.features && plan.features.map(function (feature, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-start gap-3 text-sm text-zinc-300" },
                        react_1["default"].createElement(lucide_react_1.Check, { className: "w-4 h-4 text-blue-400 shrink-0 mt-0.5" }),
                        react_1["default"].createElement("span", null, feature))); })),
                    react_1["default"].createElement(button_1.Button, { className: "w-full " + (recommended
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white text-zinc-900 hover:bg-zinc-100'), onClick: function () {
                            if (isAuthenticated) {
                                react_2.router.visit("/" + localeShort + "/settings/billing");
                            }
                            else if (plan.price_id) {
                                // Paid plan with price_id - go to register with plan param
                                react_2.router.visit("/" + localeShort + "/register?plan=" + plan.price_id + "&plan_name=" + encodeURIComponent(plan.display_name || plan.name));
                            }
                            else {
                                // Free plan or fallback - standard registration
                                react_2.router.visit("/" + localeShort + "/register");
                            }
                        } }, (function () {
                        if (parseFloat(String(plan.price).replace(/[^0-9.]/g, '') || '0') === 0)
                            return t('Start free');
                        return t('Get Started');
                    })())));
            }))),
            react_1["default"].createElement("div", { className: "mt-12 text-center" },
                react_1["default"].createElement("p", { className: "text-zinc-500 text-sm" }, t('landing.pricing.disclaimer'))))));
}
function FinalCTA(_a) {
    var locale = _a.locale;
    var t = react_i18next_1.useTranslation().t;
    var getFinalCTAText = function () {
        return {
            title: t('landing.cta.title'),
            subtitle: t('landing.cta.subtitle'),
            cta: t('landing.cta.primary')
        };
    };
    var ctaText = getFinalCTAText();
    return (react_1["default"].createElement("section", { className: "py-20 md:py-32 relative overflow-hidden" },
        react_1["default"].createElement("div", { className: "absolute inset-0" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-blue-950/20 via-blue-900/20 to-transparent" }),
            react_1["default"].createElement("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl" })),
        react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-6 text-center relative z-10" },
            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } },
                react_1["default"].createElement("h2", { className: "text-5xl md:text-6xl font-bold mb-6" }, ctaText.title),
                react_1["default"].createElement("p", { className: "text-xl text-gray-400 mb-10" }, ctaText.subtitle),
                react_1["default"].createElement(button_1.Button, { size: "lg", onClick: function () { return react_2.router.visit("/" + locale.split('-')[0] + "/register"); }, className: "bg-white text-black hover:bg-gray-200 px-8 h-14 text-lg font-semibold shadow-lg shadow-white/20" },
                    ctaText.cta,
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" }))))));
}
function Footer(_a) {
    var locale = _a.locale;
    var t = react_i18next_1.useTranslation().t;
    var handleOpenCookieSettings = function (e) {
        e.preventDefault();
        window.dispatchEvent(new Event('openCookieSettings'));
    };
    return (react_1["default"].createElement("footer", { className: "bg-zinc-950 border-t border-white/10 py-12 px-6" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8 mb-12" },
                react_1["default"].createElement("div", { className: "col-span-1 md:col-span-1" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                        react_1["default"].createElement("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center" },
                            react_1["default"].createElement("img", { src: "/docset.png", alt: "Docset", className: "w-6 h-6" })),
                        react_1["default"].createElement("span", { className: "font-bold text-xl" }, "DOCSET")),
                    react_1["default"].createElement("p", { className: "text-gray-400 text-sm mb-6" }, "Automated document processing powered by Advanced AI Vision."),
                    react_1["default"].createElement("div", { className: "flex gap-4" })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "font-semibold mb-4" }, "Product"),
                    react_1["default"].createElement("ul", { className: "space-y-2 text-sm text-gray-400" },
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "#features", className: "hover:text-white transition" }, "Features")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "#pricing", className: "hover:text-white transition" }, "Pricing")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "#api", className: "hover:text-white transition" }, "API")))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "font-semibold mb-4" }, "Legal"),
                    react_1["default"].createElement("ul", { className: "space-y-2 text-sm text-gray-400" },
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "/" + locale + "/privacy", className: "hover:text-white transition" }, t('Privacy Policy'))),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "/" + locale + "/terms", className: "hover:text-white transition" }, t('Terms of Service'))),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("button", { onClick: handleOpenCookieSettings, className: "hover:text-white transition text-left" }))))),
            react_1["default"].createElement("div", { className: "border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" },
                react_1["default"].createElement("p", { className: "text-sm text-gray-500" },
                    "\u00A9 ",
                    new Date().getFullYear(),
                    " Docset. All rights reserved."),
                react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm text-gray-500" },
                    react_1["default"].createElement("div", { className: "w-2 h-2 rounded-full bg-green-500" }),
                    react_1["default"].createElement("span", null, "All systems operational"))))));
}
function DemoModal(_a) {
    var _this = this;
    var onClose = _a.onClose, locale = _a.locale, onDemoComplete = _a.onDemoComplete;
    var t = react_i18next_1.useTranslation().t;
    var _b = react_1.useState(null), file = _b[0], setFile = _b[1];
    var _c = react_1.useState(false), processing = _c[0], setProcessing = _c[1];
    var _d = react_1.useState(null), result = _d[0], setResult = _d[1];
    var _e = react_1.useState(null), error = _e[0], setError = _e[1];
    var MAX_FILE_SIZE = 5 * 1024 * 1024;
    var handleFileChange = function (e) {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            var selectedFile = e.target.files[0];
            if (selectedFile.size > MAX_FILE_SIZE) {
                setError(t('File too large', { size: 5 }));
                setFile(null);
                e.target.value = '';
                return;
            }
            setFile(selectedFile);
        }
    };
    var handleProcess = function () { return __awaiter(_this, void 0, void 0, function () {
        var formData, response, data, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!file)
                        return [2 /*return*/];
                    if (file.size > MAX_FILE_SIZE) {
                        setError(t('File too large', { size: 5 }));
                        return [2 /*return*/];
                    }
                    setProcessing(true);
                    setError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    formData = new FormData();
                    formData.append('file', file);
                    return [4 /*yield*/, fetch('/api/demo/extract', {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'X-CSRF-TOKEN': ((_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || ''
                            }
                        })];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    if (!response.ok) {
                        if (response.status === 429) {
                            sonner_1.toast.error(t('Demo already used. Please register to continue.'));
                            setTimeout(function () {
                                onClose();
                                react_2.router.visit("/" + locale + "/register");
                            }, 2500);
                            return [2 /*return*/];
                        }
                        throw new Error(data.message || t('document_processing_error')); // Fallback or key? "Extraction failed" isn't in JSON directly but "document_processing_error" is close/better
                    }
                    setResult(data.data);
                    sonner_1.toast.success(t('Data Extracted Successfully!'));
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _b.sent();
                    console.error('Demo extraction error:', error_1);
                    setError(error_1.message || t('document_processing_error'));
                    sonner_1.toast.error(error_1.message || t('document_processing_error'));
                    return [3 /*break*/, 6];
                case 5:
                    setProcessing(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(dialog_1.Dialog, { open: true, onOpenChange: onClose },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/10 text-white" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, { className: "text-2xl font-bold" }, t('Try DocSet Demo')),
                react_1["default"].createElement(dialog_1.DialogDescription, { className: "text-gray-400" }, t('Upload a document to see how DocSet extracts data automatically. This is a one-time free demo.'))),
            !result ? (react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-blue-500/50 transition-all" },
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-16 w-16 mx-auto text-gray-600 mb-4" }),
                    react_1["default"].createElement(input_1.Input, { type: "file", onChange: handleFileChange, accept: ".pdf,.jpg,.jpeg,.png", className: "hidden", id: "demo-file" }),
                    react_1["default"].createElement(label_1.Label, { htmlFor: "demo-file", className: "cursor-pointer text-blue-400 hover:text-blue-300 font-semibold text-lg" }, t('Click to upload')),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-400 mt-3" }, t('PDF, JPG, PNG (max 10MB)')),
                    file && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1, y: 10 }, animate: { opacity: 1, y: 0 } },
                        react_1["default"].createElement(badge_1.Badge, { className: "mt-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2 text-sm" },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4 mr-2" }),
                            file.name,
                            " (",
                            (file.size / 1024 / 1024).toFixed(2),
                            " MB)"))),
                    error && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1, y: 10 }, animate: { opacity: 1, y: 0 }, className: "mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm text-red-400 font-medium" }, error)))),
                react_1["default"].createElement(button_1.Button, { onClick: handleProcess, disabled: !file || processing || !!error, className: "w-full bg-blue-500 hover:bg-blue-600 text-white", size: "lg" }, processing ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Sparkles, { className: "mr-2 h-5 w-5 animate-spin" }),
                    t('Processing...'))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Sparkles, { className: "mr-2 h-5 w-5" }),
                    t('Extract Data')))))) : (react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 1, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-10 w-10 text-green-500" }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-xl font-bold text-green-400" }, t('Data Extracted Successfully!')),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-400" }, t('landing.howItWorks.steps.2.desc')),
                            " ")),
                    react_1["default"].createElement("div", { className: "space-y-3" }, Object.entries(result).map(function (_a) {
                        var key = _a[0], value = _a[1];
                        return (react_1["default"].createElement(framer_motion_1.motion.div, { key: key, initial: { opacity: 1, x: -10 }, animate: { opacity: 1, x: 0 }, className: "flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10" },
                            react_1["default"].createElement("span", { className: "font-medium capitalize text-gray-300" },
                                key.replace('_', ' '),
                                ":"),
                            react_1["default"].createElement("span", { className: "font-bold text-white" }, value)));
                    }))),
                react_1["default"].createElement("div", { className: "bg-blue-500/10 border border-blue-500/30 rounded-xl p-6" },
                    react_1["default"].createElement("p", { className: "font-medium mb-2 text-blue-300" }, t('🎉 Demo completed!')),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-400" }, t('Register now to unlock unlimited document processing with advanced features.'))),
                react_1["default"].createElement(button_1.Button, { onClick: onDemoComplete, className: "w-full bg-white text-black hover:bg-gray-200", size: "lg" },
                    t('Register to Continue'),
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2" })))))));
}
