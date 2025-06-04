
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseVendorFile } from "@/utils/vendorImport";
import { createVendor, type VendorFormData } from "@/services/vendorService";

interface ImportError {
  row: number;
  message: string;
}

interface ImportResults {
  successful: number;
  failed: number;
  errors: ImportError[];
}

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
      // Parse the file
      setProgress(20);
      const vendors = await parseVendorFile(file);
      
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
          await createVendorMutation.mutateAsync(vendors[i]);
          importResults.successful++;
        } catch (error: any) {
          importResults.failed++;
          importResults.errors.push({
            row: i + 2, // +2 because row 1 is header and arrays are 0-indexed
            message: error.message || "Failed to create vendor"
          });
        }
        
        // Update progress
        setProgress(40 + ((i + 1) / vendors.length) * 60);
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
      setError(error.message || "Failed to process file");
      toast.error("Import failed", {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
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
