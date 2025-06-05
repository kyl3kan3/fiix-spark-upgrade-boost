
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
        
        console.log("=== WORD PARSER DEBUG ===");
        console.log("Raw extracted text:", text);
        console.log("Text length:", text.length);
        
        // Clean and split text into lines
        const lines = text.split(/[\n\r]+/)
          .map(line => line.trim())
          .filter(line => line.length > 1);
        
        console.log("Cleaned lines:", lines);
        console.log("Total lines:", lines.length);
        
        const vendors: ParsedVendor[] = [];
        
        // Simple line-by-line parsing approach
        let currentVendor: any = {};
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          console.log(`Processing line ${i}: "${line}"`);
          
          // Skip obvious headers
          if (line.toLowerCase().includes('vendor') && line.toLowerCase().includes('list')) {
            console.log("Skipping header line");
            continue;
          }
          
          // Try to extract email from any line
          const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (emailMatch && !currentVendor.email) {
            currentVendor.email = emailMatch[1];
            console.log("Found email:", emailMatch[1]);
          }
          
          // Try to extract phone from any line
          const phoneMatch = line.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
          if (phoneMatch && !currentVendor.phone) {
            currentVendor.phone = phoneMatch[1];
            console.log("Found phone:", phoneMatch[1]);
          }
          
          // Check for key-value pairs (name:, email:, phone:, etc.)
          if (line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            const cleanKey = key.trim().toLowerCase();
            
            console.log(`Key-value found: "${cleanKey}" = "${value}"`);
            
            if (cleanKey.includes('name') || cleanKey.includes('company')) {
              currentVendor.name = value;
            } else if (cleanKey.includes('email')) {
              currentVendor.email = value;
            } else if (cleanKey.includes('phone')) {
              currentVendor.phone = value;
            } else if (cleanKey.includes('contact')) {
              currentVendor.contact_person = value;
            } else if (cleanKey.includes('address')) {
              currentVendor.address = value;
            } else if (cleanKey.includes('city')) {
              currentVendor.city = value;
            } else if (cleanKey.includes('state')) {
              currentVendor.state = value;
            } else if (cleanKey.includes('zip')) {
              currentVendor.zip_code = value;
            } else if (cleanKey.includes('website')) {
              currentVendor.website = value;
            }
          }
          
          // If no name yet, check if this line could be a company name
          if (!currentVendor.name && line.length > 2 && line.length < 100) {
            // Look for company indicators or capitalized words
            if (line.match(/^[A-Z][a-zA-Z\s&.,'-]+$/) || 
                line.match(/(inc|llc|corp|ltd|company|services|solutions|group)/i)) {
              currentVendor.name = line;
              console.log("Potential company name:", line);
            }
          }
          
          // Check if we should start a new vendor
          const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
          const shouldFinalize = 
            line.match(/^[-=_]{3,}/) || // Separator line
            (currentVendor.name && (currentVendor.email || currentVendor.phone) && 
             (nextLine.match(/^[A-Z]/) || nextLine.includes('@') || i === lines.length - 1));
          
          if (shouldFinalize && currentVendor.name) {
            // Set defaults
            if (!currentVendor.vendor_type) currentVendor.vendor_type = 'service';
            if (!currentVendor.status) currentVendor.status = 'active';
            
            console.log("Finalizing vendor:", currentVendor);
            vendors.push({ ...currentVendor });
            currentVendor = {};
          }
        }
        
        // Add final vendor if exists
        if (currentVendor.name) {
          if (!currentVendor.vendor_type) currentVendor.vendor_type = 'service';
          if (!currentVendor.status) currentVendor.status = 'active';
          console.log("Adding final vendor:", currentVendor);
          vendors.push(currentVendor);
        }
        
        console.log("=== PARSING COMPLETE ===");
        console.log("Total vendors found:", vendors.length);
        console.log("Vendors:", vendors);
        
        if (vendors.length === 0) {
          // Provide helpful error with text sample
          const textSample = text.substring(0, 500);
          throw new Error(`No vendor data found in the Word document. 

Text sample from document:
"${textSample}${text.length > 500 ? '...' : ''}"

Please ensure your document contains vendor information in a clear format like:
- Company Name: ABC Services
- Email: contact@abc.com
- Phone: 555-0123

Or simple lists with company names and contact details.`);
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
