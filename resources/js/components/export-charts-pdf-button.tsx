import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportChartsPDFButtonProps {
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  filename?: string;
}

export function ExportChartsPDFButton({
  disabled = false,
  variant = 'outline',
  size = 'default',
  filename = 'charts_report',
}: ExportChartsPDFButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const exportChartsToPDF = async () => {
    try {
      setIsExporting(true);

      // Find all chart containers
      const chartsContainer = document.querySelector('[data-charts-container]');
      
      if (!chartsContainer) {
        toast.error(t('No charts found to export'));
        return;
      }

      // Create PDF in landscape orientation (horizontal)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const charts = chartsContainer.querySelectorAll('[data-chart-card]');
      
      if (charts.length === 0) {
        toast.error(t('No charts found to export'));
        return;
      }

      let isFirstPage = true;

      for (const chart of Array.from(charts)) {
        if (!isFirstPage) {
          pdf.addPage();
        }

        // Store reference to original element for onclone callback
        const originalChart = chart as HTMLElement;

        // Capture chart as image with onclone callback to fix oklch colors
        const canvas = await html2canvas(originalChart, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc, clonedElement) => {
            // Apply computed styles to all elements in the clone
            const applyComputedStyles = (original: Element, cloned: Element) => {
              const computedStyle = window.getComputedStyle(original);
              const clonedEl = cloned as HTMLElement;
              
              // Apply all color-related properties (browser converts oklch to rgb)
              if (computedStyle.backgroundColor) {
                clonedEl.style.backgroundColor = computedStyle.backgroundColor;
              }
              if (computedStyle.color) {
                clonedEl.style.color = computedStyle.color;
              }
              if (computedStyle.borderColor) {
                clonedEl.style.borderColor = computedStyle.borderColor;
              }
              if (computedStyle.borderTopColor) {
                clonedEl.style.borderTopColor = computedStyle.borderTopColor;
              }
              if (computedStyle.borderRightColor) {
                clonedEl.style.borderRightColor = computedStyle.borderRightColor;
              }
              if (computedStyle.borderBottomColor) {
                clonedEl.style.borderBottomColor = computedStyle.borderBottomColor;
              }
              if (computedStyle.borderLeftColor) {
                clonedEl.style.borderLeftColor = computedStyle.borderLeftColor;
              }
              if (computedStyle.outlineColor) {
                clonedEl.style.outlineColor = computedStyle.outlineColor;
              }
              
              // Recursively apply to children
              const originalChildren = original.children;
              const clonedChildren = cloned.children;
              
              for (let i = 0; i < originalChildren.length; i++) {
                if (originalChildren[i] && clonedChildren[i]) {
                  applyComputedStyles(originalChildren[i], clonedChildren[i]);
                }
              }
            };
            
            // Apply to the cloned element and all its children
            applyComputedStyles(originalChart, clonedElement);
          },
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to fit landscape A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pdfWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Center vertically if image is smaller than page
        const yPosition = imgHeight < pdfHeight - 20 
          ? (pdfHeight - imgHeight) / 2 
          : 10;

        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
        
        isFirstPage = false;
      }

      // Save PDF
      pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(t('Charts exported to PDF successfully!'));
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('Error exporting charts to PDF'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      disabled={disabled || isExporting}
      onClick={exportChartsToPDF}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('Exporting...')}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {t('Export Charts PDF')}
        </>
      )}
    </Button>
  );
}
