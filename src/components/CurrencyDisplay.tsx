import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  originalCurrency?: string;
  className?: string;
  showOriginal?: boolean;
  variant?: "default" | "large" | "small" | "compact";
}

export function CurrencyDisplay({
  amount,
  originalCurrency = "USD",
  className,
  showOriginal = false,
  variant = "default"
}: CurrencyDisplayProps) {
  const { formatCurrency, selectedCurrency, convertAmount } = useCurrency();

  const convertedAmount = convertAmount(amount, originalCurrency);
  const formattedAmount = formatCurrency(amount);
  const originalFormattedAmount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: originalCurrency,
  }).format(amount);
  
  const getVariantClasses = () => {
    switch (variant) {
      case "large":
        return "text-2xl font-bold";
      case "small":
        return "text-sm";
      case "compact":
        return "text-xs font-medium";
      default:
        return "text-base font-semibold";
    }
  };

  if (originalCurrency === selectedCurrency.code || !showOriginal) {
    return (
      <span className={cn(getVariantClasses(), className)}>
        {formattedAmount}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn(getVariantClasses())}>
        {formattedAmount}
      </span>
      {showOriginal && originalCurrency !== selectedCurrency.code && (
        <span className="text-xs text-muted-foreground">
          Original: {originalFormattedAmount}
        </span>
      )}
    </div>
  );
}

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  currency?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
  className,
  currency
}: CurrencyInputProps) {
  const { selectedCurrency, formatCurrency } = useCurrency();
  
  const displayCurrency = currency || selectedCurrency.code;
  const currencySymbol = currency 
    ? SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || '$'
    : selectedCurrency.symbol;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d.]/g, '');
    const numericValue = parseFloat(rawValue) || 0;
    onChange(numericValue);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {currencySymbol}
      </div>
      <input
        type="text"
        value={value === 0 ? '' : value.toString()}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8 pr-12 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {displayCurrency}
      </div>
    </div>
  );
}

// Re-export SUPPORTED_CURRENCIES for convenience
import { SUPPORTED_CURRENCIES } from "@/contexts/CurrencyContext";
export { SUPPORTED_CURRENCIES };