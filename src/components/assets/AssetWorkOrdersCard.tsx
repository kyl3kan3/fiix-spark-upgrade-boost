import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

async function fetchAssetWorkOrders(assetId: string) {
  const { data, error } = await supabase
    .from("work_orders")
    .select("id, title, status, due_date, created_at")
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return data ?? [];
}

export function AssetWorkOrdersCard({ assetId }: { assetId: string }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["asset-work-orders", assetId],
    queryFn: () => fetchAssetWorkOrders(assetId),
  });

  return (
    <div className="surface-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="label-eyebrow flex items-center gap-2">
          <ClipboardList className="h-4 w-4" /> Work order history
        </h3>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/work-orders?asset=${assetId}`}>View all</Link>
        </Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No work orders linked yet.</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {orders.map((wo) => (
            <li key={wo.id} className="py-2.5 flex items-center justify-between gap-2">
              <Link to={`/work-orders/${wo.id}`} className="font-medium hover:text-primary truncate">
                {wo.title}
              </Link>
              <span className="text-xs text-muted-foreground shrink-0 capitalize">
                {wo.status}
                {wo.due_date ? ` · ${format(new Date(wo.due_date), "MMM d")}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
