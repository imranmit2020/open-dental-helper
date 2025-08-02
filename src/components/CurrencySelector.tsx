import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown, DollarSign, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency, SUPPORTED_CURRENCIES, Currency } from "@/contexts/CurrencyContext";

interface CurrencySelectorProps {
  variant?: "default" | "minimal" | "compact";
  showRefreshButton?: boolean;
  className?: string;
}

export function CurrencySelector({ 
  variant = "default", 
  showRefreshButton = true,
  className 
}: CurrencySelectorProps) {
  const { selectedCurrency, setSelectedCurrency, updateExchangeRates, isLoading } = useCurrency();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setOpen(false);
  };

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
              <span className="font-medium">{selectedCurrency.symbol}</span>
              <span className="text-xs text-muted-foreground">{selectedCurrency.code}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search currencies..." />
              <CommandList>
                <CommandEmpty>No currency found.</CommandEmpty>
                <CommandGroup>
                  {filteredCurrencies.map((currency) => (
                    <CommandItem
                      key={currency.code}
                      onSelect={() => handleSelect(currency)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{currency.symbol}</span>
                        <div>
                          <div className="font-medium">{currency.code}</div>
                          <div className="text-xs text-muted-foreground">{currency.name}</div>
                        </div>
                      </div>
                      {selectedCurrency.code === currency.code && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {selectedCurrency.code}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No currency found.</CommandEmpty>
                <CommandGroup>
                  {filteredCurrencies.map((currency) => (
                    <CommandItem
                      key={currency.code}
                      onSelect={() => handleSelect(currency)}
                    >
                      <span className="mr-2">{currency.symbol}</span>
                      {currency.code}
                      {selectedCurrency.code === currency.code && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Currency:</span>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-64 justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">{selectedCurrency.symbol}</span>
              <span>{selectedCurrency.code}</span>
              <span className="text-sm text-muted-foreground">-</span>
              <span className="text-sm text-muted-foreground truncate">
                {selectedCurrency.name}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Search currencies..." />
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {filteredCurrencies.map((currency) => (
                  <CommandItem
                    key={currency.code}
                    onSelect={() => handleSelect(currency)}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-semibold">{currency.symbol}</span>
                      </div>
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-sm text-muted-foreground">{currency.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Rate: {currency.rate}
                      </Badge>
                      {selectedCurrency.code === currency.code && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showRefreshButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={updateExchangeRates}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          {isLoading ? "Updating..." : "Refresh"}
        </Button>
      )}
    </div>
  );
}