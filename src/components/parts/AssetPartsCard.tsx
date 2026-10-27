import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { fetchPartsForAsset } from "@/services/partsService";
import { useHasFeature } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

interface Props {
  assetId: string;
}

export function AssetPartsCard({ assetId }: Props) {
  const enabled = useHasFeature("parts_inventory");
  const { data: parts = [] } = useQuery({
    queryKey: ["parts", "asset", assetId],
    queryFn: () => fetchPartsForAsset(assetId),
    enabled,
  });

  if (!enabled) return null;

  return (
    <div className="surface-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="label-eyebrow flex items-center gap-2">
          <Package className="h-4 w-4" /> Parts
        </h3>
        <Button asChild variant="ghost" size="sm" className="text-xs">
          <Link to="/parts">Catalog</Link>
        </Button>
      </div>
      {parts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No parts linked. Assign this equipment from the{" "}
          <Link to="/parts" className="text-primary hover:underline">parts catalog</Link>.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {parts.map((l) => (
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
