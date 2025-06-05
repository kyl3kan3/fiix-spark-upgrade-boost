
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

  // For page-based documents, require significant separation between vendors
  // Only finalize after many empty lines (suggesting page break) AND next line is clearly a new vendor
  if (consecutiveEmptyLines >= 8 && nextLine && isMainCompanyName(nextLine)) {
    // Ensure we have enough data to constitute a complete vendor
    if (currentVendor.name && linesProcessed >= 15) {
      return true;
    }
  }

  // For well-structured documents, only finalize when we have:
  // - A clear company name AND substantial contact info AND significant separation
  if (currentVendor.name && (currentVendor.phone || currentVendor.email) && linesProcessed >= 20) {
    // Look for very clear separation (like page breaks)
    if (consecutiveEmptyLines >= 6 && nextLine && isMainCompanyName(nextLine)) {
      // Double-check that the next line is actually a different company
      const currentCompanyWords = currentVendor.name.toLowerCase().split(/\s+/);
      const nextLineWords = nextLine.toLowerCase().split(/\s+/);
      const hasCommonWords = currentCompanyWords.some(word => 
        word.length > 2 && nextLineWords.includes(word)
      );
      
      if (!hasCommonWords) {
        return true;
      }
    }
  }

  // Be very conservative - don't finalize too early
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
