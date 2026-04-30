import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllAssets } from "@/services/assets/assetQueries";

interface Props {
  selectedAssetIds: string[];
  onChange: (ids: string[]) => void;
  /** Map of assetId -> minutes offset from the checklist's base due time. */
  assetOffsets?: Record<string, number>;
  onOffsetsChange?: (offsets: Record<string, number>) => void;
}

const ChecklistAssetsSelector: React.FC<Props> = ({
  selectedAssetIds,
  onChange,
  assetOffsets = {},
  onOffsetsChange,
}) => {
  const [search, setSearch] = useState("");
  const [autoStagger, setAutoStagger] = useState<number>(15);
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: getAllAssets,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter((a: any) => a.name?.toLowerCase().includes(q));
  }, [assets, search]);

  const toggle = (id: string) => {
    if (selectedAssetIds.includes(id)) {
      onChange(selectedAssetIds.filter((x) => x !== id));
      if (onOffsetsChange && assetOffsets[id] !== undefined) {
        const next = { ...assetOffsets };
        delete next[id];
        onOffsetsChange(next);
      }
    } else {
      onChange([...selectedAssetIds, id]);
    }
  };

  const selectAllVisible = () => {
    const ids = new Set(selectedAssetIds);
    filtered.forEach((a: any) => ids.add(a.id));
    onChange(Array.from(ids));
  };

  const clearAll = () => onChange([]);

  const setOffset = (id: string, minutes: number) => {
    if (!onOffsetsChange) return;
    onOffsetsChange({ ...assetOffsets, [id]: Math.max(0, Math.round(minutes || 0)) });
  };

  const applyAutoStagger = () => {
    if (!onOffsetsChange) return;
    const step = Math.max(0, Math.round(autoStagger || 0));
    const next: Record<string, number> = { ...assetOffsets };
    selectedAssetIds.forEach((id, i) => {
      next[id] = i * step;
    });
    onOffsetsChange(next);
  };

  const clearOffsets = () => {
    if (!onOffsetsChange) return;
    onOffsetsChange({});
  };

  const formatOffset = (m: number) => {
    if (!m) return "starts at due time";
    if (m < 60) return `+${m}m`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `+${h}h ${r}m` : `+${h}h`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Applies to equipment</h2>
          <p className="text-sm text-muted-foreground">
            Pick the units this checklist runs against. Leave empty for a generic checklist.
          </p>
        </div>
        <Badge variant="outline">{selectedAssetIds.length} selected</Badge>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search equipment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={selectAllVisible}
          className="text-sm text-primary hover:underline"
        >
          Select all visible
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-muted-foreground hover:underline"
        >
          Clear
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-sm text-muted-foreground">Loading equipment…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No equipment found. Add some on the Equipment page first.
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
          {filtered.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/40">
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <Checkbox
                  checked={selectedAssetIds.includes(a.id)}
                  onCheckedChange={() => toggle(a.id)}
                />
                <span className="flex-1 text-sm">{a.name}</span>
                {a.serial_number && (
                  <span className="text-xs text-muted-foreground">{a.serial_number}</span>
                )}
              </label>
              {onOffsetsChange && selectedAssetIds.includes(a.id) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min={0}
                    step={5}
                    value={assetOffsets[a.id] ?? 0}
                    onChange={(e) => setOffset(a.id, Number(e.target.value))}
                    className="h-7 w-20 text-xs"
                    aria-label={`Stagger offset for ${a.name} in minutes`}
                  />
                  <span className="text-[10px] text-muted-foreground w-24 truncate">
                    {formatOffset(assetOffsets[a.id] ?? 0)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {onOffsetsChange && selectedAssetIds.length > 1 && (
        <div className="mt-4 rounded-md border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm">Auto-stagger prompts</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Spread prompts across selected units so they don't all fire at once. First unit starts on time, each next unit waits N minutes more.
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={240}
              step={5}
              value={autoStagger}
              onChange={(e) => setAutoStagger(Number(e.target.value))}
              className="h-8 w-24"
            />
            <span className="text-xs text-muted-foreground">minutes apart</span>
            <Button type="button" size="sm" variant="outline" onClick={applyAutoStagger}>
              Apply
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={clearOffsets}>
              Reset all to 0
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ChecklistAssetsSelector;