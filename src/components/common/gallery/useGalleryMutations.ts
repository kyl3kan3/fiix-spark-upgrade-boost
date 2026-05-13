import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAttachment,
  listAttachments,
  reorderAttachments,
  updateAttachmentMeta,
  uploadAttachment,
  type AttachmentMetaUpdate,
} from "@/services/attachments/attachmentService";
import type { AttachmentEntityType, AttachmentRow } from "./types";

interface UseGalleryArgs {
  entityType: AttachmentEntityType;
  entityId: string;
  onReorderSaved?: () => void;
}

const galleryQueryKey = (entityType: AttachmentEntityType, entityId: string): QueryKey =>
  ["attachments", entityType, entityId];

const errorToast = (fallback: string) => (e: unknown) =>
  toast.error(e instanceof Error ? e.message : fallback);

export function useGalleryQuery({ entityType, entityId }: UseGalleryArgs) {
  const queryKey = galleryQueryKey(entityType, entityId);
  const query = useQuery({
    queryKey,
    queryFn: () => listAttachments({ entityType, entityId }),
    enabled: !!entityId,
  });
  return { ...query, queryKey };
}

export function useGalleryMutations({ entityType, entityId, onReorderSaved }: UseGalleryArgs) {
  const qc = useQueryClient();
  const queryKey = galleryQueryKey(entityType, entityId);
  const ref = { entityType, entityId };

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      for (const f of files) await uploadAttachment(f, ref);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Photos uploaded");
    },
    onError: errorToast("Upload failed"),
  });

  const remove = useMutation({
    mutationFn: (item: AttachmentRow) => deleteAttachment(item, ref),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Photo removed");
    },
    onError: errorToast("Delete failed"),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => reorderAttachments(ids, ref),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Order saved");
      onReorderSaved?.();
    },
    onError: errorToast("Could not save order"),
  });

  const updateMeta = useMutation({
    mutationFn: (vars: AttachmentMetaUpdate) => updateAttachmentMeta(vars, ref),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Saved");
    },
    onError: errorToast("Could not save"),
  });

  return { upload, remove, reorder, updateMeta };
}
