
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

export const isMainCompanyName = (line: string): boolean => {
  if (line.length < 5 || line.length > 100) return false;
  
  // Exclude obvious non-company text
  if (isPhoneNumber(line) || isEmailAddress(line) || isWebsiteUrl(line)) {
    return false;
  }
  
  // Exclude product lines completely
  if (isProductLine(line)) {
    return false;
  }
  
  // Exclude lines that start with numbers (addresses/measurements)
  if (/^\d+\s+/.test(line)) {
    return false;
  }

  // Exclude common non-company phrases
  if (/^(products?|services?|items?|equipment|supplies|materials|contact|phone|email|address|website)/i.test(line)) {
    return false;
  }

  // Exclude clear address patterns (city, state zip)
  if (/^[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/.test(line)) {
    return false;
  }
  
  // Must be in proper case (not all lowercase)
  if (line === line.toLowerCase()) {
    return false;
  }

  // Strong company indicators - look for business keywords
  const hasCompanyWords = /\b(company|corp|corporation|inc|incorporated|llc|ltd|limited|group|enterprises|industries|systems|solutions|services|supply|hardware|electric|construction|engineering|manufacturing|technologies)\b/i.test(line);
  
  // Check if it's in all caps with multiple words (common for company names in directories)
  const isAllCapsMultiWord = line === line.toUpperCase() && line.split(' ').length >= 2;
  
  // Check if it's proper title case with at least 2 words
  const isTitleCase = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line) && line.split(' ').length >= 2;
  
  // IMPORTANT: Exclude obvious person names (First Last format)
  const isPersonNamePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(line) && 
    !hasCompanyWords && 
    line.split(' ').length === 2;
  
  if (isPersonNamePattern) {
    return false;
  }
  
  // Must have strong indicators to be considered a company name
  return (hasCompanyWords || isAllCapsMultiWord) && (isTitleCase || isAllCapsMultiWord);
};

export const isLikelyCompanyName = (line: string): boolean => {
  // Make this much more restrictive - only used as fallback
  return isMainCompanyName(line);
};

export const isPersonName = (line: string): boolean => {
  const words = line.trim().split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  
  // All words should be capitalized
  const allCapitalized = words.every(word => 
    /^[A-Z][a-z]+$/.test(word) || 
    /^[A-Z]\.?$/.test(word) || // Middle initial
    /^(Jr|Sr|II|III|IV)\.?$/i.test(word) // Suffixes
  );
  
  // Avoid company words
  const hasCompanyWords = /\b(technology|tech|inc|llc|corp|ltd|company|hardware|electric|construction|supply)\b/i.test(line);
  
  // Avoid all caps
  if (line === line.toUpperCase()) {
    return false;
  }
  
  return allCapitalized && !hasCompanyWords && !isPhoneNumber(line) && !isProductLine(line);
};

export const isAddressLine = (line: string): boolean => {
  const addressPatterns = [
    /^\d+\s+[A-Za-z]/,  // Starts with number + street name
    /\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln|boulevard|blvd)\b/i,
    /^P\.?O\.?\s+Box\s+\d+/i,  // PO Box
    /^[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/,  // City, STATE ZIP
  ];
  
  return addressPatterns.some(pattern => pattern.test(line)) && !isProductLine(line);
};
