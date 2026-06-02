import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, HelpCircle, Menu, Search, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "./navConfig";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TopBarProps {
  unreadCount: number;
  onToggleNotifications: () => void;
  onOpenPalette: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  unreadCount,
  onToggleNotifications,
  onOpenPalette,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { profile } = useUserProfile();

  const current = NAV_ITEMS.find((i) => pathname.startsWith(i.href));
  const pageTitle = current?.label || "Welcome";

  // Simple greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = profile?.first_name || "";
  const initial =
    profile?.first_name?.charAt(0).toUpperCase() ||
    profile?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[240px] z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between gap-3 h-16 px-4 md:px-6">
        {/* Left: mobile menu + greeting/title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted -ml-1 transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-80 bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
            >
              <div className="px-6 py-5 border-b border-sidebar-border">
                <h2 className="font-headline text-2xl font-bold text-primary tracking-tight">
                  MaintenEase
                </h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Facility Management
                </p>
              </div>
              <nav className="py-3 px-2 overflow-y-auto h-[calc(100vh-100px)]">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 h-11 text-sm font-medium rounded-r-lg border-l-4 border-transparent transition-colors my-0.5",
                        active
                          ? "border-primary bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            {pathname === "/dashboard" || pathname === "/" ? (
              <>
                <div className="text-xs text-muted-foreground font-medium">
                  {greeting}
                  {name ? "," : "!"}
                </div>
                <div className="font-headline text-xl sm:text-2xl text-foreground tracking-tight truncate">
                  {name ? `${name} 👋` : "Welcome 👋"}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-muted-foreground font-medium">
                  You're viewing
                </div>
                <div className="font-headline text-xl sm:text-2xl text-foreground tracking-tight truncate">
                  {pageTitle}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: pill search per Clean Tech */}
        <button
          onClick={onOpenPalette}
          className="hidden md:flex items-center gap-2 h-10 px-4 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm text-muted-foreground min-w-[280px] font-medium"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-left">Search orders, assets...</span>
        </button>

        {/* Right: round icon buttons per Clean Tech */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPalette}
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleNotifications}
            className="relative h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors active:opacity-80"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/help")}
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors active:opacity-80"
            aria-label="Open help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors active:opacity-80"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="ml-1 rounded-full"
            aria-label="Open profile"
          >
            <Avatar className="h-8 w-8 shadow-sm">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.first_name || "User"}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
