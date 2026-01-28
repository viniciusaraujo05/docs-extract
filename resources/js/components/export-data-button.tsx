import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileJson, FileCode, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ExportDataButtonProps {
  data: Record<string, any> | Array<Record<string, any>>;
  filename?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportDataButton({
  data,
  filename = 'export',
  disabled = false,
  variant = 'outline',
  size = 'default',
}: ExportDataButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  };

  const downloadFile = (content: string | Blob, fileName: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToGoogleSheets = async () => {
    try {
      setIsExporting(true);
      const response = await axios.post('/integrations/google/export', {
        data,
        filename
      });

      if (response.data.url) {
        window.open(response.data.url, '_blank');
        toast.success(t('Exported to Google Sheets successfully!'));
      } else {
        toast.success(t('Exported to Google Sheets (Empty)'));
      }
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error === 'Google account not connected') {
         toast.error(t('Please connect your Google account in Settings > Integrations first.'));
      } else {
         toast.error(t('Error exporting to Google Sheets'));
      }
      console.error('Sheets export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    try {
      setIsExporting(true);
      
      let csvContent = '';
      
      if (Array.isArray(data)) {
        // Array of objects - tabular format
        if (data.length === 0) {
          toast.error(t('No data to export'));
          return;
        }
        
        // Get headers from first object
        const headers = Object.keys(data[0]);
        
        // Header row
        csvContent = headers.map(h => `"${h}"`).join(',') + '\n';
        
        // Data rows
        csvContent += data.map(row => {
          return headers.map(header => {
            const value = row[header];
            // Handle different value types
            if (value === null || value === undefined) return '""';
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',');
        }).join('\n');
        
      } else {
        // Single object - key-value format
        const headers = Object.keys(data);
        const values = Object.values(data);
        
        csvContent = [
          headers.map(h => `"${h}"`).join(','),
          values.map(v => {
            if (v === null || v === undefined) return '""';
            if (typeof v === 'object') return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
            return `"${String(v).replace(/"/g, '""')}"`;
          }).join(','),
        ].join('\n');
      }

      downloadFile(csvContent, `${sanitizeFilename(filename)}.csv`, 'text/csv;charset=utf-8;');
      toast.success(t('Exported to CSV successfully!'));
    } catch (error) {
      toast.error(t('Error exporting to CSV'));
      console.error('CSV export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      let xmlContent = '<?xml version="1.0"?>\n';
      xmlContent += '<?mso-application progid="Excel.Sheet"?>\n';
      xmlContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
      xmlContent += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
      xmlContent += '<Worksheet ss:Name="Data">\n';
      xmlContent += '<Table>\n';
      
      if (Array.isArray(data)) {
        // Array of objects - tabular format
        if (data.length === 0) {
          toast.error(t('No data to export'));
          return;
        }
        
        const headers = Object.keys(data[0]);
        
        // Header row
        xmlContent += '<Row>\n';
        headers.forEach(header => {
          xmlContent += `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>\n`;
        });
        xmlContent += '</Row>\n';
        
        // Data rows
        data.forEach(row => {
          xmlContent += '<Row>\n';
          headers.forEach(header => {
            const value = row[header];
            let strValue = '';
            
            if (value === null || value === undefined) {
              strValue = '';
            } else if (typeof value === 'object') {
              strValue = JSON.stringify(value);
            } else {
              strValue = String(value);
            }
            
            const isNumber = !isNaN(Number(strValue)) && strValue.trim() !== '' && typeof value === 'number';
            xmlContent += `<Cell><Data ss:Type="${isNumber ? 'Number' : 'String'}">${escapeXml(strValue)}</Data></Cell>\n`;
          });
          xmlContent += '</Row>\n';
        });
        
      } else {
        // Single object - key-value format
        const headers = Object.keys(data);
        const values = Object.values(data);
        
        // Header row
        xmlContent += '<Row>\n';
        headers.forEach(header => {
          xmlContent += `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>\n`;
        });
        xmlContent += '</Row>\n';
        
        // Data row
        xmlContent += '<Row>\n';
        values.forEach(value => {
          let strValue = '';
          
          if (value === null || value === undefined) {
            strValue = '';
          } else if (typeof value === 'object') {
            strValue = JSON.stringify(value);
          } else {
            strValue = String(value);
          }
          
          const isNumber = !isNaN(Number(strValue)) && strValue.trim() !== '';
          xmlContent += `<Cell><Data ss:Type="${isNumber ? 'Number' : 'String'}">${escapeXml(strValue)}</Data></Cell>\n`;
        });
        xmlContent += '</Row>\n';
      }
      
      xmlContent += '</Table>\n';
      xmlContent += '</Worksheet>\n';
      xmlContent += '</Workbook>';

      downloadFile(
        xmlContent,
        `${sanitizeFilename(filename)}.xls`,
        'application/vnd.ms-excel'
      );
      toast.success(t('Exported to Excel successfully!'));
    } catch (error) {
      toast.error(t('Error exporting to Excel'));
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    try {
      setIsExporting(true);
      const jsonContent = JSON.stringify(data, null, 2);
      downloadFile(jsonContent, `${sanitizeFilename(filename)}.json`, 'application/json');
      toast.success(t('Exported to JSON successfully!'));
    } catch (error) {
      toast.error(t('Error exporting to JSON'));
      console.error('JSON export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToXML = () => {
    try {
      setIsExporting(true);
      let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
      
      if (Array.isArray(data)) {
        // Array of objects - tabular format
        xmlContent += '<records>\n';
        
        data.forEach((row, index) => {
          xmlContent += `  <record index="${index + 1}">\n`;
          Object.entries(row).forEach(([key, value]) => {
            const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
            let strValue = '';
            
            if (value === null || value === undefined) {
              strValue = '';
            } else if (typeof value === 'object') {
              strValue = JSON.stringify(value);
            } else {
              strValue = String(value);
            }
            
            xmlContent += `    <${sanitizedKey}>${escapeXml(strValue)}</${sanitizedKey}>\n`;
          });
          xmlContent += '  </record>\n';
        });
        
        xmlContent += '</records>';
        
      } else {
        // Single object - key-value format
        xmlContent += '<data>\n';
        
        Object.entries(data).forEach(([key, value]) => {
          const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
          let strValue = '';
          
          if (value === null || value === undefined) {
            strValue = '';
          } else if (typeof value === 'object') {
            strValue = JSON.stringify(value);
          } else {
            strValue = String(value);
          }
          
          xmlContent += `  <${sanitizedKey}>${escapeXml(strValue)}</${sanitizedKey}>\n`;
        });
        
        xmlContent += '</data>';
      }
      
      downloadFile(xmlContent, `${sanitizeFilename(filename)}.xml`, 'application/xml');
      toast.success(t('Exported to XML successfully!'));
    } catch (error) {
      toast.error(t('Error exporting to XML'));
      console.error('XML export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToHTML = () => {
    try {
      setIsExporting(true);
      let htmlContent = '<!DOCTYPE html>\n';
      htmlContent += '<html lang="en">\n';
      htmlContent += '<head>\n';
      htmlContent += '  <meta charset="UTF-8">\n';
      htmlContent += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
      htmlContent += `  <title>${escapeHtml(filename)}</title>\n`;
      htmlContent += '  <style>\n';
      htmlContent += '    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }\n';
      htmlContent += '    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n';
      htmlContent += '    h1 { color: #333; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }\n';
      htmlContent += '    table { width: 100%; border-collapse: collapse; margin-top: 20px; }\n';
      htmlContent += '    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }\n';
      htmlContent += '    th { background-color: #2563eb; color: white; font-weight: bold; }\n';
      htmlContent += '    tr:hover { background-color: #f5f5f5; }\n';
      htmlContent += '    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }\n';
      htmlContent += '  </style>\n';
      htmlContent += '</head>\n';
      htmlContent += '<body>\n';
      htmlContent += '  <div class="container">\n';
      htmlContent += `    <h1>${escapeHtml(filename)}</h1>\n`;
      htmlContent += '    <table>\n';
      
      if (Array.isArray(data)) {
        // Array of objects - tabular format
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          
          // Header row
          htmlContent += '      <thead>\n';
          htmlContent += '        <tr>\n';
          headers.forEach(header => {
            htmlContent += `          <th>${escapeHtml(header)}</th>\n`;
          });
          htmlContent += '        </tr>\n';
          htmlContent += '      </thead>\n';
          
          // Data rows
          htmlContent += '      <tbody>\n';
          data.forEach(row => {
            htmlContent += '        <tr>\n';
            headers.forEach(header => {
              const value = row[header];
              let strValue = '';
              
              if (value === null || value === undefined) {
                strValue = '';
              } else if (typeof value === 'object') {
                strValue = JSON.stringify(value);
              } else {
                strValue = String(value);
              }
              
              htmlContent += `          <td>${escapeHtml(strValue)}</td>\n`;
            });
            htmlContent += '        </tr>\n';
          });
          htmlContent += '      </tbody>\n';
        }
        
      } else {
        // Single object - key-value format
        htmlContent += '      <thead>\n';
        htmlContent += '        <tr>\n';
        htmlContent += '          <th>Field</th>\n';
        htmlContent += '          <th>Value</th>\n';
        htmlContent += '        </tr>\n';
        htmlContent += '      </thead>\n';
        htmlContent += '      <tbody>\n';
        
        Object.entries(data).forEach(([key, value]) => {
          let strValue = '';
          
          if (value === null || value === undefined) {
            strValue = '';
          } else if (typeof value === 'object') {
            strValue = JSON.stringify(value);
          } else {
            strValue = String(value);
          }
          
          htmlContent += '        <tr>\n';
          htmlContent += `          <td><strong>${escapeHtml(key)}</strong></td>\n`;
          htmlContent += `          <td>${escapeHtml(strValue)}</td>\n`;
          htmlContent += '        </tr>\n';
        });
        
        htmlContent += '      </tbody>\n';
      }
      
      htmlContent += '    </table>\n';
      htmlContent += `    <div class="footer">Generated on ${new Date().toLocaleString()}</div>\n`;
      htmlContent += '  </div>\n';
      htmlContent += '</body>\n';
      htmlContent += '</html>';
      
      downloadFile(htmlContent, `${sanitizeFilename(filename)}.html`, 'text/html');
      toast.success(t('Exported to HTML successfully!'));
    } catch (error) {
      toast.error(t('Error exporting to HTML'));
      console.error('HTML export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const exportFormats = [
    {
       label: 'Google Sheets',
       icon: FileSpreadsheet,
       action: exportToGoogleSheets,
       description: t('Export to Google Sheets'),
    },
    {
      label: 'CSV',
      icon: FileSpreadsheet,
      action: exportToCSV,
      description: t('Comma-separated values'),
    },
    {
      label: 'Excel',
      icon: FileSpreadsheet,
      action: exportToExcel,
      description: t('Microsoft Excel format'),
    },
    {
      label: 'JSON',
      icon: FileJson,
      action: exportToJSON,
      description: t('JavaScript Object Notation'),
    },
    {
      label: 'XML',
      icon: FileCode,
      action: exportToXML,
      description: t('Extensible Markup Language'),
    },
    {
      label: 'HTML',
      icon: FileText,
      action: exportToHTML,
      description: t('Web page format'),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('Exporting...')}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {t('Export')}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('Export Format')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {exportFormats.map((format) => (
          <DropdownMenuItem
            key={format.label}
            onClick={format.action}
            disabled={isExporting}
            className="cursor-pointer"
          >
            <format.icon className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">{format.label}</span>
              <span className="text-xs text-muted-foreground">{format.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
