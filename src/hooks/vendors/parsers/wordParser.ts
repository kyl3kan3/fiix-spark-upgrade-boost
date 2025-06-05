
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
        
        console.log("Extracted text from Word document:", text);
        
        // Clean and prepare text for parsing
        const vendors: ParsedVendor[] = [];
        const lines = text.split(/[\n\r]+/).filter(line => line.trim()).map(line => line.trim());
        
        console.log(`Total lines to process: ${lines.length}`);
        
        // Strategy 1: Enhanced key-value pattern matching
        let currentVendor: any = {};
        let vendorCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Skip very short lines or obvious headers
          if (line.length < 2 || 
              line.toLowerCase().includes('vendor list') || 
              line.toLowerCase().includes('contact information') ||
              line.toLowerCase().includes('company directory')) {
            continue;
          }
          
          console.log(`Processing line ${i}: "${line}"`);
          
          // Enhanced key-value detection with multiple separators
          const separators = [':', '=', '-', '|', '\t'];
          let keyValueFound = false;
          
          for (const separator of separators) {
            if (line.includes(separator)) {
              const parts = line.split(separator);
              if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase();
                const value = parts.slice(1).join(separator).trim();
                
                if (value && value.length > 0) {
                  console.log(`Found key-value pair: "${key}" = "${value}"`);
                  
                  // Enhanced field mapping with more variations
                  if (key.match(/(company|business|vendor|organization|firm)\s*(name)?/)) {
                    currentVendor.name = value;
                  } else if (key.match(/(email|e-mail|mail)/)) {
                    currentVendor.email = value;
                  } else if (key.match(/(phone|tel|telephone|mobile|cell|contact\s*number)/)) {
                    currentVendor.phone = value;
                  } else if (key.match(/(contact|person|representative|manager)/)) {
                    currentVendor.contact_person = value;
                  } else if (key.match(/(type|category|service|industry)/)) {
                    currentVendor.vendor_type = value || 'service';
                  } else if (key.match(/(status|state|condition)/)) {
                    currentVendor.status = value || 'active';
                  } else if (key.match(/(address|street|location)/)) {
                    currentVendor.address = value;
                  } else if (key.match(/city/)) {
                    currentVendor.city = value;
                  } else if (key.match(/(state|province|region)/)) {
                    currentVendor.state = value;
                  } else if (key.match(/(zip|postal|code)/)) {
                    currentVendor.zip_code = value;
                  } else if (key.match(/(website|url|web|site)/)) {
                    currentVendor.website = value;
                  } else if (key.match(/(description|notes|details|services|about)/)) {
                    currentVendor.description = value;
                  }
                  
                  keyValueFound = true;
                  break;
                }
              }
            }
          }
          
          // If no key-value found, try to detect patterns like "Name - Email - Phone"
          if (!keyValueFound) {
            const patterns = [
              /(.+?)\s*[-–—]\s*(.+@.+)\s*[-–—]\s*(.+)/,  // Name - Email - Phone
              /(.+?)\s*[,]\s*(.+@.+)\s*[,]\s*(.+)/,      // Name, Email, Phone
              /(.+?)\s+(.+@.+)\s+([0-9\-\(\)\s]+)/      // Name Email Phone
            ];
            
            for (const pattern of patterns) {
              const match = line.match(pattern);
              if (match) {
                console.log(`Found pattern match:`, match);
                currentVendor.name = match[1].trim();
                currentVendor.email = match[2].trim();
                currentVendor.phone = match[3].trim();
                keyValueFound = true;
                break;
              }
            }
          }
          
          // Check if this line looks like a standalone company name
          if (!keyValueFound && !currentVendor.name) {
            const companyIndicators = /(inc|llc|corp|ltd|company|services|solutions|group|enterprises|systems)/i;
            if (line.match(companyIndicators) || 
                (line.length > 5 && line.length < 80 && 
                 line.match(/^[A-Z][a-zA-Z0-9\s&.,'-]+$/))) {
              currentVendor.name = line;
              console.log(`Detected company name: "${line}"`);
            }
          }
          
          // Check if this line contains an email without a key
          if (!keyValueFound && !currentVendor.email) {
            const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (emailMatch) {
              currentVendor.email = emailMatch[1];
              console.log(`Found standalone email: "${emailMatch[1]}"`);
            }
          }
          
          // Check if this line contains a phone number without a key
          if (!keyValueFound && !currentVendor.phone) {
            const phoneMatch = line.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
            if (phoneMatch) {
              currentVendor.phone = phoneMatch[0];
              console.log(`Found standalone phone: "${phoneMatch[0]}"`);
            }
          }
          
          // Determine if we should finalize the current vendor
          const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
          const isNewVendor = 
            line.match(/^[-=_]{3,}/) ||  // Separator lines
            nextLine.toLowerCase().includes('company') ||
            nextLine.toLowerCase().includes('vendor') ||
            (currentVendor.name && Object.keys(currentVendor).length >= 2 && 
             (nextLine.match(/^[A-Z][a-zA-Z\s&.-]+$/) || nextLine.includes('@')));
          
          if (isNewVendor && currentVendor.name) {
            // Set defaults for missing fields
            if (!currentVendor.vendor_type) currentVendor.vendor_type = 'service';
            if (!currentVendor.status) currentVendor.status = 'active';
            
            vendors.push({ ...currentVendor });
            console.log(`Added vendor ${vendorCount + 1}:`, currentVendor);
            vendorCount++;
            currentVendor = {};
          }
        }
        
        // Add the last vendor if it exists
        if (currentVendor.name) {
          if (!currentVendor.vendor_type) currentVendor.vendor_type = 'service';
          if (!currentVendor.status) currentVendor.status = 'active';
          vendors.push(currentVendor);
          console.log(`Added final vendor:`, currentVendor);
        }
        
        // Strategy 2: Enhanced table parsing for structured data
        if (vendors.length === 0) {
          console.log("No vendors found with enhanced parsing, trying table approach...");
          
          for (const line of lines) {
            // Skip obvious headers
            if (line.toLowerCase().includes('name') && 
                (line.toLowerCase().includes('email') || line.toLowerCase().includes('phone'))) {
              continue;
            }
            
            // Try multiple splitting methods
            const splittingMethods = [
              () => line.split('\t').map(p => p.trim()).filter(p => p),
              () => line.split(/\s{3,}/).map(p => p.trim()).filter(p => p),
              () => line.split('|').map(p => p.trim()).filter(p => p),
              () => line.split(',').map(p => p.trim()).filter(p => p)
            ];
            
            for (const splitter of splittingMethods) {
              const parts = splitter();
              if (parts.length >= 2) {
                const vendor: any = {
                  name: parts[0],
                  vendor_type: 'service',
                  status: 'active'
                };
                
                // Try to identify what each part might be
                for (let j = 1; j < parts.length; j++) {
                  const part = parts[j];
                  if (part.includes('@')) {
                    vendor.email = part;
                  } else if (part.match(/^[\d\-\(\)\s]+$/)) {
                    vendor.phone = part;
                  } else if (j === 1 && !part.includes('@') && !part.match(/^[\d\-\(\)\s]+$/)) {
                    vendor.contact_person = part;
                  }
                }
                
                if (vendor.name && vendor.name.length > 1) {
                  vendors.push(vendor);
                  console.log(`Added vendor from table parsing:`, vendor);
                  break; // Found a valid split, no need to try others
                }
              }
            }
          }
        }
        
        // Strategy 3: Extract any text that looks like company names if still no results
        if (vendors.length === 0) {
          console.log("Trying name extraction fallback...");
          
          for (const line of lines) {
            // More comprehensive company name detection
            const companyPatterns = [
              /^([A-Z][a-zA-Z0-9\s&.,'-]+(Inc|LLC|Corp|Ltd|Company|Services|Solutions|Group|Enterprises|Systems))/i,
              /^([A-Z][a-zA-Z\s&.-]{3,50})$/,  // Capitalized phrases
              /^([A-Z][a-z]+\s+[A-Z][a-z]+)/   // First Last or Company Name patterns
            ];
            
            for (const pattern of companyPatterns) {
              const match = line.match(pattern);
              if (match) {
                const vendor: any = {
                  name: match[1].trim(),
                  vendor_type: 'service',
                  status: 'active'
                };
                
                vendors.push(vendor);
                console.log(`Added vendor from name extraction:`, vendor);
                break;
              }
            }
          }
        }
        
        console.log(`Final vendor count: ${vendors.length}`);
        
        if (vendors.length === 0) {
          throw new Error(`No vendor data could be extracted from the Word document. 

Please ensure your document contains vendor information in one of these formats:

1. Key-value format with separators (: = - |):
   Company: ABC Services
   Email: contact@abc.com
   Phone: 555-0123

2. Structured lists or tables with vendor information
3. Each vendor on separate lines or separated by lines/breaks

Extracted text sample: "${text.substring(0, 300)}..."`);
        }
        
        resolve(vendors);
      } catch (error) {
        console.error("Error processing Word document:", error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Word document'));
    reader.readAsArrayBuffer(file);
  });
};
