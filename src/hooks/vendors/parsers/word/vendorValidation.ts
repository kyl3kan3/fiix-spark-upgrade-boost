
export const isPhoneNumber = (line: string): boolean => {
  return /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(line);
};

export const isEmailAddress = (line: string): boolean => {
  return /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(line);
};

export const isWebsiteUrl = (line: string): boolean => {
  return /(https?:\/\/[^\s]+|www\.[^\s]+)/.test(line);
};

export const isProductLine = (line: string): boolean => {
  // Very specific product patterns - be more restrictive
  const productPatterns = [
    /^\s*[-•]\s*[A-Za-z]/, // Clear bullet points
    /^\s*\d+[\.)]\s*[A-Za-z]/, // Clear numbered lists
    /\b(valve|fitting|pipe|tubing|gasket|bolt|screw|hardware)\b/i, // Specific product words
  ];
  
  return productPatterns.some(pattern => pattern.test(line));
};

export const isLocationLine = (line: string): boolean => {
  // Detect lines like "Freeburg IL", "Chicago IL", etc. - these are NOT company names
  return /^[A-Z][a-z]+\s+[A-Z]{2}$/i.test(line.trim());
};

export const isPersonName = (line: string): boolean => {
  const words = line.trim().split(/\s+/);
  
  // Must be 2-4 words
  if (words.length < 2 || words.length > 4) return false;
  
  // All words should be capitalized (First Last format)
  const allCapitalized = words.every(word => 
    /^[A-Z][a-z]+$/.test(word) || 
    /^[A-Z]\.?$/.test(word) || // Middle initial
    /^(Jr|Sr|II|III|IV)\.?$/i.test(word) // Suffixes
  );
  
  // Exclude company words
  const hasCompanyWords = /\b(hardware|electric|construction|supply|ace|company|corp|inc|llc|ltd|services|solutions|group|enterprises|industries|systems|technologies)\b/i.test(line);
  
  // Exclude all caps (company names are often all caps)
  if (line === line.toUpperCase()) {
    return false;
  }
  
  // Exclude if it contains obvious non-person indicators
  if (isPhoneNumber(line) || isProductLine(line) || isLocationLine(line)) {
    return false;
  }
  
  return allCapitalized && !hasCompanyWords;
};

export const isMainCompanyName = (line: string): boolean => {
  const trimmedLine = line.trim();
  
  if (trimmedLine.length < 3 || trimmedLine.length > 100) return false;
  
  // EXCLUDE these patterns completely - they are NOT company names
  if (isPhoneNumber(trimmedLine) || isEmailAddress(trimmedLine) || isWebsiteUrl(trimmedLine)) {
    return false;
  }
  
  // EXCLUDE product lines completely
  if (isProductLine(trimmedLine)) {
    return false;
  }
  
  // EXCLUDE location lines like "Freeburg IL" - these are NOT company names
  if (isLocationLine(trimmedLine)) {
    console.log('[Validation] EXCLUDING location line as company name:', trimmedLine);
    return false;
  }
  
  // EXCLUDE person names - these are NOT company names
  if (isPersonName(trimmedLine)) {
    console.log('[Validation] EXCLUDING person name as company name:', trimmedLine);
    return false;
  }
  
  // EXCLUDE lines that start with numbers (addresses/measurements)
  if (/^\d+\s+/.test(trimmedLine)) {
    return false;
  }

  // EXCLUDE common non-company phrases
  if (/^(products?|services?|items?|equipment|supplies|materials|contact|phone|email|address|website)/i.test(trimmedLine)) {
    return false;
  }

  // EXCLUDE clear address patterns (city, state zip)
  if (/^[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/.test(trimmedLine)) {
    return false;
  }
  
  // Must be in proper case (not all lowercase)
  if (trimmedLine === trimmedLine.toLowerCase()) {
    return false;
  }

  // Strong company indicators - look for business keywords
  const hasCompanyWords = /\b(ace\s+hardware|hardware|electric|construction|supply|company|corp|corporation|inc|incorporated|llc|ltd|limited|group|enterprises|industries|systems|solutions|services|manufacturing|technologies)\b/i.test(trimmedLine);
  
  // Check if it's in all caps with multiple words (common for company names in directories)
  const isAllCapsMultiWord = trimmedLine === trimmedLine.toUpperCase() && trimmedLine.split(' ').length >= 2;
  
  // Check if it's proper title case with at least 2 words
  const isTitleCase = /^[A-Z][A-Za-z\s&.,'-]*$/.test(trimmedLine) && trimmedLine.split(' ').length >= 2;
  
  // Must have strong indicators to be considered a company name
  const isValidCompany = (hasCompanyWords || isAllCapsMultiWord) && (isTitleCase || isAllCapsMultiWord);
  
  if (isValidCompany) {
    console.log('[Validation] IDENTIFIED company name:', trimmedLine);
  }
  
  return isValidCompany;
};

export const isLikelyCompanyName = (line: string): boolean => {
  // Make this much more restrictive - only used as fallback
  return isMainCompanyName(line);
};

export const isAddressLine = (line: string): boolean => {
  const addressPatterns = [
    /^\d+\s+[A-Za-z]/,  // Starts with number + street name
    /\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln|boulevard|blvd)\b/i,
    /^P\.?O\.?\s+Box\s+\d+/i,  // PO Box
    /^[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/,  // City, STATE ZIP
  ];
  
  // Don't treat location lines as addresses
  if (isLocationLine(line)) {
    return false;
  }
  
  return addressPatterns.some(pattern => pattern.test(line)) && !isProductLine(line);
};
