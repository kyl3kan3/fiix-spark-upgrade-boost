
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { parseCSVFile } from "@/hooks/vendors/parsers/csvParser";
import { parseWithImage } from "@/hooks/vendors/parsers/imageParser";
import { convertToImages } from "@/hooks/vendors/utils/converters";
import { ParsedVendor, EdgeFunctionResponse } from "./types";

export const useFileUploadHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadFile = async (
    selectedFile: File, 
    forceImageParser: boolean = false,
    useImageParser: boolean = false,
    setParsedData: (data: ParsedVendor[]) => void,
    setFile: (file: File | null) => void
  ) => {
    const useImageParsing = forceImageParser || useImageParser;
    const fileName = selectedFile.name.toLowerCase();
    
    // Check if it's a CSV file - always parse directly
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

    // For image files, use AI Vision parsing directly
    if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
      setFile(selectedFile);
      setIsProcessing(true);
      
      try {
        console.log('[Image Upload] Processing image file:', selectedFile.name);
        const vendors = await parseWithImage(selectedFile);
        setParsedData(vendors);
        toast.success(`Successfully parsed ${vendors.length} vendors from image using AI Vision`);
      } catch (error: any) {
        console.error("Error parsing image file:", error);
        toast.error("Failed to parse image file", {
          description: error.message || "Please try a different image or file format"
        });
        setFile(null);
        setParsedData([]);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // For DOCX files, use the edge function (text extraction or image conversion)
    if (fileName.endsWith('.docx')) {
      setFile(selectedFile);
      setIsProcessing(true);
      
      try {
        console.log('[DOCX Upload] Processing DOCX file:', selectedFile.name);
        console.log('[DOCX Upload] Using AI Vision parser:', useImageParsing);
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        if (useImageParsing) {
          formData.append('useImageParser', 'true');
        }
        
        const { data, error } = await supabase.functions.invoke('parse-vendor', {
          body: formData,
        });
        
        if (error) {
          console.error('[DOCX Upload] Supabase function error:', error);
          throw new Error(error.message || 'Failed to process DOCX file');
        }
        
        const response = data as EdgeFunctionResponse;
        console.log('[DOCX Upload] Response:', response);
        
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
        console.error("Error parsing DOCX file:", error);
        toast.error("Failed to parse DOCX file", {
          description: error.message || "Please check the file format and try again"
        });
        setFile(null);
        setParsedData([]);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // For PDF and other document types, convert to images and use AI Vision
    if (fileName.match(/\.(pdf|doc|rtf|txt|xlsx|xls|ppt|pptx)$/)) {
      setFile(selectedFile);
      setIsProcessing(true);
      
      try {
        console.log('[Document Upload] Converting document to images:', selectedFile.name);
        
        // Convert document to images
        const imageFiles = await convertToImages(selectedFile);
        console.log(`[Document Upload] Converted to ${imageFiles.length} image(s)`);
        
        // Parse each image with AI Vision
        let allVendors: ParsedVendor[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          console.log(`[Document Upload] Processing image ${i + 1}/${imageFiles.length}`);
          
          try {
            const vendors = await parseWithImage(imageFile);
            allVendors.push(...vendors);
          } catch (pageError) {
            console.warn(`[Document Upload] Failed to parse page ${i + 1}:`, pageError);
            // Continue with other pages
          }
        }
        
        // Remove duplicates based on name and email
        const uniqueVendors = allVendors.filter((vendor, index, arr) => {
          return arr.findIndex(v => 
            v.name.toLowerCase() === vendor.name.toLowerCase() && 
            v.email.toLowerCase() === vendor.email.toLowerCase()
          ) === index;
        });
        
        setParsedData(uniqueVendors);
        toast.success(`Successfully parsed ${uniqueVendors.length} vendors from ${selectedFile.type.includes('pdf') ? 'PDF' : 'document'} using AI Vision`, {
          description: imageFiles.length > 1 ? `Processed ${imageFiles.length} pages` : undefined
        });
        
      } catch (error: any) {
        console.error("Error processing document file:", error);
        toast.error("Failed to process document", {
          description: error.message || "Please try a different file format or contact support"
        });
        setFile(null);
        setParsedData([]);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Unsupported file type
    toast.error("Unsupported file type", {
      description: "Please upload CSV, DOCX, PDF, image files, or other common document formats"
    });
  };

  return {
    uploadFile,
    isProcessing
  };
};
