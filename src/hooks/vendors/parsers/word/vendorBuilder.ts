
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

    // If we encounter a clear company name and we already have a vendor with data, finalize immediately
    if (isMainCompanyName(trimmedCurrentLine) && hasAnyData && currentVendor.name && currentVendor.name !== trimmedCurrentLine && linesProcessed > 1) {
      console.log("[Vendor Builder] Found new company name on current line, finalizing current vendor. Current:", currentVendor.name, "New:", trimmedCurrentLine);
      return true;
    }

    // Also check next line for company names - but only if we have substantial data
    if (trimmedNextLine && isMainCompanyName(trimmedNextLine) && hasAnyData && currentVendor.name && linesProcessed > 1) {
      console.log("[Vendor Builder] Next line is company name, finalizing current vendor. Current:", currentVendor.name, "Next:", trimmedNextLine);
      return true;
    }

    // If we have a vendor with a name and encounter a person name, finalize (person likely belongs to next vendor)
    if (isPersonName(trimmedCurrentLine) && hasAnyData && currentVendor.name && linesProcessed > 2) {
      console.log("[Vendor Builder] Found person name with existing vendor, finalizing. Current vendor:", currentVendor.name, "Person:", trimmedCurrentLine);
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
