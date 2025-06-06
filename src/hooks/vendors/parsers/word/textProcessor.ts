
export interface ProcessedText {
  lines: string[];
  rawText: string;
}

export const processWordText = (text: string): ProcessedText => {
  // Clean and split text into lines, preserving more structure
  const lines = text.split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)  // Keep empty lines for page break detection
    // Remove excessive whitespace but preserve structure
    .map(line => line.replace(/\s+/g, ' '));
  
  return {
    lines,
    rawText: text
  };
};

export const isHeaderLine = (line: string): boolean => {
  // More comprehensive header detection
  const headerPatterns = [
    /vendor\s+list/i,
    /company\s+directory/i,
    /supplier\s+list/i,
    /contractor\s+directory/i,
    /contact\s+information/i,
    // Page headers/footers
    /^page\s+\d+/i,
    /^\d+\s*$/,  // Just page numbers
    /^(header|footer)/i
  ];
  
  return headerPatterns.some(pattern => pattern.test(line));
};

export const isSeparatorLine = (line: string): boolean => {
  return line.match(/^[-=_]{3,}/) !== null;
};

// Enhanced service/product line detection
export const isServiceLine = (line: string): boolean => {
  const serviceKeywords = /\b(ball\s+valves|gate\s+valves|gasket\s+rings|welded\s+tubing|elbow|pipe|tees|head\s+plug|electric\s+actuator|services|products|solutions|equipment|supplies|fittings|hardware|tools|materials|components|parts)\b/i;
  
  // Also check for bullet points or numbered lists which often contain products
  const listPattern = /^\s*[-•]\s*|^\s*\d+[\.)]\s*/;
  
  return serviceKeywords.test(line) || listPattern.test(line);
};

// Detect product/item listings
export const isProductListing = (line: string): boolean => {
  // Patterns that indicate this line is part of a product catalog rather than vendor info
  const productPatterns = [
    /^\s*[-•]\s*[A-Za-z]/, // Bullet points
    /^\s*\d+[\.)]\s*[A-Za-z]/, // Numbered lists
    /\b(item|part|model|catalog|sku)\s*[#:]?\s*[A-Z0-9]/i, // Item numbers
    /\b\d+["']?\s*(inch|in|mm|cm|meter|ft|foot|feet)\b/i, // Measurements
    /\b(size|diameter|length|width|height)\s*[:=]\s*\d+/i, // Specifications
    /\b(available|stocked|inventory)\b/i, // Inventory related terms
  ];
  
  return productPatterns.some(pattern => pattern.test(line));
};
