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
exports.useTwoFactorAuth = exports.OTP_MAX_LENGTH = void 0;
var react_1 = require("react");
exports.OTP_MAX_LENGTH = 6;
var fetchJson = function (url) { return __awaiter(void 0, void 0, Promise, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(url, {
                    headers: { Accept: 'application/json' }
                })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("Failed to fetch: " + response.status);
                }
                return [2 /*return*/, response.json()];
        }
    });
}); };
exports.useTwoFactorAuth = function () {
    var _a = react_1.useState(null), qrCodeSvg = _a[0], setQrCodeSvg = _a[1];
    var _b = react_1.useState(null), manualSetupKey = _b[0], setManualSetupKey = _b[1];
    var _c = react_1.useState([]), recoveryCodesList = _c[0], setRecoveryCodesList = _c[1];
    var _d = react_1.useState([]), errors = _d[0], setErrors = _d[1];
    var hasSetupData = react_1.useMemo(function () { return qrCodeSvg !== null && manualSetupKey !== null; }, [qrCodeSvg, manualSetupKey]);
    var fetchQrCode = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchJson('/user/two-factor-qr-code')];
                case 1:
                    data = _a.sent();
                    setQrCodeSvg(data.svg);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to fetch QR code:', error_1);
                    setQrCodeSvg(null);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var fetchSetupKey = react_1.useCallback(function () { return __awaiter(void 0, void 0, Promise, function () {
        var key, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchJson('/user/two-factor-secret-key')];
                case 1:
                    key = (_a.sent()).secretKey;
                    setManualSetupKey(key);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to fetch a setup key:', error_2);
                    setManualSetupKey(null);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var clearErrors = react_1.useCallback(function () {
        setErrors([]);
    }, []);
    var clearSetupData = react_1.useCallback(function () {
        setManualSetupKey(null);
        setQrCodeSvg(null);
        clearErrors();
    }, [clearErrors]);
    var fetchRecoveryCodes = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var codes, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    clearErrors();
                    return [4 /*yield*/, fetchJson('/user/two-factor-recovery-codes')];
                case 1:
                    codes = _a.sent();
                    setRecoveryCodesList(codes);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Failed to fetch recovery codes:', error_3);
                    setRecoveryCodesList([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [clearErrors]);
    var fetchSetupData = react_1.useCallback(function () { return __awaiter(void 0, void 0, Promise, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    clearErrors();
                    return [4 /*yield*/, Promise.all([fetchQrCode(), fetchSetupKey()])];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    setQrCodeSvg(null);
                    setManualSetupKey(null);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [clearErrors, fetchQrCode, fetchSetupKey]);
    return {
        qrCodeSvg: qrCodeSvg,
        manualSetupKey: manualSetupKey,
        recoveryCodesList: recoveryCodesList,
        hasSetupData: hasSetupData,
        errors: errors,
        clearErrors: clearErrors,
        clearSetupData: clearSetupData,
        fetchQrCode: fetchQrCode,
        fetchSetupKey: fetchSetupKey,
        fetchSetupData: fetchSetupData,
        fetchRecoveryCodes: fetchRecoveryCodes
    };
};
