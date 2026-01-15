import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Maximize2, RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentPreviewProps {
  file: File | null;
  filePreview: string | null;
}

export function DocumentPreview({ file, filePreview }: DocumentPreviewProps) {
  const { t } = useTranslation();
  const [imageScale, setImageScale] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.15);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPdf = file?.type === 'application/pdf';
  const isImage = file?.type?.startsWith('image/');

  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId: NodeJS.Timeout;
    const updateWidth = () => {
      // Clear previous timeout
      clearTimeout(timeoutId);
      
      // Debounce the resize
      timeoutId = setTimeout(() => {
        if (!containerRef.current) return;
        const width = Math.max(containerRef.current?.clientWidth || 600, 400);
        const newWidth = Math.min(width - 32, 800);
        
        // Only update if significantly different (avoid micro-updates)
        setPageWidth((prev) => {
          if (Math.abs(prev - newWidth) > 5) {
            return newWidth;
          }
          return prev;
        });
      }, 100);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  const handleOpenNewTab = useCallback(() => {
    if (!filePreview) return;
    window.open(filePreview, '_blank');
  }, [filePreview]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const handlePdfZoomIn = useCallback(() => {
    setPdfScale((prev) => Math.min(prev + 0.15, 3));
  }, []);

  const handlePdfZoomOut = useCallback(() => {
    setPdfScale((prev) => Math.max(prev - 0.15, 0.5));
  }, []);

  const handlePdfZoomReset = useCallback(() => {
    setPdfScale(1.15);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  if (!filePreview || !file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileText className="h-16 w-16 opacity-50 mb-2" />
        <p className="text-sm">{t('No preview available')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('Document Preview')}
          </h3>
          <p className="text-xs text-muted-foreground truncate" title={file?.name}>
            {file?.name}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 flex-shrink-0"
          onClick={handleOpenNewTab}
          title={t('Open in new tab')}
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Zoom Controls (Slider) - Only for PDF */}
      {isPdf && (
        <div className="flex items-center gap-3 px-2 py-2 bg-muted/30 rounded">
          <span className="text-xs font-medium text-muted-foreground w-8">Zoom</span>
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={handlePdfZoomOut}
            disabled={pdfScale <= 0.5}
            title="Zoom Out"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={pdfScale}
            onChange={(e) => setPdfScale(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            title="Zoom slider"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={handlePdfZoomIn}
            disabled={pdfScale >= 3}
            title="Zoom In"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <span className="text-xs font-mono text-muted-foreground w-10 text-right">
            {Math.round(pdfScale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={handlePdfZoomReset}
            title="Reset Zoom"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Preview Area */}
      <div
        ref={containerRef}
        className={cn(
          'relative flex-1 max-h-[600px] overflow-auto rounded border bg-white',
          isImage && 'bg-checkerboard flex items-center justify-center'
        )}
      >
        {isPdf ? (
          <>
            {/* Page Navigation */}
            {numPages > 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-10 flex items-center gap-1 rounded bg-background/90 px-2 py-1 backdrop-blur shadow border">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium px-1.5">
                  {pageNumber}/{numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* PDF Document */}
            <div className="flex justify-center py-4 min-w-max">
              <Document
                file={filePreview}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-4">
                    <div className="text-xs text-muted-foreground">
                      {t('Loading PDF...')}
                    </div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-4">
                    <div className="text-xs text-destructive">
                      {t('Failed to load PDF')}
                    </div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth * pdfScale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={
                    <div className="flex items-center justify-center p-4 bg-white rounded">
                      <div className="text-xs text-muted-foreground">
                        {t('Loading page...')}
                      </div>
                    </div>
                  }
                  className="shadow"
                />
              </Document>
            </div>
          </>
        ) : isImage ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={10}
            centerOnInit
            limitToBounds={false}
            wheel={{ 
              step: 0.08,
              smoothStep: 0.002
            }}
            pinch={{ 
              step: 5,
              disabled: false 
            }}
            doubleClick={{ 
              mode: 'zoomIn', 
              step: 0.7,
              animationTime: 200
            }}
            panning={{
              velocityDisabled: false
            }}
            velocityAnimation={{
              sensitivity: 1,
              animationTime: 400,
              animationType: 'easeOut'
            }}
            onTransformed={({ state }) => setImageScale(state.scale)}
          >
            {({ zoomIn, zoomOut, resetTransform, centerView }) => (
              <>
                <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-md bg-background/95 p-1 backdrop-blur shadow-lg border">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => zoomOut(0.5)}
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => zoomIn(0.5)}
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => {
                      resetTransform();
                      centerView();
                    }}
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <TransformComponent 
                  wrapperClass="!w-full !h-full" 
                  contentClass="!w-full !h-full flex items-center justify-center"
                >
                  <img
                    src={filePreview}
                    alt="Preview"
                    draggable={false}
                    className="max-h-full max-w-full select-none object-contain"
                    style={{ 
                      imageRendering: imageScale > 2 ? 'crisp-edges' : 'high-quality',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                    }}
                    loading="eager"
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

      {/* Footer Instructions */}
      <div className="text-xs text-center text-muted-foreground">
        {isPdf ? (
          <p>Pages: ← →</p>
        ) : (
          <p>Scroll/pinch to zoom • Drag to pan</p>
        )}
      </div>
    </div>
  );
}
