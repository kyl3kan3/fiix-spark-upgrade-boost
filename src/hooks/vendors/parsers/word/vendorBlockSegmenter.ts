
export interface TextBlock {
  content: string;
  startLine: number;
  endLine: number;
  confidence: number;
}

export class VendorBlockSegmenter {
  segmentIntoVendorBlocks(lines: string[]): TextBlock[] {
    const blocks: TextBlock[] = [];
    let currentBlock: string[] = [];
    let currentStartLine = 0;
    let lastNonEmptyLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip completely empty lines but track them for boundary detection
      if (!line) {
        continue;
      }

      // Check if this line starts a new vendor block
      if (this.isVendorBoundary(line, lines, i, lastNonEmptyLine)) {
        // Finalize previous block if it has content
        if (currentBlock.length > 0) {
          blocks.push({
            content: currentBlock.join('\n'),
            startLine: currentStartLine,
            endLine: lastNonEmptyLine,
            confidence: this.calculateBlockConfidence(currentBlock)
          });
        }
        
        // Start new block
        currentBlock = [line];
        currentStartLine = i;
      } else {
        // Add to current block
        currentBlock.push(line);
      }
      
      lastNonEmptyLine = i;
    }

    // Don't forget the last block
    if (currentBlock.length > 0) {
      blocks.push({
        content: currentBlock.join('\n'),
        startLine: currentStartLine,
        endLine: lastNonEmptyLine,
        confidence: this.calculateBlockConfidence(currentBlock)
      });
    }

    return this.filterAndMergeBlocks(blocks);
  }

  private isVendorBoundary(
    currentLine: string, 
    allLines: string[], 
    currentIndex: number, 
    lastNonEmptyIndex: number
  ): boolean {
    // Large gap suggests new vendor (more than 3 empty lines)
    const emptyLineGap = currentIndex - lastNonEmptyIndex - 1;
    if (emptyLineGap >= 3) {
      return true;
    }

    // Strong company name indicators
    if (this.isStrongCompanyName(currentLine)) {
      // Only treat as boundary if we're not at the very beginning
      if (lastNonEmptyIndex >= 0) {
        return true;
      }
    }

    // Pattern change detection (e.g., from address back to company name)
    if (lastNonEmptyIndex >= 0) {
      const previousLine = allLines[lastNonEmptyIndex]?.trim();
      if (previousLine && this.isPatternChange(previousLine, currentLine)) {
        return true;
      }
    }

    return false;
  }

  private isStrongCompanyName(line: string): boolean {
    // Very conservative company name detection for boundaries
    const hasStrongBusinessWords = /\b(ace\s+hardware|hardware|supply|company|corp|corporation|inc|incorporated|llc|ltd|services|solutions|manufacturing|electric|construction)\b/i.test(line);
    const isAllCapsMultiWord = line === line.toUpperCase() && line.split(' ').length >= 2;
    const isTitleCaseMultiWord = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line) && line.split(' ').length >= 2;
    
    return hasStrongBusinessWords && (isAllCapsMultiWord || isTitleCaseMultiWord) && line.length >= 10;
  }

  private isPatternChange(previousLine: string, currentLine: string): boolean {
    const prevIsAddress = this.looksLikeAddress(previousLine);
    const currIsCompany = this.isStrongCompanyName(currentLine);
    
    // If previous was address-like and current is company-like, likely a boundary
    return prevIsAddress && currIsCompany;
  }

  private looksLikeAddress(line: string): boolean {
    return /\b[A-Z]{2}\s+\d{5}(-\d{4})?$/.test(line) || 
           /^\d+\s+[A-Za-z]/.test(line) ||
           /\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln)\b/i.test(line);
  }

  private calculateBlockConfidence(blockLines: string[]): number {
    let score = 0;
    let factors = 0;

    // Check for company name
    if (blockLines.some(line => this.isStrongCompanyName(line))) {
      score += 0.4;
    }
    factors++;

    // Check for contact info
    const hasPhone = blockLines.some(line => /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(line));
    const hasEmail = blockLines.some(line => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(line));
    if (hasPhone || hasEmail) {
      score += 0.3;
    }
    factors++;

    // Check for address
    if (blockLines.some(line => this.looksLikeAddress(line))) {
      score += 0.2;
    }
    factors++;

    // Check block size (not too small, not too large)
    const totalLength = blockLines.join(' ').length;
    if (totalLength >= 30 && totalLength <= 500) {
      score += 0.1;
    }
    factors++;

    return score / factors;
  }

  private filterAndMergeBlocks(blocks: TextBlock[]): TextBlock[] {
    // Filter out blocks with very low confidence
    let filteredBlocks = blocks.filter(block => 
      block.confidence >= 0.2 && 
      block.content.length >= 20
    );

    // Merge very small adjacent blocks that might belong together
    const mergedBlocks: TextBlock[] = [];
    
    for (let i = 0; i < filteredBlocks.length; i++) {
      const currentBlock = filteredBlocks[i];
      const nextBlock = filteredBlocks[i + 1];
      
      // If current block is very short and next block is close, consider merging
      if (nextBlock && 
          currentBlock.content.length < 50 && 
          nextBlock.startLine - currentBlock.endLine <= 2 &&
          !this.isStrongCompanyName(nextBlock.content.split('\n')[0])) {
        
        // Merge blocks
        const mergedContent = currentBlock.content + '\n' + nextBlock.content;
        mergedBlocks.push({
          content: mergedContent,
          startLine: currentBlock.startLine,
          endLine: nextBlock.endLine,
          confidence: Math.max(currentBlock.confidence, nextBlock.confidence)
        });
        
        i++; // Skip the next block since we merged it
      } else {
        mergedBlocks.push(currentBlock);
      }
    }

    return mergedBlocks;
  }
}
