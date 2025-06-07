import mammoth from 'mammoth';

export async function parseDOCX(file: File): Promise<any[]> {
  const data = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: data });
  
  const text = result.value.trim();
  
  // If the text is short, treat it as a single vendor
  if (text.length < 200) {
    return [{ name: text.replace(/\n/g, ' ').trim() }];
  }
  
  // Split by double line breaks first (paragraph separation)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length > 1) {
    // If we have multiple paragraphs, each might be a vendor
    return paragraphs
      .map(paragraph => paragraph.replace(/\n/g, ' ').trim())
      .filter(paragraph => paragraph.length > 3) // Filter out very short entries
      .map(paragraph => ({ name: paragraph }));
  }
  
  // If no clear paragraph separation, look for other patterns
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // If we have many short lines, they might be a list of vendor names
  const shortLines = lines.filter(line => line.length < 100);
  if (shortLines.length === lines.length && lines.length > 2) {
    return lines.map(line => ({ name: line }));
  }
  
  // Otherwise, treat the entire document as one vendor entry
  return [{ name: text.replace(/\n/g, ' ').trim() }];
}
