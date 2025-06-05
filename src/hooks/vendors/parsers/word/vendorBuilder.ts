
import { VendorFormData } from "@/services/vendorService";
import { extractEmail, extractPhone, extractWebsite, isCompanyName } from "./patternExtractors";

interface PartialVendor extends Partial<VendorFormData> {}

export const createVendorBuilder = () => {
  let currentVendor: PartialVendor = {};
  
  const addDataFromLine = (line: string) => {
    // Try to extract email from any line
    const email = extractEmail(line);
    if (email && !currentVendor.email) {
      currentVendor.email = email;
    }
    
    // Try to extract phone from any line
    const phone = extractPhone(line);
    if (phone && !currentVendor.phone) {
      currentVendor.phone = phone;
    }
    
    // Try to extract website from any line
    const website = extractWebsite(line);
    if (website && !currentVendor.website) {
      currentVendor.website = website;
    }
    
    // If no name yet, check if this line could be a company name
    if (!currentVendor.name && isCompanyName(line)) {
      currentVendor.name = line;
    }
  };
  
  const shouldFinalize = (line: string, nextLine: string, isLastLine: boolean): boolean => {
    return line.match(/^[-=_]{3,}/) || // Separator line
           (currentVendor.name && (currentVendor.email || currentVendor.phone) && 
            (nextLine.match(/^[A-Z]/) || nextLine.includes('@') || isLastLine));
  };
  
  const finalize = (): VendorFormData | null => {
    if (!currentVendor.name) return null;
    
    const vendor: VendorFormData = {
      name: currentVendor.name,
      email: currentVendor.email || '',
      phone: currentVendor.phone || '',
      contact_person: currentVendor.contact_person || '',
      vendor_type: currentVendor.vendor_type || 'service',
      status: currentVendor.status || 'active',
      address: currentVendor.address || '',
      city: currentVendor.city || '',
      state: currentVendor.state || '',
      zip_code: currentVendor.zip_code || '',
      website: currentVendor.website || '',
      description: currentVendor.description || ''
    };
    
    return vendor;
  };
  
  const reset = () => {
    currentVendor = {};
  };
  
  const getCurrentVendor = () => currentVendor;
  
  return {
    addDataFromLine,
    shouldFinalize,
    finalize,
    reset,
    getCurrentVendor
  };
};
