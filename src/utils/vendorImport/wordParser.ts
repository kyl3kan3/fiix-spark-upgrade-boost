
import { VendorFormData } from "@/services/vendorService";
import { extractVendorsFromText } from './textParser';

export const parseWord = async (file: File): Promise<VendorFormData[]> => {
  console.log("Parsing Word document:", file.name, file.type, file.size);
  
  try {
    // For Word documents, we need to handle different formats
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.toLowerCase().endsWith('.docx')) {
      // For .docx files, we can't easily extract text without specialized libraries
      throw new Error('DOCX files are not supported. Please convert to CSV format for best results.');
    }
    
    if (file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc')) {
      // For .doc files, we also can't easily extract text
      throw new Error('DOC files are not supported. Please convert to CSV format for best results.');
    }
    
    // If it's actually a text file with .doc extension, try to read it as text
    const text = await file.text();
    console.log("Word document text length:", text.length);
    
    if (!text || text.trim().length === 0) {
      throw new Error('Document appears to be empty or cannot be read as text.');
    }
    
    const vendors = extractVendorsFromText(text);
    console.log("Extracted vendors from Word document:", vendors.length);
    
    if (vendors.length === 0) {
      throw new Error('No vendor information found in the document. Please ensure the document contains vendor data in a readable format, or convert to CSV.');
    }
    
    return vendors;
  } catch (error: any) {
    console.error("Word parsing error:", error);
    if (error.message.includes('not supported')) {
      throw error;
    }
    throw new Error('Failed to parse Word document. Please save the document as a CSV file for better compatibility.');
  }
};
