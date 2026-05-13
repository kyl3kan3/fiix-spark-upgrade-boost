import { supabase } from "@/integrations/supabase/client";
import { logAttachmentEvent } from "@/lib/attachments/audit";
import { tryGetUserCompany } from "@/services/supabaseHelpers";
import {
  GALLERY_ALLOWED_TYPES,
  GALLERY_BUCKET,
  GALLERY_MAX_BYTES,
  type AttachmentEntityType,
  type AttachmentRow,
} from "@/components/common/gallery/types";

/**
 * Pure data-access layer for the photo / attachment gallery. UI components
 * should call these via the `useGalleryMutations` / `useGalleryQuery`
 * react-query wrappers in `@/components/common/gallery/useGalleryMutations`;
 * the functions themselves stay framework-free so they can be unit-tested
 * or invoked from a service worker / edge function without React.
 */

interface EntityRef {
  entityType: AttachmentEntityType;
  entityId: string;
}

export async function listAttachments({ entityType, entityId }: EntityRef): Promise<AttachmentRow[]> {
  const { data, error } = await supabase
    .from("attachments")
    .select("id,url,storage_path,file_name,uploaded_by,created_at,sort_order,caption,description")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as AttachmentRow[];
}

export async function uploadAttachment(file: File, ref: EntityRef): Promise<void> {
  if (!GALLERY_ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Unsupported type: ${file.name}`);
  }
  if (file.size > GALLERY_MAX_BYTES) {
    throw new Error(`${file.name} exceeds 10 MB`);
  }
  const { userId, companyId } = await tryGetUserCompany();
  if (!userId) throw new Error("You must be signed in to upload");
  if (!companyId) throw new Error("Your account is not linked to a company");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${companyId}/${ref.entityType}/${ref.entityId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);

  const { data: inserted, error: insErr } = await supabase.from("attachments").insert({
    company_id: companyId,
    entity_type: ref.entityType,
    entity_id: ref.entityId,
    url: pub.publicUrl,
    storage_path: path,
    file_name: file.name,
    content_type: file.type,
    size_bytes: file.size,
    uploaded_by: userId,
    sort_order: Date.now() % 1000000,
  }).select("id").single();
  if (insErr) throw insErr;

  await logAttachmentEvent({
    companyId,
    entityType: ref.entityType,
    entityId: ref.entityId,
    attachmentId: inserted?.id ?? null,
    action: "uploaded",
    actorId: userId,
    details: { file_name: file.name, size_bytes: file.size },
  });
}

export async function deleteAttachment(item: AttachmentRow, ref: EntityRef): Promise<void> {
  const { userId, companyId } = await tryGetUserCompany();
  await supabase.storage.from(GALLERY_BUCKET).remove([item.storage_path]);
  const { error } = await supabase.from("attachments").delete().eq("id", item.id);
  if (error) throw error;
  if (userId && companyId) {
    await logAttachmentEvent({
      companyId,
      entityType: ref.entityType,
      entityId: ref.entityId,
      attachmentId: item.id,
      action: "deleted",
      actorId: userId,
      details: { file_name: item.file_name },
    });
  }
}

export async function reorderAttachments(ids: string[], ref: EntityRef): Promise<void> {
  await Promise.all(
    ids.map((id, idx) =>
      supabase.from("attachments").update({ sort_order: idx }).eq("id", id),
    ),
  );
  const { userId, companyId } = await tryGetUserCompany();
  if (userId && companyId) {
    await logAttachmentEvent({
      companyId,
      entityType: ref.entityType,
      entityId: ref.entityId,
      action: "reordered",
      actorId: userId,
      details: { order: ids },
    });
  }
}

export interface AttachmentMetaUpdate {
  id: string;
  caption?: string | null;
  description?: string | null;
}

export async function updateAttachmentMeta(
  vars: AttachmentMetaUpdate,
  ref: EntityRef,
): Promise<void> {
  const { error } = await supabase
    .from("attachments")
    .update({ caption: vars.caption ?? null, description: vars.description ?? null })
    .eq("id", vars.id);
  if (error) throw error;
  const { userId, companyId } = await tryGetUserCompany();
  if (userId && companyId) {
    await logAttachmentEvent({
      companyId,
      entityType: ref.entityType,
      entityId: ref.entityId,
      attachmentId: vars.id,
      action: "updated",
      actorId: userId,
      details: { caption: vars.caption, description: vars.description },
    });
  }
}
