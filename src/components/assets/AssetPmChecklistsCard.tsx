import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

async function fetchLinkedPmChecklists(assetId: string) {
  const { data, error } = await supabase
    .from("checklist_assets")
    .select("checklist:checklists(id, name, frequency, is_active)")
    .eq("asset_id", assetId);
  if (error) throw error;
  return (data ?? [])
    .map((row) => row.checklist)
    .filter((c): c is { id: string; name: string; frequency: string | null; is_active: boolean } =>
      Boolean(c && c.is_active),
    );
}

export function AssetPmChecklistsCard({ assetId }: { assetId: string }) {
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["asset-pm-checklists", assetId],
    queryFn: () => fetchLinkedPmChecklists(assetId),
  });

  return (
    <div className="surface-card rounded-lg p-6">
      <h3 className="label-eyebrow mb-4 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4" /> Linked PM checklists
      </h3>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : checklists.length === 0 ? (
        <p className="text-sm text-muted-foreground">No preventive checklists linked to this asset.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {checklists.map((c) => (
            <li key={c.id}>
              <Link to={`/checklists/${c.id}`} className="font-medium hover:text-primary">
                {c.name}
              </Link>
              {c.frequency ? (
                <span className="text-xs text-muted-foreground ml-2 capitalize">{c.frequency}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
