import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Image as ImageIcon, Loader2, Download, AlertCircle, Folder, ChevronRight, Home, Check, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ... existing types ...
interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    iconLink: string;
    thumbnailLink?: string;
}

interface GoogleDrivePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileSelect: (file: File | File[]) => void; // Support multiple
    locale: string;
    multiple?: boolean;
}

interface Breadcrumb {
    id: string;
    name: string;
}

export function GoogleDrivePicker({ open, onOpenChange, onFileSelect, locale, multiple = false }: GoogleDrivePickerProps) {
    const { t } = useTranslation();
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Navigation State
    const [currentFolder, setCurrentFolder] = useState<string>('root');
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: 'root', name: 'My Drive' }]);
    
    // Selection State
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (open) {
            loadFiles(currentFolder);
        } else {
            // Reset state on close
            setFiles([]);
            setCurrentFolder('root');
            setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
            setSelectedFiles(new Set());
        }
    }, [open]);

    const loadFiles = async (folderId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/${locale}/integrations/list?folderId=${folderId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (response.status === 400 || response.status === 401) {
                setError('NOT_CONNECTED');
                return;
            }

            if (!response.ok) throw new Error('Failed to load files');

            const data = await response.json();
            setFiles(data.files || []);
        } catch (err) {
            console.error(err);
            setError(t('Failed to load Google Drive files'));
        } finally {
            setLoading(false);
        }
    };

    const handleFolderClick = (folder: DriveFile) => {
        const newBreadcrumbs = [...breadcrumbs, { id: folder.id, name: folder.name }];
        setBreadcrumbs(newBreadcrumbs);
        setCurrentFolder(folder.id);
        loadFiles(folder.id);
        // Clear selection when changing folders? Maybe not necessary depending on UX
    };

    const handleBreadcrumbClick = (crumb: Breadcrumb, index: number) => {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        setCurrentFolder(crumb.id);
        loadFiles(crumb.id);
    };

    const toggleSelection = (file: DriveFile) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            handleFolderClick(file);
            return;
        }

        const newSelection = new Set(selectedFiles);
        if (multiple) {
            if (newSelection.has(file.id)) {
                newSelection.delete(file.id);
            } else {
                newSelection.add(file.id);
            }
        } else {
            // Single select mode: select and verify immediately? 
            // Better to select visually and confirm with button, or double click.
            // For now, let's keep click-to-select for visual feedback
            newSelection.clear();
            newSelection.add(file.id);
        }
        setSelectedFiles(newSelection);
    };

    const handleConfirmSelection = async () => {
        if (selectedFiles.size === 0) return;

        // Download all selected files
        const selectedIdList = Array.from(selectedFiles);
        const filesToDownload = files.filter(f => selectedIdList.includes(f.id));

        if (filesToDownload.length > 0) {
            await downloadFiles(filesToDownload);
        }
    };

    const downloadFiles = async (filesToDownload: DriveFile[]) => {
        const resultFiles: File[] = [];

        for (const file of filesToDownload) {
             setDownloading(file.id);
             try {
                const response = await fetch(`/${locale}/integrations/google/download/${file.id}`);
                if (!response.ok) throw new Error('Download failed');
    
                const blob = await response.blob();
                
                let name = file.name;
                if (file.mimeType.includes('pdf') && !name.toLowerCase().endsWith('.pdf')) name += '.pdf';
                if (file.mimeType.includes('spreadsheet') && !name.toLowerCase().endsWith('.xlsx')) name += '.xlsx';
                
                resultFiles.push(new File([blob], name, { type: blob.type }));
             } catch (err) {
                 console.error(err);
                 toast.error(t('Failed to import file: {{name}}', { name: file.name }));
             }
        }

        setDownloading(null);
        if (resultFiles.length > 0) {
            if (multiple) {
                onFileSelect(resultFiles);
            } else {
                onFileSelect(resultFiles[0]);
            }
            onOpenChange(false);
            toast.success(t('{{count}} file(s) imported from Google Drive', { count: resultFiles.length }));
        }
    };

    const getFileType = (file: DriveFile) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') return t('Folder');
        if (file.mimeType === 'application/pdf') return 'PDF';
        if (file.mimeType === 'image/jpeg') return 'JPG';
        if (file.mimeType === 'image/png') return 'PNG';
        if (file.mimeType.includes('image/')) return 'Image';
        if (file.mimeType.includes('spreadsheet') || file.mimeType.includes('excel')) return 'Sheet';
        if (file.mimeType.includes('document') || file.mimeType.includes('word')) return 'Doc';
        if (file.mimeType.includes('presentation')) return 'Slide';
        
        const parts = file.name.split('.');
        if (parts.length > 1) return parts.pop()?.toUpperCase();
        return t('File');
    };

    const getFileTypeIcon = (file: DriveFile) => {
        if (file.mimeType === 'application/pdf') return <FileText className="h-12 w-12 text-red-500/80" />;
        if (file.mimeType.includes('image/')) return <ImageIcon className="h-12 w-12 text-purple-500/80" />;
        if (file.mimeType.includes('spreadsheet') || file.mimeType.includes('excel')) return <FileText className="h-12 w-12 text-green-500/80" />;
        if (file.mimeType.includes('document') || file.mimeType.includes('word')) return <FileText className="h-12 w-12 text-blue-500/80" />;
        return <FileText className="h-12 w-12 text-muted-foreground/50" />;
    };

    const handleConnect = () => {
         const returnTo = encodeURIComponent(window.location.pathname);
         window.location.href = `/${locale}/integrations/google/connect?return_to=${returnTo}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b shrink-0">
                     <div className="flex items-center justify-between">
                        <DialogTitle>{t('Google Drive')}</DialogTitle>
                     </div>
                     {/* Breadcrumbs */}
                     <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2 overflow-hidden">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.id} className="flex items-center">
                                {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                                <button 
                                    onClick={() => handleBreadcrumbClick(crumb, index)}
                                    className={cn(
                                        "hover:text-foreground hover:underline truncate max-w-[150px]",
                                        index === breadcrumbs.length - 1 && "font-medium text-foreground"
                                    )}
                                >
                                    {crumb.id === 'root' ? <Home className="h-4 w-4" /> : crumb.name}
                                </button>
                            </div>
                        ))}
                     </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 relative overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-6">
                            {loading && files.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground mt-2">{t('Loading files...')}</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                     {error === 'NOT_CONNECTED' ? (
                                        <div className="space-y-4">
                                             <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                                             <div className="space-y-2">
                                                <h3 className="font-semibold text-lg">{t('Not Connected')}</h3>
                                                <p className="text-muted-foreground max-w-xs mx-auto">
                                                    {t('Connect your Google account to access your Drive files.')}
                                                </p>
                                             </div>
                                             <Button onClick={handleConnect}>
                                                 {t('Connect to Google Drive')}
                                             </Button>
                                        </div>
                                     ) : (
                                        <div className="space-y-2">
                                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                                            <p className="text-red-500">{error}</p>
                                            <Button variant="outline" onClick={() => loadFiles(currentFolder)}>
                                                {t('Try Again')}
                                            </Button>
                                        </div>
                                     )}
                                </div>
                            ) : files.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Folder className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>{t('No files found in this folder')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {files.map((file) => {
                                        const isSelected = selectedFiles.has(file.id);
                                        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                                        const isDownloading = downloading === file.id;

                                        return (
                                            <div
                                                key={file.id}
                                                onClick={() => toggleSelection(file)}
                                                className={cn(
                                                    "group relative flex flex-col gap-2 p-4 rounded-xl border border-muted transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/30",
                                                    isSelected && "border-primary bg-primary/5 ring-1 ring-primary",
                                                    isDownloading && "opacity-70 pointer-events-none"
                                                )}
                                            >
                                                <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center relative overflow-hidden">
                                                    {file.thumbnailLink && !isFolder ? (
                                                        <img 
                                                            src={file.thumbnailLink} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    
                                                    {/* Fallback Icon for when image fails or no thumbnail */}
                                                    <div className={cn(
                                                        "fallback-icon flex items-center justify-center w-full h-full absolute inset-0 bg-muted/50",
                                                        (file.thumbnailLink && !isFolder) ? 'hidden' : ''
                                                    )}>
                                                        {isFolder ? (
                                                            <Folder className="h-12 w-12 text-blue-400 group-hover:text-blue-500 transition-colors" />
                                                        ) : (
                                                            getFileTypeIcon(file)
                                                        )}
                                                    </div>
                                                    
                                                    {/* Selection Checkbox/Indicator */}
                                                    {(isSelected || multiple) && !isFolder && (
                                                        <div className={cn(
                                                            "absolute top-2 right-2 h-6 w-6 rounded-full border-2 border-primary bg-background flex items-center justify-center transition-opacity",
                                                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                        )}>
                                                            {isSelected && <Check className="h-3 w-3 text-primary" />}
                                                        </div>
                                                    )}

                                                    {isDownloading && (
                                                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <p className="font-medium text-sm truncate" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {getFileType(file)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="p-4 border-t gap-2 sm:justify-between shrink-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                        {selectedFiles.size > 0 && (
                            <span>{t('{{count}} selected', { count: selectedFiles.size })}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button 
                            onClick={handleConfirmSelection} 
                            disabled={selectedFiles.size === 0 || !!downloading}
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('Importing...')}
                                </>
                            ) : (
                                t('Import Selected')
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
