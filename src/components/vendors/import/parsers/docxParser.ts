
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
    // If expecting 1 vendor, treat as single vendor unless very clearly structured
    if (expectedCount === 1) {
      // Only split if we have very clear separation (many paragraphs)
      if (paragraphs.length > 5 && paragraphs.every(p => p.length < 300)) {
        return paragraphs
          .map(paragraph => paragraph.replace(/\n/g, ' ').trim())
          .filter(paragraph => paragraph.length > 3)
          .map(paragraph => ({ name: paragraph }));
      }
      return [{ name: text.replace(/\n/g, ' ').trim() }];
    }
    
    // For multiple expected vendors, try to split intelligently
    if (expectedCount > 1) {
      // Try paragraphs first if count is reasonable
      if (Math.abs(paragraphs.length - expectedCount) <= Math.max(1, expectedCount * 0.3)) {
        return paragraphs
          .map(paragraph => paragraph.replace(/\n/g, ' ').trim())
          .filter(paragraph => paragraph.length > 3)
          .map(paragraph => ({ name: paragraph }));
      }
      
      // Try lines if paragraph count doesn't match but lines do
      if (Math.abs(lines.length - expectedCount) <= Math.max(1, expectedCount * 0.3)) {
        return lines.map(line => ({ name: line }));
      }
      
      // If we have way more lines than expected, try to group them
      if (lines.length > expectedCount * 2) {
        const groupSize = Math.ceil(lines.length / expectedCount);
        const groups = [];
        for (let i = 0; i < lines.length; i += groupSize) {
          const group = lines.slice(i, i + groupSize).join(' ');
          if (group.trim()) {
            groups.push({ name: group.trim() });
          }
        }
        return groups;
      }
      
      // If we have fewer items than expected, try different splitting
      if (paragraphs.length < expectedCount && lines.length >= expectedCount) {
        return lines.slice(0, expectedCount).map(line => ({ name: line }));
      }
      
      // Try splitting paragraphs by common separators
      if (paragraphs.length < expectedCount) {
        const allSplits = [];
        for (const paragraph of paragraphs) {
          // Try splitting by common patterns
          const splits = paragraph.split(/[;,]\s+|(\d+\.)\s+|(-)\s+/).filter(s => s && s.trim().length > 3);
          if (splits.length > 1) {
            allSplits.push(...splits.map(s => s.trim()));
          } else {
            allSplits.push(paragraph.trim());
          }
        }
        
        if (Math.abs(allSplits.length - expectedCount) <= Math.max(1, expectedCount * 0.5)) {
          return allSplits.map(split => ({ name: split }));
        }
      }
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
