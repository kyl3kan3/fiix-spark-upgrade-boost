
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
    console.log("Starting vendor import process");
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Parse the file with timeout
      setProgress(20);
      console.log("Parsing file...");
      
      let vendors;
      try {
        // Add timeout to prevent hanging
        const parsePromise = parseVendorFile(file);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('File parsing timed out after 30 seconds')), 30000)
        );
        
        vendors = await Promise.race([parsePromise, timeoutPromise]) as any;
      } catch (parseError: any) {
        console.error("File parsing failed:", parseError);
        throw new Error(`File parsing failed: ${parseError.message}`);
      }
      
      console.log("Successfully parsed vendors:", vendors.length);
      
      if (vendors.length === 0) {
        throw new Error("No vendor data found in the file. Please check the file format and content.");
      }

      setProgress(40);

      // Import vendors with better error handling
      const importResults: ImportResults = {
        successful: 0,
        failed: 0,
        errors: []
      };

      console.log("Starting vendor creation process...");
      
      for (let i = 0; i < vendors.length; i++) {
        try {
          console.log(`Creating vendor ${i + 1}/${vendors.length}:`, vendors[i].name);
          
          // Validate required fields
          if (!vendors[i].name || vendors[i].name.trim().length === 0) {
            throw new Error("Vendor name is required");
          }
          
          // Add timeout to individual vendor creation
          const createPromise = createVendorMutation.mutateAsync(vendors[i]);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Vendor creation timed out')), 10000)
          );
          
          await Promise.race([createPromise, timeoutPromise]);
          importResults.successful++;
          console.log(`✓ Successfully created vendor: ${vendors[i].name}`);
        } catch (error: any) {
          console.error(`✗ Failed to create vendor ${vendors[i].name}:`, error);
          importResults.failed++;
          importResults.errors.push({
            row: i + 2, // +2 because row 1 is header and arrays are 0-indexed
            message: `${vendors[i].name}: ${error.message || "Failed to create vendor"}`
          });
        }
        
        // Update progress
        const newProgress = 40 + ((i + 1) / vendors.length) * 60;
        setProgress(newProgress);
      }

      console.log("Import results:", importResults);
      setResults(importResults);
      
      // Refresh vendor list
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      
      if (importResults.successful > 0) {
        toast.success(`Successfully imported ${importResults.successful} vendor${importResults.successful !== 1 ? 's' : ''}`);
      }
      
      if (importResults.failed > 0) {
        toast.error(`Failed to import ${importResults.failed} vendor${importResults.failed !== 1 ? 's' : ''}`);
      }

    } catch (error: any) {
      console.error("Import process failed:", error);
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
    console.log("Resetting import state");
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
