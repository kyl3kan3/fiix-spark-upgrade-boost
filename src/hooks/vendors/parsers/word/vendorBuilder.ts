
import { VendorData, createEmptyVendor } from './vendorDataTypes';
import { 
  isPhoneNumber, 
  isEmailAddress, 
  isWebsiteUrl, 
  isMainCompanyName, 
  isLikelyCompanyName, 
  isPersonName, 
  isAddressLine 
} from './vendorValidation';
import { shouldFinalize, finalizeVendor } from './vendorFinalization';

export const createVendorBuilder = () => {
  let currentVendor: VendorData = createEmptyVendor();
  let hasAnyData = false;
  let linesProcessed = 0;
  let consecutiveEmptyLines = 0;
  let hasFoundMainCompanyName = false;

  const addDataFromLine = (line: string) => {
    linesProcessed++;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      consecutiveEmptyLines++;
      return;
    }
    
    consecutiveEmptyLines = 0;

    // Skip lines that are clearly not company names
    if (isPhoneNumber(trimmedLine) || 
        isEmailAddress(trimmedLine) || 
        isAddressLine(trimmedLine) ||
        isWebsiteUrl(trimmedLine)) {
      console.log('[Vendor Builder] Skipping non-company line:', trimmedLine);
      return;
    }

    // Priority 1: Look for main company name first (usually appears early and prominent)
    if (!hasFoundMainCompanyName && isMainCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      hasAnyData = true;
      hasFoundMainCompanyName = true;
      console.log('[Vendor Builder] Set main company name:', trimmedLine);
      return;
    }

    // Priority 2: If we already have a main company name, look for contact person
    if (hasFoundMainCompanyName && !currentVendor.contact_person && isPersonName(trimmedLine)) {
      currentVendor.contact_person = trimmedLine;
      hasAnyData = true;
      console.log('[Vendor Builder] Set contact person:', trimmedLine);
      return;
    }

    // Priority 3: Handle address information
    if (isAddressLine(trimmedLine)) {
      if (!currentVendor.address) {
        currentVendor.address = trimmedLine;
      } else {
        // Append to existing address
        currentVendor.address += ', ' + trimmedLine;
      }
      hasAnyData = true;
      console.log('[Vendor Builder] Added address info:', trimmedLine);
      return;
    }

    // Priority 4: If no main company name yet, but this could be one
    if (!hasFoundMainCompanyName && isLikelyCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      hasAnyData = true;
      hasFoundMainCompanyName = true;
      console.log('[Vendor Builder] Set company name:', trimmedLine);
      return;
    }

    // For any other text, mark that we have data but don't treat as company name
    if (trimmedLine.length > 2) {
      hasAnyData = true;
      console.log('[Vendor Builder] Added misc data:', trimmedLine);
    }
  };

  const shouldFinalizeVendor = (currentLine: string, nextLine: string, isLastLine: boolean): boolean => {
    return shouldFinalize(
      currentVendor,
      linesProcessed,
      consecutiveEmptyLines,
      hasAnyData,
      currentLine,
      nextLine,
      isLastLine,
      isMainCompanyName
    );
  };

  const finalize = (): VendorData | null => {
    return finalizeVendor(currentVendor, hasAnyData);
  };

  const reset = () => {
    currentVendor = createEmptyVendor();
    hasAnyData = false;
    linesProcessed = 0;
    consecutiveEmptyLines = 0;
    hasFoundMainCompanyName = false;
  };

  const getCurrentVendor = () => currentVendor;

  return {
    addDataFromLine,
    shouldFinalize: shouldFinalizeVendor,
    finalize,
    reset,
    getCurrentVendor
  };
};
