
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
      const imageFile = await convertFileToImage(file);
      const base64Image = await convertFileToBase64(imageFile);
      return await parseImageWithVision(base64Image);
    } catch (error) {
      console.warn('[File Parser] Image conversion failed, falling back to text parsing:', error);
      // Fall back to text parsing if image conversion fails
    }
  }
  
  // Use original file type parsers for text mode
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
