
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseVendorFile } from "@/utils/vendorImport";
import { createVendor } from "@/services/vendorService";
import type { ImportError, ImportResults } from "@/utils/vendorImport";

export const useVendorImport = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createVendorMutation = useMutation({
    mutationFn: createVendor,
  });

  const importFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      console.log("Starting file import for:", file.name, file.type);
      
      // Parse the file
      setProgress(20);
      const vendors = await parseVendorFile(file);
      console.log("Parsed vendors:", vendors.length);
      
      if (vendors.length === 0) {
        throw new Error("No vendor data found in the file");
      }

      setProgress(40);

      // Import vendors
      const importResults: ImportResults = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < vendors.length; i++) {
        try {
          console.log(`Creating vendor ${i + 1}/${vendors.length}:`, vendors[i].name);
          await createVendorMutation.mutateAsync(vendors[i]);
          importResults.successful++;
          console.log(`Successfully created vendor: ${vendors[i].name}`);
        } catch (error: any) {
          console.error(`Failed to create vendor ${vendors[i].name}:`, error);
          importResults.failed++;
          importResults.errors.push({
            row: i + 2, // +2 because row 1 is header and arrays are 0-indexed
            message: error.message || "Failed to create vendor"
          });
        }
        
        // Update progress
        const newProgress = 40 + ((i + 1) / vendors.length) * 60;
        setProgress(newProgress);
        console.log(`Progress: ${newProgress}%`);
      }

      setResults(importResults);
      
      // Refresh vendor list
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      
      if (importResults.successful > 0) {
        toast.success(`Successfully imported ${importResults.successful} vendors`);
      }
      
      if (importResults.failed > 0) {
        toast.error(`Failed to import ${importResults.failed} vendors`);
      }

    } catch (error: any) {
      console.error("Import failed:", error);
      setError(error.message || "Failed to process file");
      toast.error("Import failed", {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
      console.log("Import process completed");
    }
  };

  const resetImport = () => {
    setResults(null);
    setError(null);
    setProgress(0);
    setIsProcessing(false);
  };

  return {
    importFile,
    isProcessing,
    progress,
    results,
    error,
    resetImport
  };
};
