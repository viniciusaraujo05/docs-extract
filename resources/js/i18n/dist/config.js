"use strict";
exports.__esModule = true;
exports.setPortugueseVariant = void 0;
var i18next_1 = require("i18next");
var react_i18next_1 = require("react-i18next");
var i18next_browser_languagedetector_1 = require("i18next-browser-languagedetector");
var pt_PT_json_1 = require("./locales/pt-PT.json");
var pt_BR_json_1 = require("./locales/pt-BR.json");
var en_json_1 = require("./locales/en.json");
// Detecta variante de português baseado no navegador
var detectPortugueseVariant = function () {
    var _a;
    var browserLang = navigator.language || ((_a = navigator.languages) === null || _a === void 0 ? void 0 : _a[0]) || 'pt-PT';
    // Se navegador especifica pt-BR explicitamente
    if (browserLang.toLowerCase().includes('br')) {
        return 'pt-BR';
    }
    // Default para Portugal
    return 'pt-PT';
};
i18next_1["default"]
    .use(i18next_browser_languagedetector_1["default"])
    .use(react_i18next_1.initReactI18next)
    .init({
    resources: {
        pt: {
            translation: detectPortugueseVariant() === 'pt-BR' ? pt_BR_json_1["default"] : pt_PT_json_1["default"]
        },
        en: {
            translation: en_json_1["default"]
        }
    },
    fallbackLng: 'en',
    supportedLngs: ['pt', 'en'],
    interpolation: {
        escapeValue: false
    },
    detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'selected-locale'
    }
});
// Expor função para trocar variante de português dinamicamente
exports.setPortugueseVariant = function (variant) {
    var translations = variant === 'pt-BR' ? pt_BR_json_1["default"] : pt_PT_json_1["default"];
    i18next_1["default"].addResourceBundle('pt', 'translation', translations, true, true);
    localStorage.setItem('pt-variant', variant);
};
// Restaurar variante salva se existir
var savedVariant = localStorage.getItem('pt-variant');
if (savedVariant) {
    exports.setPortugueseVariant(savedVariant);
}
exports["default"] = i18next_1["default"];
