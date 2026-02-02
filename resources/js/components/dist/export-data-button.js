"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ExportDataButton = void 0;
var react_1 = require("react");
var axios_1 = require("axios");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var react_i18next_1 = require("react-i18next");
function ExportDataButton(_a) {
    var _this = this;
    var data = _a.data, _b = _a.filename, filename = _b === void 0 ? 'export' : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, _d = _a.variant, variant = _d === void 0 ? 'outline' : _d, _e = _a.size, size = _e === void 0 ? 'default' : _e;
    var t = react_i18next_1.useTranslation().t;
    var _f = react_1.useState(false), isExporting = _f[0], setIsExporting = _f[1];
    var sanitizeFilename = function (name) {
        return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    };
    var downloadFile = function (content, fileName, mimeType) {
        var blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    var exportToGoogleSheets = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, 3, 4]);
                    setIsExporting(true);
                    return [4 /*yield*/, axios_1["default"].post('/api/integrations/google/export', {
                            data: data,
                            filename: filename
                        })];
                case 1:
                    response = _d.sent();
                    if (response.data.url) {
                        window.open(response.data.url, '_blank');
                        sonner_1.toast.success(t('Exported to Google Sheets successfully!'));
                    }
                    else {
                        sonner_1.toast.success(t('Exported to Google Sheets (Empty)'));
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _d.sent();
                    if (((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.status) === 400 && ((_c = (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === 'Google account not connected') {
                        sonner_1.toast.error(t('Please connect your Google account in Settings > Integrations first.'));
                    }
                    else {
                        sonner_1.toast.error(t('Error exporting to Google Sheets'));
                    }
                    console.error('Sheets export error:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setIsExporting(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var exportToCSV = function () {
        try {
            setIsExporting(true);
            var csvContent = '';
            if (Array.isArray(data)) {
                // Array of objects - tabular format
                if (data.length === 0) {
                    sonner_1.toast.error(t('No data to export'));
                    return;
                }
                // Get headers from first object
                var headers_1 = Object.keys(data[0]);
                // Header row
                csvContent = headers_1.map(function (h) { return "\"" + h + "\""; }).join(',') + '\n';
                // Data rows
                csvContent += data.map(function (row) {
                    return headers_1.map(function (header) {
                        var value = row[header];
                        // Handle different value types
                        if (value === null || value === undefined)
                            return '""';
                        if (typeof value === 'object')
                            return "\"" + JSON.stringify(value).replace(/"/g, '""') + "\"";
                        return "\"" + String(value).replace(/"/g, '""') + "\"";
                    }).join(',');
                }).join('\n');
            }
            else {
                // Single object - key-value format
                var headers = Object.keys(data);
                var values = Object.values(data);
                csvContent = [
                    headers.map(function (h) { return "\"" + h + "\""; }).join(','),
                    values.map(function (v) {
                        if (v === null || v === undefined)
                            return '""';
                        if (typeof v === 'object')
                            return "\"" + JSON.stringify(v).replace(/"/g, '""') + "\"";
                        return "\"" + String(v).replace(/"/g, '""') + "\"";
                    }).join(','),
                ].join('\n');
            }
            downloadFile(csvContent, sanitizeFilename(filename) + ".csv", 'text/csv;charset=utf-8;');
            sonner_1.toast.success(t('Exported to CSV successfully!'));
        }
        catch (error) {
            sonner_1.toast.error(t('Error exporting to CSV'));
            console.error('CSV export error:', error);
        }
        finally {
            setIsExporting(false);
        }
    };
    var exportToExcel = function () { return __awaiter(_this, void 0, void 0, function () {
        var xmlContent_1, headers_2, headers, values;
        return __generator(this, function (_a) {
            try {
                setIsExporting(true);
                xmlContent_1 = '<?xml version="1.0"?>\n';
                xmlContent_1 += '<?mso-application progid="Excel.Sheet"?>\n';
                xmlContent_1 += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
                xmlContent_1 += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
                xmlContent_1 += '<Worksheet ss:Name="Data">\n';
                xmlContent_1 += '<Table>\n';
                if (Array.isArray(data)) {
                    // Array of objects - tabular format
                    if (data.length === 0) {
                        sonner_1.toast.error(t('No data to export'));
                        return [2 /*return*/];
                    }
                    headers_2 = Object.keys(data[0]);
                    // Header row
                    xmlContent_1 += '<Row>\n';
                    headers_2.forEach(function (header) {
                        xmlContent_1 += "<Cell><Data ss:Type=\"String\">" + escapeXml(header) + "</Data></Cell>\n";
                    });
                    xmlContent_1 += '</Row>\n';
                    // Data rows
                    data.forEach(function (row) {
                        xmlContent_1 += '<Row>\n';
                        headers_2.forEach(function (header) {
                            var value = row[header];
                            var strValue = '';
                            if (value === null || value === undefined) {
                                strValue = '';
                            }
                            else if (typeof value === 'object') {
                                strValue = JSON.stringify(value);
                            }
                            else {
                                strValue = String(value);
                            }
                            var isNumber = !isNaN(Number(strValue)) && strValue.trim() !== '' && typeof value === 'number';
                            xmlContent_1 += "<Cell><Data ss:Type=\"" + (isNumber ? 'Number' : 'String') + "\">" + escapeXml(strValue) + "</Data></Cell>\n";
                        });
                        xmlContent_1 += '</Row>\n';
                    });
                }
                else {
                    headers = Object.keys(data);
                    values = Object.values(data);
                    // Header row
                    xmlContent_1 += '<Row>\n';
                    headers.forEach(function (header) {
                        xmlContent_1 += "<Cell><Data ss:Type=\"String\">" + escapeXml(header) + "</Data></Cell>\n";
                    });
                    xmlContent_1 += '</Row>\n';
                    // Data row
                    xmlContent_1 += '<Row>\n';
                    values.forEach(function (value) {
                        var strValue = '';
                        if (value === null || value === undefined) {
                            strValue = '';
                        }
                        else if (typeof value === 'object') {
                            strValue = JSON.stringify(value);
                        }
                        else {
                            strValue = String(value);
                        }
                        var isNumber = !isNaN(Number(strValue)) && strValue.trim() !== '';
                        xmlContent_1 += "<Cell><Data ss:Type=\"" + (isNumber ? 'Number' : 'String') + "\">" + escapeXml(strValue) + "</Data></Cell>\n";
                    });
                    xmlContent_1 += '</Row>\n';
                }
                xmlContent_1 += '</Table>\n';
                xmlContent_1 += '</Worksheet>\n';
                xmlContent_1 += '</Workbook>';
                downloadFile(xmlContent_1, sanitizeFilename(filename) + ".xls", 'application/vnd.ms-excel');
                sonner_1.toast.success(t('Exported to Excel successfully!'));
            }
            catch (error) {
                sonner_1.toast.error(t('Error exporting to Excel'));
                console.error('Excel export error:', error);
            }
            finally {
                setIsExporting(false);
            }
            return [2 /*return*/];
        });
    }); };
    var exportToJSON = function () {
        try {
            setIsExporting(true);
            var jsonContent = JSON.stringify(data, null, 2);
            downloadFile(jsonContent, sanitizeFilename(filename) + ".json", 'application/json');
            sonner_1.toast.success(t('Exported to JSON successfully!'));
        }
        catch (error) {
            sonner_1.toast.error(t('Error exporting to JSON'));
            console.error('JSON export error:', error);
        }
        finally {
            setIsExporting(false);
        }
    };
    var exportToXML = function () {
        try {
            setIsExporting(true);
            var xmlContent_2 = '<?xml version="1.0" encoding="UTF-8"?>\n';
            if (Array.isArray(data)) {
                // Array of objects - tabular format
                xmlContent_2 += '<records>\n';
                data.forEach(function (row, index) {
                    xmlContent_2 += "  <record index=\"" + (index + 1) + "\">\n";
                    Object.entries(row).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        var sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
                        var strValue = '';
                        if (value === null || value === undefined) {
                            strValue = '';
                        }
                        else if (typeof value === 'object') {
                            strValue = JSON.stringify(value);
                        }
                        else {
                            strValue = String(value);
                        }
                        xmlContent_2 += "    <" + sanitizedKey + ">" + escapeXml(strValue) + "</" + sanitizedKey + ">\n";
                    });
                    xmlContent_2 += '  </record>\n';
                });
                xmlContent_2 += '</records>';
            }
            else {
                // Single object - key-value format
                xmlContent_2 += '<data>\n';
                Object.entries(data).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    var sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
                    var strValue = '';
                    if (value === null || value === undefined) {
                        strValue = '';
                    }
                    else if (typeof value === 'object') {
                        strValue = JSON.stringify(value);
                    }
                    else {
                        strValue = String(value);
                    }
                    xmlContent_2 += "  <" + sanitizedKey + ">" + escapeXml(strValue) + "</" + sanitizedKey + ">\n";
                });
                xmlContent_2 += '</data>';
            }
            downloadFile(xmlContent_2, sanitizeFilename(filename) + ".xml", 'application/xml');
            sonner_1.toast.success(t('Exported to XML successfully!'));
        }
        catch (error) {
            sonner_1.toast.error(t('Error exporting to XML'));
            console.error('XML export error:', error);
        }
        finally {
            setIsExporting(false);
        }
    };
    var exportToHTML = function () {
        try {
            setIsExporting(true);
            var htmlContent_1 = '<!DOCTYPE html>\n';
            htmlContent_1 += '<html lang="en">\n';
            htmlContent_1 += '<head>\n';
            htmlContent_1 += '  <meta charset="UTF-8">\n';
            htmlContent_1 += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
            htmlContent_1 += "  <title>" + escapeHtml(filename) + "</title>\n";
            htmlContent_1 += '  <style>\n';
            htmlContent_1 += '    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }\n';
            htmlContent_1 += '    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n';
            htmlContent_1 += '    h1 { color: #333; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }\n';
            htmlContent_1 += '    table { width: 100%; border-collapse: collapse; margin-top: 20px; }\n';
            htmlContent_1 += '    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }\n';
            htmlContent_1 += '    th { background-color: #2563eb; color: white; font-weight: bold; }\n';
            htmlContent_1 += '    tr:hover { background-color: #f5f5f5; }\n';
            htmlContent_1 += '    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }\n';
            htmlContent_1 += '  </style>\n';
            htmlContent_1 += '</head>\n';
            htmlContent_1 += '<body>\n';
            htmlContent_1 += '  <div class="container">\n';
            htmlContent_1 += "    <h1>" + escapeHtml(filename) + "</h1>\n";
            htmlContent_1 += '    <table>\n';
            if (Array.isArray(data)) {
                // Array of objects - tabular format
                if (data.length > 0) {
                    var headers_3 = Object.keys(data[0]);
                    // Header row
                    htmlContent_1 += '      <thead>\n';
                    htmlContent_1 += '        <tr>\n';
                    headers_3.forEach(function (header) {
                        htmlContent_1 += "          <th>" + escapeHtml(header) + "</th>\n";
                    });
                    htmlContent_1 += '        </tr>\n';
                    htmlContent_1 += '      </thead>\n';
                    // Data rows
                    htmlContent_1 += '      <tbody>\n';
                    data.forEach(function (row) {
                        htmlContent_1 += '        <tr>\n';
                        headers_3.forEach(function (header) {
                            var value = row[header];
                            var strValue = '';
                            if (value === null || value === undefined) {
                                strValue = '';
                            }
                            else if (typeof value === 'object') {
                                strValue = JSON.stringify(value);
                            }
                            else {
                                strValue = String(value);
                            }
                            htmlContent_1 += "          <td>" + escapeHtml(strValue) + "</td>\n";
                        });
                        htmlContent_1 += '        </tr>\n';
                    });
                    htmlContent_1 += '      </tbody>\n';
                }
            }
            else {
                // Single object - key-value format
                htmlContent_1 += '      <thead>\n';
                htmlContent_1 += '        <tr>\n';
                htmlContent_1 += '          <th>Field</th>\n';
                htmlContent_1 += '          <th>Value</th>\n';
                htmlContent_1 += '        </tr>\n';
                htmlContent_1 += '      </thead>\n';
                htmlContent_1 += '      <tbody>\n';
                Object.entries(data).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    var strValue = '';
                    if (value === null || value === undefined) {
                        strValue = '';
                    }
                    else if (typeof value === 'object') {
                        strValue = JSON.stringify(value);
                    }
                    else {
                        strValue = String(value);
                    }
                    htmlContent_1 += '        <tr>\n';
                    htmlContent_1 += "          <td><strong>" + escapeHtml(key) + "</strong></td>\n";
                    htmlContent_1 += "          <td>" + escapeHtml(strValue) + "</td>\n";
                    htmlContent_1 += '        </tr>\n';
                });
                htmlContent_1 += '      </tbody>\n';
            }
            htmlContent_1 += '    </table>\n';
            htmlContent_1 += "    <div class=\"footer\">Generated on " + new Date().toLocaleString() + "</div>\n";
            htmlContent_1 += '  </div>\n';
            htmlContent_1 += '</body>\n';
            htmlContent_1 += '</html>';
            downloadFile(htmlContent_1, sanitizeFilename(filename) + ".html", 'text/html');
            sonner_1.toast.success(t('Exported to HTML successfully!'));
        }
        catch (error) {
            sonner_1.toast.error(t('Error exporting to HTML'));
            console.error('HTML export error:', error);
        }
        finally {
            setIsExporting(false);
        }
    };
    var escapeXml = function (str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    var escapeHtml = function (str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    var exportFormats = [
        {
            label: 'Google Sheets',
            icon: lucide_react_1.FileSpreadsheet,
            action: exportToGoogleSheets,
            description: t('Export to Google Sheets')
        },
        {
            label: 'CSV',
            icon: lucide_react_1.FileSpreadsheet,
            action: exportToCSV,
            description: t('Comma-separated values')
        },
        {
            label: 'Excel',
            icon: lucide_react_1.FileSpreadsheet,
            action: exportToExcel,
            description: t('Microsoft Excel format')
        },
        {
            label: 'JSON',
            icon: lucide_react_1.FileJson,
            action: exportToJSON,
            description: t('JavaScript Object Notation')
        },
        {
            label: 'XML',
            icon: lucide_react_1.FileCode,
            action: exportToXML,
            description: t('Extensible Markup Language')
        },
        {
            label: 'HTML',
            icon: lucide_react_1.FileText,
            action: exportToHTML,
            description: t('Web page format')
        },
    ];
    return (React.createElement(dropdown_menu_1.DropdownMenu, null,
        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
            React.createElement(button_1.Button, { variant: variant, size: size, disabled: disabled || isExporting }, isExporting ? (React.createElement(React.Fragment, null,
                React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                t('Exporting...'))) : (React.createElement(React.Fragment, null,
                React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                t('Export'))))),
        React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-56" },
            React.createElement(dropdown_menu_1.DropdownMenuLabel, null, t('Export Format')),
            React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
            exportFormats.map(function (format) { return (React.createElement(dropdown_menu_1.DropdownMenuItem, { key: format.label, onClick: format.action, disabled: isExporting, className: "cursor-pointer" },
                React.createElement(format.icon, { className: "mr-2 h-4 w-4" }),
                React.createElement("div", { className: "flex flex-col" },
                    React.createElement("span", { className: "font-medium" }, format.label),
                    React.createElement("span", { className: "text-xs text-muted-foreground" }, format.description)))); }))));
}
exports.ExportDataButton = ExportDataButton;
