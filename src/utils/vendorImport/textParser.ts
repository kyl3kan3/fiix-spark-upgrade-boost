
import { VendorFormData } from "@/services/vendorService";
import { extractEmail, extractPhone, extractWebsite } from './extractors';
import { sanitizeText } from './textSanitizer';

export const extractVendorsFromText = (text: string): VendorFormData[] => {
  console.log("Extracting vendors from text, length:", text.length);
  
  if (!text || text.trim().length === 0) {
    console.log("Empty text provided");
    return [];
  }

  const vendors: VendorFormData[] = [];
  
  // Split text into lines and clean them
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  console.log("Total non-empty lines:", lines.length);
  
  // Look for patterns that might indicate vendor information
  const vendorKeywords = /vendor|company|supplier|contractor|business|corp|inc|llc|ltd/i;
  const namePatterns = /name|company|business|vendor/i;
  
  let currentVendor: Partial<VendorFormData> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip headers or very short lines
    if (line.length < 3) continue;
    
    // Check if this line might be a vendor name
    if (vendorKeywords.test(line) || namePatterns.test(line) || 
        (line.includes(':') && line.split(':')[0].length < 20)) {
      
      // If we have a current vendor, save it
      if (currentVendor && currentVendor.name) {
        vendors.push(createVendorFromData(currentVendor));
      }
      
      // Start a new vendor
      const name = extractVendorName(line);
      if (name) {
        currentVendor = { name };
        console.log("Found potential vendor:", name);
      }
    } else if (currentVendor) {
      // Try to extract information for the current vendor
      const email = extractEmail(line);
      const phone = extractPhone(line);
      const website = extractWebsite(line);
      
      if (email && !currentVendor.email) {
        currentVendor.email = email;
      }
      if (phone && !currentVendor.phone) {
        currentVendor.phone = phone;
      }
      if (website && !currentVendor.website) {
        currentVendor.website = website;
      }
      
      // Look for address information
      if (line.toLowerCase().includes('address') || 
          line.toLowerCase().includes('street') ||
          /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln)/i.test(line)) {
        if (!currentVendor.address) {
          currentVendor.address = sanitizeText(line.replace(/address:?/i, '').trim());
        }
      }
      
      // Look for contact person
      if (line.toLowerCase().includes('contact') || 
          line.toLowerCase().includes('person') ||
          /contact\s*person:?\s*(.+)/i.test(line)) {
        if (!currentVendor.contact_person) {
          currentVendor.contact_person = sanitizeText(line.replace(/contact\s*person:?/i, '').trim());
        }
      }
    } else {
      // No current vendor, but this might be a standalone vendor name
      if (line.length > 5 && line.length < 100 && !line.includes('@') && !line.includes('http')) {
        currentVendor = { name: sanitizeText(line) };
        console.log("Found standalone vendor:", line);
      }
    }
  }
  
  // Don't forget the last vendor
  if (currentVendor && currentVendor.name) {
    vendors.push(createVendorFromData(currentVendor));
  }
  
  console.log("Total vendors extracted:", vendors.length);
  return vendors;
};

const extractVendorName = (line: string): string | null => {
  // Remove common prefixes
  let cleaned = line.replace(/vendor:?|company:?|name:?|business:?/i, '').trim();
  
  // If there's a colon, take what's after it
  if (cleaned.includes(':')) {
    cleaned = cleaned.split(':')[1].trim();
  }
  
  return sanitizeText(cleaned) || null;
};

const createVendorFromData = (data: Partial<VendorFormData>): VendorFormData => {
  return {
    name: data.name || 'Unknown Vendor',
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    city: data.city || null,
    state: data.state || null,
    zip_code: data.zip_code || null,
    contact_person: data.contact_person || null,
    contact_title: data.contact_title || null,
    website: data.website || null,
    description: data.description || null,
    vendor_type: data.vendor_type || 'supplier',
    status: data.status || 'active',
    rating: data.rating || null
  };
};
