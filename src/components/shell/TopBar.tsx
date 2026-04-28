import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "./navConfig";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

interface TopBarProps {
  unreadCount: number;
  onToggleNotifications: () => void;
  onOpenPalette: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ unreadCount, onToggleNotifications, onOpenPalette }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { profile } = useUserProfile();

  const current = NAV_ITEMS.find((i) => pathname.startsWith(i.href));
  const pageTitle = current?.label || "Welcome";

  // Simple greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = profile?.first_name || "";

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between gap-3 h-16 lg:h-20 px-4 md:px-6">
        {/* Left: mobile menu + greeting/title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-border bg-card hover:bg-secondary -ml-1">
                <Menu className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
              <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground font-display font-extrabold text-xl flex items-center justify-center shadow-soft">M</div>
                <div className="leading-tight">
                  <div className="font-display font-extrabold text-lg text-foreground">MaintenEase</div>
                  <div className="text-xs text-muted-foreground font-medium">Easy maintenance</div>
                </div>
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
                        "w-full flex items-center gap-3 px-3 h-14 text-base font-bold rounded-2xl transition-colors my-1",
                        active
                          ? "bg-gradient-primary text-primary-foreground shadow-soft"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.4} />
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
                <div className="text-xs sm:text-sm text-muted-foreground font-semibold">{greeting}{name ? "," : "!"}</div>
                <div className="font-display font-extrabold text-xl sm:text-2xl text-foreground tracking-tight truncate">
                  {name ? `${name} 👋` : "Welcome 👋"}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs sm:text-sm text-muted-foreground font-semibold">You're viewing</div>
                <div className="font-display font-extrabold text-xl sm:text-2xl text-foreground tracking-tight truncate">{pageTitle}</div>
              </>
            )}
          </div>
        </div>

        {/* Center: big friendly search */}
        <button
          onClick={onOpenPalette}
          className="hidden md:flex items-center gap-3 h-12 px-5 rounded-2xl border-2 border-border bg-card hover:bg-secondary hover:border-primary transition-all text-base text-muted-foreground min-w-[280px] font-semibold"
        >
          <Search className="h-5 w-5 text-primary" strokeWidth={2.4} />
          <span className="flex-1 text-left">What are you looking for?</span>
        </button>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button onClick={onOpenPalette} className="md:hidden h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-border bg-card hover:bg-secondary">
            <Search className="h-5 w-5" strokeWidth={2.4} />
          </button>
          <button
            onClick={onToggleNotifications}
            className="relative h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-border bg-card hover:bg-secondary transition-colors"
          >
            <Bell className="h-5 w-5" strokeWidth={2.4} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[11px] font-extrabold flex items-center justify-center ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
