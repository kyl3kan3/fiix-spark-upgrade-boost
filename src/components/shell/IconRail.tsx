import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./navConfig";

interface IconRailProps {
  onOpenPalette: () => void;
}

const IconRail: React.FC<IconRailProps> = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const initial =
    profile?.first_name?.charAt(0).toUpperCase() ||
    profile?.email?.charAt(0).toUpperCase() ||
    "U";

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  // Group items in display order, but render flat with hairline dividers between groups
  const grouped: Array<typeof NAV_ITEMS> = [];
  let currentGroup = "";
  NAV_ITEMS.forEach((item) => {
    if (item.group !== currentGroup) {
      grouped.push([item]);
      currentGroup = item.group;
    } else {
      grouped[grouped.length - 1].push(item);
    }
  });

  return (
    <TooltipProvider delayDuration={150}>
      <aside className="hidden md:flex flex-col w-[76px] shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 z-30">
        {/* Brand mark */}
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
          <NavLink
            to="/dashboard"
            className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground font-display font-extrabold flex items-center justify-center shadow-soft"
          >
            M
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {grouped.map((group, gi) => (
            <div key={gi} className={cn("py-1", gi > 0 && "border-t border-sidebar-border/60 mt-2 pt-2")}>
              {group.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "relative flex items-center justify-center h-11 w-11 mx-auto my-1 rounded-xl transition-all duration-200 group",
                            "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                            isActive && "text-sidebar-primary-foreground bg-sidebar-primary shadow-soft hover:text-sidebar-primary-foreground hover:bg-sidebar-primary"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border py-3 flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-10 w-10 flex items-center justify-center rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium">Theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="h-10 w-10 flex items-center justify-center rounded-xl text-sidebar-foreground/70 hover:text-destructive-foreground hover:bg-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium">Sign out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/profile")}
                className="mt-1 overflow-hidden rounded-full ring-2 ring-sidebar-border hover:ring-sidebar-primary transition"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "User"} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium">Profile</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default IconRail;
