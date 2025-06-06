
import { VendorData, createEmptyVendor } from './vendorDataTypes';
import { isMainCompanyName, isPersonName, isLocationLine } from './vendorValidation';
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

    // Skip location lines completely - they're not vendor data
    if (isLocationLine(trimmedLine)) {
      console.log("[Vendor Builder] Skipping location line:", trimmedLine);
      return;
    }

    const result = dataProcessor.processLine(trimmedLine, currentVendor);
    if (result.hasData) {
      hasAnyData = true;
    }
  };

  const shouldFinalizeVendor = (currentLine: string, nextLine: string, isLastLine: boolean): boolean => {
    const trimmedCurrentLine = currentLine.trim();
    const trimmedNextLine = nextLine ? nextLine.trim() : '';

    // Skip location lines when checking for finalization
    if (isLocationLine(trimmedCurrentLine)) {
      return false;
    }

    // Always finalize at the end
    if (isLastLine && hasAnyData && currentVendor.name) {
      console.log("[Vendor Builder] End of document, finalizing vendor:", currentVendor.name);
      return true;
    }

    // Only finalize if we have a complete vendor AND encounter a new company name
    if (hasAnyData && currentVendor.name && linesProcessed > 3) {
      // Check if next line is a clear new company name (not current line)
      if (trimmedNextLine && isMainCompanyName(trimmedNextLine) && trimmedNextLine !== currentVendor.name) {
        console.log("[Vendor Builder] Next line is new company, finalizing current vendor. Current:", currentVendor.name, "Next:", trimmedNextLine);
        return true;
      }
    }

    // Only finalize on very large gaps (likely page breaks)
    if (consecutiveEmptyLines >= 8 && hasAnyData && currentVendor.name && linesProcessed >= 5) {
      console.log("[Vendor Builder] Large gap detected, finalizing vendor");
      return true;
    }

    return false;
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
