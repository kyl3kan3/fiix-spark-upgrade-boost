
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVendor, VendorFormData } from "@/services/vendorService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { parseCSVFile } from "@/hooks/vendors/parsers/csvParser";

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
  const [useImageParser, setUseImageParser] = useState(false);
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

  const uploadFile = async (selectedFile: File, forceImageParser: boolean = false) => {
    const useImageParsing = forceImageParser || useImageParser;
    const fileName = selectedFile.name.toLowerCase();
    
    // Check if it's a CSV file
    if (fileName.endsWith('.csv')) {
      setFile(selectedFile);
      setIsProcessing(true);
      
      try {
        console.log('[CSV Upload] Processing CSV file:', selectedFile.name);
        const data = await parseCSVFile(selectedFile);
        
        // Transform CSV data to match vendor format
        const transformedVendors = data.map(row => ({
          name: row.name || row.Name || '',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
          contact_person: row.contact_person || row['Contact Person'] || '',
          contact_title: row.contact_title || row['Contact Title'] || '',
          vendor_type: (row.vendor_type || row['Vendor Type'] || 'service') as 'service' | 'supplier' | 'contractor' | 'consultant',
          status: (row.status || row.Status || 'active') as 'active' | 'inactive' | 'suspended',
          address: row.address || row.Address || '',
          city: row.city || row.City || '',
          state: row.state || row.State || '',
          zip_code: row.zip_code || row['Zip Code'] || row.zipcode || '',
          website: row.website || row.Website || '',
          description: row.description || row.Description || row.notes || row.Notes || '',
          rating: row.rating ? Number(row.rating) : null
        }));
        
        setParsedData(transformedVendors);
        toast.success(`Successfully parsed ${transformedVendors.length} vendors from CSV`);
        
      } catch (error: any) {
        console.error("Error parsing CSV file:", error);
        toast.error("Failed to parse CSV file", {
          description: error.message || "Please check the file format and try again"
        });
        setFile(null);
        setParsedData([]);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // For DOCX files, use the edge function
    if (!fileName.endsWith('.docx')) {
      if (useImageParsing) {
        toast.error('AI Vision parser currently supports DOCX and CSV files. Please upload a DOCX or CSV file.');
      } else {
        toast.error('Currently only DOCX and CSV files are supported');
      }
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      console.log('[Edge Function Upload] Starting file processing:', selectedFile.name);
      console.log('[Edge Function Upload] Using AI Vision parser:', useImageParsing);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Add a parameter to indicate if we want to use image parsing
      if (useImageParsing) {
        formData.append('useImageParser', 'true');
      }
      
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
      
      const parsingMethod = useImageParsing ? 'AI Vision' : 'text extraction';
      toast.success(response.message || `Successfully parsed ${response.vendors.length} vendors using ${parsingMethod}`, {
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

  const toggleImageParser = () => {
    setUseImageParser(!useImageParser);
  };

  const retryWithImageParser = async () => {
    if (file) {
      await uploadFile(file, true);
    }
  };

  return {
    file,
    parsedData,
    isProcessing,
    isImporting: importMutation.isPending,
    useImageParser,
    uploadFile,
    importVendors,
    clearFile,
    toggleImageParser,
    retryWithImageParser
  };
};
