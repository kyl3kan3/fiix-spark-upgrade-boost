import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { dueAssetIds } from "@/lib/checklists/scheduling";

const STORAGE_KEY = "due-prompt:lastShown";

/**
 * Shows a one-time daily toast when the user has overdue or due-today checklists.
 * For "twice-daily" frequency we fire twice (AM/PM). Otherwise once per calendar day.
 * Never re-fires within the same window even if the user reloads the app.
 */
const promptKey = (now: Date) => {
 const half = now.getHours() < 12 ? "AM" : "PM";
 return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${half}`;
};

const DailyDuePrompt: React.FC = () => {
 const navigate = useNavigate();
 const firedRef = useRef(false);

 const { data: due = [] } = useQuery({
 queryKey: ["due-checklists"],
 queryFn: checklistService.getDueChecklists,
 refetchInterval: 5 * 60 * 1000,
 });

 useEffect(() => {
 if (firedRef.current) return;
 // Respect per-asset stagger: only count checklists that have at least one
 // currently-due asset (or no assets at all, which means "checklist itself is due").
 const now = new Date();
 const activeDue = due.filter((c: any) => {
 const ids = c.asset_ids ?? [];
 if (ids.length === 0) return true;
 return dueAssetIds(c.schedule?.next_due_at, ids, c.asset_offsets ?? {}, now).length > 0;
 });
 if (!activeDue.length) return;

 const key = promptKey(new Date());
 let last: string | null = null;
 try {
 last = localStorage.getItem(STORAGE_KEY);
 } catch {
 // ignore (private mode etc.)
 }
 if (last === key) return;

 firedRef.current = true;
 try {
 localStorage.setItem(STORAGE_KEY, key);
 } catch {
 /* ignore */
 }

 const count = activeDue.length;
 toast(`${count} inspection${count === 1 ? "" : "s"} due`, {
 description: "Open the Due dashboard to start checking your equipment.",
 icon: <Bell className="h-4 w-4" />,
 duration: 8000,
 action: {
 label: "View",
 onClick: () => navigate("/checklists/due"),
 },
 });
 }, [due, navigate]);

 return null;
};

export default DailyDuePrompt;