
export interface DocumentBlock {
  content: string;
  startLine: number;
  endLine: number;
  type: 'vendor' | 'header' | 'footer' | 'product_list';
  confidence: number;
}

export class ImprovedDocumentSegmenter {
  segmentDocument(lines: string[]): DocumentBlock[] {
    console.log('[Improved Segmenter] Starting segmentation of', lines.length, 'lines');
    
    const blocks: DocumentBlock[] = [];
    let currentBlock: string[] = [];
    let currentStartLine = 0;
    let consecutiveEmptyLines = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        consecutiveEmptyLines++;
        continue;
      }
      
      // Check if this line starts a new vendor block
      const isNewVendorStart = this.isVendorStartLine(line, i, lines);
      
      // If we have accumulated content and this looks like a new vendor, save the current block
      if (currentBlock.length > 0 && (isNewVendorStart || consecutiveEmptyLines >= 2)) {
        const blockContent = currentBlock.join('\n').trim();
        if (blockContent.length > 10) { // Only include substantial blocks
          blocks.push({
            content: blockContent,
            startLine: currentStartLine,
            endLine: i - 1,
            type: 'vendor',
            confidence: this.calculateBlockConfidence(blockContent)
          });
        }
        currentBlock = [];
        currentStartLine = i;
      }
      
      // Reset consecutive empty lines counter
      consecutiveEmptyLines = 0;
      
      // Skip obvious headers/footers
      if (this.isHeaderOrFooter(line)) {
        continue;
      }
      
      // Add line to current block
      currentBlock.push(line);
      
      // If we haven't started a block yet, mark the start
      if (currentBlock.length === 1) {
        currentStartLine = i;
      }
    }
    
    // Don't forget the last block
    if (currentBlock.length > 0) {
      const blockContent = currentBlock.join('\n').trim();
      if (blockContent.length > 10) {
        blocks.push({
          content: blockContent,
          startLine: currentStartLine,
          endLine: lines.length - 1,
          type: 'vendor',
          confidence: this.calculateBlockConfidence(blockContent)
        });
      }
    }
    
    console.log('[Improved Segmenter] Processed', lines.length, 'lines into', blocks.length, 'vendor blocks');
    return blocks;
  }
  
  private isVendorStartLine(line: string, index: number, lines: string[]): boolean {
    // Company name patterns - be more aggressive in detecting these
    const companyPatterns = [
      // Company suffixes
      /\b(inc\.?|llc\.?|corp\.?|ltd\.?|company|co\.?)\s*$/i,
      // Business name patterns
      /^[A-Z][A-Z\s&\-\.]+(?:INC\.?|LLC\.?|CORP\.?|LTD\.?|COMPANY|CO\.?)?\s*$/,
      // All caps business names (common in vendor lists)
      /^[A-Z][A-Z\s&\-\.\,]+[A-Z]$/,
      // Names with common business words
      /\b(services|systems|supply|electric|fire|protection|refrigeration|hardware|quarry|sanitation|oil|burglary|insulation|masters)\b/i,
      // Names that start with uppercase and contain business indicators
      /^[A-Z].*(services|systems|supply|solutions|group|enterprises|industries)/i
    ];
    
    // Check if line matches company patterns
    const matchesCompanyPattern = companyPatterns.some(pattern => pattern.test(line));
    
    // Additional context checks
    const nextLine = index < lines.length - 1 ? lines[index + 1].trim() : '';
    const prevLine = index > 0 ? lines[index - 1].trim() : '';
    
    // If next line looks like an address, this is likely a company name
    const nextLooksLikeAddress = this.looksLikeAddress(nextLine);
    
    // If previous line was empty or very short, this could be a new vendor
    const goodSeparation = !prevLine || prevLine.length < 10;
    
    return matchesCompanyPattern || (nextLooksLikeAddress && goodSeparation);
  }
  
  private looksLikeAddress(line: string): boolean {
    const addressPatterns = [
      /^\d+\s+[A-Za-z]/,  // Starts with number and street name
      /\b(street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|blvd|boulevard|way|place|pl\.?)\b/i,
      /\b(p\.?o\.?\s*box|po\s*box)\s*\d+/i,  // PO Box
      /^\d+\s+[A-Z]/  // Number followed by uppercase (street address)
    ];
    
    return addressPatterns.some(pattern => pattern.test(line));
  }
  
  private isHeaderOrFooter(line: string): boolean {
    const headerFooterPatterns = [
      /^page\s+\d+/i,
      /^\d+\s*$/,  // Just page numbers
      /vendor\s+list/i,
      /company\s+directory/i,
      /contact\s+information/i,
      /^[-=_]{3,}$/  // Separator lines
    ];
    
    return headerFooterPatterns.some(pattern => pattern.test(line)) || line.length < 3;
  }
  
  private calculateBlockConfidence(content: string): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for company indicators
    if (/\b(inc\.?|llc\.?|corp\.?|ltd\.?|company|co\.?)\b/i.test(content)) {
      confidence += 0.2;
    }
    
    // Boost for contact information
    if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(content)) {
      confidence += 0.15; // Phone number
    }
    
    if (/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(content)) {
      confidence += 0.15; // Email
    }
    
    // Boost for address-like content
    if (/\b(street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?)\b/i.test(content)) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }
}
