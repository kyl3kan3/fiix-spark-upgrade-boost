
import { VendorFormData } from "@/services/vendorService";
import { extractVendorsFromText } from './textParser';
import * as mammoth from 'mammoth';

export const parseWord = async (file: File): Promise<VendorFormData[]> => {
  console.log("Parsing Word document:", file.name, file.type, file.size);
  
  try {
    // Handle DOCX files using mammoth
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.toLowerCase().endsWith('.docx')) {
      console.log("Processing DOCX file with mammoth");
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      console.log("Extracted text from DOCX, length:", text.length);
      
      if (!text || text.trim().length === 0) {
        throw new Error('DOCX document appears to be empty or contains no readable text.');
      }
      
      const vendors = extractVendorsFromText(text);
      console.log("Extracted vendors from DOCX document:", vendors.length);
      
      if (vendors.length === 0) {
        throw new Error('No vendor information found in the DOCX document. Please ensure the document contains vendor data in a readable format.');
      }
      
      return vendors;
    }
    
    // Handle older DOC files - these are still not easily supported
    if (file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc')) {
      throw new Error('Legacy DOC files are not supported. Please save the document as DOCX or convert to CSV format for best results.');
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
    if (error.message.includes('not supported') || error.message.includes('No vendor information')) {
      throw error;
    }
    throw new Error('Failed to parse Word document. Please ensure the document is not corrupted and contains readable text, or save it as a CSV file for better compatibility.');
  }
};
