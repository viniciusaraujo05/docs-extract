import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { FileJson, FileText, Scale, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
    const { t, i18n } = useTranslation();
    const { props } = usePage<{ locale: string }>();
    const locale = props.locale || 'en';
    
    useEffect(() => {
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);

    return (
        <>
            <Head title="Terms of Service - DOCSET" />
            
            <div className="min-h-screen bg-black text-white">
                <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => router.visit(`/${locale}`)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <FileJson className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">DOCSET</span>
                        </motion.div>
                        <Button
                            variant="outline"
                            onClick={() => router.visit(`/${locale}`)}
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            {t('Back to home')}
                        </Button>
                    </div>
                </header>

                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
                    <div className="absolute inset-0">
                        <motion.div 
                          className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2],
                          }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                    </div>

                    <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Scale className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <h1 className="text-5xl font-bold">{t('Terms of Service')}</h1>
                                </div>
                                <p className="text-xl text-gray-400">
                                    {t('Last updated')}: {new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>

                            <div className="prose prose-invert prose-lg max-w-none">
                                <Section
                                    icon={<FileText className="h-5 w-5" />}
                                    title="1. Acceptance of Terms"
                                    delay={0.1}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        By accessing and using DOCSET ("the Service"), you accept and agree to be bound by the terms 
                                        and provision of this agreement. If you do not agree to these Terms of Service, please do not 
                                        use the Service.
                                    </p>
                                </Section>

                                <Section
                                    icon={<CheckCircle className="h-5 w-5" />}
                                    title="2. Description of Service"
                                    delay={0.2}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        DOCSET provides a document data extraction service that allows users to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li>Upload PDF and image documents</li>
                                        <li>Define custom extraction templates</li>
                                        <li>Extract structured data using AI technology</li>
                                        <li>Review and validate extracted data</li>
                                        <li>Export data via UI or API</li>
                                        <li>Store and manage document data</li>
                                    </ul>
                                </Section>

                                <Section
                                    icon={<Scale className="h-5 w-5" />}
                                    title="3. User Accounts"
                                    delay={0.3}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        When you create an account with us, you must provide accurate, complete, and current information. 
                                        Failure to do so constitutes a breach of the Terms.
                                    </p>
                                    <p className="text-gray-300 leading-relaxed">
                                        You are responsible for safeguarding the password and for all activities that occur under your 
                                        account. You agree not to disclose your password to any third party and to notify us immediately 
                                        if you become aware of any breach of security or unauthorized use of your account.
                                    </p>
                                </Section>

                                <Section
                                    icon={<FileText className="h-5 w-5" />}
                                    title="4. Acceptable Use"
                                    delay={0.4}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        You agree not to use the Service to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li>Upload illegal, harmful, or offensive content</li>
                                        <li>Violate any applicable laws or regulations</li>
                                        <li>Infringe upon intellectual property rights of others</li>
                                        <li>Attempt to gain unauthorized access to our systems</li>
                                        <li>Interfere with or disrupt the Service</li>
                                        <li>Use the Service to process documents you don't have rights to</li>
                                        <li>Resell or redistribute the Service without authorization</li>
                                    </ul>
                                </Section>

                                <Section
                                    icon={<Shield className="h-5 w-5" />}
                                    title="5. Your Content"
                                    delay={0.5}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        You retain all rights to the documents and data you upload to DOCSET. By uploading content, 
                                        you grant us a limited license to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li>Process your documents to provide the extraction service</li>
                                        <li>Store your documents and extracted data</li>
                                        <li>Display your data back to you through our interface</li>
                                    </ul>
                                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                        <p className="text-sm text-blue-300">
                                            <strong>Important:</strong> We will never use your documents to train AI models, share them 
                                            with third parties, or use them for any purpose other than providing you with our service.
                                        </p>
                                    </div>
                                </Section>

                                <Section
                                    icon={<FileText className="h-5 w-5" />}
                                    title="6. Pricing and Payment"
                                    delay={0.6}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        DOCSET offers various pricing plans, including a free tier. Paid plans are billed monthly or 
                                        annually as selected by you.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li>All fees are non-refundable unless required by law</li>
                                        <li>Prices may change with 30 days notice</li>
                                        <li>You can cancel your subscription at any time</li>
                                        <li>Upon cancellation, you retain access until the end of your billing period</li>
                                        <li>Free tier limitations may apply</li>
                                    </ul>
                                </Section>

                                <Section
                                    icon={<AlertTriangle className="h-5 w-5" />}
                                    title="7. Service Availability"
                                    delay={0.7}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        We strive to provide reliable service, but we do not guarantee that the Service will be 
                                        uninterrupted or error-free. We reserve the right to modify, suspend, or discontinue the 
                                        Service at any time with reasonable notice. We are not liable for any modifications, 
                                        suspension, or discontinuation of the Service.
                                    </p>
                                </Section>

                                <Section
                                    icon={<XCircle className="h-5 w-5" />}
                                    title="8. Termination"
                                    delay={0.8}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        We may terminate or suspend your account and access to the Service immediately, without prior 
                                        notice or liability, for any reason, including:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li>Breach of these Terms</li>
                                        <li>Non-payment of fees</li>
                                        <li>Violation of applicable laws</li>
                                        <li>Fraudulent or illegal activity</li>
                                    </ul>
                                    <p className="text-gray-300 leading-relaxed mt-4">
                                        Upon termination, your right to use the Service will immediately cease. You may delete your 
                                        account at any time from your account settings.
                                    </p>
                                </Section>

                                <Section
                                    icon={<Scale className="h-5 w-5" />}
                                    title="9. Limitation of Liability"
                                    delay={0.9}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        To the maximum extent permitted by law, DOCSET shall not be liable for any indirect, incidental, 
                                        special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                                        directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting 
                                        from your use of the Service.
                                    </p>
                                </Section>

                                <Section
                                    icon={<FileText className="h-5 w-5" />}
                                    title="10. Disclaimer of Warranties"
                                    delay={1.0}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        The Service is provided "as is" and "as available" without warranties of any kind, either express 
                                        or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free, or 
                                        that the results obtained from the use of the Service will be accurate or reliable.
                                    </p>
                                </Section>

                                <Section
                                    icon={<Shield className="h-5 w-5" />}
                                    title="11. Data Protection"
                                    delay={1.1}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        We are committed to protecting your data. Please review our Privacy Policy to understand how we 
                                        collect, use, and protect your information. By using the Service, you also agree to our Privacy 
                                        Policy.
                                    </p>
                                </Section>

                                <Section
                                    icon={<FileText className="h-5 w-5" />}
                                    title="12. Changes to Terms"
                                    delay={1.2}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        We reserve the right to modify these Terms at any time. We will notify users of any material 
                                        changes via email or through the Service. Your continued use of the Service after such 
                                        modifications constitutes your acceptance of the updated Terms.
                                    </p>
                                </Section>

                                <Section
                                    icon={<Scale className="h-5 w-5" />}
                                    title="13. Governing Law"
                                    delay={1.3}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        These Terms shall be governed by and construed in accordance with the laws of Portugal, without 
                                        regard to its conflict of law provisions. Any disputes arising from these Terms or your use of 
                                        the Service shall be subject to the exclusive jurisdiction of the courts of Portugal.
                                    </p>
                                </Section>

                                <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl">
                                    <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        If you have any questions about these Terms of Service, please contact us at:
                                    </p>
                                    <p className="text-blue-400 mt-2">
                                        <a href="mailto:legal@docset.app" className="hover:text-blue-300">
                                            legal@docset.app
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <footer className="border-t border-white/10 py-8 mt-24">
                    <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-400">
                        <p>© {new Date().getFullYear()} DOCSET. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function Section({ 
    icon, 
    title, 
    children, 
    delay 
}: { 
    icon: React.ReactNode; 
    title: string; 
    children: React.ReactNode; 
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="mb-12"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <div className="ml-13">
                {children}
            </div>
        </motion.div>
    );
}
