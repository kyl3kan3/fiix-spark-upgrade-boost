import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useOnboardingDocuments } from "@/hooks/useOnboardingDocuments";
import { getOnboardingDocumentUrl, type OnboardingDocument } from "@/services/documentDumpService";
import {
  ACCEPTED_MIME_HINT,
  DOC_KINDS,
  DOC_KIND_LABELS,
  formatBytes,
  type DocKind,
} from "@/lib/documentDump";

const AUTO = "__auto__";

const STATUS_STYLES: Record<OnboardingDocument["status"], string> = {
  uploaded: "bg-muted text-muted-foreground",
  processing: "bg-warning/15 text-warning border-warning/30",
  processed: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

const DocumentDumpUploader: React.FC = () => {
  const { documents, isLoading, error, refetch, uploadFiles, isUploading, remove, isRemoving } =
    useOnboardingDocuments();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [kind, setKind] = useState<string>(AUTO);

  const handleFiles = (fileList: FileList | null) => {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) return;
    void uploadFiles(files, kind === AUTO ? undefined : (kind as DocKind));
  };

  const onDownload = async (doc: OnboardingDocument) => {
    try {
      const url = await getOnboardingDocumentUrl(doc.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("Failed to get document URL:", e);
      toast.error("Couldn't open that document");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="space-y-2">
          <Label>Document type</Label>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger aria-label="Document type" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AUTO}>Auto-detect</SelectItem>
              {DOC_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {DOC_KIND_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground sm:pb-2">
          Applied to the next files you add. Leave on Auto-detect to guess from the file name.
        </p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`w-full rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_MIME_HINT}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="font-medium">
            {isUploading ? "Uploading…" : "Drop files here or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            Asset lists, manuals, warranties, floor plans — PDF, CSV, Excel, Word, images. Up to 25 MB each.
          </p>
        </div>
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Uploaded documents{documents.length ? ` (${documents.length})` : ""}
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/40">
            <CardContent className="flex items-center justify-between p-4">
              <p className="text-sm text-muted-foreground">
                {error.message || "Couldn't load your documents."}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No documents yet. Drop your existing asset lists and manuals above to get a head start.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-3">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {DOC_KIND_LABELS[doc.doc_kind]} · {formatBytes(doc.size_bytes)}
                      </p>
                    </div>
                    <Badge variant="outline" className={STATUS_STYLES[doc.status]}>
                      <span className="capitalize">{doc.status}</span>
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => onDownload(doc)} aria-label="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(doc)}
                      disabled={isRemoving}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentDumpUploader;
