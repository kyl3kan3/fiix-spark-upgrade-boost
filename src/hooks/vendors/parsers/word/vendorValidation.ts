
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
  // Enhanced product detection for items/services that vendors supply
  const productPatterns = [
    // Common industrial products
    /\b(valves?|fittings?|pipes?|tubing|gaskets?|seals?|bolts?|nuts?|screws?)\b/i,
    // Services
    /\b(installation|maintenance|repair|service|testing|inspection)\b/i,
    // Product categories with quantities or specifications
    /^\s*[-•]\s*[A-Za-z]/,  // Bullet points
    /^\s*\d+[\.)]\s*[A-Za-z]/, // Numbered lists
    // Product codes or part numbers
    /\b[A-Z]{2,}\d+|[A-Z]+[-/]\d+|\d+[-/][A-Z]+/,
    // Measurements and specifications
    /\b\d+["']?\s*(inch|in|mm|cm|meter|ft|foot|feet)\b/i,
    // Materials
    /\b(steel|aluminum|copper|brass|plastic|rubber|stainless)\b/i
  ];
  
  return productPatterns.some(pattern => pattern.test(line));
};

export const isMainCompanyName = (line: string): boolean => {
  if (line.length < 3 || line.length > 100) return false;
  
  // Exclude obvious non-company text
  if (isPhoneNumber(line) || isEmailAddress(line) || isWebsiteUrl(line)) {
    return false;
  }
  
  // Exclude product lines
  if (isProductLine(line)) {
    return false;
  }
  
  // Exclude lines that start with numbers (likely addresses or product codes)
  if (/^\d+\s+/.test(line)) {
    return false;
  }
  
  // Exclude lines with common contact keywords
  if (/\b(cell|mobile|office|phone|tel|email|contact|fax)\s*[#:]?\s*\d/.test(line.toLowerCase())) {
    return false;
  }
  
  // Exclude obvious product/service listings
  if (/^\s*[-•]\s*/.test(line) || /^\s*\d+[\.)]\s*/.test(line)) {
    return false;
  }
  
  // Strong indicators for main company names
  const strongCompanyIndicators = /\b(technology|technologies|tech|corporation|corp|company|companies|inc|incorporated|llc|ltd|limited|group|enterprises|industries|systems|solutions|services|supply|supplies|hardware|electric|construction|engineering|manufacturing|industrial)\b/i;
  
  // Check if it's in all caps (like "ACID PIPING TECHNOLOGY")
  const isAllCaps = line === line.toUpperCase() && line.includes(' ');
  
  // Check if it's a prominent business name pattern
  const isProminentName = /^[A-Z][A-Z\s&.,'-]+$/.test(line) && line.length >= 5;
  
  // Special handling for technology companies and APT format
  if (line.toUpperCase().includes('TECHNOLOGY') || line.toUpperCase().includes('PIPING')) {
    return true;
  }
  
  // Handle parenthetical company names like "Acid Piping Technology (APT)"
  if (/^[A-Z][A-Za-z\s&.,'-]*\([A-Z]+\)$/.test(line)) {
    return true;
  }
  
  // Must have strong indicators AND proper formatting to be considered main company name
  return (strongCompanyIndicators.test(line) && (isAllCaps || isProminentName)) || 
         (isAllCaps && line.split(' ').length <= 6 && !isPhoneNumber(line) && !isProductLine(line));
};

export const isLikelyCompanyName = (line: string): boolean => {
  if (line.length < 3 || line.length > 100) return false;
  
  // Exclude obvious non-company text
  if (isPhoneNumber(line) || isEmailAddress(line) || isWebsiteUrl(line) || isProductLine(line)) {
    return false;
  }
  
  // Exclude lines that start with numbers
  if (/^\d+\s+/.test(line)) {
    return false;
  }
  
  // Exclude contact info lines
  if (/\b(cell|mobile|office|phone|tel|email|contact|fax)\s*[#:]?\s*\d/.test(line.toLowerCase())) {
    return false;
  }
  
  // Exclude product listings
  if (/^\s*[-•]\s*/.test(line) || /^\s*\d+[\.)]\s*/.test(line)) {
    return false;
  }
  
  // Company indicators - be more restrictive
  const companyIndicators = /\b(corporation|corp|company|companies|inc|incorporated|llc|ltd|limited|group|enterprises|industries|systems|solutions|services|supply|supplies|hardware|electric|construction|engineering|manufacturing|industrial)\b/i;
  
  // Check if it's mostly uppercase
  const isUpperCase = line === line.toUpperCase() && line.includes(' ');
  
  // Check if it starts with capital letters
  const startsWithCaps = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line);
  
  // Special patterns for business names - be more restrictive
  const businessNamePattern = /^[A-Z][A-Z\s&.,'-]*[A-Z]$/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 5;
  
  // Handle acronyms in parentheses
  const hasAcronym = /\([A-Z]{2,}\)/.test(line);
  
  // Be more conservative - require strong indicators
  return (companyIndicators.test(line) && (isUpperCase || startsWithCaps)) ||
         (businessNamePattern && companyIndicators.test(line)) ||
         hasAcronym;
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
  const hasCompanyWords = /\b(technology|technologies|tech|piping|acid|apt|ace\s+hardware|inc|llc|corp|ltd|company|hardware|electric|construction|supply|systems|of\s+[a-z]+)\b/i.test(line);
  
  // Avoid phone numbers and emails
  if (isPhoneNumber(line) || isEmailAddress(line) || isProductLine(line)) {
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
    /^\d{4}\s+[A-Za-z].*Road/i,  // Pattern like "2890 Arnold Tenbrook Road"
  ];
  
  // Don't treat product lines as addresses
  if (isProductLine(line)) {
    return false;
  }
  
  return addressPatterns.some(pattern => pattern.test(line));
};
