import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, Trash2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Pencil, Check, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { logAttachmentEvent } from "@/lib/attachments/audit";
import { useSignedAssetImageUrl } from "@/lib/storage/signedAssetImage";

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
 readOnly?: boolean;
}

interface AttachmentRow {
 id: string;
 url: string;
 storage_path: string;
 file_name: string | null;
 uploaded_by: string;
 created_at: string;
 sort_order?: number | null;
 caption?: string | null;
 description?: string | null;
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
 const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
 const [zoom, setZoom] = useState(1);
 const [manageOpen, setManageOpen] = useState(false);
 const [orderedIds, setOrderedIds] = useState<string[]>([]);

 const queryKey = ["attachments", entityType, entityId];

 const { data: items = [], isLoading } = useQuery({
 queryKey,
 queryFn: async () => {
 const { data, error } = await supabase
 .from("attachments")
 .select("id,url,storage_path,file_name,uploaded_by,created_at,sort_order,caption,description")
 .eq("entity_type", entityType)
 .eq("entity_id", entityId)
 .order("sort_order", { ascending: true })
 .order("created_at", { ascending: true });
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

 const { data: inserted, error: insErr } = await supabase.from("attachments").insert({
 company_id: profile.company_id,
 entity_type: entityType,
 entity_id: entityId,
 url: pub.publicUrl,
 storage_path: path,
 file_name: file.name,
 content_type: file.type,
 size_bytes: file.size,
 uploaded_by: user.id,
 sort_order: Date.now() % 1000000,
 }).select("id").single();
 if (insErr) throw insErr;
 await logAttachmentEvent({
 companyId: profile.company_id,
 entityType,
 entityId,
 attachmentId: inserted?.id ?? null,
 action: "uploaded",
 actorId: user.id,
 details: { file_name: file.name, size_bytes: file.size },
 });
 };

 const uploadMutation = useMutation({
 mutationFn: async (files: File[]) => {
 for (const f of files) await uploadOne(f);
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
 const { data: { user } } = await supabase.auth.getUser();
 const { data: profile } = user
 ? await supabase.from("profiles").select("company_id").eq("id", user.id).maybeSingle()
 : { data: null as any };
 await supabase.storage.from(BUCKET).remove([item.storage_path]);
 const { error } = await supabase.from("attachments").delete().eq("id", item.id);
 if (error) throw error;
 if (user && profile?.company_id) {
 await logAttachmentEvent({
 companyId: profile.company_id,
 entityType,
 entityId,
 attachmentId: item.id,
 action: "deleted",
 actorId: user.id,
 details: { file_name: item.file_name },
 });
 }
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey });
 toast.success("Photo removed");
 },
 onError: (e: any) => toast.error(e?.message || "Delete failed"),
 });

 const reorderMutation = useMutation({
 mutationFn: async (ids: string[]) => {
 await Promise.all(ids.map((id, idx) =>
 supabase.from("attachments").update({ sort_order: idx }).eq("id", id)
 ));
 const { data: { user } } = await supabase.auth.getUser();
 const { data: profile } = user
 ? await supabase.from("profiles").select("company_id").eq("id", user.id).maybeSingle()
 : { data: null as any };
 if (user && profile?.company_id) {
 await logAttachmentEvent({
 companyId: profile.company_id,
 entityType,
 entityId,
 action: "reordered",
 actorId: user.id,
 details: { order: ids },
 });
 }
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey });
 toast.success("Order saved");
 setManageOpen(false);
 },
 onError: (e: any) => toast.error(e?.message || "Could not save order"),
 });

 const updateMetaMutation = useMutation({
 mutationFn: async (vars: { id: string; caption?: string | null; description?: string | null }) => {
 const { error } = await supabase
 .from("attachments")
 .update({ caption: vars.caption ?? null, description: vars.description ?? null })
 .eq("id", vars.id);
 if (error) throw error;
 const { data: { user } } = await supabase.auth.getUser();
 const { data: profile } = user
 ? await supabase.from("profiles").select("company_id").eq("id", user.id).maybeSingle()
 : { data: null as any };
 if (user && profile?.company_id) {
 await logAttachmentEvent({
 companyId: profile.company_id,
 entityType,
 entityId,
 attachmentId: vars.id,
 action: "updated",
 actorId: user.id,
 details: { caption: vars.caption, description: vars.description },
 });
 }
 },
 onSuccess: () => {
 qc.invalidateQueries({ queryKey });
 toast.success("Saved");
 },
 onError: (e: any) => toast.error(e?.message || "Could not save"),
 });

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
 .filter(Boolean) as AttachmentRow[];

 const showLightbox = (i: number) => { setLightboxIndex(i); setZoom(1); };
 const lightboxItem = lightboxIndex != null ? items[lightboxIndex] : null;
 const lightboxSrc = useSignedAssetImageUrl(lightboxItem?.url ?? null);
 const navLightbox = (dir: -1 | 1) => {
 if (lightboxIndex == null) return;
 const next = (lightboxIndex + dir + items.length) % items.length;
 setLightboxIndex(next);
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
 <ManageThumb src={it.url} />
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

const ManageThumb: React.FC<{ src: string }> = ({ src }) => {
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

const PhotoCard: React.FC<PhotoCardProps> = ({ item, readOnly, onZoom, onDelete, onSaveMeta }) => {
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
 <Button size="sm" variant="outline" onClick={() => { setEditing(false); setCaption(item.caption ?? ""); setDescription(item.description ?? ""); }}>
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
