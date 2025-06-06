
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVendor, VendorFormData } from "@/services/vendorService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ParsedVendor extends VendorFormData {}

interface EdgeFunctionResponse {
  success: boolean;
  vendors?: ParsedVendor[];
  error?: string;
  details?: string;
  totalBlocks?: number;
  message?: string;
}

export const useVendorImportEdgeFunction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedVendor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (vendors: ParsedVendor[]) => {
      const results = await Promise.allSettled(
        vendors.map(vendor => {
          const cleanVendor = {
            ...vendor,
            name: vendor.name || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            contact_person: vendor.contact_person || '',
            contact_title: vendor.contact_title || '',
            vendor_type: vendor.vendor_type || 'service',
            status: vendor.status || 'active',
            address: vendor.address || '',
            city: vendor.city || '',
            state: vendor.state || '',
            zip_code: vendor.zip_code || '',
            website: vendor.website || '',
            description: vendor.description || '',
            rating: vendor.rating || null
          };
          return createVendor(cleanVendor);
        })
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (failed > 0) {
        console.error('Failed vendor imports:', results.filter(result => result.status === 'rejected'));
      }
      
      return { successful, failed, total: vendors.length };
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (results.failed > 0) {
        toast.warning(`Import completed with ${results.failed} failures`, {
          description: `${results.successful}/${results.total} vendors imported successfully`
        });
      } else {
        toast.success(`Successfully imported ${results.successful} vendors`);
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
    if (!selectedFile.name.endsWith('.docx')) {
      toast.error('Currently only DOCX files are supported');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      console.log('[Edge Function Upload] Starting file processing:', selectedFile.name);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('parse-vendor', {
        body: formData,
      });
      
      if (error) {
        console.error('[Edge Function Upload] Supabase function error:', error);
        throw new Error(error.message || 'Failed to process file');
      }
      
      const response = data as EdgeFunctionResponse;
      console.log('[Edge Function Upload] Response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error occurred');
      }
      
      if (!response.vendors || response.vendors.length === 0) {
        throw new Error('No vendor data found in the document');
      }
      
      setParsedData(response.vendors);
      
      toast.success(response.message || `Successfully parsed ${response.vendors.length} vendors`, {
        description: response.totalBlocks ? `Processed ${response.totalBlocks} document blocks` : undefined
      });
      
    } catch (error: any) {
      console.error("Error parsing file with edge function:", error);
      toast.error("Failed to parse file", {
        description: error.message || "Please check the file format and try again"
      });
      setFile(null);
      setParsedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const importVendors = async (customVendors?: ParsedVendor[]): Promise<boolean> => {
    const vendorsToImport = customVendors || parsedData;
    
    if (vendorsToImport.length === 0) {
      toast.error("No vendor data to import");
      return false;
    }

    try {
      await importMutation.mutateAsync(vendorsToImport);
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
    clearFile
  };
};
