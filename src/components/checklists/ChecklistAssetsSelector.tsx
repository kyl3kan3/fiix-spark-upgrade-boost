import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { getAllAssets } from "@/services/assets/assetQueries";

interface Props {
  selectedAssetIds: string[];
  onChange: (ids: string[]) => void;
}

const ChecklistAssetsSelector: React.FC<Props> = ({ selectedAssetIds, onChange }) => {
  const [search, setSearch] = useState("");
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
            <label
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/40 cursor-pointer"
            >
              <Checkbox
                checked={selectedAssetIds.includes(a.id)}
                onCheckedChange={() => toggle(a.id)}
              />
              <span className="flex-1 text-sm">{a.name}</span>
              {a.serial_number && (
                <span className="text-xs text-muted-foreground">{a.serial_number}</span>
              )}
            </label>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ChecklistAssetsSelector;