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
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var react_2 = require("@inertiajs/react");
var react_3 = require("@inertiajs/react");
var email_verification_banner_1 = require("@/components/email-verification-banner");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var dialog_1 = require("@/components/ui/dialog");
var tooltip_1 = require("@/components/ui/tooltip");
var alert_1 = require("@/components/ui/alert");
var app_layout_1 = require("@/layouts/app-layout");
var layout_1 = require("@/layouts/settings/layout");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function BillingIndex() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var _m = react_i18next_1.useTranslation(), t = _m.t, i18n = _m.i18n;
    var page = react_2.usePage();
    var props = page.props;
    var serverLocale = props.locale;
    var auth = page.props.auth;
    var _o = react_1.useState(serverLocale || 'pt'), locale = _o[0], setLocale = _o[1];
    react_1.useEffect(function () {
        if (serverLocale) {
            setLocale(serverLocale);
            i18n.changeLanguage(serverLocale);
        }
        else {
            var savedLocale = localStorage.getItem('selected-locale') || 'pt';
            setLocale(savedLocale);
            i18n.changeLanguage(savedLocale);
        }
    }, [serverLocale, i18n]);
    var BREADCRUMBS = [
        { title: t('Dashboard'), href: "/" + locale + "/dashboard" },
        { title: t('Settings'), href: "/" + locale + "/settings/billing" },
        { title: t('Billing', 'Billing'), href: "/" + locale + "/settings/billing" },
    ];
    var _p = react_1.useState(true), loading = _p[0], setLoading = _p[1];
    var _q = react_1.useState('free'), currentPlan = _q[0], setCurrentPlan = _q[1];
    var _r = react_1.useState(null), planData = _r[0], setPlanData = _r[1];
    var _s = react_1.useState({ pages: 0, documents: 0, models: 0, api_requests: 0, reports: 0 }), usage = _s[0], setUsage = _s[1];
    var _t = react_1.useState({
        pages: 0,
        documents: 0,
        models: 0,
        api_requests: 0,
        reports: 0
    }), usagePercentages = _t[0], setUsagePercentages = _t[1];
    var _u = react_1.useState(null), nextBillingDate = _u[0], setNextBillingDate = _u[1];
    var _v = react_1.useState(false), isTrial = _v[0], setIsTrial = _v[1];
    var _w = react_1.useState(false), isCanceled = _w[0], setIsCanceled = _w[1];
    var _x = react_1.useState(null), upcomingInvoice = _x[0], setUpcomingInvoice = _x[1];
    var _y = react_1.useState([]), invoices = _y[0], setInvoices = _y[1];
    var _z = react_1.useState(false), showUpgradeDialog = _z[0], setShowUpgradeDialog = _z[1];
    var _0 = react_1.useState(false), showCancelDialog = _0[0], setShowCancelDialog = _0[1];
    var _1 = react_1.useState(false), showPagesModal = _1[0], setShowPagesModal = _1[1];
    var _2 = react_1.useState([]), pagesDetail = _2[0], setPagesDetail = _2[1];
    var _3 = react_1.useState([]), plans = _3[0], setPlans = _3[1]; // Store raw plans
    var _4 = react_1.useState([]), availablePlans = _4[0], setAvailablePlans = _4[1];
    var _5 = react_1.useState(null), error = _5[0], setError = _5[1];
    // Default limits for free plan
    var defaultLimits = {
        documents: 20,
        models: 2,
        api_requests: 100
    };
    react_1.useEffect(function () {
        fetchData();
    }, []);
    var fetchData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, usageResponse, planResponse, plansResponse, invoiceResponse, usageData, planDataResponse, plansData, plansArray, invoiceData, invoicesResponse, invoicesData, validInvoices, e_1, error_1;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        return __generator(this, function (_v) {
            switch (_v.label) {
                case 0:
                    _v.trys.push([0, 15, 16, 17]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.allSettled([
                            fetch("/api/usage", {
                                headers: {
                                    'Accept': 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'X-CSRF-TOKEN': ((_b = document.querySelector('meta[name="csrf-token"]')) === null || _b === void 0 ? void 0 : _b.getAttribute('content')) || ''
                                }
                            }),
                            fetch("/api/plans/current?locale=" + locale, {
                                headers: {
                                    'Accept': 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'X-CSRF-TOKEN': ((_c = document.querySelector('meta[name="csrf-token"]')) === null || _c === void 0 ? void 0 : _c.getAttribute('content')) || ''
                                }
                            }),
                            fetch("/api/plans?locale=" + locale, {
                                headers: {
                                    'Accept': 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'X-CSRF-TOKEN': ((_d = document.querySelector('meta[name="csrf-token"]')) === null || _d === void 0 ? void 0 : _d.getAttribute('content')) || ''
                                }
                            }),
                            fetch("/api/plans/upcoming-invoice", {
                                headers: {
                                    'Accept': 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'X-CSRF-TOKEN': ((_e = document.querySelector('meta[name="csrf-token"]')) === null || _e === void 0 ? void 0 : _e.getAttribute('content')) || ''
                                }
                            }),
                        ])];
                case 1:
                    _a = _v.sent(), usageResponse = _a[0], planResponse = _a[1], plansResponse = _a[2], invoiceResponse = _a[3];
                    if (!(usageResponse.status === 'fulfilled')) return [3 /*break*/, 3];
                    return [4 /*yield*/, usageResponse.value.json()];
                case 2:
                    usageData = _v.sent();
                    if (usageData.success) {
                        setUsage({
                            pages: ((_f = usageData.usage.documents) === null || _f === void 0 ? void 0 : _f.used) || 0,
                            documents: ((_g = usageData.usage.documents) === null || _g === void 0 ? void 0 : _g.used) || 0,
                            models: ((_h = usageData.usage.models) === null || _h === void 0 ? void 0 : _h.used) || 0,
                            api_requests: ((_j = usageData.usage.api_requests) === null || _j === void 0 ? void 0 : _j.used) || 0,
                            reports: ((_k = usageData.usage.reports) === null || _k === void 0 ? void 0 : _k.used) || 0
                        });
                        setUsagePercentages({
                            pages: ((_l = usageData.usage.documents) === null || _l === void 0 ? void 0 : _l.percentage) || 0,
                            documents: ((_m = usageData.usage.documents) === null || _m === void 0 ? void 0 : _m.percentage) || 0,
                            models: ((_o = usageData.usage.models) === null || _o === void 0 ? void 0 : _o.percentage) || 0,
                            api_requests: ((_p = usageData.usage.api_requests) === null || _p === void 0 ? void 0 : _p.percentage) || 0,
                            reports: ((_q = usageData.usage.reports) === null || _q === void 0 ? void 0 : _q.percentage) || 0
                        });
                        if ((_r = usageData.period) === null || _r === void 0 ? void 0 : _r.end) {
                            setNextBillingDate(usageData.period.end); // Assuming ISO string now
                        }
                        setCurrentPlan(((_t = (_s = usageData.plan) === null || _s === void 0 ? void 0 : _s.name) === null || _t === void 0 ? void 0 : _t.toLowerCase()) || 'free');
                    }
                    _v.label = 3;
                case 3:
                    if (!(planResponse.status === 'fulfilled')) return [3 /*break*/, 5];
                    return [4 /*yield*/, planResponse.value.json()];
                case 4:
                    planDataResponse = _v.sent();
                    setPlanData(planDataResponse.plan_data || null);
                    // Use backend provided status and dates
                    if (planDataResponse.is_canceled !== undefined) {
                        setIsCanceled(planDataResponse.is_canceled);
                    }
                    // Prefer the date from the subscription object (ends_at) if available
                    if (planDataResponse.next_billing_date) {
                        setNextBillingDate(planDataResponse.next_billing_date);
                    }
                    _v.label = 5;
                case 5:
                    if (!(plansResponse.status === 'fulfilled' && plansResponse.value.ok)) return [3 /*break*/, 7];
                    return [4 /*yield*/, plansResponse.value.json()];
                case 6:
                    plansData = _v.sent();
                    plansArray = Object.values(plansData);
                    setPlans(plansArray);
                    _v.label = 7;
                case 7:
                    if (!(invoiceResponse.status === 'fulfilled')) return [3 /*break*/, 9];
                    return [4 /*yield*/, invoiceResponse.value.json()];
                case 8:
                    invoiceData = _v.sent();
                    // Only set if we have actual data (not null)
                    if (invoiceData && typeof invoiceData.amount === 'number') {
                        setUpcomingInvoice(invoiceData);
                    }
                    _v.label = 9;
                case 9:
                    _v.trys.push([9, 13, , 14]);
                    return [4 /*yield*/, fetch("/api/plans/invoices", {
                            headers: {
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': ((_u = document.querySelector('meta[name="csrf-token"]')) === null || _u === void 0 ? void 0 : _u.getAttribute('content')) || ''
                            }
                        })];
                case 10:
                    invoicesResponse = _v.sent();
                    if (!invoicesResponse.ok) return [3 /*break*/, 12];
                    return [4 /*yield*/, invoicesResponse.json()];
                case 11:
                    invoicesData = _v.sent();
                    validInvoices = (invoicesData || []).filter(function (invoice) {
                        return invoice && typeof invoice.amount === 'number';
                    });
                    setInvoices(validInvoices);
                    _v.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    e_1 = _v.sent();
                    console.error('Error fetching invoices:', e_1);
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 17];
                case 15:
                    error_1 = _v.sent();
                    console.error('Error fetching billing data:', error_1);
                    setError('Failed to load billing information');
                    sonner_1.toast.error('Failed to load billing information');
                    return [3 /*break*/, 17];
                case 16:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    }); };
    // Filter plans whenever currentPlan or plans list changes
    react_1.useEffect(function () {
        if (plans.length > 0) {
            setAvailablePlans(plans.filter(function (p) {
                var isCurrentPlan = p.name && p.name.toLowerCase() === (currentPlan || '').toLowerCase();
                // Hide Free plan if user is on a paid plan (assuming 'free' is the identifier for the free plan)
                var isFreePlan = p.name && p.name.toLowerCase() === 'free';
                var userIsOnPaidPlan = currentPlan && currentPlan.toLowerCase() !== 'free';
                if (userIsOnPaidPlan && isFreePlan)
                    return false;
                return !isCurrentPlan;
            }));
        }
    }, [currentPlan, plans]);
    var formatPrice = function (amount, currency) {
        if (currency === void 0) { currency = 'EUR'; }
        // Treat null/undefined as 0
        if (amount === null || amount === undefined || amount === 'N/A')
            amount = 0;
        // Ensure we have a number
        var numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    };
    var formatDate = function (dateString) {
        if (!dateString)
            return null;
        return new Date(dateString).toLocaleDateString(locale, { dateStyle: 'long' });
    };
    var handleUpgrade = function (priceId) {
        if (!priceId) {
            sonner_1.toast.error('Invalid plan selected');
            return;
        }
        react_2.router.visit("/" + locale + "/subscription/checkout?price_id=" + priceId);
    };
    var handleCancelSubscription = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/plans/cancel-subscription", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': ((_a = document.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || ''
                            }
                        })];
                case 1:
                    response = _b.sent();
                    if (!response.ok) return [3 /*break*/, 2];
                    setShowCancelDialog(false);
                    window.location.reload();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    setError(data.error || 'Failed to cancel subscription');
                    _b.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _b.sent();
                    setError('Failed to cancel subscription');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleShowPagesDetail = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/usage/pages-detail", {
                            headers: {
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': ((_a = document.querySelector('meta[name=\"csrf-token\"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || ''
                            }
                        })];
                case 1:
                    response = _b.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    if (data.success) {
                        setPagesDetail(data.documents || []);
                        setShowPagesModal(true);
                    }
                    _b.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_3 = _b.sent();
                    sonner_1.toast.error('Failed to load page details');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function () {
        if (isCanceled) {
            return (React.createElement(badge_1.Badge, { variant: "secondary", className: "flex items-center gap-1" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-3 w-3" }),
                "Canceled"));
        }
        return (React.createElement(badge_1.Badge, { variant: "default", className: "flex items-center gap-1 bg-green-600 hover:bg-green-700" },
            React.createElement(lucide_react_1.CheckCircle, { className: "h-3 w-3" }),
            "Active"));
    };
    var getUsageColor = function (percentage) {
        if (percentage >= 95)
            return 'text-red-600';
        if (percentage >= 80)
            return 'text-yellow-600';
        return 'text-green-600';
    };
    var translateFeature = function (feature) {
        var translations = {
            'Perfect for trying out DOCSET': t('billing.perfect_for_trying', 'Perfect for trying out DOCSET'),
            'For individuals and small businesses': t('billing.for_individuals', 'For individuals and small businesses'),
            'For teams that need full power': t('billing.for_teams', 'For teams that need full power'),
            'For enterprises and serious integrations': t('billing.for_enterprises', 'For enterprises and serious integrations'),
            '/month': t('billing.per_month', '/month'),
            'documents per month': t('billing.documents_per_month', 'documents per month'),
            'models': t('billing.models_plural', 'models'),
            'reports': t('billing.reports', 'reports'),
            'API access': t('billing.api_access', 'API access'),
            'API requests per month': t('billing.api_requests_per_month', 'API requests per month'),
            'API clients': t('billing.api_clients', 'API clients'),
            'CSV & JSON exports': t('billing.csv_json_exports', 'CSV & JSON exports'),
            'DOCSET branding on exports': t('billing.branding_exports', 'DOCSET branding on exports'),
            'Full UI': t('billing.full_ui', 'Full UI'),
            'Review before saving': t('billing.review_before_saving', 'Review before saving'),
            'Unlimited reports': t('billing.unlimited_reports', 'Unlimited reports'),
            'Unlimited models': t('billing.unlimited_models', 'Unlimited models'),
            '5,000+ documents per month': t('billing.documents_per_month_plus', '5,000+ documents per month'),
            '100,000+ API requests per month': t('billing.api_requests_per_month_plus', '100,000+ API requests per month')
        };
        return translations[feature] || feature;
    };
    var getProgressColor = function (percentage) {
        if (percentage >= 95)
            return 'bg-red-500';
        if (percentage >= 80)
            return 'bg-yellow-500';
        return 'bg-green-500';
    };
    if (loading) {
        return null;
    }
    if (error) {
        return (React.createElement("div", { className: "space-y-6" },
            React.createElement(alert_1.Alert, null,
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertTitle, null, "Error"),
                React.createElement(alert_1.AlertDescription, null, error))));
    }
    return (React.createElement(app_layout_1["default"], { breadcrumbs: BREADCRUMBS },
        React.createElement(react_3.Head, { title: t('Billing', 'Billing & Subscription') }),
        React.createElement(layout_1["default"], null,
            React.createElement("div", { className: "space-y-6" },
                page.props.auth.user && !page.props.auth.user.email_verified_at && (React.createElement(email_verification_banner_1.EmailVerificationBanner, { email: page.props.auth.user.email, locale: page.props.locale })),
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-lg font-medium" }, t('billing.title', 'Billing & Subscription')),
                    React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, t('billing.subtitle', 'Manage your plan, view usage, and control your subscription.'))),
                ((_a = page.props.flash) === null || _a === void 0 ? void 0 : _a.success) && (React.createElement(alert_1.Alert, { className: "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300" },
                    React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4" }),
                    React.createElement(alert_1.AlertTitle, null, "Success"),
                    React.createElement(alert_1.AlertDescription, null, page.props.flash.success))),
                ((_b = page.props.flash) === null || _b === void 0 ? void 0 : _b.error) && (React.createElement(alert_1.Alert, { variant: "destructive" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                    React.createElement(alert_1.AlertTitle, null, "Error"),
                    React.createElement(alert_1.AlertDescription, null, page.props.flash.error))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, { className: "flex items-center gap-3" },
                                    React.createElement("span", null, t('billing.current_plan', 'Current Plan')),
                                    getStatusBadge()),
                                React.createElement(card_1.CardDescription, null,
                                    t('billing.current_plan_description', 'You are currently on the'),
                                    " ",
                                    (planData === null || planData === void 0 ? void 0 : planData.name) || t('billing.free_plan', 'FREE'),
                                    " ",
                                    t('billing.current_plan', 'plan'),
                                    " (",
                                    formatPrice(planData === null || planData === void 0 ? void 0 : planData.price, planData === null || planData === void 0 ? void 0 : planData.currency),
                                    (planData === null || planData === void 0 ? void 0 : planData.interval) ? "/" + planData.interval : '',
                                    ")",
                                    nextBillingDate && currentPlan !== 'free' && (React.createElement("span", { className: "ml-2 block sm:inline mt-1 sm:mt-0" }, isCanceled ? (React.createElement("span", { className: "text-amber-600 dark:text-amber-400 font-medium" },
                                        "\u2022 ",
                                        t('billing.scheduled_cancel', 'Scheduled to cancel on'),
                                        ": ",
                                        formatDate(nextBillingDate))) : (React.createElement("span", null,
                                        "\u2022 ",
                                        t('billing.next_billing', 'Next billing date'),
                                        ": ",
                                        formatDate((upcomingInvoice === null || upcomingInvoice === void 0 ? void 0 : upcomingInvoice.date) || nextBillingDate))))))),
                            React.createElement("div", { className: "flex gap-2 flex-wrap" },
                                React.createElement(button_1.Button, { onClick: function () { return setShowUpgradeDialog(true); }, className: "gap-2" },
                                    React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }),
                                    currentPlan === 'free' ? t('billing.upgrade_plan', 'Upgrade Plan') : t('billing.change_plan', 'Change Plan')))))),
                React.createElement("div", { className: "grid gap-8 md:grid-cols-2 max-w-4xl mx-auto" },
                    React.createElement(tooltip_1.TooltipProvider, null,
                        React.createElement(tooltip_1.Tooltip, null,
                            React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                React.createElement(card_1.Card, { className: "cursor-pointer hover:shadow-md transition-shadow", onClick: handleShowPagesDetail },
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                            React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                                            "Pages",
                                            React.createElement(lucide_react_1.MousePointerClick, { className: "h-3 w-3 ml-auto text-muted-foreground" }))),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement("div", { className: "space-y-3" },
                                            React.createElement("div", { className: "flex justify-between text-sm" },
                                                React.createElement("span", null,
                                                    (usage === null || usage === void 0 ? void 0 : usage.pages) || 0,
                                                    " of ",
                                                    ((_c = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _c === void 0 ? void 0 : _c.documents) === -1 ? '∞' : (((_d = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _d === void 0 ? void 0 : _d.documents) || 100)),
                                                React.createElement("span", { className: getUsageColor((usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.pages) || 0) },
                                                    ((usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.pages) || 0).toFixed(0),
                                                    "%")),
                                            React.createElement(progress_1.Progress, { value: (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.pages) || 0, className: "h-2" }))))),
                            (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.pages) >= 80 && (React.createElement(tooltip_1.TooltipContent, null,
                                React.createElement("p", { className: "text-sm" }, (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.pages) >= 95
                                    ? "You've reached your page limit. Upgrade to continue."
                                    : "You're approaching your page limit. Consider upgrading soon."))))),
                    React.createElement(tooltip_1.TooltipProvider, null,
                        React.createElement(tooltip_1.Tooltip, null,
                            React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                            React.createElement(lucide_react_1.Database, { className: "h-5 w-5" }),
                                            t('billing.models', 'Models'))),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement("div", { className: "space-y-3" },
                                            React.createElement("div", { className: "flex justify-between text-sm" },
                                                React.createElement("span", null,
                                                    (usage === null || usage === void 0 ? void 0 : usage.models) || 0,
                                                    " of ",
                                                    ((_e = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _e === void 0 ? void 0 : _e.models) === -1 ? '∞' : (((_f = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _f === void 0 ? void 0 : _f.models) || 5)),
                                                React.createElement("span", { className: getUsageColor((usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.models) || 0) },
                                                    ((usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.models) || 0).toFixed(0),
                                                    "%")),
                                            React.createElement(progress_1.Progress, { value: (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.models) || 0, className: "h-2" }))))),
                            (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.models) >= 80 && (React.createElement(tooltip_1.TooltipContent, null,
                                React.createElement("p", { className: "text-sm" }, (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.models) >= 95
                                    ? "You've reached your models limit. Upgrade to continue creating new models."
                                    : "You're approaching your models limit. Consider upgrading soon."))))),
                    React.createElement(tooltip_1.TooltipProvider, null,
                        React.createElement(tooltip_1.Tooltip, null,
                            React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                            React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }),
                                            "Reports")),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement("div", { className: "space-y-3" },
                                            React.createElement("div", { className: "flex justify-between text-sm" },
                                                React.createElement("span", null,
                                                    (usage === null || usage === void 0 ? void 0 : usage.reports) || 0,
                                                    " of ",
                                                    ((_g = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _g === void 0 ? void 0 : _g.reports) === -1 ? '∞' : (((_h = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _h === void 0 ? void 0 : _h.reports) || 1)),
                                                React.createElement("span", { className: getUsageColor((usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.reports) || 0) },
                                                    ((usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.reports) || 0).toFixed(0),
                                                    "%")),
                                            React.createElement(progress_1.Progress, { value: (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.reports) || 0, className: "h-2" }))))),
                            (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.reports) >= 80 && (React.createElement(tooltip_1.TooltipContent, null,
                                React.createElement("p", { className: "text-sm" }, (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.reports) >= 95
                                    ? "You've reached your reports limit. Upgrade to create more reports."
                                    : "You're approaching your reports limit. Consider upgrading soon."))))),
                    React.createElement(tooltip_1.TooltipProvider, null,
                        React.createElement(tooltip_1.Tooltip, null,
                            React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                            React.createElement(lucide_react_1.Globe, { className: "h-5 w-5" }),
                                            t('billing.api_requests', 'API Requests'))),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement("div", { className: "space-y-3" },
                                            React.createElement("div", { className: "flex justify-between text-sm" },
                                                React.createElement("span", null,
                                                    (usage === null || usage === void 0 ? void 0 : usage.api_requests) || 0,
                                                    " of ",
                                                    ((_j = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _j === void 0 ? void 0 : _j.api_requests) === -1 ? '∞' : (((_k = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _k === void 0 ? void 0 : _k.api_requests) || 100)),
                                                React.createElement("span", { className: getUsageColor((usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.api_requests) || 0) },
                                                    ((usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.api_requests) || 0).toFixed(0),
                                                    "%")),
                                            React.createElement(progress_1.Progress, { value: (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.api_requests) || 0, className: "h-2" }))))),
                            (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.api_requests) >= 80 && (React.createElement(tooltip_1.TooltipContent, null,
                                React.createElement("p", { className: "text-sm" }, (usagePercentages === null || usagePercentages === void 0 ? void 0 : usagePercentages.api_requests) >= 95
                                    ? "You've reached your API requests limit. Upgrade to continue using the API."
                                    : "You're approaching your API requests limit. Consider upgrading soon.")))))),
                upcomingInvoice && upcomingInvoice.amount !== undefined && (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }),
                            t('billing.upcoming_invoice', 'Upcoming Invoice'))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-2xl font-bold" }, (upcomingInvoice === null || upcomingInvoice === void 0 ? void 0 : upcomingInvoice.amount) != null ?
                                    formatPrice(upcomingInvoice.amount / 100, upcomingInvoice.currency) :
                                    'N/A'),
                                React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    t('billing.due_on', 'Due on'),
                                    " ",
                                    formatDate(upcomingInvoice === null || upcomingInvoice === void 0 ? void 0 : upcomingInvoice.date) || 'N/A')),
                            React.createElement(button_1.Button, { variant: "outline", size: "sm" }, t('billing.view_details', 'View Details')))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Download, { className: "h-5 w-5" }),
                            "Invoice History")),
                    React.createElement(card_1.CardContent, null, invoices.length > 0 ? (React.createElement("div", { className: "space-y-3" }, invoices.map(function (invoice) { return (React.createElement("div", { key: invoice.id, className: "flex items-center justify-between p-3 rounded-lg border" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium" }, invoice.amount != null ?
                                formatPrice(invoice.amount / 100, invoice.currency) :
                                'N/A'),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, formatDate(invoice.date))),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", asChild: true },
                            React.createElement("a", { href: invoice.url, target: "_blank", rel: "noopener noreferrer", className: "gap-2" },
                                React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4" }),
                                t('billing.view', 'View'))))); }))) : (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, t('billing.no_invoices', 'No invoices yet'))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, t('billing.plan_features', 'Plan Features')),
                        React.createElement(card_1.CardDescription, null,
                            t('billing.whats_included', "What's included in your"),
                            " ", planData === null || planData === void 0 ? void 0 :
                            planData.name,
                            " ",
                            t('billing.current_plan', 'plan'))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "grid gap-3 sm:grid-cols-2" }, Array.isArray(planData === null || planData === void 0 ? void 0 : planData.features) && planData.features.map(function (feature, index) { return (React.createElement("div", { key: index, className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-500" }),
                            React.createElement("span", { className: "text-sm" }, feature))); })))),
                currentPlan !== 'free' && !isCanceled && (React.createElement(card_1.Card, { className: "border-red-200 dark:border-red-800" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-red-600 dark:text-red-400" },
                            React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }),
                            t('billing.cancel_subscription_title', 'Cancel Subscription')),
                        React.createElement(card_1.CardDescription, null, t('billing.cancel_subscription_description', "If you need to cancel your subscription, you can do it here. You'll continue to have access until the end of your billing period."))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(button_1.Button, { variant: "destructive", onClick: function () { return setShowCancelDialog(true); }, className: "gap-2" },
                            React.createElement(lucide_react_1.XCircle, { className: "h-4 w-4" }),
                            t('billing.cancel_subscription', 'Cancel Subscription')))))),
            React.createElement(dialog_1.Dialog, { open: showPagesModal, onOpenChange: setShowPagesModal },
                React.createElement(dialog_1.DialogContent, { className: "max-w-3xl max-h-[80vh] overflow-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Page Usage Details"),
                        React.createElement(dialog_1.DialogDescription, null, "Detailed breakdown of pages used this billing period")),
                    React.createElement("div", { className: "mt-4" }, pagesDetail.length > 0 ? (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "rounded-md border" },
                            React.createElement("table", { className: "w-full" },
                                React.createElement("thead", null,
                                    React.createElement("tr", { className: "border-b bg-muted/50" },
                                        React.createElement("th", { className: "p-3 text-left font-medium" }, "Document"),
                                        React.createElement("th", { className: "p-3 text-right font-medium" }, "Pages"),
                                        React.createElement("th", { className: "p-3 text-right font-medium" }, "Date"))),
                                React.createElement("tbody", null, pagesDetail.map(function (doc, index) { return (React.createElement("tr", { key: doc.id, className: index % 2 === 0 ? 'bg-background' : 'bg-muted/20' },
                                    React.createElement("td", { className: "p-3 text-sm" }, doc.name),
                                    React.createElement("td", { className: "p-3 text-right text-sm font-medium" }, doc.pages),
                                    React.createElement("td", { className: "p-3 text-right text-sm text-muted-foreground" }, new Date(doc.created_at).toLocaleDateString()))); })),
                                React.createElement("tfoot", null,
                                    React.createElement("tr", { className: "border-t bg-muted/50 font-semibold" },
                                        React.createElement("td", { className: "p-3" }, "Total"),
                                        React.createElement("td", { className: "p-3 text-right" }, pagesDetail.reduce(function (sum, doc) { return sum + doc.pages; }, 0)),
                                        React.createElement("td", { className: "p-3" }))))),
                        React.createElement("div", { className: "mt-4 flex items-center justify-between text-sm text-muted-foreground" },
                            React.createElement("span", null,
                                pagesDetail.length,
                                " documents this period"),
                            React.createElement("span", null,
                                "Limit: ",
                                ((_l = planData === null || planData === void 0 ? void 0 : planData.limits) === null || _l === void 0 ? void 0 : _l.documents) || 100,
                                " pages/month")))) : (React.createElement("div", { className: "text-center py-12 text-muted-foreground" },
                        React.createElement(lucide_react_1.FileText, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
                        React.createElement("p", null, "No documents found in this billing period")))))),
            React.createElement(dialog_1.Dialog, { open: showUpgradeDialog, onOpenChange: setShowUpgradeDialog },
                React.createElement(dialog_1.DialogContent, { className: "max-w-5xl max-h-[85vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, { className: "text-2xl" }, t('billing.change_plan', 'Change Your Plan')),
                        React.createElement(dialog_1.DialogDescription, { className: "text-base" },
                            t('billing.current_plan_description', 'You are currently on the'),
                            " ",
                            React.createElement("strong", { className: "text-primary" }, (planData === null || planData === void 0 ? void 0 : planData.name) || t('billing.free_plan', 'FREE')),
                            " ",
                            t('billing.plan_select', 'plan. Select a new plan that fits your needs'))),
                    React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6" },
                        planData && (React.createElement(card_1.Card, { className: "relative border-2 border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-950/20" },
                            React.createElement(badge_1.Badge, { className: "absolute -top-3 left-4 bg-green-600 hover:bg-green-600" }, t('billing.current_plan_badge', 'Current Plan')),
                            React.createElement(card_1.CardHeader, { className: "pt-6" },
                                React.createElement(card_1.CardTitle, { className: "text-green-700 dark:text-green-400" }, planData.name),
                                React.createElement(card_1.CardDescription, null, translateFeature(planData.tagline)),
                                React.createElement("div", { className: "flex items-baseline gap-1" },
                                    React.createElement("span", { className: "text-3xl font-bold text-green-700 dark:text-green-400" }, formatPrice(planData.price, planData.currency)),
                                    planData.interval && (React.createElement("span", { className: "text-muted-foreground" }, translateFeature('/' + planData.interval))))),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("ul", { className: "space-y-2 mb-4" }, Array.isArray(planData.features) && planData.features.slice(0, 5).map(function (feature, index) { return (React.createElement("li", { key: index, className: "flex items-start gap-2 text-sm" },
                                    React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" }),
                                    React.createElement("span", null, translateFeature(feature)))); })),
                                React.createElement(button_1.Button, { disabled: true, className: "w-full", variant: "outline" }, t('billing.current', 'Current'))))),
                        availablePlans.map(function (plan) { return (React.createElement(card_1.Card, { key: plan.name, className: "relative transition-all hover:shadow-lg " + (plan.recommended ? 'border-2 border-primary shadow-md' : 'border') },
                            plan.recommended && (React.createElement(badge_1.Badge, { className: "absolute -top-3 left-4 bg-primary" }, t('billing.recommended', 'Recommended'))),
                            React.createElement(card_1.CardHeader, { className: plan.recommended ? 'pt-6' : '' },
                                React.createElement(card_1.CardTitle, null, plan.name),
                                React.createElement(card_1.CardDescription, null, translateFeature(plan.tagline)),
                                React.createElement("div", { className: "flex items-baseline gap-1" },
                                    React.createElement("span", { className: "text-3xl font-bold" }, formatPrice(plan.price, plan.currency)),
                                    plan.interval && (React.createElement("span", { className: "text-muted-foreground" }, translateFeature('/' + plan.interval))))),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("ul", { className: "space-y-2 mb-4" }, Array.isArray(plan.features) && plan.features.map(function (feature, index) { return (React.createElement("li", { key: index, className: "flex items-start gap-2 text-sm" },
                                    React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" }),
                                    React.createElement("span", null, translateFeature(feature)))); })),
                                React.createElement(button_1.Button, { className: "w-full", variant: plan.recommended ? "default" : "outline", onClick: function () { return plan.stripe_price_id && handleUpgrade(plan.stripe_price_id); } },
                                    t('billing.subscribe_to', 'Subscribe to'),
                                    " ",
                                    plan.name)))); })))),
            React.createElement(dialog_1.Dialog, { open: showCancelDialog, onOpenChange: setShowCancelDialog },
                React.createElement(dialog_1.DialogContent, null,
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, t('billing.cancel_subscription_title', 'Cancel Subscription')),
                        React.createElement(dialog_1.DialogDescription, null, t('billing.cancel_confirmation', 'Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your billing period.'))),
                    React.createElement("div", { className: "flex gap-3 mt-4" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowCancelDialog(false); } }, t('billing.keep_subscription', 'Keep Subscription')),
                        React.createElement(button_1.Button, { variant: "destructive", onClick: handleCancelSubscription }, t('billing.cancel_subscription', 'Cancel Subscription'))))))));
}
exports["default"] = BillingIndex;
