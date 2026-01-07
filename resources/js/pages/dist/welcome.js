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
exports.__esModule = true;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var react_2 = require("@inertiajs/react");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var config_1 = require("@/i18n/config");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var heroFallback = {
    en: {
        title: "Turn documents into structured data",
        subtitle: "DOCSET extracts data from recurring PDFs and images. Define your schema, review every field, and export via UI or API.",
        cta_primary: "Start free",
        cta_demo: "Try demo"
    },
    'pt-BR': {
        title: "Transforme documentos em dados estruturados",
        subtitle: "DOCSET extrai dados de PDFs e imagens recorrentes. Defina seu esquema, revise cada campo e exporte via UI ou API.",
        cta_primary: "Começar grátis",
        cta_demo: "Ver demonstração"
    },
    'pt-PT': {
        title: "Transforme documentos em dados estruturados",
        subtitle: "DOCSET extrai dados de PDFs e imagens recorrentes. Defina o seu esquema, reveja cada campo e exporte via UI ou API.",
        cta_primary: "Começar grátis",
        cta_demo: "Ver demonstração"
    }
};
var featuresFallback = {
    en: {
        title: "Everything you need",
        items: [
            { icon: lucide_react_1.Upload, title: "Upload PDFs & Images", desc: "Drag and drop documents or use our API to submit files programmatically." },
            { icon: lucide_react_1.Settings, title: "Custom schemas", desc: "Define text, number, or date fields. Reuse templates across documents." },
            { icon: lucide_react_1.Eye, title: "Manual review", desc: "Review extracted data side-by-side with the original document before saving." },
            { icon: lucide_react_1.Database, title: "Structured history", desc: "Access your data through reports, exports, or our REST API." },
            { icon: lucide_react_1.Code, title: "Developer-first API", desc: "Simple REST API with JSON responses. Built for automation and integration." },
            { icon: lucide_react_1.Shield, title: "Privacy & security", desc: "Your data is encrypted. We never train models on your documents." },
        ]
    },
    'pt-BR': {
        title: "Tudo que você precisa",
        items: [
            { icon: lucide_react_1.Upload, title: "Upload de PDFs e Imagens", desc: "Arraste e solte documentos ou use nossa API para enviar arquivos programaticamente." },
            { icon: lucide_react_1.Settings, title: "Esquemas personalizados", desc: "Defina campos de texto, número ou data. Reutilize templates entre documentos." },
            { icon: lucide_react_1.Eye, title: "Revisão manual", desc: "Revise os dados extraídos lado a lado com o documento original antes de salvar." },
            { icon: lucide_react_1.Database, title: "Histórico estruturado", desc: "Acesse seus dados através de relatórios, exportações ou nossa API REST." },
            { icon: lucide_react_1.Code, title: "API para desenvolvedores", desc: "API REST simples com respostas JSON. Construída para automação e integração." },
            { icon: lucide_react_1.Shield, title: "Privacidade e segurança", desc: "Seus dados são criptografados. Nunca treinamos modelos com seus documentos." },
        ]
    },
    'pt-PT': {
        title: "Tudo o que precisa",
        items: [
            { icon: lucide_react_1.Upload, title: "Upload de PDFs e Imagens", desc: "Arraste e largue documentos ou use a nossa API para enviar ficheiros programaticamente." },
            { icon: lucide_react_1.Settings, title: "Esquemas personalizados", desc: "Defina campos de texto, número ou data. Reutilize modelos entre documentos." },
            { icon: lucide_react_1.Eye, title: "Revisão manual", desc: "Reveja os dados extraídos lado a lado com o documento original antes de guardar." },
            { icon: lucide_react_1.Database, title: "Histórico estruturado", desc: "Aceda aos seus dados através de relatórios, exportações ou a nossa API REST." },
            { icon: lucide_react_1.Code, title: "API para programadores", desc: "API REST simples com respostas JSON. Construída para automação e integração." },
            { icon: lucide_react_1.Shield, title: "Privacidade e segurança", desc: "Os seus dados são encriptados. Nunca treinamos modelos com os seus documentos." },
        ]
    }
};
var pricingFallback = {
    en: {
        title: "Simple pricing",
        subtitle: "All features on every plan",
        cta: "Get started"
    },
    'pt-BR': {
        title: "Preços simples",
        subtitle: "Todos os recursos em cada plano",
        cta: "Começar"
    },
    'pt-PT': {
        title: "Preços simples",
        subtitle: "Todos os recursos em cada plano",
        cta: "Começar"
    }
};
var planNamesMapping = {
    en: {
        'FREE': 'Free',
        'STARTER': 'Starter',
        'PRO': 'Pro',
        'BUSINESS': 'Business'
    },
    'pt-BR': {
        'FREE': 'Grátis',
        'STARTER': 'Starter',
        'PRO': 'Pro',
        'BUSINESS': 'Business'
    },
    'pt-PT': {
        'FREE': 'Grátis',
        'STARTER': 'Starter',
        'PRO': 'Pro',
        'BUSINESS': 'Business'
    }
};
var productFlowFallback = {
    en: {
        badge: "How it works",
        title: "Three simple steps",
        steps: [
            { step: "01", title: "Upload documents", description: "Send PDFs or images via UI or API. We process asynchronously." },
            { step: "02", title: "Review & approve", description: "Verify extracted data with side-by-side document preview." },
            { step: "03", title: "Export or integrate", description: "Download as CSV/JSON or use our REST API for automation." },
        ]
    },
    'pt-BR': {
        badge: "Como funciona",
        title: "Três passos simples",
        steps: [
            { step: "01", title: "Envie documentos", description: "Envie PDFs ou imagens via UI ou API. Processamos de forma assíncrona." },
            { step: "02", title: "Revise e aprove", description: "Verifique os dados extraídos com visualização lado a lado do documento." },
            { step: "03", title: "Exporte ou integre", description: "Baixe como CSV/JSON ou use nossa API REST para automação." },
        ]
    },
    'pt-PT': {
        badge: "Como funciona",
        title: "Três passos simples",
        steps: [
            { step: "01", title: "Envie documentos", description: "Envie PDFs ou imagens via UI ou API. Processamos de forma assíncrona." },
            { step: "02", title: "Reveja e aprove", description: "Verifique os dados extraídos com visualização lado a lado do documento." },
            { step: "03", title: "Exporte ou integre", description: "Descarregue como CSV/JSON ou use a nossa API REST para automação." },
        ]
    }
};
var codeExampleFallback = {
    en: {
        badge: "Developer API",
        title: "Built for data extraction",
        subtitle: "Use DOCSET via UI or integrate it using a simple REST API. JSON responses, webhooks, and more.",
        cta: "Try demo",
        tabs: { upload: "Upload", retrieve: "Retrieve" }
    },
    'pt-BR': {
        badge: "API para desenvolvedores",
        title: "Feito para desenvolvedores",
        subtitle: "Use DOCSET via UI ou integre usando uma API REST simples. Respostas JSON, webhooks e mais.",
        cta: "Ver demonstração",
        tabs: { upload: "Enviar", retrieve: "Recuperar" }
    },
    'pt-PT': {
        badge: "API para programadores",
        title: "Feito para programadores",
        subtitle: "Use DOCSET via UI ou integre usando uma API REST simples. Respostas JSON, webhooks e mais.",
        cta: "Ver demonstração",
        tabs: { upload: "Enviar", retrieve: "Recuperar" }
    }
};
var finalCTAFallback = {
    en: {
        title: "Start using DOCSET today",
        subtitle: "No credit card required. Start extracting structured data in minutes.",
        cta: "Get started for free"
    },
    'pt-BR': {
        title: "Comece a usar DOCSET hoje",
        subtitle: "Sem cartão de crédito. Comece a extrair dados estruturados em minutos.",
        cta: "Começar grátis"
    },
    'pt-PT': {
        title: "Comece a usar DOCSET hoje",
        subtitle: "Sem cartão de crédito. Comece a extrair dados estruturados em minutos.",
        cta: "Começar grátis"
    }
};
var headerNavFallback = {
    en: { features: "Features", pricing: "Pricing", api: "API", login: "Login", startFree: "Start free", dashboard: "Dashboard" },
    'pt-BR': { features: "Recursos", pricing: "Preços", api: "API", login: "Entrar", startFree: "Começar grátis", dashboard: "Painel" },
    'pt-PT': { features: "Recursos", pricing: "Preços", api: "API", login: "Entrar", startFree: "Começar grátis", dashboard: "Painel" }
};
var miscFallback = {
    en: { builtForDevelopers: "Built for data extraction", mostPopular: "Most popular" },
    'pt-BR': { builtForDevelopers: "Feito para extração de dados", mostPopular: "Mais popular" },
    'pt-PT': { builtForDevelopers: "Feito para extração de dados", mostPopular: "Mais popular" }
};
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
    return (react_1["default"].createElement("div", { className: "bg-black text-white antialiased" },
        react_1["default"].createElement(Header, { locale: getCurrentLocaleValue(), onLocaleChange: handleLocaleChange, theme: theme, onToggleTheme: toggleTheme, isAuthenticated: isAuthenticated }),
        react_1["default"].createElement(Hero, { locale: getFullLocale(), onOpenDemo: function () { return setShowDemo(true); } }),
        react_1["default"].createElement(ProductFlow, { locale: getFullLocale() }),
        react_1["default"].createElement(Features, { locale: getFullLocale() }),
        react_1["default"].createElement(CodeExample, { locale: getFullLocale(), onOpenDemo: function () { return setShowDemo(true); } }),
        react_1["default"].createElement(Pricing, { locale: getFullLocale() }),
        react_1["default"].createElement(FinalCTA, { locale: getFullLocale() }),
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
    var getHeaderText = function () {
        if (locale === 'pt-BR' || locale === 'pt')
            return headerNavFallback['pt-BR'];
        if (locale === 'pt-PT')
            return headerNavFallback['pt-PT'];
        return headerNavFallback.en;
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
        react_1["default"].createElement(framer_motion_1.motion.header, { initial: { y: -100, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "fixed top-0 w-full z-50 transition-all duration-300 " + (scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent") },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-8" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.05 }, className: "flex items-center gap-2 cursor-pointer", onClick: function () { return react_2.router.visit("/" + locale.split('-')[0]); } },
                        react_1["default"].createElement("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.FileJson, { className: "h-5 w-5 text-white" })),
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
        react_1["default"].createElement(framer_motion_1.AnimatePresence, null, mobileMenuOpen && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: "100%" }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: "100%" }, transition: { type: "spring", damping: 25, stiffness: 200 }, className: "fixed inset-0 z-[60] bg-zinc-950 flex flex-col md:hidden" },
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
    var getHeroText = function () {
        if (locale === 'pt-BR' || locale === 'pt')
            return heroFallback['pt-BR'];
        if (locale === 'pt-PT')
            return heroFallback['pt-PT'];
        return heroFallback.en;
    };
    var heroRaw = getHeroText();
    return (react_1["default"].createElement("section", { className: "relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" }),
        react_1["default"].createElement("div", { className: "absolute inset-0" },
            react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl", animate: {
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }, transition: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                } }),
            react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl", animate: {
                    scale: [1.2, 1, 1.2],
                    opacity: [0.5, 0.3, 0.5]
                }, transition: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                } })),
        react_1["default"].createElement("div", { className: "max-w-5xl mx-auto px-6 text-center relative z-10" },
            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20" },
                    react_1["default"].createElement(lucide_react_1.Sparkles, { className: "w-3 h-3 mr-1" }),
                    (function () {
                        if (locale === 'pt-BR' || locale === 'pt')
                            return miscFallback['pt-BR'].builtForDevelopers;
                        if (locale === 'pt-PT')
                            return miscFallback['pt-PT'].builtForDevelopers;
                        return miscFallback.en.builtForDevelopers;
                    })()),
                react_1["default"].createElement("h1", { className: "text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6" }, heroRaw.title),
                react_1["default"].createElement("p", { className: "text-xl text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto" }, heroRaw.subtitle),
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } },
                        react_1["default"].createElement(button_1.Button, { size: "lg", onClick: function () { return react_2.router.visit("/" + locale + "/register"); }, className: "bg-white text-black hover:bg-gray-200 px-8 h-12 text-base font-medium shadow-lg shadow-white/20" },
                            heroRaw.cta_primary,
                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))),
                    react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } },
                        react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", onClick: onOpenDemo, className: "border-white/20 text-white hover:bg-white/10 px-8 h-12 text-base font-medium" },
                            react_1["default"].createElement(lucide_react_1.Play, { className: "mr-2 h-4 w-4" }),
                            heroRaw.cta_demo)))),
            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 }, className: "mt-20" },
                react_1["default"].createElement(AnimatedProductDemo, null)))));
}
function AnimatedProductDemo() {
    var _a = react_1.useState(0), step = _a[0], setStep = _a[1];
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            setStep(function (prev) { return (prev + 1) % 3; });
        }, 3000);
        return function () { return clearInterval(interval); };
    }, []);
    return (react_1["default"].createElement("div", { className: "relative" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" }),
        react_1["default"].createElement(framer_motion_1.motion.div, { className: "bg-zinc-900 rounded-2xl border border-white/10 p-4 sm:p-8 shadow-2xl", initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
            react_1["default"].createElement("div", { className: "flex gap-2 mb-6" }, [0, 1, 2].map(function (i) { return (react_1["default"].createElement("div", { key: i, className: "h-1.5 flex-1 rounded-full transition-all duration-500 " + (step === i ? 'bg-blue-500' : 'bg-white/10') })); })),
            react_1["default"].createElement(framer_motion_1.AnimatePresence, { mode: "wait" },
                step === 0 && (react_1["default"].createElement(framer_motion_1.motion.div, { key: "upload", initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                        react_1["default"].createElement("div", { className: "w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.Upload, { className: "w-5 h-5 text-blue-400" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "font-semibold" }, "1. Upload document"),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-400" }, "PDF, JPG, or PNG"))),
                    react_1["default"].createElement("div", { className: "border-2 border-dashed border-white/20 rounded-xl p-8 text-center" },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "w-12 h-12 text-gray-600 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-gray-400 text-sm" }, "invoice_march_2024.pdf"),
                        react_1["default"].createElement("div", { className: "mt-4 h-2 bg-white/5 rounded-full overflow-hidden" },
                            react_1["default"].createElement(framer_motion_1.motion.div, { className: "h-full bg-blue-500", initial: { width: 0 }, animate: { width: "100%" }, transition: { duration: 1.5 } }))))),
                step === 1 && (react_1["default"].createElement(framer_motion_1.motion.div, { key: "define", initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                        react_1["default"].createElement("div", { className: "w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.Settings, { className: "w-5 h-5 text-blue-400" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "font-semibold" }, "2. Define & review fields"),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-400" }, "Edit extracted data"))),
                    react_1["default"].createElement("div", { className: "grid gap-3" }, [
                        { label: "Invoice Number", value: "#INV-2024-001" },
                        { label: "Total Amount", value: "€12,450.00" },
                        { label: "Date", value: "2024-01-05" },
                    ].map(function (field, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: field.label, initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 }, className: "bg-white/5 rounded-lg p-4 flex items-center justify-between border border-white/10" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-xs text-gray-400" }, field.label),
                            react_1["default"].createElement("p", { className: "font-mono font-medium" }, field.value)),
                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-500" }))); })))),
                step === 2 && (react_1["default"].createElement(framer_motion_1.motion.div, { key: "export", initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                        react_1["default"].createElement("div", { className: "w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.Database, { className: "w-5 h-5 text-blue-400" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "font-semibold" }, "3. Export or use API"),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-400" }, "Get structured data"))),
                    react_1["default"].createElement("div", { className: "bg-zinc-950 rounded-lg p-6 border border-white/10" },
                        react_1["default"].createElement("pre", { className: "text-xs font-mono text-gray-300 overflow-x-auto" },
                            react_1["default"].createElement("code", null, "{\n  \"invoice_number\": \"#INV-2024-001\",\n  \"amount\": 12450.00,\n  \"date\": \"2024-01-05\",\n  \"status\": \"validated\"\n}"))),
                    react_1["default"].createElement("div", { className: "flex gap-2" }, [
                        { icon: lucide_react_1.Download, label: "CSV" },
                        { icon: lucide_react_1.FileJson, label: "JSON" },
                        { icon: lucide_react_1.Code, label: "API" },
                    ].map(function (item) { return (react_1["default"].createElement(button_1.Button, { key: item.label, variant: "outline", size: "sm", className: "flex-1 border-white/10 text-white hover:bg-white/5" },
                        react_1["default"].createElement(item.icon, { className: "w-4 h-4 mr-2" }),
                        item.label)); }))))))));
}
function ProductFlow(_a) {
    var locale = _a.locale;
    var getProductFlowText = function () {
        if (locale === 'pt-BR' || locale === 'pt')
            return productFlowFallback['pt-BR'];
        if (locale === 'pt-PT')
            return productFlowFallback['pt-PT'];
        return productFlowFallback.en;
    };
    var flowText = getProductFlowText();
    var iconMap = [lucide_react_1.Upload, lucide_react_1.Eye, lucide_react_1.Database];
    return (react_1["default"].createElement("section", { className: "py-20 md:py-32 relative overflow-hidden" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6" },
            react_1["default"].createElement("div", { className: "text-center mb-20" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-blue-500/10 text-blue-300 border-blue-500/20" }, flowText.badge),
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-bold" }, flowText.title)),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8" }, flowText.steps.map(function (item, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: item.step, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.1 }, className: "relative" },
                react_1["default"].createElement("div", { className: "bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300" },
                    react_1["default"].createElement("div", { className: "text-5xl font-bold text-white/10 mb-4" }, item.step),
                    react_1["default"].createElement("div", { className: "w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6" }, react_1["default"].createElement(iconMap[i], { className: "w-6 h-6 text-blue-400" })),
                    react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-3" }, item.title),
                    react_1["default"].createElement("p", { className: "text-gray-400 leading-relaxed" }, item.description)))); })))));
}
function Features(_a) {
    var locale = _a.locale;
    var getFeaturesText = function () {
        if (locale === 'pt-BR' || locale === 'pt')
            return featuresFallback['pt-BR'];
        if (locale === 'pt-PT')
            return featuresFallback['pt-PT'];
        return featuresFallback.en;
    };
    var featuresText = getFeaturesText();
    return (react_1["default"].createElement("section", { id: "features", className: "py-20 md:py-32 relative" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6" },
            react_1["default"].createElement("div", { className: "text-center mb-20" },
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-bold mb-6" }, featuresText.title)),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" }, featuresText.items.map(function (feature, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: feature.title, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.05 }, className: "group" },
                react_1["default"].createElement("div", { className: "bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300" },
                    react_1["default"].createElement(feature.icon, { className: "w-8 h-8 text-blue-400 mb-4" }),
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold mb-2" }, feature.title),
                    react_1["default"].createElement("p", { className: "text-gray-400 text-sm leading-relaxed" }, feature.desc)))); })))));
}
function CodeExample(_a) {
    var locale = _a.locale, onOpenDemo = _a.onOpenDemo;
    var getCodeExampleText = function () {
        if (locale === 'pt-BR' || locale === 'pt')
            return codeExampleFallback['pt-BR'];
        if (locale === 'pt-PT')
            return codeExampleFallback['pt-PT'];
        return codeExampleFallback.en;
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
    var _this = this;
    var locale = _a.locale;
    var getPricingText = function () {
        if (locale === 'pt-BR' || locale === 'pt')
            return pricingFallback['pt-BR'];
        if (locale === 'pt-PT')
            return pricingFallback['pt-PT'];
        return pricingFallback.en;
    };
    var pricingText = getPricingText();
    var _b = react_1.useState([]), plans = _b[0], setPlans = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1];
    react_1.useEffect(function () {
        var fetchPlans = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, plansArray, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, fetch("/api/plans?locale=" + locale)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (data && Object.keys(data).length > 0) {
                            plansArray = Object.values(data).map(function (plan, index) { return (__assign(__assign({}, plan), { order: plan.id === 'free' ? 0 : plan.id === 'starter' ? 1 : plan.id === 'pro' ? 2 : 3 })); });
                            setPlans(plansArray.sort(function (a, b) { return a.order - b.order; }));
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error fetching plans:', error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchPlans();
    }, [locale]);
    var getRecurringText = function (recurring) {
        if (!recurring)
            return '';
        var interval = recurring.interval;
        var count = recurring.interval_count || 1;
        var intervalTexts = {
            en: { month: '/mo', year: '/yr' },
            'pt-BR': { month: '/mês', year: '/ano' },
            'pt-PT': { month: '/mês', year: '/ano' }
        };
        var localeTexts = intervalTexts[locale] || intervalTexts.en;
        if (count === 1) {
            return localeTexts[interval] || "/" + interval;
        }
        return "/" + count + " " + interval + "s";
    };
    var displayPlans = plans.map(function (plan) { return ({
        name: plan.display_name || plan.name,
        price: plan.price,
        frequency: plan.recurring ? getRecurringText(plan.recurring) : '',
        price_id: plan.price_id || plan.id,
        popular: plan.recommended || false,
        features: plan.features || [],
        order: plan.order || 0
    }); });
    return (react_1["default"].createElement("section", { id: "pricing", className: "py-20 md:py-32 relative" },
        react_1["default"].createElement("div", { className: "max-w-6xl mx-auto px-6" },
            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "text-center mb-20" },
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-bold mb-6" }, pricingText.title),
                react_1["default"].createElement("p", { className: "text-xl text-gray-400" }, pricingText.subtitle)),
            loading ? (react_1["default"].createElement("div", { className: "text-center py-12" },
                react_1["default"].createElement("p", { className: "text-gray-400" }, "Loading pricing..."))) : plans.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-12" },
                react_1["default"].createElement("p", { className: "text-gray-400" }, "No pricing plans available"))) : (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" }, displayPlans.map(function (plan, i) { return (react_1["default"].createElement(framer_motion_1.motion.div, { key: plan.price_id, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.1 }, whileHover: { y: -8 } },
                react_1["default"].createElement("div", { className: "relative h-full rounded-2xl p-8 border transition-all duration-300 " + (plan.popular
                        ? 'bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500 shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/20') },
                    plan.popular && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.5 }, className: "absolute -top-4 left-1/2 -translate-x-1/2" },
                        react_1["default"].createElement(badge_1.Badge, { className: "bg-blue-500 text-white border-0" }, (function () {
                            if (locale === 'pt-BR' || locale === 'pt')
                                return miscFallback['pt-BR'].mostPopular;
                            if (locale === 'pt-PT')
                                return miscFallback['pt-PT'].mostPopular;
                            return miscFallback.en.mostPopular;
                        })()))),
                    react_1["default"].createElement("div", { className: "mb-8" },
                        react_1["default"].createElement("h3", { className: "text-lg font-semibold mb-2" }, plan.name),
                        react_1["default"].createElement("div", { className: "flex items-baseline gap-1" },
                            react_1["default"].createElement("span", { className: "text-4xl font-bold" }, plan.price),
                            plan.frequency && react_1["default"].createElement("span", { className: "text-gray-400" }, plan.frequency))),
                    react_1["default"].createElement("ul", { className: "space-y-3 mb-8" }, plan.features.map(function (feature, idx) { return (react_1["default"].createElement(framer_motion_1.motion.li, { key: feature, initial: { opacity: 0, x: -10 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { delay: i * 0.1 + idx * 0.05 }, className: "flex items-center gap-2 text-sm text-gray-300" },
                        react_1["default"].createElement(lucide_react_1.Check, { className: "w-4 h-4 text-blue-400" }),
                        feature)); })),
                    react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } },
                        react_1["default"].createElement(button_1.Button, { onClick: function () { return react_2.router.visit("/" + locale + "/register"); }, className: "w-full " + (plan.popular
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20') }, pricingText.cta))))); }))))));
}
function FinalCTA(_a) {
    var locale = _a.locale;
    var getFinalCTAText = function () {
        if (locale === 'pt-BR' || locale === 'pt')
            return finalCTAFallback['pt-BR'];
        if (locale === 'pt-PT')
            return finalCTAFallback['pt-PT'];
        return finalCTAFallback.en;
    };
    var ctaText = getFinalCTAText();
    return (react_1["default"].createElement("section", { className: "py-20 md:py-32 relative overflow-hidden" },
        react_1["default"].createElement("div", { className: "absolute inset-0" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-blue-950/20 via-blue-900/20 to-transparent" }),
            react_1["default"].createElement("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl" })),
        react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-6 text-center relative z-10" },
            react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } },
                react_1["default"].createElement("h2", { className: "text-5xl md:text-6xl font-bold mb-6" }, ctaText.title),
                react_1["default"].createElement("p", { className: "text-xl text-gray-400 mb-10" }, ctaText.subtitle),
                react_1["default"].createElement(button_1.Button, { size: "lg", onClick: function () { return react_2.router.visit("/" + locale.split('-')[0] + "/register"); }, className: "bg-white text-black hover:bg-gray-200 px-8 h-14 text-lg font-semibold shadow-lg shadow-white/20" },
                    ctaText.cta,
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" }))))));
}
function Footer(_a) {
    var locale = _a.locale;
    return (react_1["default"].createElement("footer", { className: "border-t border-white/10 py-16" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12" },
                react_1["default"].createElement("div", { className: "sm:col-span-2 lg:col-span-1" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                        react_1["default"].createElement("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.FileJson, { className: "h-5 w-5 text-white" })),
                        react_1["default"].createElement("span", { className: "font-bold text-lg" }, "DOCSET")),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-400" }, "Turn documents into structured data")),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h4", { className: "font-semibold mb-4" }, "Product"),
                    react_1["default"].createElement("ul", { className: "space-y-2 text-sm text-gray-400" },
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "#features", className: "hover:text-white transition" }, "Features")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "#pricing", className: "hover:text-white transition" }, "Pricing")))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h4", { className: "font-semibold mb-4" }, "Legal"),
                    react_1["default"].createElement("ul", { className: "space-y-2 text-sm text-gray-400" },
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "/" + locale + "/privacy", className: "hover:text-white transition" }, "Privacy")),
                        react_1["default"].createElement("li", null,
                            react_1["default"].createElement("a", { href: "/" + locale + "/terms", className: "hover:text-white transition" }, "Terms"))))),
            react_1["default"].createElement(separator_1.Separator, { className: "my-12 bg-white/10" }),
            react_1["default"].createElement("div", { className: "text-center text-sm text-gray-400" },
                react_1["default"].createElement("p", null, " 2025 DOCSET. All rights reserved.")))));
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
                setError('File size must not exceed 5MB');
                setFile(null);
                e.target.value = '';
                return;
            }
            setFile(selectedFile);
        }
    };
    var handleProcess = function () { return __awaiter(_this, void 0, void 0, function () {
        var formData, response, data, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!file)
                        return [2 /*return*/];
                    if (file.size > MAX_FILE_SIZE) {
                        setError('File size must not exceed 5MB');
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
                            sonner_1.toast.error('You have already used the demo. Please register to continue using DOCSET.');
                            setTimeout(function () {
                                onClose();
                                react_2.router.visit("/" + locale + "/register");
                            }, 2500);
                            return [2 /*return*/];
                        }
                        throw new Error(data.message || 'Extraction failed');
                    }
                    setResult(data.data);
                    sonner_1.toast.success('Data extracted successfully!');
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _b.sent();
                    console.error('Demo extraction error:', error_2);
                    setError(error_2.message || 'An error occurred');
                    sonner_1.toast.error(error_2.message || 'An error occurred');
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
                react_1["default"].createElement(dialog_1.DialogTitle, { className: "text-2xl font-bold" }, "Try DOCSET Demo"),
                react_1["default"].createElement(dialog_1.DialogDescription, { className: "text-gray-400" }, "Upload a document to see how DOCSET extracts data automatically")),
            !result ? (react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-blue-500/50 transition-all" },
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-16 w-16 mx-auto text-gray-600 mb-4" }),
                    react_1["default"].createElement(input_1.Input, { type: "file", onChange: handleFileChange, accept: ".pdf,.jpg,.jpeg,.png", className: "hidden", id: "demo-file" }),
                    react_1["default"].createElement(label_1.Label, { htmlFor: "demo-file", className: "cursor-pointer text-blue-400 hover:text-blue-300 font-semibold text-lg" }, "Click to upload"),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-400 mt-3" }, "PDF, JPG, PNG (max 5MB)"),
                    file && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
                        react_1["default"].createElement(badge_1.Badge, { className: "mt-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2 text-sm" },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4 mr-2" }),
                            file.name,
                            " (",
                            (file.size / 1024 / 1024).toFixed(2),
                            " MB)"))),
                    error && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm text-red-400 font-medium" }, error)))),
                react_1["default"].createElement(button_1.Button, { onClick: handleProcess, disabled: !file || processing || !!error, className: "w-full bg-blue-500 hover:bg-blue-600 text-white", size: "lg" }, processing ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Sparkles, { className: "mr-2 h-5 w-5 animate-spin" }),
                    "Processing...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Sparkles, { className: "mr-2 h-5 w-5" }),
                    "Extract Data"))))) : (react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-10 w-10 text-green-500" }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-xl font-bold text-green-400" }, "Data Extracted Successfully!"),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-400" }, "Review the extracted fields below"))),
                    react_1["default"].createElement("div", { className: "space-y-3" }, Object.entries(result).map(function (_a) {
                        var key = _a[0], value = _a[1];
                        return (react_1["default"].createElement(framer_motion_1.motion.div, { key: key, initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, className: "flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10" },
                            react_1["default"].createElement("span", { className: "font-medium capitalize text-gray-300" },
                                key.replace('_', ' '),
                                ":"),
                            react_1["default"].createElement("span", { className: "font-bold text-white" }, value)));
                    }))),
                react_1["default"].createElement("div", { className: "bg-blue-500/10 border border-blue-500/30 rounded-xl p-6" },
                    react_1["default"].createElement("p", { className: "font-medium mb-2 text-blue-300" }, "\uD83C\uDF89 Demo completed!"),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-400" }, "Register now to unlock unlimited processing and all features")),
                react_1["default"].createElement(button_1.Button, { onClick: onDemoComplete, className: "w-full bg-white text-black hover:bg-gray-200", size: "lg" },
                    "Register to Continue",
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2" })))))));
}
