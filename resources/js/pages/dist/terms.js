"use strict";
exports.__esModule = true;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var react_2 = require("@inertiajs/react");
var react_i18next_1 = require("react-i18next");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
function Terms() {
    var _a = react_i18next_1.useTranslation(), t = _a.t, i18n = _a.i18n;
    var props = react_2.usePage().props;
    var locale = props.locale || 'en';
    react_1.useEffect(function () {
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(react_2.Head, { title: "Terms of Service - DOCSET" }),
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
                    react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl", animate: {
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
                                    react_1["default"].createElement(lucide_react_1.Scale, { className: "h-6 w-6 text-blue-400" })),
                                react_1["default"].createElement("h1", { className: "text-5xl font-bold" }, t('Terms of Service'))),
                            react_1["default"].createElement("p", { className: "text-xl text-gray-400" },
                                t('Last updated'),
                                ": ",
                                new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }))),
                        react_1["default"].createElement("div", { className: "prose prose-invert prose-lg max-w-none" },
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), title: "1. Acceptance of Terms", delay: 0.1 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "By accessing and using DOCSET (\"the Service\"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5" }), title: "2. Description of Service", delay: 0.2 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "DOCSET provides a document data extraction service that allows users to:"),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null, "Upload PDF and image documents"),
                                    react_1["default"].createElement("li", null, "Define custom extraction templates"),
                                    react_1["default"].createElement("li", null, "Extract structured data using AI technology"),
                                    react_1["default"].createElement("li", null, "Review and validate extracted data"),
                                    react_1["default"].createElement("li", null, "Export data via UI or API"),
                                    react_1["default"].createElement("li", null, "Store and manage document data"))),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Scale, { className: "h-5 w-5" }), title: "3. User Accounts", delay: 0.3 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms."),
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "You are responsible for safeguarding the password and for all activities that occur under your account. You agree not to disclose your password to any third party and to notify us immediately if you become aware of any breach of security or unauthorized use of your account.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), title: "4. Acceptable Use", delay: 0.4 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "You agree not to use the Service to:"),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null, "Upload illegal, harmful, or offensive content"),
                                    react_1["default"].createElement("li", null, "Violate any applicable laws or regulations"),
                                    react_1["default"].createElement("li", null, "Infringe upon intellectual property rights of others"),
                                    react_1["default"].createElement("li", null, "Attempt to gain unauthorized access to our systems"),
                                    react_1["default"].createElement("li", null, "Interfere with or disrupt the Service"),
                                    react_1["default"].createElement("li", null, "Use the Service to process documents you don't have rights to"),
                                    react_1["default"].createElement("li", null, "Resell or redistribute the Service without authorization"))),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), title: "5. Your Content", delay: 0.5 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "You retain all rights to the documents and data you upload to DOCSET. By uploading content, you grant us a limited license to:"),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null, "Process your documents to provide the extraction service"),
                                    react_1["default"].createElement("li", null, "Store your documents and extracted data"),
                                    react_1["default"].createElement("li", null, "Display your data back to you through our interface")),
                                react_1["default"].createElement("div", { className: "mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl" },
                                    react_1["default"].createElement("p", { className: "text-sm text-blue-300" },
                                        react_1["default"].createElement("strong", null, "Important:"),
                                        " We will never use your documents to train AI models, share them with third parties, or use them for any purpose other than providing you with our service."))),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), title: "6. Pricing and Payment", delay: 0.6 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "DOCSET offers various pricing plans, including a free tier. Paid plans are billed monthly or annually as selected by you."),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null, "All fees are non-refundable unless required by law"),
                                    react_1["default"].createElement("li", null, "Prices may change with 30 days notice"),
                                    react_1["default"].createElement("li", null, "You can cancel your subscription at any time"),
                                    react_1["default"].createElement("li", null, "Upon cancellation, you retain access until the end of your billing period"),
                                    react_1["default"].createElement("li", null, "Free tier limitations may apply"))),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }), title: "7. Service Availability", delay: 0.7 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "We strive to provide reliable service, but we do not guarantee that the Service will be uninterrupted or error-free. We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice. We are not liable for any modifications, suspension, or discontinuation of the Service.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }), title: "8. Termination", delay: 0.8 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mb-4" }, "We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including:"),
                                react_1["default"].createElement("ul", { className: "list-disc list-inside space-y-2 text-gray-300 ml-4" },
                                    react_1["default"].createElement("li", null, "Breach of these Terms"),
                                    react_1["default"].createElement("li", null, "Non-payment of fees"),
                                    react_1["default"].createElement("li", null, "Violation of applicable laws"),
                                    react_1["default"].createElement("li", null, "Fraudulent or illegal activity")),
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed mt-4" }, "Upon termination, your right to use the Service will immediately cease. You may delete your account at any time from your account settings.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Scale, { className: "h-5 w-5" }), title: "9. Limitation of Liability", delay: 0.9 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "To the maximum extent permitted by law, DOCSET shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), title: "10. Disclaimer of Warranties", delay: 1.0 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "The Service is provided \"as is\" and \"as available\" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free, or that the results obtained from the use of the Service will be accurate or reliable.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), title: "11. Data Protection", delay: 1.1 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "We are committed to protecting your data. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using the Service, you also agree to our Privacy Policy.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), title: "12. Changes to Terms", delay: 1.2 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.")),
                            react_1["default"].createElement(Section, { icon: react_1["default"].createElement(lucide_react_1.Scale, { className: "h-5 w-5" }), title: "13. Governing Law", delay: 1.3 },
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "These Terms shall be governed by and construed in accordance with the laws of Portugal, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Portugal.")),
                            react_1["default"].createElement("div", { className: "mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl" },
                                react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-3" }, "Contact Us"),
                                react_1["default"].createElement("p", { className: "text-gray-300 leading-relaxed" }, "If you have any questions about these Terms of Service, please contact us at:"),
                                react_1["default"].createElement("p", { className: "text-blue-400 mt-2" },
                                    react_1["default"].createElement("a", { href: "mailto:legal@docset.app", className: "hover:text-blue-300" }, "legal@docset.app"))))))),
            react_1["default"].createElement("footer", { className: "border-t border-white/10 py-8 mt-24" },
                react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-6 text-center text-sm text-gray-400" },
                    react_1["default"].createElement("p", null,
                        "\u00A9 ",
                        new Date().getFullYear(),
                        " DOCSET. All rights reserved."))))));
}
exports["default"] = Terms;
function Section(_a) {
    var icon = _a.icon, title = _a.title, children = _a.children, delay = _a.delay;
    return (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: delay, duration: 0.5 }, className: "mb-12" },
        react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-4" },
            react_1["default"].createElement("div", { className: "w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400" }, icon),
            react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, title)),
        react_1["default"].createElement("div", { className: "ml-13" }, children)));
}
