import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, HelpCircle, Menu, Search, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { filterNavItems, type NavRole } from "./navConfig";
import { useSubscription } from "@/hooks/useSubscription";
import { resolvePageTitle } from "@/lib/pageTitle";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import BrandMark from "./BrandMark";

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
  const { data: sub } = useSubscription();
  const role = (profile?.role ?? "viewer") as NavRole;
  const navItems = filterNavItems(role, sub);

  const pageTitle = resolvePageTitle(pathname);

  const initial =
    profile?.first_name?.charAt(0).toUpperCase() ||
    profile?.email?.charAt(0).toUpperCase() ||
    "U";

  const iconButton =
    "h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[240px] z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between gap-3 h-14 px-3 md:px-6">
        {/* Left: mobile menu + where you are */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <button className={cn(iconButton, "flex lg:hidden")} aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-80 bg-sidebar text-sidebar-foreground border-r border-sidebar-border [&>button]:text-white"
            >
              <div className="px-4 py-5 border-b border-sidebar-border">
                <BrandMark tone="onInk" tagline="Facility management" />
              </div>
              <nav className="py-3 px-2 overflow-y-auto h-[calc(100vh-100px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "relative w-full flex items-center gap-3 px-3 h-11 text-sm font-medium rounded-md transition-colors duration-150 my-px",
                        active
                          ? "bg-sidebar-accent text-white font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-highlight"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
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

          <div className="min-w-0 flex-1 font-display text-lg font-semibold text-foreground truncate">
            {pageTitle}
          </div>
        </div>

        {/* Search opens the command palette */}
        <button
          onClick={onOpenPalette}
          className="hidden md:flex items-center gap-2 h-9 pl-3 pr-2 rounded-md border border-input bg-background text-sm text-muted-foreground min-w-[300px] transition-colors duration-150 hover:border-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search work orders, assets, pages</span>
          <kbd className="rounded-sm border border-border bg-card px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted-foreground">
            Ctrl K
          </kbd>
        </button>

        <div className="flex items-center gap-1">
          <button onClick={onOpenPalette} className={cn(iconButton, "flex md:hidden")} aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleNotifications}
            className={cn(iconButton, "relative flex")}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold tabular-nums flex items-center justify-center ring-2 ring-card">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/help")}
            className={cn(iconButton, "hidden sm:flex")}
            aria-label="Open help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className={cn(iconButton, "hidden sm:flex")}
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open profile"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.first_name || "User"}
              />
              <AvatarFallback className="bg-foreground text-background text-sm font-semibold">
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
