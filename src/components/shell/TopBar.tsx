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
    <header className="sticky top-0 z-30 h-14 bg-background border-b-2 border-foreground flex items-center justify-between px-4 md:px-6 gap-3">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile nav drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden h-9 w-9 -ml-1">
              <Menu className="h-4 w-4" strokeWidth={2} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-r-2 border-foreground rounded-none">
            <div className="p-5 border-b-2 border-sidebar-border bg-sidebar-primary">
              <span className="font-mono font-bold text-sidebar-primary-foreground text-2xl tracking-tighter">MAINTENEASE/</span>
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
                      "w-full flex items-center gap-3 px-5 py-3 text-sm font-mono uppercase tracking-wider font-bold transition-colors border-l-4",
                      active ? "bg-sidebar-accent text-sidebar-primary border-sidebar-primary" : "text-sidebar-foreground/70 border-transparent hover:text-sidebar-primary hover:bg-sidebar-accent/60 hover:border-sidebar-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-muted-foreground min-w-0">
          <Link to="/dashboard" className="font-mono font-bold text-foreground text-base hover:bg-primary hover:text-primary-foreground transition-colors hidden sm:inline px-2 py-0.5 border-2 border-foreground">
            ME/
          </Link>
          {top && (
            <>
              <span className="hidden sm:inline opacity-60 font-bold">/</span>
              <span className="text-foreground truncate font-bold">{titleize(segments[0] || "dashboard").toUpperCase()}</span>
              {segments[1] && (
                <>
                  <span className="hidden md:inline opacity-60 font-bold">/</span>
                  <span className="hidden md:inline truncate text-muted-foreground font-bold">{titleize(segments[1]).toUpperCase()}</span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Center: command palette trigger */}
      <button
        onClick={onOpenPalette}
        className="hidden md:flex items-center gap-2.5 h-9 px-3 rounded-none border-2 border-foreground bg-card hover:bg-primary hover:text-primary-foreground transition-all text-sm font-mono uppercase tracking-wider min-w-[280px] shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] hover:-translate-x-[2px] hover:-translate-y-[2px]"
      >
        <CmdIcon className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="flex-1 text-left text-xs">SEARCH/QUERY</span>
        <kbd className="font-mono font-bold text-[10px] px-1.5 py-0.5 border-2 border-foreground bg-background text-foreground">⌘K</kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="icon" className="md:hidden h-9 w-9" onClick={onOpenPalette}>
          <CmdIcon className="h-4 w-4" strokeWidth={2} />
        </Button>
        <button
          onClick={onToggleNotifications}
          className="relative h-9 w-9 flex items-center justify-center rounded-none border-2 border-transparent hover:border-foreground hover:bg-primary transition-colors"
        >
          <Bell className="h-4 w-4" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-accent border-2 border-foreground" />
          )}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
