
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
  // Don't finalize if we don't have at least a name
  if (!currentVendor.name) return false;

  // Always finalize on last line if we have data
  if (isLastLine && hasAnyData) return true;

  // Finalize after significant empty space (5+ empty lines) and next line looks like new vendor
  if (consecutiveEmptyLines >= 5 && nextLine && isMainCompanyName(nextLine)) {
    return true;
  }

  // Finalize when we encounter what looks like a completely new company section
  if (nextLine && isMainCompanyName(nextLine) && 
      !nextLine.toLowerCase().includes(currentVendor.name.toLowerCase().split(' ')[0])) {
    // Only if we've processed enough lines to constitute a complete vendor
    if (linesProcessed >= 8) {
      return true;
    }
  }

  // Don't finalize too early - give more lines to build up the vendor
  if (linesProcessed < 15) {
    return false;
  }

  return false;
};

export const finalizeVendor = (vendor: VendorData, hasAnyData: boolean): VendorData | null => {
  if (!hasAnyData || !vendor.name) {
    return null;
  }

  // Clean up the vendor data
  const finalVendor = { ...vendor };
  
  // Parse city, state, zip from address if not separately set
  if (finalVendor.address && !finalVendor.city) {
    // Look for patterns like "City, STATE ZIP" at the end of address
    const addressMatch = finalVendor.address.match(/^(.*?),?\s*([A-Za-z\s]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
    if (addressMatch) {
      const [, streetPart, cityPart, state, zip] = addressMatch;
      finalVendor.address = streetPart.trim();
      finalVendor.city = cityPart.trim();
      finalVendor.state = state;
      finalVendor.zip_code = zip;
    } else {
      // Try simpler pattern
      const simpleMatch = finalVendor.address.match(/^(.*?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      if (simpleMatch) {
        const [, addressPart, state, zip] = simpleMatch;
        const parts = addressPart.split(',');
        if (parts.length >= 2) {
          finalVendor.city = parts[parts.length - 1].trim();
          finalVendor.address = parts.slice(0, -1).join(',').trim();
        }
        finalVendor.state = state;
        finalVendor.zip_code = zip;
      }
    }
  }

  console.log('[Vendor Builder] Finalizing vendor:', finalVendor);
  return finalVendor;
};
