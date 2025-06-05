
interface VendorData {
  name: string;
  email: string;
  phone: string;
  contact_person: string;
  contact_title: string;
  vendor_type: "service" | "supplier" | "contractor" | "consultant";
  status: "active" | "inactive" | "suspended";
  address: string;
  city: string;
  state: string;
  zip_code: string;
  website: string;
  description: string;
  rating: number | null;
}

export const createVendorBuilder = () => {
  const createEmptyVendor = (): VendorData => ({
    name: '',
    email: '',
    phone: '',
    contact_person: '',
    contact_title: '',
    vendor_type: 'service',
    status: 'active',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    website: '',
    description: '',
    rating: null
  });

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

    // For any other text, mark that we have data
    if (trimmedLine.length > 2) {
      hasAnyData = true;
    }
  };

  const isMainCompanyName = (line: string): boolean => {
    if (line.length < 3 || line.length > 100) return false;
    
    // Strong indicators for main company names
    const strongCompanyIndicators = /\b(hardware|electric|construction|supply|supplies|services|solutions|group|inc|llc|corp|ltd|company|companies)\b/i;
    
    // Check if it's in all caps (like "ACE HARDWARE")
    const isAllCaps = line === line.toUpperCase() && line.includes(' ');
    
    // Check if it's a prominent business name pattern
    const isProminentName = /^[A-Z][A-Z\s&.,'-]+$/.test(line) && line.length >= 5;
    
    // Avoid obvious non-company text
    if (line.match(/^\d+\s+/) || // Starts with number (likely address)
        line.includes('@') || // Email
        line.match(/^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) || // Phone
        line.toLowerCase().includes('cell') ||
        line.toLowerCase().includes('office') ||
        line.toLowerCase().includes('phone')) {
      return false;
    }

    return (strongCompanyIndicators.test(line) && (isAllCaps || isProminentName)) || 
           (isAllCaps && line.split(' ').length <= 4);
  };

  const isLikelyCompanyName = (line: string): boolean => {
    if (line.length < 3 || line.length > 100) return false;
    
    // Company indicators
    const companyIndicators = /\b(inc|llc|corp|ltd|company|companies|services|solutions|group|hardware|electric|construction|supply|supplies|systems|technologies|enterprises|industries|partners|associates)\b/i;
    
    // Check if it's mostly uppercase
    const isUpperCase = line === line.toUpperCase() && line.includes(' ');
    
    // Check if it starts with capital letters
    const startsWithCaps = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line);
    
    // Avoid phone numbers, emails, and obvious addresses
    if (line.match(/^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) || 
        line.includes('@') || 
        line.match(/^\d+\s+[A-Za-z]/)) {
      return false;
    }

    return companyIndicators.test(line) || isUpperCase || (startsWithCaps && !isPersonName(line));
  };

  const isPersonName = (line: string): boolean => {
    // Simple heuristic: 2-4 words, first letter capitalized, common name patterns
    const words = line.trim().split(/\s+/);
    if (words.length < 2 || words.length > 4) return false;
    
    // All words should be capitalized
    const allCapitalized = words.every(word => /^[A-Z][a-z]+$/.test(word));
    
    // Avoid obvious company words
    const hasCompanyWords = /\b(inc|llc|corp|ltd|company|hardware|electric|construction|supply|systems)\b/i.test(line);
    
    return allCapitalized && !hasCompanyWords && line.length <= 50;
  };

  const isAddressLine = (line: string): boolean => {
    // Address patterns: starts with number, contains street indicators, city/state patterns
    const addressPatterns = [
      /^\d+\s+[A-Za-z]/,  // Starts with number + street name
      /\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln|boulevard|blvd|place|pl|court|ct|circle|cir)\b/i,
      /^P\.?O\.?\s+Box\s+\d+/i,  // PO Box
      /,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/,  // City, STATE ZIP
    ];
    
    return addressPatterns.some(pattern => pattern.test(line));
  };

  const shouldFinalize = (currentLine: string, nextLine: string, isLastLine: boolean): boolean => {
    // Don't finalize if we don't have at least a name
    if (!currentVendor.name) return false;

    // Always finalize on last line if we have data
    if (isLastLine && hasAnyData) return true;

    // Finalize after significant empty space (3+ empty lines) and next line looks like new vendor
    if (consecutiveEmptyLines >= 3 && nextLine && isMainCompanyName(nextLine)) {
      return true;
    }

    // Finalize when we encounter what looks like a completely new company section
    if (nextLine && isMainCompanyName(nextLine) && 
        !nextLine.toLowerCase().includes(currentVendor.name.toLowerCase().split(' ')[0])) {
      // Only if we've processed enough lines to constitute a complete vendor
      if (linesProcessed >= 5) {
        return true;
      }
    }

    // Don't finalize too early - give more lines to build up the vendor
    if (linesProcessed < 8) {
      return false;
    }

    return false;
  };

  const finalize = (): VendorData | null => {
    if (!hasAnyData || !currentVendor.name) {
      return null;
    }

    // Clean up the vendor data
    const vendor = { ...currentVendor };
    
    // Parse city, state, zip from address if not separately set
    if (vendor.address && !vendor.city) {
      // Look for patterns like "City, STATE ZIP" at the end of address
      const addressMatch = vendor.address.match(/^(.*?),?\s*([A-Za-z\s]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      if (addressMatch) {
        const [, streetPart, cityPart, state, zip] = addressMatch;
        vendor.address = streetPart.trim();
        vendor.city = cityPart.trim();
        vendor.state = state;
        vendor.zip_code = zip;
      } else {
        // Try simpler pattern
        const simpleMatch = vendor.address.match(/^(.*?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
        if (simpleMatch) {
          const [, addressPart, state, zip] = simpleMatch;
          const parts = addressPart.split(',');
          if (parts.length >= 2) {
            vendor.city = parts[parts.length - 1].trim();
            vendor.address = parts.slice(0, -1).join(',').trim();
          }
          vendor.state = state;
          vendor.zip_code = zip;
        }
      }
    }

    console.log('[Vendor Builder] Finalizing vendor:', vendor);
    return vendor;
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
    shouldFinalize,
    finalize,
    reset,
    getCurrentVendor
  };
};
