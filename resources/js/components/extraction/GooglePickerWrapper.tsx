import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Google Picker API Wrapper Component
 * 
 * This component uses the official Google Picker API to allow users to select files
 * from their Google Drive. This is fully compatible with the drive.file OAuth scope
 * because the user explicitly selects files through Google's official UI.
 * 
 * Requirements:
 * 1. Add Google Picker API script to your HTML head:
 *    <script src="https://apis.google.com/js/api.js"></script>
 * 2. User must have a connected Google account with valid OAuth token
 * 3. Google Cloud Project must have Picker API enabled
 */

interface GooglePickerWrapperProps {
    locale: string;
    onFileSelect: (file: File | File[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    className?: string;
}

// Extend Window interface for Google APIs
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export function GooglePickerWrapper({ 
    locale, 
    onFileSelect, 
    multiple = false, 
    disabled = false,
    className 
}: GooglePickerWrapperProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
    const [oauthToken, setOauthToken] = useState<string | null>(null);
    const [tokenChecked, setTokenChecked] = useState(false);
    
    // Detect OS for keyboard shortcut display
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? 'Cmd' : 'Ctrl';

    useEffect(() => {
        // Load Google API and Picker
        loadGoogleApi();
        // Fetch OAuth token from backend
        fetchOAuthToken();
    }, []);

    const loadGoogleApi = () => {
        if (window.gapi) {
            window.gapi.load('picker', {
                callback: () => {
                    setPickerApiLoaded(true);
                },
            });
        } else {
            console.error('Google API not loaded. Add <script src="https://apis.google.com/js/api.js"></script> to your HTML.');
        }
    };

    const fetchOAuthToken = async () => {
        try {
            const response = await fetch(`/api/integrations/google/token`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.connected && data.token) {
                    setOauthToken(data.token);
                } else {
                    setOauthToken(null);
                }
            } else {
                setOauthToken(null);
            }
        } catch (error) {
            console.error('Error fetching OAuth token:', error);
            setOauthToken(null);
        } finally {
            setTokenChecked(true);
        }
    };

    const createPicker = () => {
        if (!pickerApiLoaded || !oauthToken) {
            toast.error(t('Google Picker not ready. Please try again.'));
            return;
        }

        // CRITICAL: Developer Key is REQUIRED for drive.file scope to work with Picker
        // Without it, the Picker cannot grant explicit permission to the selected file
        const developerKey = import.meta.env.VITE_GOOGLE_PICKER_API_KEY;
        const appId = import.meta.env.VITE_GOOGLE_APP_ID;
        
        if (!developerKey || !appId) {
            toast.error(t('Google Picker configuration error. Please contact support.'));
            return;
        }

        let pickerBuilder = new window.google.picker.PickerBuilder()
            .addView(window.google.picker.ViewId.DOCS)
            .addView(window.google.picker.ViewId.DOCS_IMAGES)
            .addView(window.google.picker.ViewId.DOCS_VIDEOS)
            .addView(window.google.picker.ViewId.SPREADSHEETS)
            .addView(window.google.picker.ViewId.PDFS)
            .setOAuthToken(oauthToken)
            .setDeveloperKey(developerKey)
            .setAppId(appId)
            .setCallback(pickerCallback);

        if (multiple) {
            pickerBuilder = pickerBuilder
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .setTitle(`${t('Select files')} (${modifierKey}+Click ${t('to select multiple')})`);
        } else {
            pickerBuilder = pickerBuilder.setTitle(t('Select a file'));
        }

        const picker = pickerBuilder.build();

        picker.setVisible(true);
    };

    const pickerCallback = async (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
            setLoading(true);
            const docs = data.docs;

            try {
                const filePromises = docs.map(async (doc: any) => {
                    const fileId = doc.id;
                    const fileName = doc.name;
                    const mimeType = doc.mimeType;
                    
                    const response = await fetch(`/${locale}/integrations/google/process-file`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ fileId }),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to process file: ${fileName}`);
                    }

                    const blob = await response.blob();
                    return new File([blob], fileName, { type: mimeType });
                });

                const files = await Promise.all(filePromises);

                if (files.length > 0) {
                    if (multiple) {
                        onFileSelect(files);
                    } else {
                        onFileSelect(files[0]);
                    }
                    toast.success(t('{{count}} file(s) imported from Google Drive', { count: files.length }));
                }
            } catch (error) {
                console.error('Error processing files:', error);
                toast.error(t('Failed to import files from Google Drive'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClick = () => {
        // Wait for token check to complete
        if (!tokenChecked) {
            toast.error(t('Loading... Please wait'));
            return;
        }

        if (!oauthToken) {
            // Redirect to connect Google account
            const returnTo = encodeURIComponent(window.location.pathname);
            window.location.href = `/${locale}/integrations/google/connect?return_to=${returnTo}`;
            return;
        }

        createPicker();
    };

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                handleClick();
            }}
            disabled={disabled || loading}
            className={className}
        >
            {loading ? (
                <>
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <div className="space-y-1">
                        <span className="font-medium block">{t('Importing...')}</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" className="h-6 w-6">
                            <path d="M23.49,12.275 C23.49,11.485 23.425,10.73 23.295,10 H12 V14.51 H18.46 C18.18,15.99 17.335,17.245 16.08,18.09 L16.08,21.09 L19.905,21.09 C22.145,19.03 23.49,15.98 23.49,12.275 Z" fill="#4285F4"/>
                            <path d="M12,24 C15.24,24 17.965,22.935 19.91,21.09 L16.08,18.09 C15.005,18.815 13.62,19.25 12,19.25 C8.865,19.25 6.215,17.135 5.265,14.29 L1.3,14.29 L1.3,17.385 C3.26,21.275 7.315,24 12,24 Z" fill="#34A853"/>
                            <path d="M5.265,14.29 C5.025,13.565 4.9,12.795 4.9,12 C4.9,11.205 5.025,10.435 5.265,9.71 L5.265,6.62 L1.3,6.62 C0.47,8.28 0,10.09 0,12 C0,13.91 0.47,15.72 1.3,17.385 L5.265,14.29 Z" fill="#FBBC05"/>
                            <path d="M12,4.75 C13.77,4.75 15.355,5.36 16.605,6.55 L20.02,3.135 C17.96,1.215 15.235,0 12,0 C7.315,0 3.26,2.725 1.3,6.62 L5.265,9.71 C6.215,6.865 8.865,4.75 12,4.75 Z" fill="#EA4335"/>
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <span className="font-medium block">{t('From Google Drive')}</span>
                        <span className="text-xs text-muted-foreground block">
                            {multiple ? `${modifierKey}+Click ${t('to select multiple')}` : t('Import from cloud')}
                        </span>
                    </div>
                </>
            )}
        </button>
    );
}
