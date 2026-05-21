export const GALLERY_BUCKET = "asset-images";
export const GALLERY_MAX_BYTES = 10 * 1024 * 1024;
export const GALLERY_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type AttachmentEntityType =
  | "asset"
  | "location"
  | "work_order"
  | "report"
  | "daily_log"
  | "inspection"
  | "vendor";

export interface AttachmentRow {
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
