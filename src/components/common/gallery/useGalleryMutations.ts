import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAttachmentEvent } from "@/lib/attachments/audit";
import {
  GALLERY_ALLOWED_TYPES,
  GALLERY_BUCKET,
  GALLERY_MAX_BYTES,
  type AttachmentEntityType,
  type AttachmentRow,
} from "./types";

async function getCurrentUserAndCompany() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, companyId: null as string | null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  return { user, companyId: (profile?.company_id ?? null) as string | null };
}

interface UseGalleryArgs {
  entityType: AttachmentEntityType;
  entityId: string;
  onReorderSaved?: () => void;
}

export function useGalleryQuery({ entityType, entityId }: UseGalleryArgs) {
  const queryKey: QueryKey = ["attachments", entityType, entityId];
  const query = useQuery({
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
  return { ...query, queryKey };
}

export function useGalleryMutations({ entityType, entityId, onReorderSaved }: UseGalleryArgs) {
  const qc = useQueryClient();
  const queryKey: QueryKey = ["attachments", entityType, entityId];

  const uploadOne = async (file: File) => {
    if (!GALLERY_ALLOWED_TYPES.includes(file.type)) throw new Error(`Unsupported type: ${file.name}`);
    if (file.size > GALLERY_MAX_BYTES) throw new Error(`${file.name} exceeds 10 MB`);
    const { user, companyId } = await getCurrentUserAndCompany();
    if (!user) throw new Error("You must be signed in to upload");
    if (!companyId) throw new Error("Your account is not linked to a company");

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${companyId}/${entityType}/${entityId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);

    const { data: inserted, error: insErr } = await supabase.from("attachments").insert({
      company_id: companyId,
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
      companyId,
      entityType,
      entityId,
      attachmentId: inserted?.id ?? null,
      action: "uploaded",
      actorId: user.id,
      details: { file_name: file.name, size_bytes: file.size },
    });
  };

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      for (const f of files) await uploadOne(f);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Photos uploaded");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });

  const remove = useMutation({
    mutationFn: async (item: AttachmentRow) => {
      const { user, companyId } = await getCurrentUserAndCompany();
      await supabase.storage.from(GALLERY_BUCKET).remove([item.storage_path]);
      const { error } = await supabase.from("attachments").delete().eq("id", item.id);
      if (error) throw error;
      if (user && companyId) {
        await logAttachmentEvent({
          companyId,
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
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const reorder = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id, idx) =>
        supabase.from("attachments").update({ sort_order: idx }).eq("id", id)
      ));
      const { user, companyId } = await getCurrentUserAndCompany();
      if (user && companyId) {
        await logAttachmentEvent({
          companyId,
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
      onReorderSaved?.();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save order"),
  });

  const updateMeta = useMutation({
    mutationFn: async (vars: { id: string; caption?: string | null; description?: string | null }) => {
      const { error } = await supabase
        .from("attachments")
        .update({ caption: vars.caption ?? null, description: vars.description ?? null })
        .eq("id", vars.id);
      if (error) throw error;
      const { user, companyId } = await getCurrentUserAndCompany();
      if (user && companyId) {
        await logAttachmentEvent({
          companyId,
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
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  return { upload, remove, reorder, updateMeta };
}
