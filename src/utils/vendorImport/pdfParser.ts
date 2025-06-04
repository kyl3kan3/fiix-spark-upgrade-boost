
import { VendorFormData } from "@/services/vendorService";
import * as pdfjsLib from 'pdfjs-dist';
import { extractVendorsFromText } from './textParser';

export const parsePDF = async (file: File): Promise<VendorFormData[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item: any) => item.str).join(' ') + ' ';
    }

    return extractVendorsFromText(text);
  } catch (error) {
    throw new Error('Failed to parse PDF file. Please ensure it contains readable text.');
  }
};
