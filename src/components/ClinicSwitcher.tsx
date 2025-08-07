import { useState } from "react";
import { Check, ChevronsUpDown, Building2, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/contexts/TenantContext";

export function ClinicSwitcher() {
  const [open, setOpen] = useState(false);
  const { currentTenant, tenants, switchTenant, loading } = useTenant();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">No clinic selected</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-card hover:bg-muted/50 border-border/50"
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm truncate">
                  {currentTenant.name}
                </span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {currentTenant.clinic_code.toUpperCase()}
                </Badge>
              </div>
              {currentTenant.address && (
                <span className="text-xs text-muted-foreground truncate max-w-48">
                  {currentTenant.address}
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search clinics..." />
          <CommandList>
            <CommandEmpty>No clinics found.</CommandEmpty>
            <CommandGroup heading="Available Clinics">
              {tenants.map((tenant) => (
                <CommandItem
                  key={tenant.id}
                  value={tenant.name}
                  onSelect={() => {
                    switchTenant(tenant.id);
                    setOpen(false);
                  }}
                  className="p-3"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {tenant.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {tenant.clinic_code.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {tenant.address && (
                        <div className="flex items-center space-x-1 mb-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {tenant.address}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        {tenant.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {tenant.phone}
                            </span>
                          </div>
                        )}
                        {tenant.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {tenant.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentTenant.id === tenant.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}