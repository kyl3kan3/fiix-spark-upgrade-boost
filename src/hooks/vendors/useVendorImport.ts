
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVendor, VendorFormData } from "@/services/vendorService";
import { toast } from "sonner";
import { parseFile } from "./parsers/fileParserFactory";
import { downloadTemplate } from "./utils/templateGenerator";
import { useVendorImageParser } from "./useVendorImageParser";
import { convertDocxToImage } from "./utils/documentConverter";

interface ParsedVendor extends VendorFormData {
  // Remove logo_url since it's not in the database schema
}

export const useVendorImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedVendor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useImageParser, setUseImageParser] = useState(false);
  const queryClient = useQueryClient();
  const { parseImageWithVision, convertFileToBase64 } = useVendorImageParser();

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
      const useImageParsing = forceImageParser || useImageParser || selectedFile.type.startsWith('image/');
      
      // Check if it's a DOCX file and we should use vision processing
      if ((selectedFile.name.toLowerCase().endsWith('.docx') || selectedFile.name.toLowerCase().endsWith('.doc')) && useImageParsing) {
        console.log('[Vendor Import] Converting DOCX to image for AI Vision processing...');
        toast.info('Converting document to image for better AI processing...');
        
        try {
          const imageBlob = await convertDocxToImage(selectedFile);
          const base64Image = await convertFileToBase64(imageBlob);
          const parsedVendors = await parseImageWithVision(base64Image);
          setParsedData(parsedVendors);
          toast.success(`Successfully parsed ${parsedVendors.length} vendors using AI Vision (converted from document)`);
          return;
        } catch (conversionError) {
          console.warn('[Vendor Import] DOCX to image conversion failed, falling back to text parsing:', conversionError);
          toast.warning('Document conversion failed, using text parsing instead...');
          // Fall back to regular text parsing
        }
      }
      
      // Check if it's an image file and we should use vision processing
      if (selectedFile.type.startsWith('image/') || useImageParsing) {
        console.log('[Vendor Import] Using GPT Vision for image processing...');
        const base64Image = await convertFileToBase64(selectedFile);
        const parsedVendors = await parseImageWithVision(base64Image);
        setParsedData(parsedVendors);
        toast.success(`Successfully parsed ${parsedVendors.length} vendors using GPT-4 Vision`);
      } else {
        // Use existing file parsing for non-image files
        const parsedVendors = await parseFile(selectedFile, useImageParsing);
        setParsedData(parsedVendors);
        
        const parsingMethod = useImageParsing ? 'AI Vision' : 'text extraction';
        toast.success(`Successfully parsed ${parsedVendors.length} vendors using ${parsingMethod}`);
      }
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
