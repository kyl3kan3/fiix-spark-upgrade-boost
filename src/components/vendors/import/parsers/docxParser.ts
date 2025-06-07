import mammoth from 'mammoth';

export async function parseDOCX(file: File, expectedCount?: number): Promise<any[]> {
  const data = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: data });
  
  const text = result.value.trim();
  
  // If the text is short, treat it as a single vendor
  if (text.length < 200) {
    return [{ name: text.replace(/\n/g, ' ').trim() }];
  }
  
  // Split by double line breaks first (paragraph separation)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Split by single line breaks for list-style content
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Use expected count to guide parsing strategy
  if (expectedCount) {
    // If expecting 1 vendor and we have many lines/paragraphs, treat as single vendor
    if (expectedCount === 1 && (lines.length > 5 || paragraphs.length > 2)) {
      return [{ name: text.replace(/\n/g, ' ').trim() }];
    }
    
    // If expected count is closer to paragraph count, use paragraphs
    if (Math.abs(paragraphs.length - expectedCount) < Math.abs(lines.length - expectedCount)) {
      return paragraphs
        .map(paragraph => paragraph.replace(/\n/g, ' ').trim())
        .filter(paragraph => paragraph.length > 3)
        .map(paragraph => ({ name: paragraph }));
    }
    
    // If expected count is closer to line count, use lines
    if (Math.abs(lines.length - expectedCount) <= 2) {
      return lines.map(line => ({ name: line }));
    }
  }
  
  // Fallback to original logic when no expected count or no good match
  if (paragraphs.length > 1 && paragraphs.length <= 20) {
    return paragraphs
      .map(paragraph => paragraph.replace(/\n/g, ' ').trim())
      .filter(paragraph => paragraph.length > 3)
      .map(paragraph => ({ name: paragraph }));
  }
  
  // If we have many short lines, they might be a list of vendor names
  const shortLines = lines.filter(line => line.length < 100);
  if (shortLines.length === lines.length && lines.length > 2 && lines.length <= 50) {
    return lines.map(line => ({ name: line }));
  }
  
  // Otherwise, treat the entire document as one vendor entry
  return [{ name: text.replace(/\n/g, ' ').trim() }];
}
