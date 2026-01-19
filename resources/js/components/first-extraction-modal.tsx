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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileUp className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center">
                        {t('onboarding.first_extraction.title')}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t('onboarding.first_extraction.description')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                    >
                        {t('onboarding.first_extraction.later')}
                    </Button>
                    <Button
                        onClick={handleStartExtraction}
                    >
                        {t('onboarding.first_extraction.cta')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
