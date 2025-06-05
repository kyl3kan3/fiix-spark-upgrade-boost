
import mammoth from "mammoth";
import { VendorFormData } from "@/services/vendorService";

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
        
        // Parse the extracted text as if it were structured data
        // Looking for patterns like "Name: ABC Company" or table-like structures
        const vendors: ParsedVendor[] = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        let currentVendor: any = {};
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines
          if (!trimmedLine) continue;
          
          // Look for key-value patterns
          if (trimmedLine.includes(':')) {
            const [key, ...valueParts] = trimmedLine.split(':');
            const value = valueParts.join(':').trim();
            const normalizedKey = key.trim().toLowerCase();
            
            switch (normalizedKey) {
              case 'name':
              case 'company name':
              case 'vendor name':
                currentVendor.name = value;
                break;
              case 'email':
              case 'email address':
                currentVendor.email = value;
                break;
              case 'phone':
              case 'phone number':
                currentVendor.phone = value;
                break;
              case 'contact person':
              case 'contact':
                currentVendor.contact_person = value;
                break;
              case 'type':
              case 'vendor type':
                currentVendor.vendor_type = value || 'service';
                break;
              case 'status':
                currentVendor.status = value || 'active';
                break;
              case 'address':
                currentVendor.address = value;
                break;
              case 'city':
                currentVendor.city = value;
                break;
              case 'state':
                currentVendor.state = value;
                break;
              case 'zip':
              case 'zip code':
                currentVendor.zip_code = value;
                break;
              case 'website':
                currentVendor.website = value;
                break;
              case 'description':
                currentVendor.description = value;
                break;
            }
          }
          
          // If we encounter a line that suggests a new vendor (like "---" or "Vendor:" or if we have a complete vendor)
          if ((trimmedLine.includes('---') || trimmedLine.toLowerCase().includes('vendor') || 
              (currentVendor.name && Object.keys(currentVendor).length > 3)) && 
              currentVendor.name) {
            vendors.push({ ...currentVendor });
            currentVendor = {};
          }
        }
        
        // Add the last vendor if it exists
        if (currentVendor.name) {
          vendors.push(currentVendor);
        }
        
        if (vendors.length === 0) {
          throw new Error('No vendor data found in Word document. Please ensure the document contains vendor information in a structured format with fields like "Name:", "Email:", etc.');
        }
        
        resolve(vendors);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Word document'));
    reader.readAsArrayBuffer(file);
  });
};
