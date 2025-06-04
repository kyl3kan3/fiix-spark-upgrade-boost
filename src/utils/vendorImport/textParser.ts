
import { VendorFormData } from "@/services/vendorService";
import { sanitizeText } from './textSanitizer';
import { extractEmail, extractPhone, extractWebsite } from './extractors';

export const extractVendorsFromText = (text: string): VendorFormData[] => {
  const vendors: VendorFormData[] = [];
  
  // Sanitize the entire text first
  const cleanText = sanitizeText(text) || '';
  
  // Simple pattern matching for vendor information
  // This is a basic implementation - in production you'd want more sophisticated parsing
  const lines = cleanText.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Look for lines that might contain vendor names (basic heuristic)
    if (line.length > 5 && !line.match(/^(page|document|title|header)/i)) {
      const words = line.trim().split(/\s+/);
      if (words.length >= 2) {
        const cleanName = sanitizeText(line.substring(0, 100)) || 'Unknown Vendor';
        const cleanDescription = sanitizeText(line.length > 50 ? line.substring(0, 200) + '...' : line);
        
        const vendor: VendorFormData = {
          name: cleanName,
          email: extractEmail(line),
          phone: extractPhone(line),
          vendor_type: 'service',
          status: 'active',
          description: cleanDescription,
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
