
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVendor, VendorFormData } from "@/services/vendorService";
import { toast } from "sonner";
import { parseFile } from "./parsers/fileParserFactory";
import { downloadTemplate } from "./utils/templateGenerator";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
}

export const useVendorImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedVendor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (vendors: ParsedVendor[]) => {
      const results = await Promise.allSettled(
        vendors.map(vendor => createVendor(vendor))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      return { successful, failed, total: vendors.length };
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (results.failed > 0) {
        toast.warning(`Import completed with ${results.failed} failures`, {
          description: `${results.successful}/${results.total} vendors imported successfully`
        });
      }
    },
    onError: (error: any) => {
      console.error("Error importing vendors:", error);
      toast.error("Failed to import vendors", {
        description: error.message || "An unexpected error occurred"
      });
    }
  });

  const uploadFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      const parsedVendors = await parseFile(selectedFile);
      setParsedData(parsedVendors);
      toast.success(`Successfully parsed ${parsedVendors.length} vendors`);
    } catch (error: any) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse file", {
        description: error.message || "Please check the file format and try again"
      });
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const importVendors = async (): Promise<boolean> => {
    if (parsedData.length === 0) {
      toast.error("No vendor data to import");
      return false;
    }

    try {
      await importMutation.mutateAsync(parsedData);
      clearFile();
      return true;
    } catch (error) {
      return false;
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
  };

  return {
    file,
    parsedData,
    isProcessing,
    isImporting: importMutation.isPending,
    uploadFile,
    importVendors,
    downloadTemplate,
    clearFile
  };
};
