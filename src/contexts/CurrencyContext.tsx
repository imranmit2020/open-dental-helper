import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.73 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.25 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.35 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 110 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 6.4 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 74 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 5.2 },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', rate: 18 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.92 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rate: 8.5 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rate: 8.7 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rate: 6.3 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.35 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.8 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rate: 1.42 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 14.5 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 1180 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 8.3 }
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => string;
  convertAmount: (amount: number, fromCurrency?: string) => number;
  exchangeRates: Record<string, number>;
  updateExchangeRates: () => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      const currency = SUPPORTED_CURRENCIES.find(c => c.code === savedCurrency);
      if (currency) {
        setSelectedCurrencyState(currency);
      }
    }
    
    // Initialize exchange rates from supported currencies
    const initialRates: Record<string, number> = {};
    SUPPORTED_CURRENCIES.forEach(currency => {
      initialRates[currency.code] = currency.rate;
    });
    setExchangeRates(initialRates);
  }, []);

  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem('selectedCurrency', currency.code);
  };

  // Update exchange rates (in a real app, this would call an API)
  const updateExchangeRates = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would fetch from an API like:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      // setExchangeRates(data.rates);
      
      // For now, we'll use mock data with slight variations
      const updatedRates: Record<string, number> = {};
      SUPPORTED_CURRENCIES.forEach(currency => {
        // Add small random variation to simulate real exchange rate changes
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        updatedRates[currency.code] = currency.rate * (1 + variation);
      });
      
      setExchangeRates(updatedRates);
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertAmount = (amount: number, fromCurrency: string = 'USD'): number => {
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[selectedCurrency.code] || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  };

  const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions): string => {
    const convertedAmount = convertAmount(amount);
    
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: selectedCurrency.code,
        minimumFractionDigits: selectedCurrency.code === 'JPY' || selectedCurrency.code === 'KRW' ? 0 : 2,
        maximumFractionDigits: selectedCurrency.code === 'JPY' || selectedCurrency.code === 'KRW' ? 0 : 2,
        ...options,
      }).format(convertedAmount);
    } catch (error) {
      // Fallback for unsupported currencies
      const symbol = selectedCurrency.symbol;
      const formattedNumber = convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: selectedCurrency.code === 'JPY' || selectedCurrency.code === 'KRW' ? 0 : 2,
        maximumFractionDigits: selectedCurrency.code === 'JPY' || selectedCurrency.code === 'KRW' ? 0 : 2,
      });
      return `${symbol}${formattedNumber}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency,
      formatCurrency,
      convertAmount,
      exchangeRates,
      updateExchangeRates,
      isLoading,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}