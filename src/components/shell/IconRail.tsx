import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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

  // Group items
  const grouped: Array<{ name: string; items: typeof NAV_ITEMS }> = [];
  NAV_ITEMS.forEach((item) => {
    const last = grouped[grouped.length - 1];
    if (!last || last.name !== item.group) {
      grouped.push({ name: item.group, items: [item] });
    } else {
      last.items.push(item);
    }
  });

  return (
    <aside className="hidden lg:flex flex-col w-[248px] shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 z-30">
      {/* Brand */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-sidebar-border">
        <NavLink
          to="/dashboard"
          className="h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground font-display font-extrabold text-xl flex items-center justify-center shadow-soft"
        >
          M
        </NavLink>
        <div className="flex flex-col leading-tight">
          <span className="font-display font-extrabold text-lg text-foreground tracking-tight">MaintenEase</span>
          <span className="text-xs text-muted-foreground font-medium">Easy maintenance</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {grouped.map((group) => (
          <div key={group.name} className="mb-5 last:mb-0">
            <div className="label-eyebrow px-3 mb-2">{group.name}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  data-tour={`nav-${item.href.replace(/^\//, "").replace(/\//g, "-")}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 h-12 px-3 my-1 rounded-2xl transition-all duration-200 text-base font-bold",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-gradient-primary text-primary-foreground shadow-soft hover:bg-gradient-primary hover:text-primary-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2.2} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-sidebar-accent transition-colors"
        >
          <Avatar className="h-11 w-11 ring-2 ring-sidebar-border">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "User"} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-extrabold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start leading-tight min-w-0 flex-1">
            <span className="text-sm font-bold text-foreground truncate w-full text-left">
              {profile?.first_name || profile?.email?.split("@")[0] || "Welcome"}
            </span>
            <span className="text-xs text-muted-foreground">View profile</span>
          </div>
        </button>

        <div className="flex gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default IconRail;
