
export const isPhoneNumber = (line: string): boolean => {
  return /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(line);
};

export const isEmailAddress = (line: string): boolean => {
  return /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(line);
};

export const isWebsiteUrl = (line: string): boolean => {
  return /(https?:\/\/[^\s]+|www\.[^\s]+)/.test(line);
};

export const isMainCompanyName = (line: string): boolean => {
  if (line.length < 3 || line.length > 100) return false;
  
  // Exclude obvious non-company text
  if (isPhoneNumber(line) || isEmailAddress(line) || isWebsiteUrl(line)) {
    return false;
  }
  
  // Exclude lines that start with numbers (likely addresses)
  if (/^\d+\s+/.test(line)) {
    return false;
  }
  
  // Exclude lines with common contact keywords
  if (/\b(cell|mobile|office|phone|tel|email|contact)\s*[#:]?\s*\d/.test(line.toLowerCase())) {
    return false;
  }
  
  // Strong indicators for main company names
  const strongCompanyIndicators = /\b(ace\s+hardware|hardware|electric|construction|supply|supplies|services|solutions|group|inc|llc|corp|ltd|company|companies|of\s+[a-z]+)\b/i;
  
  // Check if it's in all caps (like "ACE HARDWARE OF FREEBURG")
  const isAllCaps = line === line.toUpperCase() && line.includes(' ');
  
  // Check if it's a prominent business name pattern
  const isProminentName = /^[A-Z][A-Z\s&.,'-]+$/.test(line) && line.length >= 5;
  
  // Special handling for ACE Hardware format
  if (line.toUpperCase().includes('ACE HARDWARE')) {
    return true;
  }
  
  return (strongCompanyIndicators.test(line) && (isAllCaps || isProminentName)) || 
         (isAllCaps && line.split(' ').length <= 6 && !isPhoneNumber(line));
};

export const isLikelyCompanyName = (line: string): boolean => {
  if (line.length < 3 || line.length > 100) return false;
  
  // Exclude obvious non-company text
  if (isPhoneNumber(line) || isEmailAddress(line) || isWebsiteUrl(line)) {
    return false;
  }
  
  // Exclude lines that start with numbers
  if (/^\d+\s+/.test(line)) {
    return false;
  }
  
  // Exclude contact info lines
  if (/\b(cell|mobile|office|phone|tel|email|contact)\s*[#:]?\s*\d/.test(line.toLowerCase())) {
    return false;
  }
  
  // Company indicators
  const companyIndicators = /\b(ace\s+hardware|inc|llc|corp|ltd|company|companies|services|solutions|group|hardware|electric|construction|supply|supplies|systems|technologies|enterprises|industries|partners|associates|of\s+[a-z]+)\b/i;
  
  // Check if it's mostly uppercase
  const isUpperCase = line === line.toUpperCase() && line.includes(' ');
  
  // Check if it starts with capital letters
  const startsWithCaps = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line);
  
  // Special patterns for business names
  const businessNamePattern = /^[A-Z][A-Z\s&.,'-]*[A-Z]$/.test(line) && line.split(' ').length >= 2;
  
  return companyIndicators.test(line) || 
         (isUpperCase && !isPersonName(line) && line.split(' ').length <= 8) || 
         (startsWithCaps && !isPersonName(line) && line.split(' ').length <= 6) ||
         businessNamePattern;
};

export const isPersonName = (line: string): boolean => {
  // Simple heuristic: 2-4 words, first letter capitalized, common name patterns
  const words = line.trim().split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  
  // All words should be capitalized (but allow for middle initials and suffixes)
  const allCapitalized = words.every(word => 
    /^[A-Z][a-z]+$/.test(word) || 
    /^[A-Z]\.?$/.test(word) || // Middle initial
    /^(Jr|Sr|II|III|IV)\.?$/i.test(word) // Suffixes
  );
  
  // Avoid obvious company words
  const hasCompanyWords = /\b(ace\s+hardware|inc|llc|corp|ltd|company|hardware|electric|construction|supply|systems|of\s+[a-z]+)\b/i.test(line);
  
  // Avoid phone numbers and emails
  if (isPhoneNumber(line) || isEmailAddress(line)) {
    return false;
  }
  
  // Avoid all caps (which are usually company names)
  if (line === line.toUpperCase()) {
    return false;
  }
  
  return allCapitalized && !hasCompanyWords && line.length <= 50;
};

export const isAddressLine = (line: string): boolean => {
  // Address patterns: starts with number, contains street indicators, city/state patterns
  const addressPatterns = [
    /^\d+\s+[A-Za-z]/,  // Starts with number + street name
    /\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln|boulevard|blvd|place|pl|court|ct|circle|cir)\b/i,
    /^P\.?O\.?\s+Box\s+\d+/i,  // PO Box
    /,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/,  // City, STATE ZIP
    /^[A-Z\s]+,\s*[A-Z]{2}\s+\d{5}(-\d{4})?$/,  // CITY, STATE ZIP
  ];
  
  return addressPatterns.some(pattern => pattern.test(line));
};
