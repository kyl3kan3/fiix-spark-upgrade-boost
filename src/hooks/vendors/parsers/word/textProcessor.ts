
export interface ProcessedText {
  lines: string[];
  rawText: string;
}

export const processWordText = (text: string): ProcessedText => {
  // Clean and split text into lines
  const lines = text.split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.length > 1);
  
  return {
    lines,
    rawText: text
  };
};

export const isHeaderLine = (line: string): boolean => {
  return line.toLowerCase().includes('vendor') && line.toLowerCase().includes('list');
};

export const isSeparatorLine = (line: string): boolean => {
  return line.match(/^[-=_]{3,}/) !== null;
};
