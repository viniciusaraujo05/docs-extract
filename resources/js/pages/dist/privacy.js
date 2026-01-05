"use strict";
exports.__esModule = true;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var react_2 = require("@inertiajs/react");
var react_i18next_1 = require("react-i18next");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
function Privacy() {
    var _a = react_i18next_1.useTranslation(), t = _a.t, i18n = _a.i18n;
    var props = react_2.usePage().props;
    var locale = props.locale || 'en';
    react_1.useEffect(function () {
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(react_2.Head, { title: "Privacy Policy - DOCSET" }),
        react_1["default"].createElement("div", { className: "min-h-screen bg-black text-white" },
            react_1["default"].createElement("header", { className: "border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50" },
                react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-6 py-4 flex items-center justify-between" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "flex items-center gap-2 cursor-pointer", onClick: function () { return react_2.router.visit("/" + locale); } },
                        react_1["default"].createElement("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.FileJson, { className: "h-5 w-5 text-white" })),
                        react_1["default"].createElement("span", { className: "font-bold text-lg" }, "DOCSET")),
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return react_2.router.visit("/" + locale); }, className: "border-white/20 text-white hover:bg-white/10" }, t('Back to home')))),
            react_1["default"].createElement("div", { className: "relative overflow-hidden" },
                react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" }),
                react_1["default"].createElement("div", { className: "absolute inset-0" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl", animate: {
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2]
                        }, transition: {
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } })),
                react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-6 py-24 relative z-10" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
                        react_1["default"].createElement("div", { className: "mb-12" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                                react_1["default"].createElement("div", { className: "w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center" },
                                    react_1["default"].createElement(lucide_react_1.Shield, { className: "h-6 w-6 text-blue-400" })),
                                react_1["default"].createElement("h1", { className: "text-5xl font-bold" }, t('Privacy Policy'))),
                            react_1["default"].createElement("p", { className: "text-xl text-gray-400" },
                                t('Last updated'),
                                ": ",
                                new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }))),
                        react_1["default"].createElement("div", { className: "prose prose-invert prose-lg max-w-none" },
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Eye, { className: "h-5 w-5" }), title: "1. Information We Collect", delay: 0.1 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "We collect information you provide directly to us when you create an account, upload documents, or use our services. This includes:"),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null, "Account information (name, email, password)"),
                                    react_1["default"].createElement("li", null, "Documents and files you upload to our platform"),
                                    react_1["default"].createElement("li", null, "Extracted data and templates you create"),
                                    react_1["default"].createElement("li", null, "Usage data and analytics"),
                                    react_1["default"].createElement("li", null, "Payment and billing information"))),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Database, { className: "h-5 w-5" }), title: "2. How We Use Your Information", delay: 0.2 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "We use the information we collect to:"),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null, "Provide, maintain, and improve our document extraction services"),
                                    react_1["default"].createElement("li", null, "Process your documents and extract structured data"),
                                    react_1["default"].createElement("li", null, "Send you technical notices and support messages"),
                                    react_1["default"].createElement("li", null, "Respond to your comments and questions"),
                                    react_1["default"].createElement("li", null, "Detect, prevent, and address technical issues or fraud"))),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Lock, { className: "h-5 w-5" }), title: "3. Data Security", delay: 0.3 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "We take data security seriously. All documents and data are encrypted in transit and at rest using industry-standard encryption (AES-256). We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."),
                                react_1["default"].createElement("div", { className: "mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl" },
                                    react_1["default"].createElement("p", { className: "text-sm text-blue-300" },
                                        react_1["default"].createElement("strong", null, "Important:"),
                                        " We never train our AI models on your documents or data. Your documents remain private and are only used to provide you with the extraction service."))),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), title: "4. Data Retention", delay: 0.4 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "We retain your documents and extracted data for as long as your account is active or as needed to provide you services. You can delete your documents at any time from your dashboard. When you close your account, we will delete your data within 30 days, except where we are required to retain it for legal or regulatory purposes.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), title: "5. Third-Party Services", delay: 0.5 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "We use trusted third-party services to help us operate our platform:"),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null,
                                        react_1["default"].createElement("strong", null, "Stripe:"),
                                        " Payment processing (they handle your payment information directly)"),
                                    react_1["default"].createElement("li", null,
                                        react_1["default"].createElement("strong", null, "AWS/Cloud Storage:"),
                                        " Secure document storage and processing"),
                                    react_1["default"].createElement("li", null,
                                        react_1["default"].createElement("strong", null, "Analytics:"),
                                        " Usage analytics to improve our service (anonymized data only)")),
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mt-4" }, "These providers are contractually obligated to protect your data and use it only for the purposes we specify.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Eye, { className: "h-5 w-5" }), title: "6. Your Rights", delay: 0.6 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "You have the right to:"),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null, "Access your personal data"),
                                    react_1["default"].createElement("li", null, "Correct inaccurate data"),
                                    react_1["default"].createElement("li", null, "Request deletion of your data"),
                                    react_1["default"].createElement("li", null, "Export your data in a portable format"),
                                    react_1["default"].createElement("li", null, "Object to processing of your data"),
                                    react_1["default"].createElement("li", null, "Withdraw consent at any time")),
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mt-4" }, "To exercise these rights, please contact us at privacy@docset.app")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), title: "7. Cookies and Tracking", delay: 0.7 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Database, { className: "h-5 w-5" }), title: "8. Changes to This Policy", delay: 0.8 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last updated\" date. You are advised to review this Privacy Policy periodically for any changes.")),
                            react_1["default"].createElement("div", { className: "mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl" },
                                react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-3" }, "Contact Us"),
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "If you have any questions about this Privacy Policy, please contact us at:"),
                                react_1["default"].createElement("p", { className: "text-blue-400 mt-2" },
                                    react_1["default"].createElement("a", { href: "mailto:privacy@docset.app", className: "hover:text-blue-300" }, "privacy@docset.app"))))))),
            react_1["default"].createElement("footer", { className: "border-t border-white/10 py-8 mt-24" },
                react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-6 text-center text-sm text-gray-400" },
                    react_1["default"].createElement("p", null,
                        "\u00A9 ",
                        new Date().getFullYear(),
                        " DOCSET. All rights reserved."))))));
}
exports["default"] = Privacy;
function Section(_a) {
    var icon = _a.icon, title = _a.title, children = _a.children, delay = _a.delay;
    return (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: delay, duration: 0.5 }, className: "mb-12" },
        react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-4" },
            react_1["default"].createElement("div", { className: "w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400" }, icon),
            react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, title)),
        react_1["default"].createElement("div", { className: "ml-13" }, children)));
}
