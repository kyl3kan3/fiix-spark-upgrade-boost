import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ImagePlus, Loader2, Trash2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, Pencil, Check, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSignedAssetImageUrl } from "@/lib/storage/signedAssetImage";
import { PhotoCard, ManageThumb } from "./gallery/PhotoCard";
import { useGalleryData } from "./gallery/useGalleryData";
import type { AttachmentEntityType } from "./gallery/types";

export type { AttachmentEntityType } from "./gallery/types";

interface ImageGalleryProps {
  entityType: AttachmentEntityType;
  entityId: string;
  title?: string;
  className?: string;
  readOnly?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  entityType,
  entityId,
  title = "Photos",
  className,
  readOnly,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [manageOpen, setManageOpen] = useState(false);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const { items, isLoading, uploadMutation, deleteMutation, reorderMutation, updateMetaMutation } =
    useGalleryData({
      entityType,
      entityId,
      onUploadSettled: () => setUploading(false),
      onReorderSaved: () => setManageOpen(false),
    });

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    uploadMutation.mutate(Array.from(files));
  };

  const openManage = () => {
    setOrderedIds(items.map((i) => i.id));
    setManageOpen(true);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    setOrderedIds((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // Drag-and-drop reorder within the manage modal (HTML5 native, no extra deps)
  const dragIndexRef = useRef<number | null>(null);
  const onDragStart = (i: number) => { dragIndexRef.current = i; };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (i: number) => {
    const from = dragIndexRef.current;
    dragIndexRef.current = null;
    if (from == null || from === i) return;
    setOrderedIds((prev) => {
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(i, 0, m);
      return next;
    });
  };

  const orderedForManage = orderedIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as typeof items;

  const showLightbox = (i: number) => { setLightboxIndex(i); setZoom(1); };
  const lightboxItem = lightboxIndex != null ? items[lightboxIndex] : null;
  const lightboxSrc = useSignedAssetImageUrl(lightboxItem?.url ?? null);
  const navLightbox = (dir: -1 | 1) => {
    if (lightboxIndex == null) return;
    setLightboxIndex((lightboxIndex + dir + items.length) % items.length);
    setZoom(1);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">
          {title} {items.length > 0 && <span className="text-muted-foreground font-normal">({items.length})</span>}
        </h3>
        {!readOnly && (
          <div className="flex gap-2">
            {items.length > 1 && (
              <Button type="button" variant="outline" size="sm" onClick={openManage}>
                <Pencil className="mr-2 h-4 w-4" /> Manage
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
              {uploading ? "Uploading…" : "Add photos"}
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = ""; }}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading photos…</p>
      ) : items.length === 0 ? (
        !readOnly && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30 p-6 text-center text-sm text-muted-foreground transition-colors"
          >
            <ImagePlus className="mx-auto mb-2 h-6 w-6" />
            Click to add photos
          </button>
        )
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((it, i) => (
            <PhotoCard
              key={it.id}
              item={it}
              readOnly={readOnly}
              onZoom={() => showLightbox(i)}
              onDelete={() => deleteMutation.mutate(it)}
              onSaveMeta={(caption, description) =>
                updateMetaMutation.mutate({ id: it.id, caption, description })
              }
            />
          ))}
        </div>
      )}

      {/* Lightbox with zoom + nav */}
      <Dialog open={lightboxIndex != null} onOpenChange={(o) => !o && setLightboxIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-background border overflow-hidden">
          {lightboxItem && (
            <div className="relative">
              <div className="overflow-auto max-h-[80vh] flex items-center justify-center bg-muted">
                <img
                  src={lightboxSrc ?? lightboxItem.url}
                  alt={lightboxItem.file_name || "Preview"}
                  className="transition-transform"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <Button size="icon" variant="secondary" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} title="Zoom out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setZoom(1)} title="Reset zoom" className="px-2">
                  <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
                </Button>
                <Button size="icon" variant="secondary" onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))} title="Zoom in">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              {items.length > 1 && (
                <>
                  <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={() => navLightbox(-1)}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => navLightbox(1)}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-xs">
                {(lightboxIndex ?? 0) + 1} / {items.length}
                {lightboxItem.file_name ? ` — ${lightboxItem.file_name}` : ""}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage / reorder modal (drag-and-drop or arrows) */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-3">
            <h3 className="font-semibold">Manage photos</h3>
            <p className="text-sm text-muted-foreground">Drag items to reorder, or use the arrows. Click Save to apply.</p>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {orderedForManage.map((it, i) => (
                <div
                  key={it.id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(i)}
                  className="flex items-center gap-3 border rounded-md p-2 bg-card hover:bg-accent/30 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <ManageThumb src={it.url} alt={it.caption || it.file_name || "Photo"} />
                  <div className="flex-1 truncate text-sm">
                    {it.caption || it.file_name || "Photo"}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => moveItem(i, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" disabled={i === orderedForManage.length - 1} onClick={() => moveItem(i, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(it)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setManageOpen(false)}>Cancel</Button>
              <Button onClick={() => reorderMutation.mutate(orderedIds)} disabled={reorderMutation.isPending}>
                <Check className="mr-2 h-4 w-4" /> {reorderMutation.isPending ? "Saving…" : "Save order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;
