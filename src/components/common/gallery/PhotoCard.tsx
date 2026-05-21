import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useSignedAssetImageUrl } from "@/lib/storage/signedAssetImage";
import type { AttachmentRow } from "./types";

/** Small thumbnail that resolves a signed URL — used in the manage/reorder modal. */
export const ManageThumb: React.FC<{ src: string }> = ({ src }) => {
  const url = useSignedAssetImageUrl(src);
  return <img src={url ?? src} alt="" className="h-14 w-14 object-cover rounded" />;
};

interface PhotoCardProps {
  item: AttachmentRow;
  readOnly?: boolean;
  onZoom: () => void;
  onDelete: () => void;
  onSaveMeta: (caption: string, description: string) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ item, readOnly, onZoom, onDelete, onSaveMeta }) => {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(item.caption ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const displayUrl = useSignedAssetImageUrl(item.url);

  useEffect(() => {
    setCaption(item.caption ?? "");
    setDescription(item.description ?? "");
  }, [item.caption, item.description]);

  return (
    <div className="relative group rounded-md overflow-hidden border bg-muted flex flex-col">
      <div className="relative aspect-square">
        <img
          src={displayUrl ?? item.url}
          alt={item.caption || item.file_name || "Photo"}
          className="h-full w-full object-cover cursor-zoom-in"
          loading="lazy"
          onClick={onZoom}
        />
        {!readOnly && (
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button type="button" variant="secondary" size="icon" className="h-7 w-7" onClick={() => setEditing((v) => !v)} title="Edit caption">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="destructive" size="icon" className="h-7 w-7" onClick={onDelete} title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {item.caption && !editing && (
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1 text-xs truncate">
            {item.caption}
          </div>
        )}
      </div>
      {editing && !readOnly && (
        <div className="p-2 space-y-2 bg-card">
          <Input
            placeholder="Caption / label"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={120}
          />
          <Textarea
            placeholder="Description / notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={1000}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setCaption(item.caption ?? "");
                setDescription(item.description ?? "");
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={() => { onSaveMeta(caption.trim(), description.trim()); setEditing(false); }}>
              <Check className="mr-1 h-3.5 w-3.5" /> Save
            </Button>
          </div>
        </div>
      )}
      {!editing && item.description && (
        <div className="px-2 py-1 text-xs text-muted-foreground line-clamp-2 bg-card">
          {item.description}
        </div>
      )}
    </div>
  );
};
