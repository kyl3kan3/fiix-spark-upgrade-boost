
import { VendorFormData } from "@/services/vendorService";
import { extractVendorsFromText } from './textParser';

export const parseWord = async (file: File): Promise<VendorFormData[]> => {
  // For Word documents, we'll use a simplified approach
  // In a production environment, you'd want to use a library like mammoth.js
  try {
    const text = await file.text();
    return extractVendorsFromText(text);
  } catch (error) {
    throw new Error('Failed to parse Word document. Please save as CSV for better results.');
  }
};
