import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Droplets } from "lucide-react";
import { fetchLubricantsForAsset } from "@/services/lubricantService";
import { useHasFeature } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

interface Props {
  assetId: string;
}

export function AssetLubricantsCard({ assetId }: Props) {
  const enabled = useHasFeature("lubricant_tracking");
  const { data: lubricants = [] } = useQuery({
    queryKey: ["lubricants", "asset", assetId],
    queryFn: () => fetchLubricantsForAsset(assetId),
    enabled,
  });

  if (!enabled) return null;

  return (
    <div className="surface-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="label-eyebrow flex items-center gap-2">
          <Droplets className="h-4 w-4" /> Lubricants
        </h3>
        <Button asChild variant="ghost" size="sm" className="text-xs">
          <Link to="/lubricants">Catalog</Link>
        </Button>
      </div>
      {lubricants.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No lubricants linked. Assign this equipment from the{" "}
          <Link to="/lubricants" className="text-primary hover:underline">lubricants catalog</Link>.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {lubricants.map((l) => (
            <li key={l.id} className="flex justify-between gap-2">
              <span className="font-medium">{l.name}</span>
              <span className="text-muted-foreground text-xs">
                {l.quantity_on_hand} {l.unit_of_measure} on shelf
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
