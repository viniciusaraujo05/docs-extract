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
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var alert_error_1 = require("./alert-error");
function TwoFactorRecoveryCodes(_a) {
    var _this = this;
    var recoveryCodesList = _a.recoveryCodesList, fetchRecoveryCodes = _a.fetchRecoveryCodes, errors = _a.errors;
    var _b = react_2.useState(false), codesAreVisible = _b[0], setCodesAreVisible = _b[1];
    var codesSectionRef = react_2.useRef(null);
    var canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;
    var toggleCodesVisibility = react_2.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(!codesAreVisible && !recoveryCodesList.length)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchRecoveryCodes()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    setCodesAreVisible(!codesAreVisible);
                    if (!codesAreVisible) {
                        setTimeout(function () {
                            var _a;
                            (_a = codesSectionRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest'
                            });
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);
    react_2.useEffect(function () {
        if (!recoveryCodesList.length) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);
    var RecoveryCodeIconComponent = codesAreVisible ? lucide_react_1.EyeOff : lucide_react_1.Eye;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "flex gap-3" },
                React.createElement(lucide_react_1.LockKeyhole, { className: "size-4", "aria-hidden": "true" }),
                "2FA Recovery Codes"),
            React.createElement(card_1.CardDescription, null, "Recovery codes let you regain access if you lose your 2FA device. Store them in a secure password manager.")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between" },
                React.createElement(button_1.Button, { onClick: toggleCodesVisibility, className: "w-fit", "aria-expanded": codesAreVisible, "aria-controls": "recovery-codes-section" },
                    React.createElement(RecoveryCodeIconComponent, { className: "size-4", "aria-hidden": "true" }),
                    codesAreVisible ? 'Hide' : 'View',
                    " Recovery Codes"),
                canRegenerateCodes && (React.createElement(button_1.Button, { variant: "secondary", onClick: function () {
                        react_1.router.post('/user/two-factor-recovery-codes', {}, {
                            preserveScroll: true,
                            onSuccess: fetchRecoveryCodes
                        });
                    }, "aria-describedby": "regenerate-warning" },
                    React.createElement(lucide_react_1.RefreshCw, null),
                    " Regenerate Codes"))),
            React.createElement("div", { id: "recovery-codes-section", className: "relative overflow-hidden transition-all duration-300 " + (codesAreVisible ? 'h-auto opacity-100' : 'h-0 opacity-0'), "aria-hidden": !codesAreVisible },
                React.createElement("div", { className: "mt-3 space-y-3" }, (errors === null || errors === void 0 ? void 0 : errors.length) ? (React.createElement(alert_error_1["default"], { errors: errors })) : (React.createElement(React.Fragment, null,
                    React.createElement("div", { ref: codesSectionRef, className: "grid gap-1 rounded-lg bg-muted p-4 font-mono text-sm", role: "list", "aria-label": "Recovery codes" }, recoveryCodesList.length ? (recoveryCodesList.map(function (code, index) { return (React.createElement("div", { key: index, role: "listitem", className: "select-text" }, code)); })) : (React.createElement("div", { className: "space-y-2", "aria-label": "Loading recovery codes" }, Array.from({ length: 8 }, function (_, index) { return (React.createElement("div", { key: index, className: "h-4 animate-pulse rounded bg-muted-foreground/20", "aria-hidden": "true" })); })))),
                    React.createElement("div", { className: "text-xs text-muted-foreground select-none" },
                        React.createElement("p", { id: "regenerate-warning" },
                            "Each recovery code can be used once to access your account and will be removed after use. If you need more, click",
                            ' ',
                            React.createElement("span", { className: "font-bold" }, "Regenerate Codes"),
                            ' ',
                            "above.")))))))));
}
exports["default"] = TwoFactorRecoveryCodes;
