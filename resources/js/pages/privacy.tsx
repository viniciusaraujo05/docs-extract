import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { FileJson, Shield, Lock, Eye, Database, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
    const { t, i18n } = useTranslation();
    const { props } = usePage<{ locale: string }>();
    const locale = props.locale || 'en';
    
    useEffect(() => {
        i18n.changeLanguage(locale);
        localStorage.setItem('selected-locale', locale);
    }, [locale, i18n]);

    return (
        <>
            <Head title="Privacy Policy - DOCSET" />
            
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
                          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
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
                                        <Shield className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <h1 className="text-5xl font-bold">{t('Privacy Policy')}</h1>
                                </div>
                                <p className="text-xl text-gray-400">
                                    {t('Last updated')}: {new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>

                            <div className="prose prose-invert prose-lg max-w-none">
                                <Section
                                    icon={<Eye className="h-5 w-5" />}
                                    title="1. Information We Collect"
                                    delay={0.1}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        We collect information you provide directly to us when you create an account, upload documents, 
                                        or use our services. This includes:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li>Account information (name, email, password)</li>
                                        <li>Documents and files you upload to our platform</li>
                                        <li>Extracted data and templates you create</li>
                                        <li>Usage data and analytics</li>
                                        <li>Payment and billing information</li>
                                    </ul>
                                </Section>

                                <Section
                                    icon={<Database className="h-5 w-5" />}
                                    title="2. How We Use Your Information"
                                    delay={0.2}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        We use the information we collect to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li>Provide, maintain, and improve our document extraction services</li>
                                        <li>Process your documents and extract structured data</li>
                                        <li>Send you technical notices and support messages</li>
                                        <li>Respond to your comments and questions</li>
                                        <li>Detect, prevent, and address technical issues or fraud</li>
                                    </ul>
                                </Section>

                                <Section
                                    icon={<Lock className="h-5 w-5" />}
                                    title="3. Data Security"
                                    delay={0.3}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        We take data security seriously. All documents and data are encrypted in transit and at rest 
                                        using industry-standard encryption (AES-256). We implement appropriate technical and 
                                        organizational measures to protect your personal information against unauthorized access, 
                                        alteration, disclosure, or destruction.
                                    </p>
                                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                        <p className="text-sm text-blue-300">
                                            <strong>Important:</strong> We never train our AI models on your documents or data. 
                                            Your documents remain private and are only used to provide you with the extraction service.
                                        </p>
                                    </div>
                                </Section>

                                <Section
                                    icon={<FileText className="h-5 w-5" />}
                                    title="4. Data Retention"
                                    delay={0.4}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        We retain your documents and extracted data for as long as your account is active or as needed 
                                        to provide you services. You can delete your documents at any time from your dashboard. 
                                        When you close your account, we will delete your data within 30 days, except where we are 
                                        required to retain it for legal or regulatory purposes.
                                    </p>
                                </Section>

                                <Section
                                    icon={<Shield className="h-5 w-5" />}
                                    title="5. Third-Party Services"
                                    delay={0.5}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        We use trusted third-party services to help us operate our platform:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li><strong>Stripe:</strong> Payment processing (they handle your payment information directly)</li>
                                        <li><strong>AWS/Cloud Storage:</strong> Secure document storage and processing</li>
                                        <li><strong>Analytics:</strong> Usage analytics to improve our service (anonymized data only)</li>
                                    </ul>
                                    <p className="text-gray-300 leading-relaxed mt-4">
                                        These providers are contractually obligated to protect your data and use it only for the 
                                        purposes we specify.
                                    </p>
                                </Section>

                                <Section
                                    icon={<Eye className="h-5 w-5" />}
                                    title="6. Your Rights"
                                    delay={0.6}
                                >
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        You have the right to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                                        <li>Access your personal data</li>
                                        <li>Correct inaccurate data</li>
                                        <li>Request deletion of your data</li>
                                        <li>Export your data in a portable format</li>
                                        <li>Object to processing of your data</li>
                                        <li>Withdraw consent at any time</li>
                                    </ul>
                                    <p className="text-gray-300 leading-relaxed mt-4">
                                        To exercise these rights, please contact us at help@docset.app
                                    </p>
                                </Section>

                                <Section
                                    icon={<FileText className="h-5 w-5" />}
                                    title="7. Cookies and Tracking"
                                    delay={0.7}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        We use cookies and similar tracking technologies to track activity on our service and hold 
                                        certain information. You can instruct your browser to refuse all cookies or to indicate when 
                                        a cookie is being sent. However, if you do not accept cookies, you may not be able to use 
                                        some portions of our service.
                                    </p>
                                </Section>

                                <Section
                                    icon={<Database className="h-5 w-5" />}
                                    title="8. Changes to This Policy"
                                    delay={0.8}
                                >
                                    <p className="text-gray-300 leading-relaxed">
                                        We may update our Privacy Policy from time to time. We will notify you of any changes by 
                                        posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
                                        advised to review this Privacy Policy periodically for any changes.
                                    </p>
                                </Section>

                                <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl">
                                    <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        If you have any questions about this Privacy Policy, please contact us at:
                                    </p>
                                    <p className="text-blue-400 mt-2">
                                        <a href="mailto:help@docset.app" className="hover:text-blue-300">
                                            help@docset.app
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
