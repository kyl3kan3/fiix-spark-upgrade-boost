import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Command as CmdIcon, Menu, ChevronRight } from "lucide-react";
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
    <header className="sticky top-0 z-30 h-14 bg-background/85 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 gap-3">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile nav drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 -ml-1">
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-r-0">
            <div className="p-5 border-b border-sidebar-border">
              <span className="font-display italic font-semibold text-sidebar-primary text-2xl">MaintenEase</span>
            </div>
            <nav className="py-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors rounded-r-full mr-3",
                      active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <Link to="/dashboard" className="font-display italic font-semibold text-foreground text-lg hover:text-primary transition-colors hidden sm:inline">
            MaintenEase
          </Link>
          {top && (
            <>
              <ChevronRight className="h-3.5 w-3.5 hidden sm:inline opacity-60" />
              <span className="text-foreground truncate font-medium">{titleize(segments[0] || "dashboard")}</span>
              {segments[1] && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 hidden md:inline opacity-60" />
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
        className="hidden md:flex items-center gap-2.5 h-9 px-3.5 rounded-full border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all text-sm text-muted-foreground min-w-[280px]"
      >
        <CmdIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="flex-1 text-left">Search anything…</span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 border border-border rounded-md bg-muted">⌘K</kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={onOpenPalette}>
          <CmdIcon className="h-4 w-4" strokeWidth={1.75} />
        </Button>
        <button
          onClick={onToggleNotifications}
          className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
          )}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
