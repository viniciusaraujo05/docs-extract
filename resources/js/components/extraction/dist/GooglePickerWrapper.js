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
exports.__esModule = true;
exports.GooglePickerWrapper = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var react_i18next_1 = require("react-i18next");
var sonner_1 = require("sonner");
function GooglePickerWrapper(_a) {
    var _this = this;
    var locale = _a.locale, onFileSelect = _a.onFileSelect, _b = _a.multiple, multiple = _b === void 0 ? false : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, className = _a.className;
    var t = react_i18next_1.useTranslation().t;
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(false), pickerApiLoaded = _e[0], setPickerApiLoaded = _e[1];
    var _f = react_1.useState(null), oauthToken = _f[0], setOauthToken = _f[1];
    var _g = react_1.useState(false), tokenChecked = _g[0], setTokenChecked = _g[1];
    // Detect OS for keyboard shortcut display
    var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    var modifierKey = isMac ? 'Cmd' : 'Ctrl';
    react_1.useEffect(function () {
        // Load Google API and Picker
        loadGoogleApi();
        // Fetch OAuth token from backend
        fetchOAuthToken();
    }, []);
    var loadGoogleApi = function () {
        if (window.gapi) {
            window.gapi.load('picker', {
                callback: function () {
                    setPickerApiLoaded(true);
                }
            });
        }
        else {
            console.error('Google API not loaded. Add <script src="https://apis.google.com/js/api.js"></script> to your HTML.');
        }
    };
    var fetchOAuthToken = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    return [4 /*yield*/, fetch("/api/integrations/google/token", {
                            headers: {
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.connected && data.token) {
                        setOauthToken(data.token);
                    }
                    else {
                        setOauthToken(null);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    setOauthToken(null);
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error fetching OAuth token:', error_1);
                    setOauthToken(null);
                    return [3 /*break*/, 7];
                case 6:
                    setTokenChecked(true);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var createPicker = function () {
        if (!pickerApiLoaded || !oauthToken) {
            sonner_1.toast.error(t('Google Picker not ready. Please try again.'));
            return;
        }
        // CRITICAL: Developer Key is REQUIRED for drive.file scope to work with Picker
        // Without it, the Picker cannot grant explicit permission to the selected file
        var developerKey = import.meta.env.VITE_GOOGLE_PICKER_API_KEY;
        var appId = import.meta.env.VITE_GOOGLE_APP_ID;
        if (!developerKey || !appId) {
            sonner_1.toast.error(t('Google Picker configuration error. Please contact support.'));
            return;
        }
        var pickerBuilder = new window.google.picker.PickerBuilder()
            .addView(window.google.picker.ViewId.DOCS)
            .addView(window.google.picker.ViewId.DOCS_IMAGES)
            .addView(window.google.picker.ViewId.DOCS_VIDEOS)
            .addView(window.google.picker.ViewId.SPREADSHEETS)
            .addView(window.google.picker.ViewId.PDFS)
            .setOAuthToken(oauthToken)
            .setDeveloperKey(developerKey)
            .setAppId(appId)
            .setCallback(pickerCallback);
        if (multiple) {
            pickerBuilder = pickerBuilder
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .setTitle(t('Select files') + " (" + modifierKey + "+Click " + t('to select multiple') + ")");
        }
        else {
            pickerBuilder = pickerBuilder.setTitle(t('Select a file'));
        }
        var picker = pickerBuilder.build();
        picker.setVisible(true);
    };
    var pickerCallback = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var docs, filePromises, files, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(data.action === window.google.picker.Action.PICKED)) return [3 /*break*/, 5];
                    setLoading(true);
                    docs = data.docs;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    filePromises = docs.map(function (doc) { return __awaiter(_this, void 0, void 0, function () {
                        var fileId, fileName, mimeType, response, blob;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    fileId = doc.id;
                                    fileName = doc.name;
                                    mimeType = doc.mimeType;
                                    return [4 /*yield*/, fetch("/" + locale + "/integrations/google/process-file", {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Accept': 'application/json',
                                                'X-Requested-With': 'XMLHttpRequest',
                                                'X-CSRF-TOKEN': ((_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || ''
                                            },
                                            body: JSON.stringify({ fileId: fileId })
                                        })];
                                case 1:
                                    response = _b.sent();
                                    if (!response.ok) {
                                        throw new Error("Failed to process file: " + fileName);
                                    }
                                    return [4 /*yield*/, response.blob()];
                                case 2:
                                    blob = _b.sent();
                                    return [2 /*return*/, new File([blob], fileName, { type: mimeType })];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(filePromises)];
                case 2:
                    files = _a.sent();
                    if (files.length > 0) {
                        if (multiple) {
                            onFileSelect(files);
                        }
                        else {
                            onFileSelect(files[0]);
                        }
                        sonner_1.toast.success(t('{{count}} file(s) imported from Google Drive', { count: files.length }));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error processing files:', error_2);
                    sonner_1.toast.error(t('Failed to import files from Google Drive'));
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleClick = function () {
        // Wait for token check to complete
        if (!tokenChecked) {
            sonner_1.toast.error(t('Loading... Please wait'));
            return;
        }
        if (!oauthToken) {
            // Redirect to connect Google account
            var returnTo = encodeURIComponent(window.location.pathname);
            window.location.href = "/" + locale + "/integrations/google/connect?return_to=" + returnTo;
            return;
        }
        createPicker();
    };
    return (React.createElement("button", { type: "button", onClick: function (e) {
            e.stopPropagation();
            handleClick();
        }, disabled: disabled || loading, className: className }, loading ? (React.createElement(React.Fragment, null,
        React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-blue-600" }),
        React.createElement("div", { className: "space-y-1" },
            React.createElement("span", { className: "font-medium block" }, t('Importing...'))))) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full" },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", role: "img", className: "h-6 w-6" },
                React.createElement("path", { d: "M23.49,12.275 C23.49,11.485 23.425,10.73 23.295,10 H12 V14.51 H18.46 C18.18,15.99 17.335,17.245 16.08,18.09 L16.08,21.09 L19.905,21.09 C22.145,19.03 23.49,15.98 23.49,12.275 Z", fill: "#4285F4" }),
                React.createElement("path", { d: "M12,24 C15.24,24 17.965,22.935 19.91,21.09 L16.08,18.09 C15.005,18.815 13.62,19.25 12,19.25 C8.865,19.25 6.215,17.135 5.265,14.29 L1.3,14.29 L1.3,17.385 C3.26,21.275 7.315,24 12,24 Z", fill: "#34A853" }),
                React.createElement("path", { d: "M5.265,14.29 C5.025,13.565 4.9,12.795 4.9,12 C4.9,11.205 5.025,10.435 5.265,9.71 L5.265,6.62 L1.3,6.62 C0.47,8.28 0,10.09 0,12 C0,13.91 0.47,15.72 1.3,17.385 L5.265,14.29 Z", fill: "#FBBC05" }),
                React.createElement("path", { d: "M12,4.75 C13.77,4.75 15.355,5.36 16.605,6.55 L20.02,3.135 C17.96,1.215 15.235,0 12,0 C7.315,0 3.26,2.725 1.3,6.62 L5.265,9.71 C6.215,6.865 8.865,4.75 12,4.75 Z", fill: "#EA4335" }))),
        React.createElement("div", { className: "space-y-1" },
            React.createElement("span", { className: "font-medium block" }, t('From Google Drive')),
            React.createElement("span", { className: "text-xs text-muted-foreground block" }, multiple ? modifierKey + "+Click " + t('to select multiple') : t('Import from cloud')))))));
}
exports.GooglePickerWrapper = GooglePickerWrapper;
