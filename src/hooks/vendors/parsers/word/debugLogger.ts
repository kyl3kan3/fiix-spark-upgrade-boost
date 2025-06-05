
export const createDebugLogger = () => {
  const log = (message: string, data?: any) => {
    console.log(`[Word Parser] ${message}`, data || '');
  };
  
  const logTextExtraction = (text: string) => {
    log("=== WORD PARSER DEBUG ===");
    log("Raw extracted text:", text);
    log("Text length:", text.length);
  };
  
  const logProcessedLines = (lines: string[]) => {
    log("Cleaned lines:", lines);
    log("Total lines:", lines.length);
  };
  
  const logLineProcessing = (index: number, line: string) => {
    log(`Processing line ${index}: "${line}"`);
  };
  
  const logSkippedLine = (reason: string) => {
    log(`Skipping line: ${reason}`);
  };
  
  const logFoundData = (type: string, value: string) => {
    log(`Found ${type}:`, value);
  };
  
  const logKeyValue = (key: string, value: string) => {
    log(`Key-value found: "${key}" = "${value}"`);
  };
  
  const logPotentialCompany = (name: string) => {
    log("Potential company name:", name);
  };
  
  const logVendorFinalized = (vendor: any) => {
    log("Finalizing vendor:", vendor);
  };
  
  const logParsingComplete = (vendorCount: number, vendors: any[]) => {
    log("=== PARSING COMPLETE ===");
    log("Total vendors found:", vendorCount);
    log("Vendors:", vendors);
  };
  
  return {
    log,
    logTextExtraction,
    logProcessedLines,
    logLineProcessing,
    logSkippedLine,
    logFoundData,
    logKeyValue,
    logPotentialCompany,
    logVendorFinalized,
    logParsingComplete
  };
};
