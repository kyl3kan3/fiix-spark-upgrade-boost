import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const BUCKET = "asset-images";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type AttachmentEntityType =
  | "asset"
  | "location"
  | "work_order"
  | "report"
  | "daily_log"
  | "inspection"
  | "vendor";

interface ImageGalleryProps {
  entityType: AttachmentEntityType;
  entityId: string;
  title?: string;
  className?: string;
  /** Compact preview (thumbnails only, no upload UI). */
  readOnly?: boolean;
}

interface AttachmentRow {
  id: string;
  url: string;
  storage_path: string;
  file_name: string | null;
  uploaded_by: string;
  created_at: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  entityType,
  entityId,
  title = "Photos",
  className,
  readOnly,
}) => {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const queryKey = ["attachments", entityType, entityId];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attachments")
        .select("id,url,storage_path,file_name,uploaded_by,created_at")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as AttachmentRow[];
    },
    enabled: !!entityId,
  });

  const uploadOne = async (file: File) => {
    if (!ALLOWED.includes(file.type)) throw new Error(`Unsupported type: ${file.name}`);
    if (file.size > MAX_BYTES) throw new Error(`${file.name} exceeds 10 MB`);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to upload");
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.company_id) throw new Error("Your account is not linked to a company");

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${profile.company_id}/${entityType}/${entityId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: insErr } = await supabase.from("attachments").insert({
      company_id: profile.company_id,
      entity_type: entityType,
      entity_id: entityId,
      url: pub.publicUrl,
      storage_path: path,
      file_name: file.name,
      content_type: file.type,
      size_bytes: file.size,
      uploaded_by: user.id,
    });
    if (insErr) throw insErr;
  };

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      for (const f of files) {
        await uploadOne(f);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Photos uploaded");
    },
    onError: (e: any) => toast.error(e?.message || "Upload failed"),
    onSettled: () => setUploading(false),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    uploadMutation.mutate(Array.from(files));
  };

  const deleteMutation = useMutation({
    mutationFn: async (item: AttachmentRow) => {
      await supabase.storage.from(BUCKET).remove([item.storage_path]);
      const { error } = await supabase.from("attachments").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Photo removed");
    },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title} {items.length > 0 && <span className="text-muted-foreground font-normal">({items.length})</span>}</h3>
        {!readOnly && (
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
          {items.map((it) => (
            <div key={it.id} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
              <img
                src={it.url}
                alt={it.file_name || "Photo"}
                className="h-full w-full object-cover cursor-zoom-in"
                loading="lazy"
                onClick={() => setPreviewUrl(it.url)}
              />
              {!readOnly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMutation.mutate(it)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;