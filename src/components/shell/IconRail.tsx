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
      <aside className="hidden md:flex flex-col w-[72px] shrink-0 bg-sidebar text-sidebar-foreground border-r-2 border-foreground h-screen sticky top-0 z-30">
        {/* Brand mark */}
        <div className="h-14 flex items-center justify-center border-b-2 border-sidebar-border bg-sidebar-primary">
          <NavLink to="/dashboard" className="font-mono font-bold text-sidebar-primary-foreground text-lg tracking-tighter">
            ME/
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {grouped.map((group, gi) => (
            <div key={gi} className={cn("py-0.5", gi > 0 && "border-t-2 border-sidebar-border mt-2 pt-2")}>
              {group.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "relative flex items-center justify-center h-11 mx-2 my-0.5 rounded-none border-2 border-transparent transition-all group",
                            "text-sidebar-foreground/70 hover:text-sidebar-primary hover:border-sidebar-primary",
                            isActive && "text-sidebar-primary-foreground bg-sidebar-primary border-sidebar-primary"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.5 : 2} />
                          </>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-mono text-xs uppercase tracking-wider border-2 border-foreground rounded-none">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t-2 border-sidebar-border py-3 flex flex-col items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-10 w-10 flex items-center justify-center rounded-none border-2 border-transparent text-sidebar-foreground/70 hover:text-sidebar-primary hover:border-sidebar-primary transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-xs uppercase tracking-wider border-2 border-foreground rounded-none">Theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="h-10 w-10 flex items-center justify-center rounded-none border-2 border-transparent text-sidebar-foreground/70 hover:text-destructive-foreground hover:bg-destructive hover:border-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-xs uppercase tracking-wider border-2 border-foreground rounded-none">Sign out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/profile")}
                className="mt-1 overflow-hidden border-2 border-sidebar-border hover:border-sidebar-primary transition rounded-none"
              >
                <Avatar className="h-9 w-9 rounded-none">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "User"} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-mono font-bold rounded-none">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-xs uppercase tracking-wider border-2 border-foreground rounded-none">Profile</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default IconRail;
