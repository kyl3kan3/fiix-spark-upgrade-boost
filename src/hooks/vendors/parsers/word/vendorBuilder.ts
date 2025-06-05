
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
import { isServiceLine } from './textProcessor';

export const createVendorBuilder = () => {
  let currentVendor: VendorData = createEmptyVendor();
  let hasAnyData = false;
  let linesProcessed = 0;
  let consecutiveEmptyLines = 0;
  let hasFoundMainCompanyName = false;
  let vendorDataLines: string[] = [];
  let processedPhoneNumbers = new Set<string>();

  const normalizePhone = (phone: string): string => {
    return phone.replace(/[\s\-\.()]/g, '');
  };

  const addDataFromLine = (line: string) => {
    linesProcessed++;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      consecutiveEmptyLines++;
      return;
    }
    
    consecutiveEmptyLines = 0;
    vendorDataLines.push(trimmedLine);

    // Handle phone numbers with duplicate prevention
    if (isPhoneNumber(trimmedLine)) {
      const phoneMatch = trimmedLine.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      if (phoneMatch) {
        const phoneNumber = phoneMatch[1];
        const normalizedPhone = normalizePhone(phoneNumber);
        
        if (!processedPhoneNumbers.has(normalizedPhone)) {
          processedPhoneNumbers.add(normalizedPhone);
          
          const context = trimmedLine.toLowerCase();
          let phoneWithContext = phoneNumber;
          
          if (context.includes('cell')) {
            phoneWithContext += ' (Cell)';
          } else if (context.includes('office')) {
            phoneWithContext += ' (Office)';
          } else if (context.includes('fax')) {
            phoneWithContext += ' (Fax)';
          }
          
          if (!currentVendor.phone) {
            currentVendor.phone = phoneWithContext;
          } else {
            currentVendor.phone += ', ' + phoneWithContext;
          }
          hasAnyData = true;
          console.log('[Vendor Builder] Added phone:', phoneWithContext);
        } else {
          console.log('[Vendor Builder] Skipped duplicate phone:', phoneNumber);
        }
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

    // Handle address lines - improved to catch full addresses
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

    // Handle service lines for description
    if (isServiceLine(trimmedLine) && !currentVendor.description) {
      currentVendor.description = trimmedLine;
      hasAnyData = true;
      console.log('[Vendor Builder] Added services description:', trimmedLine);
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
    const phoneWithContextMatch = trimmedLine.match(/(?:cell|mobile|office|phone|tel)?\s*:?\s*(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i);
    if (phoneWithContextMatch) {
      const phoneNumber = phoneWithContextMatch[1];
      const normalizedPhone = normalizePhone(phoneNumber);
      
      if (!processedPhoneNumbers.has(normalizedPhone)) {
        processedPhoneNumbers.add(normalizedPhone);
        
        const context = trimmedLine.toLowerCase();
        let phoneWithContext = phoneNumber;
        
        if (context.includes('cell') || context.includes('mobile')) {
          phoneWithContext += ' (Cell)';
        } else if (context.includes('office')) {
          phoneWithContext += ' (Office)';
        } else if (context.includes('fax')) {
          phoneWithContext += ' (Fax)';
        }
        
        if (!currentVendor.phone) {
          currentVendor.phone = phoneWithContext;
        } else {
          currentVendor.phone += ', ' + phoneWithContext;
        }
        hasAnyData = true;
        console.log('[Vendor Builder] Added phone with context:', phoneWithContext);
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
        website: result.website,
        description: result.description
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
    processedPhoneNumbers.clear();
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
