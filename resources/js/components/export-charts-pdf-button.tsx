import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { domToBlob } from 'modern-screenshot';

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

        const originalChart = chart as HTMLElement;

        // Use modern-screenshot library which handles oklch colors properly
        const blob = await domToBlob(originalChart, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        
        // Convert blob to data URL
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        // Create image to get dimensions
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imgData;
        });
        
        // Calculate dimensions to fit landscape A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pdfWidth - 20; // 10mm margin on each side
        const imgHeight = (img.height * imgWidth) / img.width;
        
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
