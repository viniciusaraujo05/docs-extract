"use strict";
exports.__esModule = true;
var react_1 = require("@inertiajs/react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var app_layout_1 = require("@/layouts/app-layout");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var react_i18next_1 = require("react-i18next");
function Checkout(_a) {
    var priceId = _a.priceId, planName = _a.planName, userName = _a.userName, userEmail = _a.userEmail;
    var t = react_i18next_1.useTranslation().t;
    var _b = react_2.useState(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var locale = document.documentElement.lang || 'en';
    var handleCheckout = function () {
        if (!priceId) {
            alert(t('subscription.checkout.noPriceSelected'));
            return;
        }
        setIsProcessing(true);
        // Use Inertia router to handle CSRF token automatically
        react_1.router.post("/api/subscription/checkout", {
            price_id: priceId
        }, {
            onFinish: function () { return setIsProcessing(false); },
            onError: function (errors) {
                console.error('Checkout error:', errors);
                setIsProcessing(false);
            }
        });
    };
    var handleBack = function () {
        react_1.router.visit("/" + locale);
    };
    return (React.createElement(app_layout_1["default"], null,
        React.createElement(react_1.Head, { title: t('subscription.checkout.title') }),
        React.createElement("div", { className: "min-h-screen bg-gradient-to-b from-background to-muted/20 py-12" },
            React.createElement("div", { className: "container mx-auto px-4 max-w-2xl" },
                React.createElement(button_1.Button, { variant: "ghost", onClick: handleBack, className: "mb-6" },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    t('subscription.checkout.back')),
                React.createElement(card_1.Card, { className: "border-2" },
                    React.createElement(card_1.CardHeader, { className: "text-center" },
                        React.createElement("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10" },
                            React.createElement(lucide_react_1.CreditCard, { className: "h-8 w-8 text-primary" })),
                        React.createElement(card_1.CardTitle, { className: "text-3xl" }, t('subscription.checkout.title')),
                        userName && (React.createElement("div", { className: "mt-2 text-primary font-medium" }, t('subscription.checkout.welcome', 'Hello, {{name}}!', { name: userName }))),
                        React.createElement(card_1.CardDescription, { className: "text-lg mt-2" }, planName ? (React.createElement(React.Fragment, null,
                            t('subscription.checkout.selectedPlan'),
                            ": ",
                            React.createElement("span", { className: "font-semibold text-foreground" }, planName))) : (t('subscription.checkout.description')))),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "rounded-lg bg-muted/50 p-6 space-y-4" },
                            React.createElement("h3", { className: "font-semibold text-lg" }, t('subscription.checkout.whatHappensNext')),
                            React.createElement("ol", { className: "space-y-3 text-sm text-muted-foreground" },
                                React.createElement("li", { className: "flex items-start" },
                                    React.createElement("span", { className: "mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" }, "1"),
                                    React.createElement("span", null, t('subscription.checkout.step1'))),
                                React.createElement("li", { className: "flex items-start" },
                                    React.createElement("span", { className: "mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" }, "2"),
                                    React.createElement("span", null, t('subscription.checkout.step2'))),
                                React.createElement("li", { className: "flex items-start" },
                                    React.createElement("span", { className: "mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" }, "3"),
                                    React.createElement("span", null, t('subscription.checkout.step3'))),
                                React.createElement("li", { className: "flex items-start" },
                                    React.createElement("span", { className: "mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" }, "4"),
                                    React.createElement("span", null, t('subscription.checkout.step4'))))),
                        React.createElement("div", { className: "rounded-lg border-2 border-primary/20 bg-primary/5 p-4" },
                            React.createElement("div", { className: "flex items-start space-x-3" },
                                React.createElement(lucide_react_1.CreditCard, { className: "h-5 w-5 text-primary mt-0.5" }),
                                React.createElement("div", { className: "space-y-1" },
                                    React.createElement("p", { className: "text-sm font-medium" }, t('subscription.checkout.securePayment')),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, t('subscription.checkout.securePaymentDesc'))))),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement(button_1.Button, { onClick: handleCheckout, disabled: isProcessing || !priceId, className: "w-full h-12 text-lg", size: "lg" }, isProcessing ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-5 w-5 animate-spin" }),
                                t('subscription.checkout.processing'))) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.CreditCard, { className: "mr-2 h-5 w-5" }),
                                t('subscription.checkout.proceedToPayment')))),
                            React.createElement("p", { className: "text-center text-xs text-muted-foreground" }, t('subscription.checkout.cancelAnytime'))))),
                React.createElement("div", { className: "mt-6 text-center text-sm text-muted-foreground" },
                    React.createElement("p", null, t('subscription.checkout.questions')))))));
}
exports["default"] = Checkout;
