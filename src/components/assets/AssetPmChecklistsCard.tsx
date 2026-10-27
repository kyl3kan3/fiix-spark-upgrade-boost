import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type LinkedPmChecklist = {
  id: string;
  name: string;
  frequency: string | null;
  is_active: boolean;
};

async function fetchLinkedPmChecklists(assetId: string): Promise<LinkedPmChecklist[]> {
  const { data: links, error: linkErr } = await supabase
    .from("checklist_assets")
    .select("checklist_id")
    .eq("asset_id", assetId);
  if (linkErr) throw linkErr;
  const checklistIds = (links ?? []).map((row) => row.checklist_id).filter(Boolean);
  if (checklistIds.length === 0) return [];

  const { data: checklists, error } = await supabase
    .from("checklists")
    .select("id, name, frequency, is_active")
    .in("id", checklistIds)
    .eq("is_active", true);
  if (error) throw error;
  return (checklists ?? []) as LinkedPmChecklist[];
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
