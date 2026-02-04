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
                                <img src="/docset.png" alt="Docset Logo" className="w-full h-full object-cover" />
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
                                    <h1 className="text-5xl font-bold">{t('legal.privacy.title')}</h1>
                                </div>
                                <p className="text-xl text-gray-400">
                                    {t('legal.privacy.last_updated')}: {new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="mt-4 text-lg text-gray-300">
                                    {t('legal.privacy.intro')}
                                </p>
                            </div>

                            <div className="prose prose-invert prose-lg max-w-none">
                                <Section
                                    icon={<Eye className="h-5 w-5" />}
                                    title={t('legal.privacy.sections.collection.title')}
                                    delay={0.1}
                                >
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                        {t('legal.privacy.sections.collection.content')}
                                    </p>
                                </Section>

                                <Section
                                    icon={<Database className="h-5 w-5" />}
                                    title={t('legal.privacy.sections.usage.title')}
                                    delay={0.2}
                                >
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                        {t('legal.privacy.sections.usage.content')}
                                    </p>
                                </Section>

                                <Section
                                    icon={<Lock className="h-5 w-5" />}
                                    title={t('legal.privacy.sections.processing.title')}
                                    delay={0.3}
                                >
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                        {t('legal.privacy.sections.processing.content')}
                                    </p>
                                </Section>

                                <Section
                                    icon={<FileText className="h-5 w-5" />}
                                    title={t('legal.privacy.sections.retention.title')}
                                    delay={0.4}
                                >
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                        {t('legal.privacy.sections.retention.content')}
                                    </p>
                                </Section>

                                <Section
                                    icon={<Shield className="h-5 w-5" />}
                                    title={t('legal.privacy.sections.cookies.title')}
                                    delay={0.5}
                                >
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                        {t('legal.privacy.sections.cookies.content')}
                                    </p>
                                </Section>

                                <Section
                                    icon={<Eye className="h-5 w-5" />}
                                    title={t('legal.privacy.sections.rights.title')}
                                    delay={0.6}
                                >
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                        {t('legal.privacy.sections.rights.content')}
                                    </p>
                                </Section>

                                <Section
                                    icon={<Database className="h-5 w-5" />}
                                    title={t('legal.privacy.sections.changes.title')}
                                    delay={0.7}
                                >
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                        {t('legal.privacy.sections.changes.content')}
                                    </p>
                                </Section>

                                <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl">
                                    <h3 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.contact.title')}</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {t('legal.privacy.sections.contact.text')}
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
