import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
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

const STORAGE_KEY = 'docset_onboarding_modal_dismissed';

export function FirstExtractionModal({ locale = 'en', isOpen: controlledOpen, onClose }: FirstExtractionModalProps) {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth: { hasDocuments: boolean } }>().props;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Only show if user has no documents AND hasn't dismissed it in this session
        const wasDismissed = sessionStorage.getItem(STORAGE_KEY);
        
        if (!auth.hasDocuments && !wasDismissed && controlledOpen !== false) {
            // Small delay for smoother entrance after page load
            const timer = setTimeout(() => setOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, [auth.hasDocuments, controlledOpen]);

    const handleClose = () => {
        setOpen(false);
        // Use sessionStorage instead of localStorage - only dismiss for this session
        sessionStorage.setItem(STORAGE_KEY, 'true');
        onClose?.();
    };

    const handleStartExtraction = () => {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        router.visit(`/${locale}/documents/create`);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl">
                <div className="relative h-32 bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-blue-500/10 radial-gradient-center"></div>
                    <div className="relative bg-white/5 backdrop-blur-md p-4 rounded-full border border-white/10 shadow-lg animate-in zoom-in duration-500">
                        <FileUp className="h-8 w-8 text-blue-400 drop-shadow-md" />
                    </div>
                </div>

                <div className="px-6 py-6 space-y-4 bg-zinc-950">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold text-white">
                            {t('onboarding.first_extraction.title')}
                        </DialogTitle>
                        <DialogDescription className="text-center text-base text-zinc-400 pt-2">
                             {t('onboarding.first_extraction.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-white/10">
                             <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                             </div>
                             <span className="text-xs font-medium text-center text-zinc-300">{t('Upload PDF/Image')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-white/10">
                             <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                             </div>
                             <span className="text-xs font-medium text-center text-zinc-300">{t('Extract Data')}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            onClick={handleStartExtraction}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 h-11 text-base group border-0"
                        >
                            {t('onboarding.first_extraction.cta')}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="w-full text-zinc-500 hover:text-white hover:bg-white/5"
                        >
                            {t('onboarding.first_extraction.later')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
