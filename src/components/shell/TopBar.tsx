import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Search, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "./navConfig";
import { cn } from "@/lib/utils";

interface TopBarProps {
  unreadCount: number;
  onToggleNotifications: () => void;
  onOpenPalette: () => void;
}

const titleize = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const TopBar: React.FC<TopBarProps> = ({ unreadCount, onToggleNotifications, onOpenPalette }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const top = NAV_ITEMS.find((i) => pathname.startsWith(i.href));

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/85 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 gap-3">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile nav drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 -ml-1">
              <Menu className="h-4 w-4" strokeWidth={2} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
            <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground font-display font-extrabold flex items-center justify-center shadow-soft">M</div>
              <span className="font-display font-bold text-foreground text-lg tracking-tight">MaintenEase</span>
            </div>
            <nav className="py-3 px-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-colors my-0.5",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                        : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <Link to="/dashboard" className="font-display font-bold text-foreground text-base hover:text-primary transition-colors hidden sm:inline">
            MaintenEase
          </Link>
          {top && (
            <>
              <ChevronRight className="hidden sm:inline h-3.5 w-3.5 opacity-60" />
              <span className="text-foreground truncate font-medium">{titleize(segments[0] || "dashboard")}</span>
              {segments[1] && (
                <>
                  <ChevronRight className="hidden md:inline h-3.5 w-3.5 opacity-60" />
                  <span className="hidden md:inline truncate text-muted-foreground">{titleize(segments[1])}</span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Center: command palette trigger */}
      <button
        onClick={onOpenPalette}
        className="hidden md:flex items-center gap-2.5 h-10 px-4 rounded-full border border-border bg-secondary/60 hover:bg-secondary hover:border-primary/40 transition-all text-sm text-muted-foreground min-w-[320px]"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
        <span className="flex-1 text-left">Search work orders, assets…</span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-md border border-border bg-background text-muted-foreground">⌘K</kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="md:hidden h-10 w-10" onClick={onOpenPalette}>
          <Search className="h-4 w-4" strokeWidth={2} />
        </Button>
        <button
          onClick={onToggleNotifications}
          className="relative h-10 w-10 flex items-center justify-center rounded-xl text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background" />
          )}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
