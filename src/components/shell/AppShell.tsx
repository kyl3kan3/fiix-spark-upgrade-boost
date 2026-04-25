import React, { useEffect, useState } from "react";
import IconRail from "./IconRail";
import TopBar from "./TopBar";
import CommandPalette from "./CommandPalette";
import DashboardNotifications from "@/components/dashboard/DashboardNotifications";
import { getUserNotifications } from "@/services/notifications";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const notifications = await getUserNotifications();
        setUnreadCount(notifications.filter((n) => !n.read).length);
      } catch (e) {
        console.error("notifications fetch failed", e);
      }
    })();
  }, []);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <IconRail onOpenPalette={() => setPaletteOpen(true)} />

      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Subtle blueprint backdrop */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-blueprint-grid opacity-[0.35] dark:opacity-[0.5]"
        />

        <TopBar
          unreadCount={unreadCount}
          onToggleNotifications={() => setNotificationsOpen((o) => !o)}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <main className="flex-1 w-full">
          {children}
        </main>

        <DashboardNotifications
          isOpen={notificationsOpen}
          setIsOpen={setNotificationsOpen}
          onNotificationCountChange={setUnreadCount}
        />
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
};

export default AppShell;
