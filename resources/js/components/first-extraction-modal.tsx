import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { FileUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface FirstExtractionModalProps {
    locale?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

const STORAGE_KEY = 'docset_onboarding_modal_v1';

export function FirstExtractionModal({ locale = 'en', isOpen: controlledOpen, onClose }: FirstExtractionModalProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Check if modal was already shown
        const wasShown = localStorage.getItem(STORAGE_KEY);
        if (!wasShown && controlledOpen !== false) {
            // Small delay for smoother entrance after page load
            const timer = setTimeout(() => setOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, [controlledOpen]);

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem(STORAGE_KEY, 'true');
        onClose?.();
    };

    const handleStartExtraction = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        router.visit(`/${locale}/documents/create`);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl">
                {/* Gradient Header */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-20"></div>
                    <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-lg animate-in zoom-in duration-500">
                        <FileUp className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                </div>

                <div className="px-6 py-6 space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400">
                            {t('onboarding.first_extraction.title')}
                        </DialogTitle>
                        <DialogDescription className="text-center text-base text-muted-foreground pt-2">
                             {t('onboarding.first_extraction.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                             <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                             </div>
                             <span className="text-xs font-medium text-center">{t('Upload PDF/Image')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                             <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                             </div>
                             <span className="text-xs font-medium text-center">{t('Extract Data')}</span>
                        </div>
                    </div>

                    <DialogFooter className="flex-col !space-x-0 gap-3 pt-2">
                        <Button
                            onClick={handleStartExtraction}
                            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11 text-base group"
                        >
                            {t('onboarding.first_extraction.cta')}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="w-full text-muted-foreground hover:text-foreground"
                        >
                            {t('onboarding.first_extraction.later')}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
