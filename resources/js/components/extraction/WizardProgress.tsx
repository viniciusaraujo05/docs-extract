import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface WizardProgressProps {
    currentStep: number;
    steps: string[];
}

/**
 * Componente de progresso do wizard
 * Mostra os passos e o estado atual com animações suaves
 */
export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
    const { t } = useTranslation();
    return (
        <div className="mx-auto w-full max-w-2xl px-4">
            <div className="relative">
                {/* Background line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted-foreground/20" />
                
                {/* Progress line */}
                <div 
                    className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out"
                    style={{ 
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((label, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = currentStep > stepNumber;
                        const isCurrent = currentStep === stepNumber;
                        const isPending = currentStep < stepNumber;

                        return (
                            <div 
                                key={index} 
                                className="flex flex-col items-center"
                                style={{ 
                                    animationDelay: `${index * 100}ms`,
                                }}
                            >
                                {/* Step circle */}
                                <div
                                    className={cn(
                                        'relative flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold text-sm transition-all duration-500',
                                        isCompleted && 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30',
                                        isCurrent && 'border-primary bg-primary text-primary-foreground scale-110 shadow-xl shadow-primary/40',
                                        isPending && 'border-muted-foreground/30 bg-background text-muted-foreground'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5 animate-in zoom-in-50 duration-300" />
                                    ) : isCurrent ? (
                                        <span className="animate-pulse">{stepNumber}</span>
                                    ) : (
                                        stepNumber
                                    )}
                                    
                                    {/* Pulse ring for current step */}
                                    {isCurrent && (
                                        <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
                                    )}
                                    
                                    {/* Sparkle for completed */}
                                    {isCompleted && (
                                        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-in zoom-in-50 duration-500" />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="mt-3 flex flex-col items-center">
                                    <span
                                        className={cn(
                                            'text-xs font-medium transition-all duration-300 text-center max-w-[80px]',
                                            isCompleted && 'text-primary',
                                            isCurrent && 'text-primary font-semibold',
                                            isPending && 'text-muted-foreground'
                                        )}
                                    >
                                        {label}
                                    </span>
                                    
                                    {/* Status indicator */}
                                    <span
                                        className={cn(
                                            'mt-1 text-[10px] transition-all duration-300',
                                            isCompleted && 'text-green-600',
                                            isCurrent && 'text-primary',
                                            isPending && 'text-muted-foreground/60'
                                        )}
                                    >
                                        {isCompleted ? `✓ ${t('Completed')}` : isCurrent ? t('In progress') : t('Pending')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
