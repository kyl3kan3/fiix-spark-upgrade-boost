
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

  // Simple approach: finalize when we see a clear new company name after enough content
  if (nextLine && isMainCompanyName(nextLine) && linesProcessed >= 10) {
    return true;
  }

  // Finalize after significant empty space (likely page break) if we have a company name
  if (consecutiveEmptyLines >= 5 && currentVendor.name && linesProcessed >= 8) {
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
