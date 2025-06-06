
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
  // Don't finalize if we don't have any meaningful data or company name
  if (!hasAnyData || !currentVendor.name) return false;

  // Always finalize on last line if we have data
  if (isLastLine && hasAnyData) return true;

  // Only finalize on very clear page breaks (lots of empty lines) 
  // This suggests we've moved to a new page/vendor
  if (consecutiveEmptyLines >= 8 && currentVendor.name && linesProcessed >= 5) {
    return true;
  }

  return false;
};

export const finalizeVendor = (vendor: VendorData, hasAnyData: boolean): VendorData | null => {
  if (!hasAnyData || !vendor.name) {
    return null;
  }

  const finalVendor = { ...vendor };
  
  // Parse city, state, zip from address if needed
  if (finalVendor.address && !finalVendor.city) {
    const addressMatch = finalVendor.address.match(/^(.*?),?\s*([A-Za-z\s]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
    if (addressMatch) {
      const [, streetPart, cityPart, state, zip] = addressMatch;
      finalVendor.address = streetPart.trim();
      finalVendor.city = cityPart.trim();
      finalVendor.state = state;
      finalVendor.zip_code = zip;
    }
  }

  if (!finalVendor.vendor_type) {
    finalVendor.vendor_type = 'supplier';
  }

  return finalVendor;
};
