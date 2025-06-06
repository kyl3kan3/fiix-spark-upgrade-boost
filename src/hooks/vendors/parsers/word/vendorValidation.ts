
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
  // Simple product detection
  const productPatterns = [
    /^\s*[-•]\s*[A-Za-z]/, // Bullet points
    /^\s*\d+[\.)]\s*[A-Za-z]/, // Numbered lists
    /\b(valves?|fittings?|pipes?|tubing|gaskets?|bolts?|screws?)\b/i,
  ];
  
  return productPatterns.some(pattern => pattern.test(line));
};

export const isMainCompanyName = (line: string): boolean => {
  if (line.length < 3 || line.length > 80) return false;
  
  // Exclude obvious non-company text
  if (isPhoneNumber(line) || isEmailAddress(line) || isWebsiteUrl(line)) {
    return false;
  }
  
  // Exclude product lines
  if (isProductLine(line)) {
    return false;
  }
  
  // Exclude lines that start with numbers (likely addresses)
  if (/^\d+\s+/.test(line)) {
    return false;
  }
  
  // Look for strong company indicators
  const companyIndicators = /\b(technology|tech|corporation|corp|company|inc|incorporated|llc|ltd|limited|group|enterprises|industries|systems|solutions|services|supply|hardware|electric|construction|engineering|manufacturing)\b/i;
  
  // Check if it's in all caps (common for company names in directories)
  const isAllCaps = line === line.toUpperCase() && line.includes(' ');
  
  // Check if it's title case
  const isTitleCase = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line);
  
  // Must have company indicators OR be in caps/title case
  return (companyIndicators.test(line) || isAllCaps || isTitleCase) && 
         !isPhoneNumber(line) && !isProductLine(line);
};

export const isLikelyCompanyName = (line: string): boolean => {
  if (line.length < 3 || line.length > 80) return false;
  
  // Exclude obvious non-company text
  if (isPhoneNumber(line) || isEmailAddress(line) || isWebsiteUrl(line) || isProductLine(line)) {
    return false;
  }
  
  // Exclude lines that start with numbers
  if (/^\d+\s+/.test(line)) {
    return false;
  }
  
  // Look for business patterns
  const businessPattern = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line) && line.split(' ').length >= 2;
  
  return businessPattern;
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
    /,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/,  // City, STATE ZIP
  ];
  
  return addressPatterns.some(pattern => pattern.test(line)) && !isProductLine(line);
};
