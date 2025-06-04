
import { VendorFormData } from "@/services/vendorService";
import { parseCSV } from './csvParser';
import { parsePDF } from './pdfParser';
import { parseWord } from './wordParser';

export const parseVendorFile = async (file: File): Promise<VendorFormData[]> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
    return parseCSV(file);
  } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return parsePDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword' ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc')
  ) {
    return parseWord(file);
  } else {
    throw new Error('Unsupported file format. Please use CSV, PDF, or Word documents.');
  }
};

// Re-export types for convenience
export type { ParsedVendor, ImportError, ImportResults } from './types';
