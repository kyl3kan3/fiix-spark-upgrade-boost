import React from "react";
import { Bell, Search, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DashboardHeaderProps {
  unreadCount: number;
  toggleNotifications: () => void;
  toggleSidebar?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  unreadCount,
  toggleNotifications,
}) => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const initial =
    profile?.first_name?.charAt(0).toUpperCase() ||
    profile?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-40 bg-background/75 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-14 md:h-16 px-3 sm:px-6 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <SidebarTrigger className="hover:bg-accent" />

          {/* Search */}
          <button className="hidden md:flex items-center gap-2 h-9 px-3 ml-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground text-sm transition-colors w-full max-w-md border border-border/40">
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search work orders, assets…</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-medium bg-background px-1.5 py-0.5 rounded border border-border/60">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent">
            <Search className="h-[18px] w-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleNotifications}
            className="relative hover:bg-accent"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          <button
            onClick={() => navigate("/profile")}
            className="ml-1 rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "Avatar"} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
