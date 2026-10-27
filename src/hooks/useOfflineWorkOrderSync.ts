import { useEffect, useState } from "react";
import {
  flushWorkOrderStatusQueue,
  getPendingWorkOrderStatuses,
} from "@/lib/offline/workOrderSync";

export function useOfflineWorkOrderSync(
  applyStatus: (id: string, status: string) => Promise<void>,
  enabled: boolean,
) {
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = () => setPendingCount(getPendingWorkOrderStatuses().length);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const onOnline = () => {
      flushWorkOrderStatusQueue(applyStatus).then(() => refresh());
    };
    window.addEventListener("online", onOnline);
    if (navigator.onLine) onOnline();
    return () => window.removeEventListener("online", onOnline);
  }, [enabled, applyStatus]);

  return { pendingCount, refresh };
}
