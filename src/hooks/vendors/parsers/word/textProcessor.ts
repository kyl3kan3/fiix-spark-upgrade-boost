
export interface ProcessedText {
  lines: string[];
  rawText: string;
}

export const processWordText = (text: string): ProcessedText => {
  // Clean and split text into lines, preserving more structure
  const lines = text.split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.length > 1)
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
    /contact\s+information/i
  ];
  
  return headerPatterns.some(pattern => pattern.test(line));
};

export const isSeparatorLine = (line: string): boolean => {
  return line.match(/^[-=_]{3,}/) !== null;
};

// Helper function to identify service/product lines
export const isServiceLine = (line: string): boolean => {
  const serviceKeywords = /\b(ball\s+valves|gate\s+valves|gasket\s+rings|welded\s+tubing|elbow|pipe|tees|head\s+plug|electric\s+actuator|services|products|solutions|equipment|supplies)\b/i;
  return serviceKeywords.test(line);
};
