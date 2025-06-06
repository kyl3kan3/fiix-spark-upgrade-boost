
import { VendorFormData } from "@/services/vendorService";
import { parseCSV } from "./csvParser";
import { parseWord } from "./wordParser";
import { parseWithImage } from "./imageParser";

interface ParsedVendor extends VendorFormData {
  // Remove logo_url field since it's not in the database schema
}

export const parseFile = async (file: File, useImageParser: boolean = false): Promise<ParsedVendor[]> => {
  const fileExtension = file.name.toLowerCase().split('.').pop();
  
  // Only use image parser for actual image files or PDFs when explicitly requested
  if (file.type.startsWith('image/')) {
    return await parseWithImage(file);
  }
  
  switch (fileExtension) {
    case 'csv':
      return await parseCSV(file);
    case 'xlsx':
    case 'xls':
      throw new Error('Excel import will be available in the next update. Please use CSV format for now.');
    case 'pdf':
      // Only use image parsing for PDF if AI Vision toggle is enabled
      if (useImageParser) {
        return await parseWithImage(file);
      } else {
        throw new Error('PDF text extraction is not available yet. Please enable "Use AI Vision Parser" for PDF files, or convert your PDF to a Word document or CSV format.');
      }
    case 'doc':
    case 'docx':
      // Always use the Word parser for Word documents, regardless of the AI Vision toggle
      // The Word parser already uses AI processing internally
      return await parseWord(file);
    default:
      throw new Error('Unsupported file format. Please use CSV, Word document, PDF, or image files.');
  }
};
