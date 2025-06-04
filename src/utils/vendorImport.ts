
import { VendorFormData } from "@/services/vendorService";

// Add dependency for PDF and Word parsing
import * as pdfjsLib from 'pdfjs-dist';

interface ParsedVendor {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contact_person?: string;
  contact_title?: string;
  website?: string;
  description?: string;
  vendor_type: "service" | "supplier" | "contractor" | "consultant";
  status: "active" | "inactive" | "suspended";
  rating?: number;
}

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

const parseCSV = async (file: File): Promise<VendorFormData[]> => {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const vendors: VendorFormData[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length > 0 && values[0].trim()) {
      const vendor = mapCSVToVendor(values);
      vendors.push(vendor);
    }
  }

  return vendors;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const mapCSVToVendor = (values: string[]): VendorFormData => {
  return {
    name: values[0] || '',
    email: values[1] || null,
    phone: values[2] || null,
    address: values[3] || null,
    city: values[4] || null,
    state: values[5] || null,
    zip_code: values[6] || null,
    contact_person: values[7] || null,
    contact_title: values[8] || null,
    website: values[9] || null,
    description: values[10] || null,
    vendor_type: (values[11] as any) || 'service',
    status: (values[12] as any) || 'active',
    rating: values[13] ? parseInt(values[13]) : null,
  };
};

const parsePDF = async (file: File): Promise<VendorFormData[]> => {
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

const parseWord = async (file: File): Promise<VendorFormData[]> => {
  // For Word documents, we'll use a simplified approach
  // In a production environment, you'd want to use a library like mammoth.js
  try {
    const text = await file.text();
    return extractVendorsFromText(text);
  } catch (error) {
    throw new Error('Failed to parse Word document. Please save as CSV for better results.');
  }
};

const extractVendorsFromText = (text: string): VendorFormData[] => {
  const vendors: VendorFormData[] = [];
  
  // Simple pattern matching for vendor information
  // This is a basic implementation - in production you'd want more sophisticated parsing
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Look for lines that might contain vendor names (basic heuristic)
    if (line.length > 5 && !line.match(/^(page|document|title|header)/i)) {
      const words = line.trim().split(/\s+/);
      if (words.length >= 2) {
        const vendor: VendorFormData = {
          name: line.trim().substring(0, 100), // Limit name length
          email: extractEmail(line),
          phone: extractPhone(line),
          vendor_type: 'service',
          status: 'active',
          description: line.length > 50 ? line.substring(0, 200) + '...' : line,
          address: null,
          city: null,
          state: null,
          zip_code: null,
          contact_person: null,
          contact_title: null,
          website: extractWebsite(line),
          rating: null,
        };
        
        vendors.push(vendor);
      }
    }
  }

  return vendors;
};

const extractEmail = (text: string): string | null => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
};

const extractPhone = (text: string): string | null => {
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
};

const extractWebsite = (text: string): string | null => {
  const websiteRegex = /(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/;
  const match = text.match(websiteRegex);
  return match ? match[0] : null;
};
