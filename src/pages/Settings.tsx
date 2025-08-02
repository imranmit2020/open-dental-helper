import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CurrencySelector } from '@/components/CurrencySelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Globe, CreditCard, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { selectedLanguage, isRTL, formatDate, t } = useLanguage();
  const { selectedCurrency } = useCurrency();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('common.settings', 'Settings')}</h1>
          <p className="text-muted-foreground">
            {t('settings.description', 'Configure your regional preferences and system settings')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('language.languageSettings', 'Language & Region')}
            </CardTitle>
            <CardDescription>
              {t('settings.languageDescription', 'Set your preferred language and regional formatting')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="language">{t('language.selectLanguage', 'Display Language')}</Label>
              <LanguageSelector variant="default" />
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {selectedLanguage.nativeName}
                </Badge>
                {isRTL && <Badge variant="outline">RTL</Badge>}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>{t('settings.regionalInfo', 'Regional Information')}</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('settings.languageCode', 'Language Code')}:</span>
                  <span className="font-mono">{selectedLanguage.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('settings.textDirection', 'Text Direction')}:</span>
                  <span>{isRTL ? t('settings.rtl', 'Right-to-Left') : t('settings.ltr', 'Left-to-Right')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('settings.dateFormat', 'Date Format')}:</span>
                  <span>{formatDate(new Date())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('currency.title', 'Currency & Financial')}
            </CardTitle>
            <CardDescription>
              {t('settings.currencyDescription', 'Configure your preferred currency and financial display options')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="currency">{t('currency.selectCurrency', 'Primary Currency')}</Label>
              <CurrencySelector variant="default" showRefreshButton={true} />
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {selectedCurrency.symbol} {selectedCurrency.code}
                </Badge>
                <Badge variant="outline">
                  Rate: {selectedCurrency.rate.toFixed(4)}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Currency Information</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency Name:</span>
                  <span>{selectedCurrency.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-mono">{selectedCurrency.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange Rate:</span>
                  <span>{selectedCurrency.rate.toFixed(4)} USD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>Application Behavior</CardTitle>
          <CardDescription>
            How these settings affect your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Language Effects</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Interface text and labels</li>
                <li>• Date and time formatting</li>
                <li>• Number formatting</li>
                <li>• Text direction (RTL support)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Currency Effects</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All monetary amounts display</li>
                <li>• Invoice and billing formats</li>
                <li>• Financial reports and analytics</li>
                <li>• Treatment cost calculations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}