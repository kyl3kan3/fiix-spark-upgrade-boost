
import { VendorData, createEmptyVendor } from './vendorDataTypes';
import { isMainCompanyName } from './vendorValidation';
import { shouldFinalize, finalizeVendor } from './vendorFinalization';
import { VendorDataProcessor } from './vendorDataProcessor';

export const createVendorBuilder = () => {
  let currentVendor: VendorData = createEmptyVendor();
  let hasAnyData = false;
  let linesProcessed = 0;
  let consecutiveEmptyLines = 0;
  const dataProcessor = new VendorDataProcessor();

  const addDataFromLine = (line: string) => {
    linesProcessed++;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      consecutiveEmptyLines++;
      return;
    }
    
    consecutiveEmptyLines = 0;

    // Detect if this is likely a new vendor name and there's already data
    if (hasAnyData && currentVendor.name && isMainCompanyName(trimmedLine) && linesProcessed > 10) {
      console.log("[Vendor Builder] Found likely new vendor name:", trimmedLine);
      // Don't process this line now, it will be processed after resetting
      return;
    }

    const result = dataProcessor.processLine(trimmedLine, currentVendor);
    if (result.hasData) {
      hasAnyData = true;
    }
  };

  const shouldFinalizeVendor = (currentLine: string, nextLine: string, isLastLine: boolean): boolean => {
    // Check if next line is likely a new vendor name and we already have data
    if (nextLine && isMainCompanyName(nextLine) && hasAnyData && currentVendor.name) {
      return true;
    }

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
    dataProcessor.finalizeDescription(currentVendor);

    const result = finalizeVendor(currentVendor, hasAnyData);
    
    if (result) {
      console.log('[Vendor Builder] Finalized vendor:', result.name);
    }
    
    return result;
  };

  const reset = () => {
    currentVendor = createEmptyVendor();
    hasAnyData = false;
    linesProcessed = 0;
    consecutiveEmptyLines = 0;
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
