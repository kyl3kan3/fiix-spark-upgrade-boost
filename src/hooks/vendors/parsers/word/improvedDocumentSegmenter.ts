
export interface DocumentBlock {
  content: string;
  startLine: number;
  endLine: number;
  confidence: number;
  blockType: 'vendor' | 'header' | 'footer' | 'separator' | 'unknown';
}

export class ImprovedDocumentSegmenter {
  segmentDocument(lines: string[]): DocumentBlock[] {
    const cleanLines = this.preprocessLines(lines);
    const rawBlocks = this.performInitialSegmentation(cleanLines);
    const typedBlocks = this.classifyBlocks(rawBlocks);
    const mergedBlocks = this.mergeRelatedBlocks(typedBlocks);
    const finalBlocks = this.filterAndValidateBlocks(mergedBlocks);
    
    console.log('[Improved Segmenter] Processed', lines.length, 'lines into', finalBlocks.length, 'vendor blocks');
    
    return finalBlocks;
  }

  private preprocessLines(lines: string[]): Array<{content: string, index: number}> {
    return lines
      .map((line, index) => ({ content: line.trim(), index }))
      .filter(item => item.content.length > 0)
      .filter(item => !this.isPageHeader(item.content))
      .filter(item => !this.isPageFooter(item.content));
  }

  private performInitialSegmentation(lines: Array<{content: string, index: number}>): DocumentBlock[] {
    const blocks: DocumentBlock[] = [];
    let currentBlock: string[] = [];
    let currentStartIndex = 0;
    let lastIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const gapSize = line.index - lastIndex - 1;

      // Start new block on large gaps or strong vendor indicators
      if (this.shouldStartNewBlock(line.content, gapSize, currentBlock.length > 0)) {
        if (currentBlock.length > 0) {
          blocks.push({
            content: currentBlock.join('\n'),
            startLine: currentStartIndex,
            endLine: lastIndex,
            confidence: 0.5,
            blockType: 'unknown'
          });
        }
        
        currentBlock = [line.content];
        currentStartIndex = line.index;
      } else {
        currentBlock.push(line.content);
      }

      lastIndex = line.index;
    }

    // Don't forget the last block
    if (currentBlock.length > 0) {
      blocks.push({
        content: currentBlock.join('\n'),
        startLine: currentStartIndex,
        endLine: lastIndex,
        confidence: 0.5,
        blockType: 'unknown'
      });
    }

    return blocks;
  }

  private shouldStartNewBlock(currentLine: string, gapSize: number, hasExistingBlock: boolean): boolean {
    // Large gap indicates new section
    if (gapSize >= 3) {
      return true;
    }

    // Strong company name at start of line
    if (hasExistingBlock && this.isVeryStrongCompanyName(currentLine)) {
      return true;
    }

    // Pattern change detection
    if (hasExistingBlock && this.indicatesNewVendor(currentLine)) {
      return true;
    }

    return false;
  }

  private classifyBlocks(blocks: DocumentBlock[]): DocumentBlock[] {
    return blocks.map(block => ({
      ...block,
      blockType: this.determineBlockType(block.content),
      confidence: this.calculateBlockConfidence(block.content)
    }));
  }

  private determineBlockType(content: string): 'vendor' | 'header' | 'footer' | 'separator' | 'unknown' {
    const lines = content.split('\n').map(line => line.trim());
    
    // Check for vendor indicators
    const hasCompanyName = lines.some(line => this.isVeryStrongCompanyName(line));
    const hasContactInfo = lines.some(line => this.hasContactInfo(line));
    const hasAddress = lines.some(line => this.hasAddressInfo(line));
    
    if (hasCompanyName && (hasContactInfo || hasAddress)) {
      return 'vendor';
    }

    // Check for headers/footers
    if (content.length < 50 && this.isHeaderFooterContent(content)) {
      return this.isPageHeader(content) ? 'header' : 'footer';
    }

    // Check for separators
    if (this.isSeparatorContent(content)) {
      return 'separator';
    }

    return 'unknown';
  }

  private mergeRelatedBlocks(blocks: DocumentBlock[]): DocumentBlock[] {
    const merged: DocumentBlock[] = [];
    
    for (let i = 0; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const nextBlock = blocks[i + 1];
      
      // Merge small adjacent vendor-related blocks
      if (nextBlock && 
          this.shouldMergeBlocks(currentBlock, nextBlock)) {
        
        const mergedContent = currentBlock.content + '\n' + nextBlock.content;
        merged.push({
          content: mergedContent,
          startLine: currentBlock.startLine,
          endLine: nextBlock.endLine,
          confidence: Math.max(currentBlock.confidence, nextBlock.confidence),
          blockType: 'vendor'
        });
        
        i++; // Skip the next block since we merged it
      } else {
        merged.push(currentBlock);
      }
    }
    
    return merged;
  }

  private shouldMergeBlocks(block1: DocumentBlock, block2: DocumentBlock): boolean {
    // Don't merge if either is too large
    if (block1.content.length > 300 || block2.content.length > 300) {
      return false;
    }

    // Merge if first block has company name but lacks contact info,
    // and second block has contact info
    const block1HasCompany = this.hasStrongCompanyName(block1.content);
    const block1HasContact = this.hasContactInfo(block1.content);
    const block2HasContact = this.hasContactInfo(block2.content);
    
    if (block1HasCompany && !block1HasContact && block2HasContact) {
      return true;
    }

    // Merge if blocks are small and related
    if (block1.content.length < 100 && block2.content.length < 100) {
      const combinedHasVendorSignals = this.hasStrongCompanyName(block1.content + '\n' + block2.content) ||
                                       this.hasContactInfo(block1.content + '\n' + block2.content);
      return combinedHasVendorSignals;
    }

    return false;
  }

  private filterAndValidateBlocks(blocks: DocumentBlock[]): DocumentBlock[] {
    return blocks
      .filter(block => block.blockType === 'vendor')
      .filter(block => block.confidence >= 0.3)
      .filter(block => block.content.length >= 20)
      .filter(block => this.hasMinimumVendorContent(block.content));
  }

  private hasMinimumVendorContent(content: string): boolean {
    const hasCompanyName = this.hasStrongCompanyName(content);
    const hasContactInfo = this.hasContactInfo(content);
    const hasAddress = this.hasAddressInfo(content);
    
    // Must have at least company name plus one other piece of info
    return hasCompanyName && (hasContactInfo || hasAddress);
  }

  private isVeryStrongCompanyName(line: string): boolean {
    if (line.length < 5 || line.length > 100) return false;
    
    const businessWords = /\b(ace\s+hardware|hardware|supply|company|corp|corporation|inc|incorporated|llc|ltd|limited|services|solutions|manufacturing|electric|construction|enterprises|industries)\b/i;
    const isAllCaps = line === line.toUpperCase() && line.split(' ').length >= 2;
    const isTitleCase = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line);
    
    return businessWords.test(line) && (isAllCaps || isTitleCase);
  }

  private hasStrongCompanyName(content: string): boolean {
    return content.split('\n').some(line => this.isVeryStrongCompanyName(line.trim()));
  }

  private hasContactInfo(content: string): boolean {
    const phonePattern = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const websitePattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/;
    
    return phonePattern.test(content) || emailPattern.test(content) || websitePattern.test(content);
  }

  private hasAddressInfo(content: string): boolean {
    const addressPatterns = [
      /^\d+\s+[A-Za-z]/m,  // Street number + name
      /\b[A-Z]{2}\s+\d{5}(-\d{4})?$/m,  // State + ZIP
      /\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln|boulevard|blvd)\b/i,
    ];
    
    return addressPatterns.some(pattern => pattern.test(content));
  }

  private indicatesNewVendor(line: string): boolean {
    return this.isVeryStrongCompanyName(line) && !this.isPageHeader(line);
  }

  private isPageHeader(content: string): boolean {
    const headerPatterns = [
      /^page\s+\d+/i,
      /^vendor\s+(list|directory)/i,
      /^contact\s+information/i,
      /^business\s+directory/i,
    ];
    
    return headerPatterns.some(pattern => pattern.test(content.trim()));
  }

  private isPageFooter(content: string): boolean {
    const footerPatterns = [
      /^page\s+\d+\s+of\s+\d+/i,
      /^\d+$/,  // Just a number
      /^continued/i,
    ];
    
    return footerPatterns.some(pattern => pattern.test(content.trim()));
  }

  private isHeaderFooterContent(content: string): boolean {
    return this.isPageHeader(content) || this.isPageFooter(content);
  }

  private isSeparatorContent(content: string): boolean {
    const separatorPatterns = [
      /^[-=_]{3,}$/,
      /^\*{3,}$/,
      /^\.{3,}$/,
    ];
    
    return separatorPatterns.some(pattern => pattern.test(content.trim()));
  }

  private calculateBlockConfidence(content: string): number {
    let score = 0;
    let maxScore = 0;

    // Company name presence
    maxScore += 0.4;
    if (this.hasStrongCompanyName(content)) score += 0.4;

    // Contact information
    maxScore += 0.3;
    if (this.hasContactInfo(content)) score += 0.3;

    // Address information
    maxScore += 0.2;
    if (this.hasAddressInfo(content)) score += 0.2;

    // Content quality
    maxScore += 0.1;
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length >= 2 && lines.length <= 10) score += 0.1;

    return Math.min(score / maxScore, 1.0);
  }
}
