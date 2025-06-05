
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
        
        // Parse the extracted text - try multiple parsing strategies
        const vendors: ParsedVendor[] = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        // Strategy 1: Look for key-value patterns with colons
        let currentVendor: any = {};
        let vendorCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines
          if (!line) continue;
          
          console.log(`Processing line ${i}: "${line}"`);
          
          // Look for key-value patterns (Name: Value)
          if (line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            
            console.log(`Found key-value pair: "${key}" = "${value}"`);
            
            // Map various field names to our schema
            if (key.includes('name') || key.includes('company') || key.includes('vendor')) {
              currentVendor.name = value;
            } else if (key.includes('email') || key.includes('e-mail')) {
              currentVendor.email = value;
            } else if (key.includes('phone') || key.includes('telephone') || key.includes('mobile')) {
              currentVendor.phone = value;
            } else if (key.includes('contact') && !key.includes('email') && !key.includes('phone')) {
              currentVendor.contact_person = value;
            } else if (key.includes('type') || key.includes('category')) {
              currentVendor.vendor_type = value || 'service';
            } else if (key.includes('status')) {
              currentVendor.status = value || 'active';
            } else if (key.includes('address') || key.includes('street')) {
              currentVendor.address = value;
            } else if (key.includes('city')) {
              currentVendor.city = value;
            } else if (key.includes('state') || key.includes('province')) {
              currentVendor.state = value;
            } else if (key.includes('zip') || key.includes('postal')) {
              currentVendor.zip_code = value;
            } else if (key.includes('website') || key.includes('url') || key.includes('web')) {
              currentVendor.website = value;
            } else if (key.includes('description') || key.includes('notes') || key.includes('details')) {
              currentVendor.description = value;
            }
          }
          
          // Check if we should save current vendor and start a new one
          const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
          const isEndOfVendor = 
            line.includes('---') || 
            line.includes('===') || 
            line.toLowerCase().includes('vendor') ||
            nextLine.toLowerCase().includes('name:') ||
            nextLine.toLowerCase().includes('company:') ||
            (currentVendor.name && Object.keys(currentVendor).length >= 2);
          
          if (isEndOfVendor && currentVendor.name) {
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
        
        // Strategy 2: If no vendors found with key-value approach, try table-like parsing
        if (vendors.length === 0) {
          console.log("No vendors found with key-value parsing, trying table approach...");
          
          // Look for table-like structures or comma/tab separated values
          for (const line of lines) {
            // Skip headers or obvious non-data lines
            if (line.toLowerCase().includes('name') && line.toLowerCase().includes('email')) {
              continue;
            }
            
            // Try splitting by tabs or multiple spaces
            let parts = line.split('\t').map(p => p.trim()).filter(p => p);
            if (parts.length < 2) {
              parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p);
            }
            if (parts.length < 2) {
              parts = line.split(',').map(p => p.trim()).filter(p => p);
            }
            
            if (parts.length >= 2) {
              const vendor: any = {
                name: parts[0],
                email: parts[1] || '',
                phone: parts[2] || '',
                contact_person: parts[3] || '',
                vendor_type: parts[4] || 'service',
                status: parts[5] || 'active'
              };
              
              if (vendor.name && vendor.name.length > 1) {
                vendors.push(vendor);
                console.log(`Added vendor from table parsing:`, vendor);
              }
            }
          }
        }
        
        // Strategy 3: If still no vendors, try to extract any company-like names
        if (vendors.length === 0) {
          console.log("No vendors found with table parsing, trying name extraction...");
          
          for (const line of lines) {
            // Look for lines that might be company names (contain certain keywords or patterns)
            if (line.length > 2 && 
                (line.includes('Inc') || line.includes('LLC') || line.includes('Corp') || 
                 line.includes('Company') || line.includes('Services') || line.includes('Ltd') ||
                 /^[A-Z][a-zA-Z\s&.-]+$/.test(line))) {
              
              const vendor: any = {
                name: line,
                vendor_type: 'service',
                status: 'active'
              };
              
              vendors.push(vendor);
              console.log(`Added vendor from name extraction:`, vendor);
            }
          }
        }
        
        console.log(`Total vendors found: ${vendors.length}`);
        
        if (vendors.length === 0) {
          throw new Error(`No vendor data found in Word document. The document should contain vendor information in one of these formats:
          
1. Key-value format:
   Name: ABC Company
   Email: contact@abc.com
   Phone: 555-0123
   
2. Table format with columns separated by tabs, spaces, or commas
3. Company names (we'll create basic entries for recognized company names)

Extracted text preview: "${text.substring(0, 200)}..."`);
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
