import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FileText, ZoomIn, ZoomOut, Maximize2, X, RotateCcw } from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface DocumentPreviewProps {
    file: File | null;
    filePreview: string | null;
}

/**
 * Componente unificado de preview de documentos
 * Suporta PDF e imagens com zoom funcional via botões e scroll wheel
 */
export function DocumentPreview({ file, filePreview }: DocumentPreviewProps) {
    const { t } = useTranslation();
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const isPdf = file?.type === 'application/pdf';
    const lastTouchDistance = useRef<number>(0);

    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 25, 400));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev - 25, 25));
    }, []);

    const handleReset = useCallback(() => {
        setZoomLevel(100);
        setPanOffset({ x: 0, y: 0 });
    }, []);

    const handleDoubleClick = useCallback(() => {
        if (zoomLevel === 100) {
            setZoomLevel(200);
        } else {
            handleReset();
        }
    }, [zoomLevel, handleReset]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -10 : 10;
            setZoomLevel(prev => Math.max(25, Math.min(400, prev + delta)));
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoomLevel > 100 && !isPdf) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        }
    }, [zoomLevel, panOffset, isPdf]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            setPanOffset({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            });
        }
    }, [isPanning, panStart]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const getTouchDistance = (touches: React.TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            lastTouchDistance.current = getTouchDistance(e.touches);
        } else if (e.touches.length === 1 && zoomLevel > 100) {
            setIsPanning(true);
            setPanStart({ 
                x: e.touches[0].clientX - panOffset.x, 
                y: e.touches[0].clientY - panOffset.y 
            });
        }
    }, [zoomLevel, panOffset]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getTouchDistance(e.touches);
            const delta = currentDistance - lastTouchDistance.current;
            lastTouchDistance.current = currentDistance;
            
            setZoomLevel(prev => Math.max(25, Math.min(400, prev + delta * 0.5)));
        } else if (e.touches.length === 1 && isPanning) {
            setPanOffset({
                x: e.touches[0].clientX - panStart.x,
                y: e.touches[0].clientY - panStart.y
            });
        }
    }, [isPanning, panStart]);

    const handleTouchEnd = useCallback(() => {
        setIsPanning(false);
        lastTouchDistance.current = 0;
    }, []);

    const renderPreview = useCallback(() => {
        if (!filePreview) {
            return (
                <div className="text-center">
                    <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('No preview available')}
                    </p>
                </div>
            );
        }

        if (isPdf) {
            const pdfUrl = `${filePreview}#toolbar=0&navpanes=0&view=FitH&zoom=${zoomLevel}`;
            return (
                <iframe
                    key={`${filePreview}-${zoomLevel}`}
                    src={pdfUrl}
                    className="h-full w-full border-0"
                    title="PDF Preview"
                    style={{ minHeight: '600px' }}
                />
            );
        }

        return (
            <div 
                className="flex items-center justify-center h-full w-full overflow-hidden"
                style={{
                    cursor: zoomLevel > 100 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    ref={imageRef}
                    src={filePreview}
                    alt="Preview"
                    draggable={false}
                    className="select-none transition-transform duration-100"
                    style={{ 
                        transform: `scale(${zoomLevel / 100}) translate(${panOffset.x / (zoomLevel / 100)}px, ${panOffset.y / (zoomLevel / 100)}px)`,
                        transformOrigin: 'center center',
                        imageRendering: zoomLevel > 100 ? 'high-quality' : 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </div>
        );
    }, [filePreview, isPdf, zoomLevel, t]);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{t('Document Preview')}</h3>
                    <p className="text-sm text-muted-foreground">{file?.name}</p>
                </div>
                {filePreview && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 25}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 min-w-[180px]">
                            <Slider
                                value={[zoomLevel]}
                                onValueChange={(value) => setZoomLevel(value[0])}
                                min={25}
                                max={400}
                                step={5}
                                className="flex-1"
                            />
                            <span className="min-w-[3.5rem] text-center text-sm font-medium text-muted-foreground">
                                {zoomLevel}%
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 400}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleReset}
                            title="Reset zoom"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(filePreview, '_blank')}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div 
                className={cn(
                    "relative flex aspect-[3/4] items-center justify-center overflow-auto rounded-lg border bg-muted/30",
                    !isPdf && "touch-pan-x touch-pan-y"
                )}
                onWheel={handleWheel}
            >
                {renderPreview()}
            </div>

            <div className="mt-2 flex flex-col gap-1 text-xs text-center text-muted-foreground">
                <p>{t('Hold Ctrl/Cmd + scroll to zoom')}</p>
                {!isPdf && (
                    <p className="text-xs">
                        {t('Double-click to zoom')} • {t('Drag to pan when zoomed')}
                    </p>
                )}
            </div>

            {/* Modal Fullscreen para Imagens */}
            {isFullscreen && !isPdf && filePreview && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                    onClick={() => setIsFullscreen(false)}
                >
                    <div className="relative max-h-[95vh] max-w-[95vw] overflow-auto">
                        <img
                            src={filePreview}
                            alt="Preview"
                            className="w-auto h-auto max-w-none cursor-zoom-out"
                            style={{ imageRendering: 'high-quality' }}
                        />
                        <button
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFullscreen(false);
                            }}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
