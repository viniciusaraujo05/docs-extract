import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, X, Settings } from 'lucide-react';
import axios from 'axios';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentProps {
  locale?: string;
}

const translations = {
  en: {
    title: 'Cookie Settings',
    description: 'We use cookies to enhance your experience. Choose which cookies you want to accept.',
    necessary: 'Necessary',
    necessaryDesc: 'Required for the website to function properly',
    analytics: 'Analytics',
    analyticsDesc: 'Help us understand how you use our website',
    marketing: 'Marketing',
    marketingDesc: 'Used to deliver personalized advertisements',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    savePreferences: 'Save Preferences',
    customize: 'Customize',
    privacyPolicy: 'Privacy Policy',
  },
  pt: {
    title: 'Configurações de Cookies',
    description: 'Usamos cookies para melhorar sua experiência. Escolha quais cookies deseja aceitar.',
    necessary: 'Necessários',
    necessaryDesc: 'Necessários para o funcionamento do site',
    analytics: 'Análise',
    analyticsDesc: 'Ajudam-nos a entender como usa o nosso site',
    marketing: 'Marketing',
    marketingDesc: 'Usados para fornecer anúncios personalizados',
    acceptAll: 'Aceitar Todos',
    rejectAll: 'Rejeitar Todos',
    savePreferences: 'Guardar Preferências',
    customize: 'Personalizar',
    privacyPolicy: 'Política de Privacidade',
  },
};

export default function CookieConsent({ locale = 'en' }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const t = translations[locale as keyof typeof translations] || translations.en;

  useEffect(() => {
    checkConsentStatus();

    const handleOpenSettings = () => {
      setShowBanner(true);
      setShowSettings(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);

    return () => {
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const checkConsentStatus = async () => {
    try {
      const response = await axios.get('/cookie-consent/status');
      if (response.data.pending && !response.data.hasConsent) {
        setShowBanner(true);
      }
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error('Error checking cookie consent:', error);
    }
  };

  const handleAcceptAll = async () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    try {
      await axios.post(`/${locale}/cookie-consent/accept`, { preferences: allAccepted });
      setShowBanner(false);
      setShowSettings(false);
    } catch (error) {
      console.error('Error accepting cookies:', error);
    }
  };

  const handleRejectAll = async () => {
    try {
      await axios.post(`/${locale}/cookie-consent/reject`);
      setShowBanner(false);
      setShowSettings(false);
    } catch (error) {
      console.error('Error rejecting cookies:', error);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await axios.post(`/${locale}/cookie-consent/accept`, { preferences });
      setShowBanner(false);
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <Card className="mx-auto max-w-4xl border-2 shadow-2xl backdrop-blur-sm bg-background/95">
            {!showSettings ? (
              <>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Cookie className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{t.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {t.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowBanner(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-0">
                  <Button
                    variant="link"
                    onClick={() => setShowSettings(true)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {t.customize}
                  </Button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={handleRejectAll}>
                      {t.rejectAll}
                    </Button>
                    <Button onClick={handleAcceptAll}>
                      {t.acceptAll}
                    </Button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{t.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-base font-semibold">{t.necessary}</Label>
                      <p className="text-sm text-muted-foreground">{t.necessaryDesc}</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-base font-semibold">{t.analytics}</Label>
                      <p className="text-sm text-muted-foreground">{t.analyticsDesc}</p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={() => togglePreference('analytics')}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-base font-semibold">{t.marketing}</Label>
                      <p className="text-sm text-muted-foreground">{t.marketingDesc}</p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={() => togglePreference('marketing')}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="link"
                    onClick={() => window.open(`/${locale}/privacy`, '_blank')}
                  >
                    {t.privacyPolicy}
                  </Button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={handleRejectAll}>
                      {t.rejectAll}
                    </Button>
                    <Button onClick={handleSavePreferences}>
                      {t.savePreferences}
                    </Button>
                  </div>
                </CardFooter>
              </>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
