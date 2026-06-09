import { format, startOfMonth, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface MonthlyWorkOrderStats {
 name: string;
 workOrders: number;
 completed: number;
 inProgress: number;
}

export interface MaintenanceTrendPoint {
 name: string;
 preventive: number;
 corrective: number;
}

export interface AssetWorkOrderSlice {
 name: string;
 value: number;
}

export interface WorkOrderReportData {
 monthly: MonthlyWorkOrderStats[];
 trends: MaintenanceTrendPoint[];
 byAsset: AssetWorkOrderSlice[];
}

interface ReportRow {
 created_at: string;
 status: string;
 priority: string;
 asset: { name: string } | null;
}

const MONTHS_BACK = 6;
const MAX_PIE_SLICES = 5;

export function buildWorkOrderReportData(
 rows: ReportRow[],
 now: Date = new Date(),
): WorkOrderReportData {
 const months = Array.from({ length: MONTHS_BACK }, (_, i) =>
 startOfMonth(subMonths(now, MONTHS_BACK - 1 - i)),
 );
 const monthKey = (date: Date) => format(date, "yyyy-MM");
 const indexByMonth = new Map(months.map((m, i) => [monthKey(m), i]));

 const monthly: MonthlyWorkOrderStats[] = months.map((m) => ({
 name: format(m, "MMM"),
 workOrders: 0,
 completed: 0,
 inProgress: 0,
 }));
 const trends: MaintenanceTrendPoint[] = months.map((m) => ({
 name: format(m, "MMM"),
 preventive: 0,
 corrective: 0,
 }));
 const assetCounts = new Map<string, number>();

 for (const row of rows) {
 const index = indexByMonth.get(monthKey(new Date(row.created_at)));
 if (index === undefined) continue;

 monthly[index].workOrders += 1;
 if (row.status === "completed") monthly[index].completed += 1;
 if (row.status === "in_progress") monthly[index].inProgress += 1;

 // No maintenance-type column exists; high-urgency work is treated as
 // corrective, routine-priority work as preventive (same proxy as the
 // PM calendar).
 if (row.priority === "high" || row.priority === "urgent") {
 trends[index].corrective += 1;
 } else {
 trends[index].preventive += 1;
 }

 const assetName = row.asset?.name || "No asset";
 assetCounts.set(assetName, (assetCounts.get(assetName) || 0) + 1);
 }

 const sortedAssets = [...assetCounts.entries()].sort((a, b) => b[1] - a[1]);
 const byAsset: AssetWorkOrderSlice[] = sortedAssets
 .slice(0, MAX_PIE_SLICES)
 .map(([name, value]) => ({ name, value }));
 const otherTotal = sortedAssets
 .slice(MAX_PIE_SLICES)
 .reduce((sum, [, value]) => sum + value, 0);
 if (otherTotal > 0) {
 byAsset.push({ name: "Other", value: otherTotal });
 }

 return { monthly, trends, byAsset };
}

export async function getWorkOrderReportData(): Promise<WorkOrderReportData> {
 const since = startOfMonth(subMonths(new Date(), MONTHS_BACK - 1));
 const { data, error } = await supabase
 .from("work_orders")
 .select("created_at, status, priority, asset:assets(name)")
 .gte("created_at", since.toISOString());

 if (error) throw error;
 return buildWorkOrderReportData((data as unknown as ReportRow[]) || []);
}

export async function getRecentWorkOrderActivity(limit = 8) {
 const { data, error } = await supabase
 .from("work_orders")
 .select(`
 id, title, status, updated_at,
 asset:assets(name),
 assignee:profiles!work_orders_assigned_to_fkey(first_name, last_name)
 `)
 .order("updated_at", { ascending: false })
 .limit(limit);

 if (error) throw error;
 return data || [];
}
