
import mammoth from "mammoth";
import { VendorFormData } from "@/services/vendorService";
import { processWordText, isHeaderLine } from "./word/textProcessor";
import { parseKeyValuePair } from "./word/keyValueParser";
import { createVendorBuilder } from "./word/vendorBuilder";
import { createDebugLogger } from "./word/debugLogger";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
}

export const parseWord = async (file: File): Promise<ParsedVendor[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        const logger = createDebugLogger();
        logger.logTextExtraction(text);
        
        // Enhanced text processing for better vendor extraction
        const { lines } = processWordText(text);
        logger.logProcessedLines(lines);
        
        const vendors: ParsedVendor[] = [];
        const vendorBuilder = createVendorBuilder();
        
        // Try to detect different document formats
        const isTableFormat = detectTableFormat(lines);
        const isListFormat = detectListFormat(lines);
        
        console.log('Document format detected:', { isTableFormat, isListFormat });
        
        if (isTableFormat) {
          const tableVendors = parseTableFormat(lines);
          vendors.push(...tableVendors);
        } else if (isListFormat) {
          const listVendors = parseListFormat(lines);
          vendors.push(...listVendors);
        } else {
          // Fallback to original parsing logic
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            logger.logLineProcessing(i, line);
            
            if (isHeaderLine(line)) {
              logger.logSkippedLine("header line");
              continue;
            }
            
            parseKeyValuePair(line, vendorBuilder.getCurrentVendor());
            vendorBuilder.addDataFromLine(line);
            
            const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
            const isLastLine = i === lines.length - 1;
            
            if (vendorBuilder.shouldFinalize(line, nextLine, isLastLine)) {
              const vendor = vendorBuilder.finalize();
              if (vendor) {
                logger.logVendorFinalized(vendor);
                vendors.push(vendor);
              }
              vendorBuilder.reset();
            }
          }
          
          const finalVendor = vendorBuilder.finalize();
          if (finalVendor) {
            logger.logVendorFinalized(finalVendor);
            vendors.push(finalVendor);
          }
        }
        
        logger.logParsingComplete(vendors.length, vendors);
        
        if (vendors.length === 0) {
          const textSample = text.substring(0, 500);
          throw new Error(`No vendor data found in the Word document. 

Text sample from document:
"${textSample}${text.length > 500 ? '...' : ''}"

Please ensure your document contains vendor information in one of these formats:
1. **Table format** with headers like "Name", "Email", "Phone", etc.
2. **List format** with clear vendor entries separated by blank lines
3. **Key-value format** like:
   - Company Name: ABC Services
   - Email: contact@abc.com
   - Phone: 555-0123

For best results, try exporting your document as a CSV file or use our CSV template.`);
        }
        
        resolve(vendors);
      } catch (error) {
        console.error("Word parser error:", error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Word document'));
    reader.readAsArrayBuffer(file);
  });
};

const detectTableFormat = (lines: string[]): boolean => {
  // Look for table headers
  const tableHeaders = ['name', 'email', 'phone', 'contact', 'company', 'vendor'];
  return lines.some(line => {
    const lowerLine = line.toLowerCase();
    return tableHeaders.filter(header => lowerLine.includes(header)).length >= 2;
  });
};

const detectListFormat = (lines: string[]): boolean => {
  // Look for repeated patterns that suggest a list
  let vendorBlocks = 0;
  for (let i = 0; i < lines.length - 2; i++) {
    const currentLine = lines[i].toLowerCase();
    const nextLine = lines[i + 1].toLowerCase();
    
    if ((currentLine.includes('company') || currentLine.includes('vendor') || currentLine.includes('name')) &&
        (nextLine.includes('email') || nextLine.includes('phone') || nextLine.includes('contact'))) {
      vendorBlocks++;
    }
  }
  return vendorBlocks >= 2;
};

const parseTableFormat = (lines: string[]): ParsedVendor[] => {
  const vendors: ParsedVendor[] = [];
  let headerIndex = -1;
  let headers: string[] = [];
  
  // Find the header row
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('name') && (line.includes('email') || line.includes('phone'))) {
      headerIndex = i;
      headers = lines[i].split(/\s{2,}|\t/).map(h => h.trim().toLowerCase());
      break;
    }
  }
  
  if (headerIndex === -1) return vendors;
  
  // Parse data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(/\s{2,}|\t/).map(v => v.trim());
    if (values.length < 2) continue;
    
    const vendor = createVendorFromTableRow(headers, values);
    if (vendor && vendor.name) {
      vendors.push(vendor);
    }
  }
  
  return vendors;
};

const parseListFormat = (lines: string[]): ParsedVendor[] => {
  const vendors: ParsedVendor[] = [];
  let currentVendor: any = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      // Empty line - finalize current vendor
      if (currentVendor.name) {
        vendors.push(createVendorFromObject(currentVendor));
        currentVendor = {};
      }
      continue;
    }
    
    // Parse key-value pairs
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmedLine.substring(0, colonIndex).trim().toLowerCase();
      const value = trimmedLine.substring(colonIndex + 1).trim();
      
      mapFieldToVendor(key, value, currentVendor);
    } else {
      // Maybe it's just a company name
      if (!currentVendor.name && trimmedLine.length > 2) {
        currentVendor.name = trimmedLine;
      }
    }
  }
  
  // Don't forget the last vendor
  if (currentVendor.name) {
    vendors.push(createVendorFromObject(currentVendor));
  }
  
  return vendors;
};

const createVendorFromTableRow = (headers: string[], values: string[]): ParsedVendor | null => {
  const vendor: any = {
    name: '',
    email: '',
    phone: '',
    contact_person: '',
    contact_title: '',
    vendor_type: 'service',
    status: 'active',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    website: '',
    description: '',
    rating: null
  };
  
  headers.forEach((header, index) => {
    if (index < values.length) {
      mapFieldToVendor(header, values[index], vendor);
    }
  });
  
  return vendor.name ? vendor : null;
};

const createVendorFromObject = (obj: any): ParsedVendor => {
  return {
    name: obj.name || '',
    email: obj.email || '',
    phone: obj.phone || '',
    contact_person: obj.contact_person || '',
    contact_title: obj.contact_title || '',
    vendor_type: obj.vendor_type || 'service',
    status: obj.status || 'active',
    address: obj.address || '',
    city: obj.city || '',
    state: obj.state || '',
    zip_code: obj.zip_code || '',
    website: obj.website || '',
    description: obj.description || '',
    rating: obj.rating || null
  };
};

const mapFieldToVendor = (key: string, value: string, vendor: any) => {
  const cleanValue = value.trim();
  
  switch (key) {
    case 'name':
    case 'company name':
    case 'company':
    case 'vendor name':
      vendor.name = cleanValue;
      break;
    case 'email':
    case 'email address':
    case 'e-mail':
      vendor.email = cleanValue;
      break;
    case 'phone':
    case 'phone number':
    case 'telephone':
      vendor.phone = cleanValue;
      break;
    case 'contact':
    case 'contact person':
    case 'contact name':
      vendor.contact_person = cleanValue;
      break;
    case 'title':
    case 'contact title':
    case 'position':
      vendor.contact_title = cleanValue;
      break;
    case 'type':
    case 'vendor type':
    case 'category':
      const lowerType = cleanValue.toLowerCase();
      if (['service', 'supplier', 'contractor', 'consultant'].includes(lowerType)) {
        vendor.vendor_type = lowerType;
      }
      break;
    case 'status':
      const lowerStatus = cleanValue.toLowerCase();
      if (['active', 'inactive', 'suspended'].includes(lowerStatus)) {
        vendor.status = lowerStatus;
      }
      break;
    case 'address':
    case 'street address':
      vendor.address = cleanValue;
      break;
    case 'city':
      vendor.city = cleanValue;
      break;
    case 'state':
    case 'province':
      vendor.state = cleanValue;
      break;
    case 'zip':
    case 'zip code':
    case 'postal code':
      vendor.zip_code = cleanValue;
      break;
    case 'website':
    case 'web':
    case 'url':
      vendor.website = cleanValue.startsWith('http') ? cleanValue : `https://${cleanValue}`;
      break;
    case 'description':
    case 'notes':
    case 'details':
      vendor.description = cleanValue;
      break;
    case 'rating':
      const rating = parseInt(cleanValue);
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        vendor.rating = rating;
      }
      break;
  }
};
