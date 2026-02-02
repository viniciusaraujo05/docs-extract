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
exports.CancelSubscriptionModal = void 0;
var react_1 = require("react");
var react_2 = require("@inertiajs/react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
function CancelSubscriptionModal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange;
    var _b = react_1.useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var handleCancel = function () { return __awaiter(_this, void 0, void 0, function () {
        var locale, response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    locale = document.documentElement.lang || 'en';
                    return [4 /*yield*/, fetch("/api/subscription/cancel-subscription", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': ((_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || ''
                            }
                        })];
                case 2:
                    response = _b.sent();
                    if (response.ok) {
                        onOpenChange(false);
                        react_2.router.reload();
                    }
                    else {
                        alert('Error cancelling subscription. Please try again.');
                        setIsLoading(false);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error cancelling subscription:', error_1);
                    alert('Error cancelling subscription. Please try again.');
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[425px]" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement("div", { className: "mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center" },
                    React.createElement(lucide_react_1.AlertTriangle, { className: "h-6 w-6 text-red-600 dark:text-red-400" })),
                React.createElement(dialog_1.DialogTitle, { className: "text-center" }, "Cancel Subscription?"),
                React.createElement(dialog_1.DialogDescription, { className: "text-center" }, "Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your billing period.")),
            React.createElement(dialog_1.DialogFooter, { className: "sm:justify-center gap-2" },
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: isLoading }, "Keep Subscription"),
                React.createElement(button_1.Button, { variant: "destructive", onClick: handleCancel, disabled: isLoading }, isLoading ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Cancelling...")) : ('Yes, Cancel'))))));
}
exports.CancelSubscriptionModal = CancelSubscriptionModal;
