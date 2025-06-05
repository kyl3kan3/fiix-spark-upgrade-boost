
import { VendorData } from './vendorDataTypes';

export const shouldFinalize = (
  currentVendor: VendorData,
  linesProcessed: number,
  consecutiveEmptyLines: number,
  hasAnyData: boolean,
  currentLine: string,
  nextLine: string,
  isLastLine: boolean,
  isMainCompanyName: (line: string) => boolean
): boolean => {
  // Don't finalize if we don't have any meaningful data
  if (!hasAnyData) return false;

  // Always finalize on last line if we have data
  if (isLastLine && hasAnyData) return true;

  // Finalize after significant empty space (4+ empty lines) and next line looks like new vendor
  if (consecutiveEmptyLines >= 4 && nextLine && isMainCompanyName(nextLine)) {
    return true;
  }

  // Finalize when we encounter what looks like a completely new company section
  if (nextLine && isMainCompanyName(nextLine) && currentVendor.name) {
    // Check if the next line is actually a different company
    const currentCompanyBase = currentVendor.name.toLowerCase().split(' ')[0];
    const nextCompanyBase = nextLine.toLowerCase().split(' ')[0];
    
    if (currentCompanyBase !== nextCompanyBase) {
      // Only if we've processed enough lines to constitute a complete vendor
      if (linesProcessed >= 5) {
        return true;
      }
    }
  }

  // For well-structured documents like ACE Hardware, finalize when we have:
  // - Company name AND contact person AND phone number
  if (currentVendor.name && currentVendor.contact_person && currentVendor.phone && linesProcessed >= 5) {
    // Look ahead to see if next section starts
    if (consecutiveEmptyLines >= 2 || isMainCompanyName(nextLine)) {
      return true;
    }
  }

  // Don't finalize too early - give more lines to build up the vendor
  if (linesProcessed < 8) {
    return false;
  }

  return false;
};

export const finalizeVendor = (vendor: VendorData, hasAnyData: boolean): VendorData | null => {
  if (!hasAnyData) {
    return null;
  }

  // Clean up the vendor data
  const finalVendor = { ...vendor };
  
  // If we don't have a name but have other data, don't create the vendor
  if (!finalVendor.name || finalVendor.name.trim() === '') {
    console.log('[Vendor Finalization] Skipping vendor without valid name');
    return null;
  }

  // Parse city, state, zip from address if not separately set
  if (finalVendor.address && !finalVendor.city) {
    // Look for patterns like "FREEBURG, IL 62243"
    const addressMatch = finalVendor.address.match(/^(.*?),?\s*([A-Za-z\s]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
    if (addressMatch) {
      const [, streetPart, cityPart, state, zip] = addressMatch;
      finalVendor.address = streetPart.trim();
      finalVendor.city = cityPart.trim();
      finalVendor.state = state;
      finalVendor.zip_code = zip;
    } else {
      // Try simpler pattern for just "CITY, STATE ZIP"
      const simpleMatch = finalVendor.address.match(/^([A-Z\s]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      if (simpleMatch) {
        const [, city, state, zip] = simpleMatch;
        finalVendor.city = city.trim();
        finalVendor.state = state;
        finalVendor.zip_code = zip;
        finalVendor.address = ''; // Clear since it was just city/state/zip
      }
    }
  }

  // Set default vendor type if not specified
  if (!finalVendor.vendor_type) {
    finalVendor.vendor_type = 'supplier';
  }

  console.log('[Vendor Finalization] Finalizing vendor:', {
    name: finalVendor.name,
    contact_person: finalVendor.contact_person,
    phone: finalVendor.phone,
    email: finalVendor.email,
    address: finalVendor.address,
    city: finalVendor.city,
    state: finalVendor.state,
    zip_code: finalVendor.zip_code
  });
  
  return finalVendor;
};
