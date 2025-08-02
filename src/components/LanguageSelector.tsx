// TODO: Language selector will be implemented later
// Currently commented out for future implementation

import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage, SUPPORTED_LANGUAGES, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "default" | "minimal" | "compact";
  className?: string;
}

export function LanguageSelector({ variant = "default", className }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const { selectedLanguage, setSelectedLanguage, isLoading } = useLanguage();

  const handleLanguageSelect = (language: Language) => {
    // TODO: Implement language selection
    console.log('Language selection will be implemented later:', language);
    setOpen(false);
  };

  const getButtonContent = () => {
    switch (variant) {
      case "minimal":
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedLanguage.flag}</span>
            <span className="hidden sm:inline">{selectedLanguage.code.toUpperCase()}</span>
          </div>
        );
      case "compact":
        return (
          <div className="flex items-center gap-1">
            <span className="text-sm">{selectedLanguage.flag}</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-lg">{selectedLanguage.flag}</span>
            <span className="hidden sm:inline font-medium">
              {selectedLanguage.nativeName}
            </span>
            <ChevronDown className="h-4 w-4" />
          </div>
        );
    }
  };

  const getButtonSize = () => {
    switch (variant) {
      case "compact":
        return "sm";
      case "minimal":
        return "sm";
      default:
        return "default";
    }
  };

  // TODO: Remove this component or implement proper functionality
  // For now, return a disabled placeholder
  return (
    <div className="opacity-50 pointer-events-none">
      <Button
        variant="outline"
        disabled={true}
        className={cn(
          "justify-between",
          variant === "compact" && "h-8 px-2",
          variant === "minimal" && "border-none bg-transparent hover:bg-accent",
          className
        )}
        size={getButtonSize()}
      >
        {getButtonContent()}
      </Button>
    </div>
  );

  /*
  // TODO: Full implementation for future use
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            variant === "compact" && "h-8 px-2",
            variant === "minimal" && "border-none bg-transparent hover:bg-accent",
            className
          )}
          size={getButtonSize()}
          disabled={isLoading}
        >
          {getButtonContent()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {SUPPORTED_LANGUAGES.map((language) => (
                <CommandItem
                  key={language.code}
                  value={language.code}
                  onSelect={() => handleLanguageSelect(language)}
                  className="flex items-center gap-3 p-3"
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-sm text-muted-foreground">{language.name}</div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedLanguage.code === language.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
  */
}