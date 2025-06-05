
import { VendorFormData } from "@/services/vendorService";
import { parseCSV } from "./csvParser";
import { parseWord } from "./wordParser";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
}

export const parseFile = async (file: File): Promise<ParsedVendor[]> => {
  const fileExtension = file.name.toLowerCase().split('.').pop();
  
  switch (fileExtension) {
    case 'csv':
      return await parseCSV(file);
    case 'xlsx':
    case 'xls':
      throw new Error('Excel import will be available in the next update. Please use CSV format for now.');
    case 'pdf':
      throw new Error('PDF import will be available in the next update. Please use CSV format for now.');
    case 'doc':
    case 'docx':
      return await parseWord(file);
    default:
      throw new Error('Unsupported file format');
  }
};
