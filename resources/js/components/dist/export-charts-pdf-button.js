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
exports.ExportChartsPDFButton = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var react_i18next_1 = require("react-i18next");
var jspdf_1 = require("jspdf");
var modern_screenshot_1 = require("modern-screenshot");
function ExportChartsPDFButton(_a) {
    var _this = this;
    var _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.variant, variant = _c === void 0 ? 'outline' : _c, _d = _a.size, size = _d === void 0 ? 'default' : _d, _e = _a.filename, filename = _e === void 0 ? 'charts_report' : _e;
    var t = react_i18next_1.useTranslation().t;
    var _f = react_1.useState(false), isExporting = _f[0], setIsExporting = _f[1];
    var exportChartsToPDF = function () { return __awaiter(_this, void 0, void 0, function () {
        var chartsContainer, pdf, charts, isFirstPage, _loop_1, _i, _a, chart, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    setIsExporting(true);
                    chartsContainer = document.querySelector('[data-charts-container]');
                    if (!chartsContainer) {
                        sonner_1.toast.error(t('No charts found to export'));
                        return [2 /*return*/];
                    }
                    pdf = new jspdf_1["default"]({
                        orientation: 'landscape',
                        unit: 'mm',
                        format: 'a4'
                    });
                    charts = chartsContainer.querySelectorAll('[data-chart-card]');
                    if (charts.length === 0) {
                        sonner_1.toast.error(t('No charts found to export'));
                        return [2 /*return*/];
                    }
                    isFirstPage = true;
                    _loop_1 = function (chart) {
                        var originalChart, blob, imgData, img, pdfWidth, pdfHeight, imgWidth, imgHeight, yPosition;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!isFirstPage) {
                                        pdf.addPage();
                                    }
                                    originalChart = chart;
                                    return [4 /*yield*/, modern_screenshot_1.domToBlob(originalChart, {
                                            scale: 2,
                                            backgroundColor: '#ffffff'
                                        })];
                                case 1:
                                    blob = _a.sent();
                                    return [4 /*yield*/, new Promise(function (resolve) {
                                            var reader = new FileReader();
                                            reader.onloadend = function () { return resolve(reader.result); };
                                            reader.readAsDataURL(blob);
                                        })];
                                case 2:
                                    imgData = _a.sent();
                                    img = new Image();
                                    return [4 /*yield*/, new Promise(function (resolve) {
                                            img.onload = resolve;
                                            img.src = imgData;
                                        })];
                                case 3:
                                    _a.sent();
                                    pdfWidth = pdf.internal.pageSize.getWidth();
                                    pdfHeight = pdf.internal.pageSize.getHeight();
                                    imgWidth = pdfWidth - 20;
                                    imgHeight = (img.height * imgWidth) / img.width;
                                    yPosition = imgHeight < pdfHeight - 20
                                        ? (pdfHeight - imgHeight) / 2
                                        : 10;
                                    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
                                    isFirstPage = false;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = Array.from(charts);
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    chart = _a[_i];
                    return [5 /*yield**/, _loop_1(chart)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Save PDF
                    pdf.save(filename + "_" + new Date().toISOString().split('T')[0] + ".pdf");
                    sonner_1.toast.success(t('Charts exported to PDF successfully!'));
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _b.sent();
                    console.error('PDF export error:', error_1);
                    sonner_1.toast.error(t('Error exporting charts to PDF'));
                    return [3 /*break*/, 7];
                case 6:
                    setIsExporting(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(button_1.Button, { variant: variant, size: size, disabled: disabled || isExporting, onClick: exportChartsToPDF }, isExporting ? (React.createElement(React.Fragment, null,
        React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        t('Exporting...'))) : (React.createElement(React.Fragment, null,
        React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
        t('Export Charts PDF')))));
}
exports.ExportChartsPDFButton = ExportChartsPDFButton;
