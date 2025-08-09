import * as React from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CurrencySelector } from "@/components/CurrencySelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ClinicSwitcher } from "@/components/ClinicSwitcher";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Outlet, useLocation, Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppSidebar } from "./AppSidebar";

const Layout = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const getBreadcrumbFromPath = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return 'Dashboard'

    return segments
      .map((segment) => segment.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
      .join(' / ')
  }

  const getBreadcrumbItems = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    const format = (segment: string) =>
      segment
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

    return segments.map((seg, idx) => ({
      label: format(seg),
      href: '/' + segments.slice(0, idx + 1).join('/'),
      isLast: idx === segments.length - 1,
    }))
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb aria-label="Breadcrumbs" className="max-w-full">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild className="font-medium">
                    <Link to="/">DentalAI Pro</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {getBreadcrumbItems(location.pathname).length > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
                {getBreadcrumbItems(location.pathname).map((item) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem className="hidden md:block">
                      {item.isLast ? (
                        <BreadcrumbPage className="font-semibold tracking-tight">
                          {item.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!item.isLast && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Clinic Switcher in the center */}
          <div className="flex items-center justify-center flex-1 max-w-md">
            <ClinicSwitcher />
          </div>
          
          <div className="flex items-center gap-2 px-4">
            <LanguageSelector variant="minimal" />
            <CurrencySelector variant="minimal" showRefreshButton={false} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
};

export default Layout;