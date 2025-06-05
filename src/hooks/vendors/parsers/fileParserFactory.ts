
import { VendorFormData } from "@/services/vendorService";
import { parseCSV } from "./csvParser";
import { parseWord } from "./wordParser";
import { parseWithImage } from "./imageParser";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
}

export const parseFile = async (file: File, useImageParser: boolean = false): Promise<ParsedVendor[]> => {
  const fileExtension = file.name.toLowerCase().split('.').pop();
  
  // If image parser is requested or file is an image, use image parsing
  if (useImageParser || file.type.startsWith('image/')) {
    return await parseWithImage(file);
  }
  
  switch (fileExtension) {
    case 'csv':
      return await parseCSV(file);
    case 'xlsx':
    case 'xls':
      throw new Error('Excel import will be available in the next update. Please use CSV format for now.');
    case 'pdf':
      return await parseWithImage(file);
    case 'doc':
    case 'docx':
      return await parseWord(file);
    default:
      throw new Error('Unsupported file format. Please use CSV, Word document, or image files.');
  }
};
