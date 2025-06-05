
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

  const addDataFromLine = (line: string) => {
    linesProcessed++;
    const trimmedLine = line.trim();
    
    if (!trimmedLine) return;

    // If we don't have a name yet and this looks like a company name, use it
    if (!currentVendor.name && isLikelyCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      hasAnyData = true;
      console.log('[Vendor Builder] Set company name:', trimmedLine);
      return;
    }

    // If we have a name but this looks like a better/more complete company name, update it
    if (currentVendor.name && isLikelyCompanyName(trimmedLine) && 
        trimmedLine.length > currentVendor.name.length && 
        !isPersonName(trimmedLine)) {
      console.log('[Vendor Builder] Updating company name from', currentVendor.name, 'to', trimmedLine);
      currentVendor.name = trimmedLine;
      return;
    }

    // If this looks like a person name and we don't have a contact person
    if (!currentVendor.contact_person && isPersonName(trimmedLine) && !isLikelyCompanyName(trimmedLine)) {
      currentVendor.contact_person = trimmedLine;
      hasAnyData = true;
      console.log('[Vendor Builder] Set contact person:', trimmedLine);
      return;
    }

    // Check for address patterns
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

    hasAnyData = true;
  };

  const isLikelyCompanyName = (line: string): boolean => {
    if (line.length < 3 || line.length > 100) return false;
    
    // Company indicators
    const companyIndicators = /\b(inc|llc|corp|ltd|company|companies|services|solutions|group|hardware|electric|construction|supply|supplies|systems|technologies|enterprises|industries|partners|associates)\b/i;
    
    // Check if it's mostly uppercase (like "ACE HARDWARE")
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

    // Finalize when we encounter what looks like a new company name
    if (nextLine && isLikelyCompanyName(nextLine) && !isPersonName(nextLine)) {
      // But not if the next line could be additional info for current vendor
      if (nextLine.toLowerCase().includes(currentVendor.name.toLowerCase().split(' ')[0])) {
        return false;
      }
      return true;
    }

    // Finalize after we've processed a reasonable amount of lines for one vendor
    // and the next line looks like it could start a new vendor
    if (linesProcessed >= 3 && nextLine && 
        (isLikelyCompanyName(nextLine) || nextLine.match(/^[A-Z\s]+$/))) {
      return true;
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
      const addressMatch = vendor.address.match(/^(.*?),?\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      if (addressMatch) {
        const [, cityPart, state, zip] = addressMatch;
        const cityMatch = cityPart.match(/,\s*([^,]+)$/);
        if (cityMatch) {
          vendor.city = cityMatch[1].trim();
          vendor.address = cityPart.replace(/,\s*[^,]+$/, '').trim();
        }
        vendor.state = state;
        vendor.zip_code = zip;
      }
    }

    console.log('[Vendor Builder] Finalizing vendor:', vendor);
    return vendor;
  };

  const reset = () => {
    currentVendor = createEmptyVendor();
    hasAnyData = false;
    linesProcessed = 0;
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
