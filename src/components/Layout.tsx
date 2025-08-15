import * as React from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CurrencySelector } from "@/components/CurrencySelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ClinicSwitcher } from "@/components/ClinicSwitcher";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { LogOut, Home, Loader2, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppSidebar } from "./AppSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRoleAccess } from "@/hooks/useRoleAccess";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const { isPatient } = useRoleAccess();

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
      setSigningOut(true);
      console.log('Starting signout process...');
      await signOut();
      console.log('Signout completed, navigating to auth...');
      // Force navigation to auth page after signout
      navigate('/auth', { replace: true });
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      setConfirmOpen(false);
    } catch (error) {
      console.error('Signout error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
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
            <Breadcrumb aria-label="Breadcrumbs" className="max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-colors hover:bg-muted hover:text-foreground">
                    <Link to="/"><Home className="h-4 w-4" aria-hidden="true" /><span>DentalAI Pro</span></Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {getBreadcrumbItems(location.pathname).length > 0 && (
                  <BreadcrumbSeparator className="hidden md:block text-muted-foreground" />
                )}
                {getBreadcrumbItems(location.pathname).map((item) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem className="hidden md:block">
                      {item.isLast ? (
                        <BreadcrumbPage className="rounded-md bg-muted px-2 py-1 font-semibold tracking-tight text-foreground shadow-sm">
                          {item.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild className="rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground">
                          <Link to={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!item.isLast && (
                      <BreadcrumbSeparator className="hidden md:block text-muted-foreground" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="professional" size="sm" className="gap-2 hover-scale" aria-label="Account menu">
                  <Avatar className="h-6 w-6 ring-1 ring-border">
                    <AvatarImage src={(user as any)?.user_metadata?.avatar_url} alt="User avatar" />
                    <AvatarFallback>{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline max-w-[140px] truncate">{user?.email ?? "Account"}</span>
                </Button>
              </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 z-50 bg-popover text-popover-foreground border border-border shadow-elegant">
                  <DropdownMenuLabel className="space-y-1">
                    <div className="text-sm font-medium">Signed in</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault();
                      setConfirmOpen(true);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to sign in again to continue.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={signingOut}>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button variant="destructive" onClick={handleSignOut} disabled={signingOut} className="gap-2">
                      {signingOut && <Loader2 className="h-4 w-4 animate-spin" />}
                      Sign Out
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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