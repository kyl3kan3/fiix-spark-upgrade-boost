
import { VendorFormData } from "@/services/vendorService";
import { sanitizeText } from './textSanitizer';

export const parseCSV = async (file: File): Promise<VendorFormData[]> => {
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
    name: sanitizeText(values[0]) || 'Unknown Vendor',
    email: sanitizeText(values[1]),
    phone: sanitizeText(values[2]),
    address: sanitizeText(values[3]),
    city: sanitizeText(values[4]),
    state: sanitizeText(values[5]),
    zip_code: sanitizeText(values[6]),
    contact_person: sanitizeText(values[7]),
    contact_title: sanitizeText(values[8]),
    website: sanitizeText(values[9]),
    description: sanitizeText(values[10]),
    vendor_type: (values[11] as any) || 'service',
    status: (values[12] as any) || 'active',
    rating: values[13] ? parseInt(values[13]) : null,
  };
};
