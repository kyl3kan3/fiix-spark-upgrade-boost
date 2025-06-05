
import { VendorData, createEmptyVendor } from './vendorDataTypes';
import { isMainCompanyName, isLikelyCompanyName } from './vendorValidation';
import { shouldFinalize, finalizeVendor } from './vendorFinalization';
import { VendorDataProcessor } from './vendorDataProcessor';

export const createVendorBuilder = () => {
  let currentVendor: VendorData = createEmptyVendor();
  let hasAnyData = false;
  let linesProcessed = 0;
  let consecutiveEmptyLines = 0;
  let vendorDataLines: string[] = [];
  const dataProcessor = new VendorDataProcessor();

  const addDataFromLine = (line: string) => {
    linesProcessed++;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      consecutiveEmptyLines++;
      return;
    }
    
    consecutiveEmptyLines = 0;
    vendorDataLines.push(trimmedLine);

    const result = dataProcessor.processLine(trimmedLine, currentVendor);
    if (result.hasData) {
      hasAnyData = true;
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
    // Let the data processor finalize the description from collected product lines
    dataProcessor.finalizeDescription(currentVendor);

    // If we have data but no company name, try to construct one from collected lines
    if (hasAnyData && !currentVendor.name && vendorDataLines.length > 0) {
      // Look for the best company name candidate - be more selective
      for (const line of vendorDataLines) {
        if (isMainCompanyName(line)) {
          currentVendor.name = line;
          console.log('[Vendor Builder] Set final main company name:', line);
          break;
        }
      }
      
      // If still no name, try likely company names but be very selective
      if (!currentVendor.name) {
        for (const line of vendorDataLines.slice(0, 5)) { // Only check first few lines
          if (isLikelyCompanyName(line)) {
            currentVendor.name = line;
            console.log('[Vendor Builder] Set final likely company name:', line);
            break;
          }
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
    vendorDataLines = [];
    dataProcessor.reset();
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
