
import { VendorFormData } from "@/services/vendorService";
import { parseCSV } from "./csvParser";
import { parseWord } from "./wordParser";
import { parseWithImage } from "./imageParser";
import { convertFileToImage } from "../utils/documentConverter";
import { useVendorImageParser } from "../useVendorImageParser";

interface ParsedVendor extends VendorFormData {
  // Remove logo_url field since it's not in the database schema
}

export const parseFile = async (file: File, useImageParser: boolean = false): Promise<ParsedVendor[]> => {
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const { parseImageWithVision, convertFileToBase64 } = useVendorImageParser();
  
  // If AI Vision parser is enabled, convert any file to image and use vision parsing
  if (useImageParser) {
    console.log('[File Parser] Using AI Vision mode - converting file to image...');
    
    try {
      // Convert file to image first (this handles all file types)
      const imageFile = await convertFileToImage(file);
      console.log('[File Parser] File converted to image successfully, size:', imageFile.size);
      
      // Convert the image to base64 for the Vision API
      const base64Image = await convertFileToBase64(imageFile);
      console.log('[File Parser] Image converted to base64, length:', base64Image.length);
      
      // Process the image with Vision API (this should be much smaller than text)
      const vendors = await parseImageWithVision(base64Image);
      console.log(`[File Parser] Successfully parsed ${vendors.length} vendors using AI Vision`);
      return vendors;
    } catch (error) {
      console.error('[File Parser] AI Vision processing failed:', error);
      throw new Error(`AI Vision processing failed: ${error.message}`);
    }
  }
  
  // Use original file type parsers for text mode only
  if (file.type.startsWith('image/')) {
    return await parseWithImage(file);
  }
  
  switch (fileExtension) {
    case 'csv':
      return await parseCSV(file);
    case 'xlsx':
    case 'xls':
      throw new Error('Excel files need to be converted to CSV first, or enable "AI Vision Parser" to process them automatically.');
    case 'pdf':
      throw new Error('For PDF files, please enable "AI Vision Parser" for automatic conversion and processing.');
    case 'doc':
    case 'docx':
      // Use Word parser for text mode, but suggest AI Vision for better results
      try {
        return await parseWord(file);
      } catch (error) {
        throw new Error('Word document parsing failed. Try enabling "AI Vision Parser" for better results with complex document layouts.');
      }
    default:
      throw new Error('Unsupported file format. Please use CSV, Word document, PDF, or image files, or enable "AI Vision Parser" to automatically convert your file.');
  }
};
