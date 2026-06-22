import React, { useMemo, useState } from "react";
import { MapPin, Pencil, Eye, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_VIEW,
  planeTransform,
  markerCounterTransform,
  relativeFromPointer,
  toPercent,
  clampAngle,
  type ViewAngle,
} from "@/lib/floorPlan";
import type { FloorPlanMarker, PlanAsset } from "@/services/floorPlanService";

const NO_ASSET = "__none__";

interface Props {
  imageUrl: string;
  assets: PlanAsset[];
  markers: FloorPlanMarker[];
  isBusy?: boolean;
  onAddMarker: (x: number, y: number, assetId: string | null, label: string | null) => void;
  onDeleteMarker: (id: string) => void;
}

const Slider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) => (
  <label className="flex items-center gap-2 text-xs text-muted-foreground">
    <span className="w-12">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 accent-primary"
    />
  </label>
);

const FloorPlanViewer: React.FC<Props> = ({
  imageUrl,
  assets,
  markers,
  isBusy,
  onAddMarker,
  onDeleteMarker,
}) => {
  const [view, setView] = useState<ViewAngle>(DEFAULT_VIEW);
  const [editMode, setEditMode] = useState(false);
  const [assetId, setAssetId] = useState<string>(NO_ASSET);
  const [label, setLabel] = useState("");

  const assetName = useMemo(() => new Map(assets.map((a) => [a.id, a.name])), [assets]);

  // In edit mode we flatten to top-down so click positions map directly to coords.
  const effectiveView: ViewAngle = editMode ? { tilt: 0, rotate: 0, zoom: view.zoom } : view;

  const handlePlaneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = relativeFromPointer(rect, e.clientX, e.clientY);
    onAddMarker(x, y, assetId === NO_ASSET ? null : assetId, label.trim() || null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? <Pencil className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {editMode ? "Editing layout" : "3D view"}
        </Button>
        {!editMode && (
          <>
            <div className="flex flex-col gap-1 w-40">
              <Slider label="Tilt" value={view.tilt} min={0} max={75} onChange={(v) => setView((s) => ({ ...s, tilt: v }))} />
              <Slider label="Rotate" value={view.rotate} min={-180} max={180} onChange={(v) => setView((s) => ({ ...s, rotate: v }))} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setView(DEFAULT_VIEW)}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </>
        )}
        <div className="w-32">
          <Slider
            label="Zoom"
            value={view.zoom}
            min={0.4}
            max={2.5}
            step={0.1}
            onChange={(v) => setView((s) => ({ ...s, zoom: clampAngle(v, 0.4, 2.5) }))}
          />
        </div>
      </div>

      {editMode && (
        <div className="flex flex-wrap items-end gap-2 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label className="text-xs">Asset to place</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger aria-label="Asset to place" className="w-48 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ASSET}>No asset (label only)</SelectItem>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="marker-label">Label (optional)</Label>
            <Input
              id="marker-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Boiler room"
              className="h-8 w-40"
            />
          </div>
          <p className="text-xs text-muted-foreground pb-2">Click the plan to drop a pin.</p>
        </div>
      )}

      <div
        className="relative w-full overflow-hidden rounded-lg border bg-muted/20"
        style={{ height: 460, perspective: "1200px" }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div
            onClick={handlePlaneClick}
            className={`relative max-w-full max-h-full transition-transform duration-200 ${
              editMode ? "cursor-crosshair" : ""
            }`}
            style={{ transform: planeTransform(effectiveView), transformStyle: "preserve-3d" }}
          >
            <img
              src={imageUrl}
              alt="Uploaded floor plan"
              className="block max-w-full max-h-[400px] select-none pointer-events-none shadow-lg"
              draggable={false}
            />
            {markers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (editMode) onDeleteMarker(m.id);
                }}
                className="absolute group"
                style={{
                  left: toPercent(m.x),
                  top: toPercent(m.y),
                  transform: `translate(-50%, -100%) ${markerCounterTransform(effectiveView)} translateZ(24px)`,
                }}
                title={m.label ?? (m.asset_id ? assetName.get(m.asset_id) : "") ?? "Marker"}
              >
                <MapPin className="h-6 w-6 text-primary drop-shadow" fill="hsl(var(--primary))" />
                <span className="absolute left-1/2 -translate-x-1/2 top-full whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 group-hover:opacity-100 transition-opacity">
                  {m.label || (m.asset_id ? assetName.get(m.asset_id) : "") || "Marker"}
                  {editMode && <Trash2 className="inline h-3 w-3 ml-1" />}
                </span>
              </button>
            ))}
          </div>
        </div>
        {isBusy && (
          <div className="absolute inset-0 bg-background/40 flex items-center justify-center text-sm">
            Saving…
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {markers.length} {markers.length === 1 ? "pin" : "pins"} placed.{" "}
        {editMode ? "Click a pin to remove it." : "Switch to Editing layout to add or remove pins."}
      </p>
    </div>
  );
};

export default FloorPlanViewer;
