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
    <header className="sticky top-0 z-30 h-12 bg-background/95 backdrop-blur-sm hairline-b flex items-center justify-between px-3 md:px-5 gap-3">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile nav drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 -ml-1">
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-foreground text-background border-r-0">
            <div className="p-4 hairline-b border-background/10">
              <span className="font-display font-bold text-accent text-base">MaintenEase</span>
            </div>
            <nav className="py-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                      active ? "bg-background/5 text-accent border-l-2 border-accent" : "text-background/70 hover:text-background hover:bg-background/5 border-l-2 border-transparent"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <span className="font-mono text-[10px] tracking-wider text-background/40">{item.code}</span>
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground min-w-0">
          <Link to="/dashboard" className="hover:text-foreground transition-colors hidden sm:inline">ME</Link>
          {top && (
            <>
              <ChevronRight className="h-3 w-3 hidden sm:inline" />
              <span className="text-accent">{top.code}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground truncate">{titleize(segments[0] || "dashboard")}</span>
              {segments[1] && (
                <>
                  <ChevronRight className="h-3 w-3 hidden md:inline" />
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
        className="hidden md:flex items-center gap-2 h-7 px-2.5 rounded-sm hairline bg-card hover:border-foreground/40 transition-colors text-xs text-muted-foreground min-w-[260px]"
      >
        <CmdIcon className="h-3 w-3" strokeWidth={1.5} />
        <span className="flex-1 text-left font-mono tracking-wider uppercase">Search · Jump · Create</span>
        <kbd className="font-mono text-[10px] px-1 hairline rounded-sm">⌘K</kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onOpenPalette}>
          <CmdIcon className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <button
          onClick={onToggleNotifications}
          className="relative h-8 w-8 flex items-center justify-center rounded-sm hover:bg-foreground/5 transition-colors"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-accent rounded-full ring-2 ring-background" />
          )}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
