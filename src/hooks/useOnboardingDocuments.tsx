import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchOnboardingDocuments,
  uploadOnboardingDocument,
  deleteOnboardingDocument,
  type OnboardingDocument,
} from "@/services/documentDumpService";
import type { DocKind } from "@/lib/documentDump";

const DOCS_KEY = ["onboarding-documents"] as const;

export function useOnboardingDocuments() {
  const queryClient = useQueryClient();
  const [uploadingCount, setUploadingCount] = useState(0);

  const {
    data: documents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: DOCS_KEY,
    queryFn: fetchOnboardingDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOnboardingDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCS_KEY }),
  });

  /** Upload a batch, tolerating per-file failures so one bad file doesn't sink the rest. */
  const uploadFiles = async (files: File[], docKind?: DocKind) => {
    if (files.length === 0) return;
    setUploadingCount((c) => c + files.length);
    let ok = 0;
    try {
      const results = await Promise.allSettled(files.map((f) => uploadOnboardingDocument(f, docKind)));
      results.forEach((r, i) => {
        if (r.status === "fulfilled") ok += 1;
        else {
          console.error("Upload failed:", files[i]?.name, r.reason);
          toast.error(`Couldn't upload ${files[i]?.name ?? "a file"}`);
        }
      });
      if (ok > 0) {
        toast.success(`Uploaded ${ok} ${ok === 1 ? "document" : "documents"}`);
        queryClient.invalidateQueries({ queryKey: DOCS_KEY });
      }
    } finally {
      setUploadingCount((c) => Math.max(0, c - files.length));
    }
  };

  return {
    documents,
    isLoading,
    error: (error as Error) ?? null,
    refetch,
    uploadFiles,
    isUploading: uploadingCount > 0,
    remove: (doc: OnboardingDocument) => deleteMutation.mutate(doc),
    isRemoving: deleteMutation.isPending,
  };
}
