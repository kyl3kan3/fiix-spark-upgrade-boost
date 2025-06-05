
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
  let vendorDataLines: string[] = []; // Track all data for this vendor

  const addDataFromLine = (line: string) => {
    linesProcessed++;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      consecutiveEmptyLines++;
      return;
    }
    
    consecutiveEmptyLines = 0;
    vendorDataLines.push(trimmedLine);

    // Handle phone numbers
    if (isPhoneNumber(trimmedLine)) {
      const phoneMatch = trimmedLine.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      if (phoneMatch) {
        if (!currentVendor.phone) {
          currentVendor.phone = phoneMatch[1];
        } else {
          currentVendor.phone += ', ' + phoneMatch[1];
        }
        hasAnyData = true;
        console.log('[Vendor Builder] Added phone:', phoneMatch[1]);
      }
      return;
    }

    // Handle email addresses
    if (isEmailAddress(trimmedLine)) {
      const emailMatch = trimmedLine.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch && !currentVendor.email) {
        currentVendor.email = emailMatch[1];
        hasAnyData = true;
        console.log('[Vendor Builder] Added email:', emailMatch[1]);
      }
      return;
    }

    // Handle website URLs
    if (isWebsiteUrl(trimmedLine)) {
      const websiteMatch = trimmedLine.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
      if (websiteMatch && !currentVendor.website) {
        let website = websiteMatch[1];
        if (!website.startsWith('http')) {
          website = 'https://' + website;
        }
        currentVendor.website = website;
        hasAnyData = true;
        console.log('[Vendor Builder] Added website:', website);
      }
      return;
    }

    // Handle address lines
    if (isAddressLine(trimmedLine)) {
      if (!currentVendor.address) {
        currentVendor.address = trimmedLine;
      } else {
        currentVendor.address += ', ' + trimmedLine;
      }
      hasAnyData = true;
      console.log('[Vendor Builder] Added address info:', trimmedLine);
      return;
    }

    // Priority 1: Look for main company name first
    if (!hasFoundMainCompanyName && isMainCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      hasAnyData = true;
      hasFoundMainCompanyName = true;
      console.log('[Vendor Builder] Set main company name:', trimmedLine);
      return;
    }

    // Priority 2: If we have a main company name, look for contact person
    if (hasFoundMainCompanyName && !currentVendor.contact_person && isPersonName(trimmedLine)) {
      currentVendor.contact_person = trimmedLine;
      hasAnyData = true;
      console.log('[Vendor Builder] Set contact person:', trimmedLine);
      return;
    }

    // Priority 3: If no main company name yet, check if this could be one
    if (!hasFoundMainCompanyName && isLikelyCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      hasAnyData = true;
      hasFoundMainCompanyName = true;
      console.log('[Vendor Builder] Set company name:', trimmedLine);
      return;
    }

    // For lines that contain phone context (like "CELL #:")
    if (trimmedLine.toLowerCase().includes('cell') && trimmedLine.includes(':')) {
      const phoneMatch = trimmedLine.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      if (phoneMatch) {
        if (!currentVendor.phone) {
          currentVendor.phone = phoneMatch[1] + ' (Cell)';
        } else {
          currentVendor.phone += ', ' + phoneMatch[1] + ' (Cell)';
        }
        hasAnyData = true;
        console.log('[Vendor Builder] Added cell phone:', phoneMatch[1]);
      }
      return;
    }

    // For any other meaningful text, mark that we have data
    if (trimmedLine.length > 2 && !trimmedLine.match(/^[^a-zA-Z]*$/)) {
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
    // If we have data but no company name, try to construct one from collected lines
    if (hasAnyData && !currentVendor.name && vendorDataLines.length > 0) {
      // Look for the best company name candidate
      for (const line of vendorDataLines) {
        if (isMainCompanyName(line) || isLikelyCompanyName(line)) {
          currentVendor.name = line;
          console.log('[Vendor Builder] Set final company name:', line);
          break;
        }
      }
    }

    const result = finalizeVendor(currentVendor, hasAnyData);
    
    // Log the final vendor data for debugging
    if (result) {
      console.log('[Vendor Builder] Final vendor data:', {
        name: result.name,
        contact_person: result.contact_person,
        phone: result.phone,
        email: result.email,
        address: result.address,
        website: result.website
      });
    }
    
    return result;
  };

  const reset = () => {
    currentVendor = createEmptyVendor();
    hasAnyData = false;
    linesProcessed = 0;
    consecutiveEmptyLines = 0;
    hasFoundMainCompanyName = false;
    vendorDataLines = [];
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
