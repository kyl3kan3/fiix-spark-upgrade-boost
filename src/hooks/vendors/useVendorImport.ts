import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVendor, VendorFormData } from "@/services/vendorService";
import { toast } from "sonner";
import { parseFile } from "./parsers/fileParserFactory";
import { downloadTemplate } from "./utils/templateGenerator";

interface ParsedVendor extends VendorFormData {
  // Remove logo_url since it's not in the database schema
}

export const useVendorImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedVendor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useImageParser, setUseImageParser] = useState(false);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (vendors: ParsedVendor[]) => {
      const results = await Promise.allSettled(
        vendors.map(vendor => {
          // Clean the vendor data before sending and remove logo_url
          const cleanVendor = {
            ...vendor,
            // Ensure all required fields have default values
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
            // Remove logo_url from the data being sent to the database
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
    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      const useImageParsing = forceImageParser || useImageParser;
      
      console.log(`[Vendor Import] 📄 Processing file: ${selectedFile.name}`);
      console.log(`[Vendor Import] 🔧 Parsing mode: ${useImageParsing ? 'AI Vision (Image Conversion)' : 'Text Extraction'}`);
      console.log(`[Vendor Import] 📊 File size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`[Vendor Import] 📋 File type: ${selectedFile.type}`);
      
      if (useImageParsing) {
        console.log('[Vendor Import] 🖼️ Converting file to image for AI Vision processing...');
        toast.info("Converting file to image format for AI analysis...", {
          description: "This may take a moment for large files"
        });
      }
      
      // The parseFile function handles the conversion internally when useImageParsing is true
      const parsedVendors = await parseFile(selectedFile, useImageParsing);
      setParsedData(parsedVendors);
      
      if (useImageParsing) {
        toast.success(`Successfully processed image with AI Vision`, {
          description: `Found ${parsedVendors.length} vendors by analyzing the converted image`
        });
      } else {
        toast.success(`Successfully parsed ${parsedVendors.length} vendors using text extraction`);
      }
      
    } catch (error: any) {
      console.error("Error parsing file:", error);
      
      // Provide specific error messages based on the error type
      if (error.message?.includes('Rate limit exceeded') || error.message?.includes('rate limit')) {
        toast.error("OpenAI rate limit exceeded", {
          description: "Try enabling 'AI Vision Parser' to process files as images instead of text"
        });
      } else if (error.message?.includes('AI Vision processing failed')) {
        toast.error("AI Vision processing failed", {
          description: "Try again or switch to text extraction mode"
        });
      } else {
        toast.error("Failed to parse file", {
          description: error.message || "Please check the file format and try again"
        });
      }
      setFile(null);
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
    downloadTemplate,
    clearFile,
    toggleImageParser,
    retryWithImageParser
  };
};
