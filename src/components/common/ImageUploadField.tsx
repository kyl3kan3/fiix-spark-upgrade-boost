import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSignedAssetImageUrl, getSignedAssetImageUrl } from "@/lib/storage/signedAssetImage";

interface ImageUploadFieldProps {
 label?: string;
 value?: string | null;
 onChange: (url: string | null) => void;
 /** Folder under the user's id, e.g. "assets" or "locations". */
 folder?: string;
 disabled?: boolean;
 helperText?: string;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Reusable image uploader that stores files in the public `asset-images`
 * bucket under `{user_id}/{folder}/...` and returns the public URL.
 */
export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
 label = "Photo",
 value,
 onChange,
 folder = "misc",
 disabled,
 helperText,
}) => {
 const inputRef = useRef<HTMLInputElement>(null);
 const [uploading, setUploading] = useState(false);
 const displayUrl = useSignedAssetImageUrl(value);

 const handleFile = async (file: File) => {
 if (!ALLOWED.includes(file.type)) {
 toast.error("Unsupported file type", {
 description: "Please use a JPG, PNG, WEBP, or GIF image.",
 });
 return;
 }
 if (file.size > MAX_BYTES) {
 toast.error("File too large", { description: "Max size is 5 MB." });
 return;
 }
 setUploading(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error("You must be signed in to upload images.");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  const companyId = profile?.company_id;
  if (!companyId) throw new Error("Your account is not linked to a company.");
 const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${companyId}/${folder}/${crypto.randomUUID()}.${ext}`;
 const { error: upErr } = await supabase.storage
 .from("asset-images")
 .upload(path, file, { contentType: file.type, upsert: false });
 if (upErr) throw upErr;
 const { data } = supabase.storage.from("asset-images").getPublicUrl(path);
 onChange(data.publicUrl);
 // Pre-warm the signed-URL cache so the preview renders immediately.
 void getSignedAssetImageUrl(data.publicUrl);
 toast.success("Image uploaded");
 } catch (e: any) {
 console.error("Image upload failed", e);
 toast.error("Upload failed", { description: e?.message });
 } finally {
 setUploading(false);
 if (inputRef.current) inputRef.current.value = "";
 }
 };

 return (
 <div className="space-y-2">
 <Label>{label}</Label>
 <div className="flex items-start gap-4">
 <div className="h-24 w-24 shrink-0 rounded-md border bg-muted overflow-hidden flex items-center justify-center">
 {displayUrl ? (
 <img
 src={displayUrl}
 alt={label}
 className="h-full w-full object-cover"
 loading="lazy"
 />
 ) : (
 <ImagePlus className="h-6 w-6 text-muted-foreground" />
 )}
 </div>
 <div className="flex-1 space-y-2">
 <div className="flex flex-wrap gap-2">
 <Button
 type="button"
 variant="outline"
 size="sm"
 disabled={disabled || uploading}
 onClick={() => inputRef.current?.click()}
 >
 {uploading ? (
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 ) : (
 <ImagePlus className="mr-2 h-4 w-4" />
 )}
 {value ? "Replace photo" : "Upload photo"}
 </Button>
 {value && (
 <Button
 type="button"
 variant="ghost"
 size="sm"
 disabled={disabled || uploading}
 onClick={() => onChange(null)}
 >
 <Trash2 className="mr-2 h-4 w-4" />
 Remove
 </Button>
 )}
 </div>
 <p className="text-xs text-muted-foreground">
 {helperText || "JPG, PNG, WEBP or GIF. Max 5 MB."}
 </p>
 </div>
 </div>
 <input
 ref={inputRef}
 type="file"
 accept={ALLOWED.join(",")}
 className="hidden"
 onChange={(e) => {
 const f = e.target.files?.[0];
 if (f) handleFile(f);
 }}
 />
 </div>
 );
};

export default ImageUploadField;