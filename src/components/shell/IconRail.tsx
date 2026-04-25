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
      <aside className="hidden md:flex flex-col w-[60px] shrink-0 bg-foreground text-background border-r border-border h-screen sticky top-0 z-30">
        {/* Brand mark */}
        <div className="h-12 flex items-center justify-center border-b border-background/10">
          <NavLink to="/dashboard" className="font-display font-bold text-accent text-sm tracking-tight">
            ME
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {grouped.map((group, gi) => (
            <div key={gi} className={cn("py-1", gi > 0 && "border-t border-background/10 mt-1 pt-2")}>
              {group.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "relative flex items-center justify-center h-10 mx-1.5 my-0.5 rounded-sm transition-colors group",
                            "text-background/55 hover:text-background hover:bg-background/5",
                            isActive && "text-accent bg-background/[0.04]"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-accent rounded-r" />
                            )}
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                          </>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-mono text-[11px] tracking-wider uppercase">
                      <span className="text-accent mr-2">{item.code}</span>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-background/10 py-2 flex flex-col items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 flex items-center justify-center rounded-sm text-background/55 hover:text-background hover:bg-background/5 transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-[11px] tracking-wider uppercase">Theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="h-9 w-9 flex items-center justify-center rounded-sm text-background/55 hover:text-destructive hover:bg-background/5 transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-[11px] tracking-wider uppercase">Sign out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/profile")}
                className="mt-1 rounded-sm overflow-hidden ring-1 ring-background/15 hover:ring-accent transition"
              >
                <Avatar className="h-8 w-8 rounded-sm">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "User"} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-[11px] font-mono rounded-sm">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-[11px] tracking-wider uppercase">Profile</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default IconRail;
