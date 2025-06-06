
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

    // More aggressive vendor separation: if we find a clear company name and already have a vendor with data
    if (hasAnyData && currentVendor.name && isMainCompanyName(trimmedLine) && linesProcessed > 3) {
      console.log("[Vendor Builder] Found new company name, should finalize current vendor:", trimmedLine);
      // Don't process this line now, it will be processed after resetting
      return;
    }

    const result = dataProcessor.processLine(trimmedLine, currentVendor);
    if (result.hasData) {
      hasAnyData = true;
    }
  };

  const shouldFinalizeVendor = (currentLine: string, nextLine: string, isLastLine: boolean): boolean => {
    // More aggressive finalization when we encounter a new company name
    if (nextLine && isMainCompanyName(nextLine) && hasAnyData && currentVendor.name && linesProcessed > 3) {
      console.log("[Vendor Builder] Next line is company name, finalizing current vendor");
      return true;
    }

    // Also finalize if we have a good amount of data and see multiple empty lines
    if (consecutiveEmptyLines >= 3 && hasAnyData && currentVendor.name && linesProcessed >= 5) {
      console.log("[Vendor Builder] Multiple empty lines with good data, finalizing");
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
