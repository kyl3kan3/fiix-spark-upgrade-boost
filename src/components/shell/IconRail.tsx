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
      <aside className="hidden md:flex flex-col w-[68px] shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 z-30">
        {/* Brand mark */}
        <div className="h-14 flex items-center justify-center border-b border-sidebar-border">
          <NavLink to="/dashboard" className="font-display italic font-semibold text-sidebar-primary text-lg tracking-tight">
            Me
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {grouped.map((group, gi) => (
            <div key={gi} className={cn("py-1", gi > 0 && "border-t border-sidebar-border mt-2 pt-3")}>
              {group.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "relative flex items-center justify-center h-11 mx-2 my-1 rounded-xl transition-all group",
                            "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            isActive && "text-sidebar-primary bg-sidebar-accent shadow-sm"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute -left-2 top-2 bottom-2 w-1 bg-sidebar-primary rounded-r-full" />
                            )}
                            <Icon className="h-[19px] w-[19px]" strokeWidth={1.75} />
                          </>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-display text-sm">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border py-3 flex flex-col items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-10 w-10 flex items-center justify-center rounded-xl text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-display text-sm">Theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="h-10 w-10 flex items-center justify-center rounded-xl text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-accent transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-display text-sm">Sign out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/profile")}
                className="mt-1 rounded-full overflow-hidden ring-2 ring-sidebar-border hover:ring-sidebar-primary transition"
              >
                <Avatar className="h-9 w-9 rounded-full">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "User"} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-display rounded-full">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-display text-sm">Profile</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default IconRail;
