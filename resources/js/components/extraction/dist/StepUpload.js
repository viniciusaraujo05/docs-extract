"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.StepUpload = void 0;
var button_1 = require("@/components/ui/button");
var GooglePickerWrapper_1 = require("./GooglePickerWrapper");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var badge_1 = require("@/components/ui/badge");
var extraction_1 = require("@/types/extraction");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var utils_1 = require("@/lib/utils");
var react_i18next_1 = require("react-i18next");
/**
 * Componente do Step 1 - Upload de documento
 * Permite arrastar/soltar ou clicar para selecionar ficheiros
 * e escolher o tipo de documento para extração
 */
function StepUpload(_a) {
    var _b;
    var file = _a.file, _c = _a.files, files = _c === void 0 ? [] : _c, _d = _a.batchMode, batchMode = _d === void 0 ? false : _d, _e = _a.hasTemplates, hasTemplates = _e === void 0 ? false : _e, documentTypes = _a.documentTypes, selectedTypeId = _a.selectedTypeId, newTypeName = _a.newTypeName, analyzing = _a.analyzing, analysisCompleted = _a.analysisCompleted, suggestedFieldsCount = _a.suggestedFieldsCount, error = _a.error, locale = _a.locale, _f = _a.checkingDuplicate, checkingDuplicate = _f === void 0 ? false : _f, _g = _a.duplicateExists, duplicateExists = _g === void 0 ? false : _g, _h = _a.duplicateFiles, duplicateFiles = _h === void 0 ? [] : _h, _j = _a.internalDuplicates, internalDuplicates = _j === void 0 ? [] : _j, _k = _a.modelLimitReached, modelLimitReached = _k === void 0 ? false : _k, _l = _a.isFirstDocument, isFirstDocument = _l === void 0 ? false : _l, onFileSelect = _a.onFileSelect, onFilesSelect = _a.onFilesSelect, onBatchModeToggle = _a.onBatchModeToggle, onTypeSelect = _a.onTypeSelect, onNewTypeNameChange = _a.onNewTypeNameChange, onAnalyzeDocument = _a.onAnalyzeDocument, onNext = _a.onNext, onUpgradePlan = _a.onUpgradePlan;
    var t = react_i18next_1.useTranslation().t;
    var _m = react_2.useState(false), dragActive = _m[0], setDragActive = _m[1];
    var _o = react_2.useState(documentTypes.length === 0), showNewType = _o[0], setShowNewType = _o[1];
    var _p = react_2.useState(false), showDrivePicker = _p[0], setShowDrivePicker = _p[1];
    var inputRef = react_2.useRef(null);
    var handleDrag = react_2.useCallback(function (e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }, []);
    var handleDrop = react_2.useCallback(function (e) {
        var _a, _b;
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        var droppedFile = (_b = (_a = e.dataTransfer.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
        if (droppedFile) {
            onFileSelect(droppedFile);
        }
    }, [onFileSelect]);
    var handleFileChange = react_2.useCallback(function (e) {
        var _a;
        var selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0)
            return;
        if (batchMode) {
            // Multiple files mode
            var newFiles = Array.from(selectedFiles);
            // Merge with existing files, avoiding duplicates by name
            var existingNames_1 = new Set(files.map(function (f) { return f.name; }));
            var uniqueNewFiles = newFiles.filter(function (f) { return !existingNames_1.has(f.name); });
            if (uniqueNewFiles.length > 0) {
                onFilesSelect === null || onFilesSelect === void 0 ? void 0 : onFilesSelect(__spreadArrays(files, uniqueNewFiles));
            }
        }
        else {
            // Single file mode
            var selectedFile = (_a = selectedFiles[0]) !== null && _a !== void 0 ? _a : null;
            if (selectedFile) {
                onFileSelect(selectedFile);
            }
        }
    }, [batchMode, files, onFileSelect, onFilesSelect]);
    var handleClick = react_2.useCallback(function () {
        var _a;
        (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    }, []);
    var handleDriveFileSelect = react_2.useCallback(function (fileOrFiles) {
        if (batchMode) {
            var newFiles = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
            // Filter duplicates
            var existingNames_2 = new Set(files.map(function (f) { return f.name; }));
            var uniqueNewFiles = newFiles.filter(function (f) { return !existingNames_2.has(f.name); });
            if (uniqueNewFiles.length > 0) {
                onFilesSelect === null || onFilesSelect === void 0 ? void 0 : onFilesSelect(__spreadArrays(files, uniqueNewFiles));
            }
        }
        else {
            // Single mode: take first if array
            var file_1 = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;
            onFileSelect(file_1);
        }
    }, [batchMode, files, onFilesSelect, onFileSelect]);
    var handleRemoveFile = react_2.useCallback(function (index) {
        if (batchMode && typeof index === 'number' && onFilesSelect) {
            // Remove specific file from batch
            var newFiles = files.filter(function (_, i) { return i !== index; });
            onFilesSelect(newFiles);
        }
        else {
            // Remove single file
            onFileSelect(null);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    }, [batchMode, files, onFileSelect, onFilesSelect]);
    var getFileIcon = react_2.useCallback(function () {
        if (!file)
            return React.createElement(lucide_react_1.Upload, { className: "h-12 w-12 text-primary" });
        if (file.type === 'application/pdf')
            return React.createElement(lucide_react_1.File, { className: "h-12 w-12 text-red-500" });
        if (file.type.startsWith('image/'))
            return React.createElement(lucide_react_1.FileImage, { className: "h-12 w-12 text-blue-500" });
        return React.createElement(lucide_react_1.FileText, { className: "h-12 w-12 text-primary" });
    }, [file]);
    var formatFileSize = react_2.useCallback(function (bytes) {
        if (bytes < 1024)
            return bytes + " B";
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    }, []);
    // Verifica se o tipo está configurado
    var hasTypeSelected = selectedTypeId !== null || newTypeName.trim() !== '';
    var selectedType = selectedTypeId ? documentTypes.find(function (t) { return t.id === selectedTypeId; }) : null;
    var isNewType = newTypeName.trim() !== '';
    return (React.createElement(card_1.Card, { className: "mx-auto w-full max-w-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500" },
        React.createElement(card_1.CardHeader, null,
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex-1" },
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-xl" },
                        React.createElement(lucide_react_1.Upload, { className: "h-5 w-5" }),
                        t('New Document'),
                        batchMode && 's'),
                    React.createElement(card_1.CardDescription, null, batchMode
                        ? t('Upload multiple files using the same template')
                        : t('First select the template, then upload the document'))),
                hasTemplates && onBatchModeToggle && (React.createElement("div", { className: "flex bg-muted rounded-lg p-1 gap-1" },
                    React.createElement(button_1.Button, { type: "button", variant: !batchMode ? "secondary" : "ghost", size: "sm", onClick: batchMode ? onBatchModeToggle : undefined, className: utils_1.cn("flex-1 gap-2 text-xs", !batchMode && "bg-background shadow-sm hover:bg-background") },
                        React.createElement(lucide_react_1.File, { className: "h-3.5 w-3.5" }),
                        t('Single')),
                    React.createElement(button_1.Button, { type: "button", variant: batchMode ? "secondary" : "ghost", size: "sm", onClick: !batchMode ? onBatchModeToggle : undefined, className: utils_1.cn("flex-1 gap-2 text-xs", batchMode && "bg-background shadow-sm hover:bg-background") },
                        React.createElement(lucide_react_1.Copy, { className: "h-3.5 w-3.5" }),
                        t('Multiple'))))),
            !hasTemplates && isFirstDocument && (React.createElement("div", { className: "mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30" },
                React.createElement("div", { className: "flex items-start gap-2" },
                    React.createElement(lucide_react_1.Info, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }),
                    React.createElement("p", { className: "text-sm text-blue-700 dark:text-blue-300" }, t('Your first upload will create a template')))))),
        React.createElement(card_1.CardContent, { className: "space-y-6" },
            React.createElement("div", { className: utils_1.cn("space-y-4 rounded-xl border-2 p-5 transition-all", hasTypeSelected
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : "border-primary/30 bg-primary/5") },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement(label_1.Label, { className: "flex items-center gap-2 text-base font-semibold" },
                        React.createElement("div", { className: utils_1.cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", hasTypeSelected
                                ? "bg-green-500 text-white"
                                : "bg-primary text-primary-foreground") }, hasTypeSelected ? React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }) : "1"),
                        t('Document Template')),
                    hasTypeSelected && (React.createElement(badge_1.Badge, { variant: "outline", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" }, isNewType ? t('New Template') : (((_b = selectedType === null || selectedType === void 0 ? void 0 : selectedType.fields) === null || _b === void 0 ? void 0 : _b.length) || 0) + " " + t('fields')))),
                !showNewType ? (React.createElement("div", { className: "space-y-3" },
                    modelLimitReached && (React.createElement("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30" },
                        React.createElement("div", { className: "flex items-start gap-3" },
                            React.createElement(lucide_react_1.Info, { className: "h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" }),
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement("p", { className: "text-sm font-medium text-amber-800 dark:text-amber-200" }, t('Model limit reached')),
                                React.createElement("p", { className: "text-sm text-amber-700 dark:text-amber-300" }, t('You have reached the limit of models in your plan. You can still use existing models or upgrade to create more.')))),
                        onUpgradePlan && (React.createElement(button_1.Button, { type: "button", onClick: onUpgradePlan, size: "sm", className: "mt-2" }, t('Upgrade Plan'))))),
                    documentTypes.length > 0 ? (React.createElement(React.Fragment, null,
                        React.createElement(select_1.Select, { value: (selectedTypeId === null || selectedTypeId === void 0 ? void 0 : selectedTypeId.toString()) || '', onValueChange: function (value) { return onTypeSelect(value ? parseInt(value) : null); } },
                            React.createElement(select_1.SelectTrigger, { className: "h-11" },
                                React.createElement(select_1.SelectValue, { placeholder: t('Select a template') })),
                            React.createElement(select_1.SelectContent, null, documentTypes.map(function (type) {
                                var _a;
                                return (React.createElement(select_1.SelectItem, { key: type.id, value: type.id.toString() },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Tag, { className: "h-4 w-4" }),
                                        React.createElement("span", null, type.name),
                                        React.createElement(badge_1.Badge, { variant: "secondary", className: "ml-2 text-xs" },
                                            ((_a = type.fields) === null || _a === void 0 ? void 0 : _a.length) || 0,
                                            " ",
                                            t('fields')))));
                            }))),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "h-px flex-1 bg-border" }),
                            React.createElement("span", { className: "text-xs text-muted-foreground" }, "ou"),
                            React.createElement("div", { className: "h-px flex-1 bg-border" })))) : null,
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(button_1.Button, { type: "button", variant: documentTypes.length === 0 ? 'default' : 'outline', onClick: function () {
                                setShowNewType(true);
                                onTypeSelect(null);
                            }, className: "w-full", disabled: (modelLimitReached && documentTypes.length > 0) || batchMode },
                            React.createElement(lucide_react_1.FolderPlus, { className: "mr-2 h-4 w-4" }),
                            documentTypes.length === 0 ? t('Create First Template') : t('Create New Template')),
                        batchMode && (React.createElement("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30" },
                            React.createElement("div", { className: "flex items-start gap-2" },
                                React.createElement(lucide_react_1.Info, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }),
                                React.createElement("p", { className: "text-xs text-blue-700 dark:text-blue-300" }, t('In multiple mode, you must select an existing template. All files will use the same template for consistency.')))))))) : (React.createElement("div", { className: "space-y-3" },
                    React.createElement(input_1.Input, { placeholder: t('Template name (e.g. Invoice, Payslip)'), value: newTypeName, onChange: function (e) { return onNewTypeNameChange(e.target.value); }, className: utils_1.cn("h-11", newTypeName ? 'border-green-500' : ''), autoFocus: true }),
                    isFirstDocument && (React.createElement("p", { className: "text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-500" },
                        "\uD83D\uDCA1 ",
                        t('first_document_template_hint'))),
                    newTypeName && (React.createElement("div", { className: "flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm" },
                        React.createElement(lucide_react_1.Sparkles, { className: "h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" }),
                        React.createElement("span", { className: "text-amber-700 dark:text-amber-300" }, t('AI will analyze the document and detect fields automatically.')))),
                    isFirstDocument && newTypeName && (React.createElement("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/30 animate-in fade-in slide-in-from-top-1 duration-500" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement(lucide_react_1.Info, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }),
                            React.createElement("span", { className: "text-blue-700 dark:text-blue-300" }, t('first_document_ai_hint'))))),
                    documentTypes.length > 0 && (React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () {
                            setShowNewType(false);
                            onNewTypeNameChange('');
                        } },
                        "\u2190 ",
                        t('Use existing template')))))),
            React.createElement("div", { className: utils_1.cn("space-y-4 rounded-xl border-2 p-5 transition-all", !hasTypeSelected && "opacity-50 pointer-events-none", file
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : hasTypeSelected
                        ? "border-primary/30 bg-primary/5"
                        : "border-muted") },
                React.createElement(label_1.Label, { className: "flex items-center gap-2 text-base font-semibold" },
                    React.createElement("div", { className: utils_1.cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", file
                            ? "bg-green-500 text-white"
                            : hasTypeSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground") }, file ? React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }) : "2"),
                    "Upload do Documento"),
                React.createElement("div", { onClick: hasTypeSelected && !file ? handleClick : undefined, onDragEnter: hasTypeSelected ? handleDrag : undefined, onDragLeave: hasTypeSelected ? handleDrag : undefined, onDragOver: hasTypeSelected ? handleDrag : undefined, onDrop: hasTypeSelected ? handleDrop : undefined, className: utils_1.cn('relative flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300', !hasTypeSelected && 'cursor-not-allowed', hasTypeSelected && !file && 'cursor-pointer border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50', dragActive && 'border-primary bg-primary/5 scale-[1.01]', file && 'cursor-default border-green-500/30 bg-green-50/50 dark:bg-green-950/20') },
                    React.createElement("input", { ref: inputRef, type: "file", accept: extraction_1.ACCEPTED_FILE_TYPES, onChange: handleFileChange, className: "hidden", disabled: !hasTypeSelected, multiple: batchMode }),
                    "                ",
                    !file ? (React.createElement("div", { className: "flex flex-col items-center gap-6 p-8 text-center" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("h3", { className: "text-lg font-semibold" }, t('How would you like to upload?')),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, t('Choose the source of your document'))),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md" },
                            React.createElement("button", { type: "button", onClick: function (e) {
                                    e.stopPropagation();
                                    handleClick();
                                }, disabled: !hasTypeSelected, className: utils_1.cn("flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200", hasTypeSelected
                                    ? "border-muted hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                                    : "border-muted opacity-50 cursor-not-allowed") },
                                React.createElement("div", { className: "p-3 bg-primary/10 rounded-full" },
                                    React.createElement(lucide_react_1.Upload, { className: "h-6 w-6 text-primary" })),
                                React.createElement("div", { className: "space-y-1" },
                                    React.createElement("span", { className: "font-medium block" }, t('From Computer')),
                                    React.createElement("span", { className: "text-xs text-muted-foreground block" }, t('Click to browse')))),
                            React.createElement(GooglePickerWrapper_1.GooglePickerWrapper, { locale: locale, onFileSelect: handleDriveFileSelect, multiple: batchMode, disabled: !hasTypeSelected, className: utils_1.cn("flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 h-full", hasTypeSelected
                                    ? "border-muted hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                                    : "border-muted opacity-50") })),
                        !hasTypeSelected && (React.createElement("p", { className: "text-xs text-muted-foreground mt-2" }, t('Select the template first'))))) : (React.createElement("div", { className: "flex w-full flex-col items-center gap-3 p-6" },
                        React.createElement("div", { className: "rounded-full bg-green-500/10 p-3" }, getFileIcon()),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("p", { className: "font-medium text-foreground" }, file.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, formatFileSize(file.size))),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function (e) {
                                e.stopPropagation();
                                handleRemoveFile();
                            } },
                            React.createElement(lucide_react_1.X, { className: "mr-2 h-4 w-4" }),
                            t('Change file'))))),
                batchMode && files.length > 0 && (React.createElement("div", { className: "mt-4 space-y-2" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium" },
                            t('Selected files'),
                            " (",
                            files.length,
                            ")"),
                        React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: handleClick, disabled: !hasTypeSelected },
                            React.createElement(lucide_react_1.Upload, { className: "mr-2 h-4 w-4" }),
                            t('Add more files'))),
                    React.createElement("div", { className: "max-h-60 space-y-2 overflow-y-auto rounded-lg border p-3" }, files.map(function (f, index) {
                        var isBackendDuplicate = duplicateFiles.some(function (d) { return d.toLowerCase() === f.name.toLowerCase(); });
                        var isInternalDuplicate = internalDuplicates.some(function (d) { return d.toLowerCase() === f.name.toLowerCase(); });
                        var isDuplicate = isBackendDuplicate || isInternalDuplicate;
                        return (React.createElement("div", { key: index, className: utils_1.cn("flex items-center justify-between rounded-md border p-3 transition-colors", isInternalDuplicate
                                ? "bg-red-50 border-red-300 dark:bg-red-950/20 dark:border-red-800"
                                : isBackendDuplicate
                                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                                    : "bg-card hover:bg-muted/50") },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1 min-w-0" },
                                React.createElement("div", { className: "flex-shrink-0" }, f.type.includes('pdf') ? (React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-red-500" })) : (React.createElement(lucide_react_1.Image, { className: "h-5 w-5 text-blue-500" }))),
                                React.createElement("div", { className: "flex-1 min-w-0" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("p", { className: "text-sm font-medium truncate" }, f.name),
                                        isInternalDuplicate && (React.createElement(badge_1.Badge, { variant: "outline", className: "h-5 gap-1 border-red-500 text-red-600 dark:text-red-400 bg-transparent text-[10px] px-1.5" },
                                            React.createElement(lucide_react_1.Info, { className: "h-3 w-3" }),
                                            t('Duplicate in list'))),
                                        isBackendDuplicate && !isInternalDuplicate && (React.createElement(badge_1.Badge, { variant: "outline", className: "h-5 gap-1 border-amber-500 text-amber-600 dark:text-amber-400 bg-transparent text-[10px] px-1.5" },
                                            React.createElement(lucide_react_1.Info, { className: "h-3 w-3" }),
                                            t('Already exists')))),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, formatFileSize(f.size)))),
                            React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { return handleRemoveFile(index); }, className: "flex-shrink-0" },
                                React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))));
                    })))),
                batchMode && files.length === 0 && hasTypeSelected && (React.createElement("div", { className: "mt-4 rounded-lg border border-dashed border-muted-foreground/25 p-4 text-center" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        t('No files selected'),
                        ". ",
                        t('Click or drag the document'),
                        ".")))),
            isNewType && file && !analyzing && !analysisCompleted && (React.createElement("div", { className: "space-y-3" },
                React.createElement("div", { className: "flex items-center justify-center" },
                    React.createElement(button_1.Button, { onClick: onAnalyzeDocument, className: "gap-2" },
                        React.createElement(lucide_react_1.Sparkles, { className: "h-4 w-4" }),
                        t('Analyze document with AI'))),
                React.createElement("p", { className: "text-center text-xs text-muted-foreground" }, t('For new templates, it is mandatory to analyze the document to detect fields')))),
            isNewType && file && analysisCompleted && suggestedFieldsCount > 0 && (React.createElement("div", { className: "flex items-center justify-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 p-4" },
                React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-600" }),
                React.createElement("span", { className: "text-sm font-medium text-green-700 dark:text-green-300" },
                    t('Analysis complete!'),
                    " ",
                    suggestedFieldsCount,
                    " ",
                    t('fields detected.')))),
            error && (React.createElement("div", { className: "rounded-lg border border-destructive/50 bg-destructive/10 p-4" },
                React.createElement("p", { className: "text-sm text-destructive font-medium" }, error),
                error.includes('protegido') && (React.createElement("p", { className: "text-xs text-destructive/80 mt-2" }, "\uD83D\uDCA1 Dica: Abra o PDF num editor e salve sem prote\u00E7\u00E3o, ou converta para imagem.")))),
            checkingDuplicate && (React.createElement("div", { className: "flex items-center justify-center gap-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4" },
                React.createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin text-blue-600" }),
                React.createElement("span", { className: "text-sm font-medium text-blue-700 dark:text-blue-300" }, t('Checking for duplicate documents...')))),
            analyzing && (React.createElement("div", { className: "flex items-center justify-center gap-3 rounded-lg bg-primary/5 p-4" },
                React.createElement(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin text-primary" }),
                React.createElement("span", { className: "text-sm font-medium text-primary" }, t('Analyzing document and detecting fields...')))),
            React.createElement(separator_1.Separator, null),
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return react_1.router.visit("/" + locale + "/documents"); } }, t('Cancel')),
                React.createElement(button_1.Button, { onClick: onNext, disabled: (!batchMode && !file) ||
                        (batchMode && files.length === 0) ||
                        analyzing ||
                        checkingDuplicate ||
                        duplicateExists ||
                        (batchMode && duplicateFiles.length > 0) ||
                        (batchMode && internalDuplicates.length > 0) ||
                        !hasTypeSelected ||
                        (isNewType && !analysisCompleted) }, analyzing ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "A analisar...")) : isNewType && !analysisCompleted ? (React.createElement(React.Fragment, null,
                    "Analise primeiro",
                    React.createElement(lucide_react_1.Sparkles, { className: "ml-2 h-4 w-4" }))) : (React.createElement(React.Fragment, null,
                    t('Continue'),
                    React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))))))));
}
exports.StepUpload = StepUpload;
