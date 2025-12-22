import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface DocumentPreviewProps {
    file: File | null;
    filePreview: string | null;
}

export function DocumentPreview({ file, filePreview }: DocumentPreviewProps) {
    const { t } = useTranslation();
    const [imageScale, setImageScale] = useState(1);

    const isPdf = file?.type === 'application/pdf';
    const isImage = !!file?.type?.startsWith('image/');

    const handleOpenNewTab = useCallback(() => {
        if (!filePreview) return;
        window.open(filePreview, '_blank');
    }, [filePreview]);

    if (!filePreview || !file) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileText className="h-16 w-16 opacity-50 mb-2" />
                <p className="text-sm">{t('No preview available')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t('Document Preview')}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate max-w-[240px]" title={file?.name}>
                        {file?.name}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {!isPdf && isImage && (
                        <span className="text-xs font-mono text-muted-foreground w-[56px] text-right">
                            {Math.round(imageScale * 100)}%
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleOpenNewTab}
                        title={t('Open in new tab')}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    'relative flex-1 min-h-[500px] overflow-hidden rounded-lg border bg-muted/30',
                    isImage && 'bg-checkerboard'
                )}
            >
                {isPdf ? (
                    <iframe
                        src={`${filePreview}#toolbar=1&navpanes=0&view=FitH`}
                        className="h-full w-full border-0"
                        title="PDF Preview"
                    />
                ) : isImage ? (
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.25}
                        maxScale={6}
                        centerOnInit
                        wheel={{ step: 0.12 }}
                        pinch={{ step: 5 }}
                        doubleClick={{ mode: 'zoomIn', step: 0.5 }}
                        onTransformed={({ state }) => setImageScale(state.scale)}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-md bg-background/80 p-1 backdrop-blur">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => zoomOut()}>
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => zoomIn()}>
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => resetTransform()}>
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>

                                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                    <img
                                        src={filePreview}
                                        alt="Preview"
                                        draggable={false}
                                        className="max-h-full max-w-full select-none object-contain"
                                        style={{ imageRendering: 'high-quality' }}
                                    />
                                </TransformComponent>
                            </>
                        )}
                    </TransformWrapper>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <FileText className="h-16 w-16 opacity-50 mb-2" />
                        <p className="text-sm">{t('No preview available')}</p>
                        <p className="mt-1 text-xs">Unsupported file type</p>
                    </div>
                )}
            </div>

            <div className="mt-2 text-xs text-center text-muted-foreground">
                {isPdf ? (
                    <p>Use Ctrl/Cmd + scroll inside the PDF to zoom</p>
                ) : (
                    <p>Scroll/pinch to zoom • Drag to pan • Double click to zoom</p>
                )}
            </div>
        </div>
    );
}
