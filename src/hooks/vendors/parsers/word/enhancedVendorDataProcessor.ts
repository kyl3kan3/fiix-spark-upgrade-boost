
import { VendorFormData } from '@/services/vendorService';
import { EnhancedAIParser, VendorBlock } from './enhancedAIParser';
import { ImprovedDocumentSegmenter, DocumentBlock } from './improvedDocumentSegmenter';
import { RegexFallbackExtractor } from './regexFallbackExtractor';

export interface ProcessedVendorData {
  vendors: VendorFormData[];
  blocks: DocumentBlock[];
  confidence: number;
  warnings: string[];
  processingStats: {
    totalLines: number;
    blocksFound: number;
    vendorsExtracted: number;
    lowConfidenceCount: number;
  };
}

export class EnhancedVendorDataProcessor {
  private aiParser = new EnhancedAIParser();
  private segmenter = new ImprovedDocumentSegmenter();
  private fallbackExtractor = new RegexFallbackExtractor();

  async processDocument(lines: string[]): Promise<ProcessedVendorData> {
    console.log('[Enhanced Processor] Starting advanced document processing with', lines.length, 'lines');
    
    // Step 1: Segment document into meaningful blocks
    const blocks = this.segmenter.segmentDocument(lines);
    console.log('[Enhanced Processor] Segmented into', blocks.length, 'document blocks');

    // Step 2: Process each vendor block with enhanced AI parser
    const vendorBlocks: VendorBlock[] = [];
    const warnings: string[] = [];
    let lowConfidenceCount = 0;

    for (const block of blocks) {
      try {
        console.log('[Enhanced Processor] Processing block:', block.content.substring(0, 50) + '...');
        
        const vendorBlock = await this.aiParser.parseVendorBlock(block.content);
        vendorBlocks.push(vendorBlock);
        
        if (vendorBlock.confidence < 0.6) {
          lowConfidenceCount++;
          warnings.push(`Low confidence parsing (${(vendorBlock.confidence * 100).toFixed(0)}%) for: ${block.content.substring(0, 50)}...`);
        }
        
        // Add processing notes as warnings
        if (vendorBlock.processingNotes.length > 0) {
          warnings.push(...vendorBlock.processingNotes.map(note => 
            `${note} in block: ${block.content.substring(0, 30)}...`
          ));
        }
        
      } catch (error) {
        console.error('[Enhanced Processor] Error processing block:', error);
        warnings.push(`Failed to process block: ${block.content.substring(0, 50)}...`);
      }
    }

    // Step 3: Apply fallback extraction and enhancement
    const enhancedVendors: VendorFormData[] = [];
    
    for (const vendorBlock of vendorBlocks) {
      let vendor = { ...vendorBlock.extractedData } as VendorFormData;
      
      // Apply fallback extraction to fill missing data
      vendor = this.fallbackExtractor.enhanceVendorData(vendor, vendorBlock.rawText) as VendorFormData;
      
      // Ensure all required fields have values
      vendor = this.ensureRequiredFields(vendor);
      
      // Quality check - only include vendors with meaningful data
      if (this.passesQualityCheck(vendor)) {
        enhancedVendors.push(vendor);
      } else {
        warnings.push(`Excluded low-quality vendor entry: ${vendor.name || 'Unknown'}`);
      }
    }

    // Step 4: Deduplicate vendors
    const deduplicatedVendors = this.deduplicateVendors(enhancedVendors);
    const duplicatesRemoved = enhancedVendors.length - deduplicatedVendors.length;
    
    if (duplicatesRemoved > 0) {
      warnings.push(`Removed ${duplicatesRemoved} duplicate vendor entries`);
    }

    // Calculate overall confidence and statistics
    const overallConfidence = vendorBlocks.length > 0 
      ? vendorBlocks.reduce((sum, block) => sum + block.confidence, 0) / vendorBlocks.length
      : 0;

    const processingStats = {
      totalLines: lines.length,
      blocksFound: blocks.length,
      vendorsExtracted: deduplicatedVendors.length,
      lowConfidenceCount
    };

    console.log('[Enhanced Processor] Processing complete:', processingStats);

    return {
      vendors: deduplicatedVendors,
      blocks,
      confidence: overallConfidence,
      warnings,
      processingStats
    };
  }

  private passesQualityCheck(vendor: Partial<VendorFormData>): boolean {
    // Must have a name
    if (!vendor.name || vendor.name.trim().length < 3) {
      return false;
    }

    // Must have at least one form of contact information
    const hasContact = (vendor.phone && vendor.phone.trim().length > 0) ||
                      (vendor.email && vendor.email.trim().length > 0) ||
                      (vendor.address && vendor.address.trim().length > 0);

    return hasContact;
  }

  private deduplicateVendors(vendors: VendorFormData[]): VendorFormData[] {
    const seen = new Set<string>();
    const deduplicated: VendorFormData[] = [];

    for (const vendor of vendors) {
      const key = this.createVendorKey(vendor);
      
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(vendor);
      }
    }

    return deduplicated;
  }

  private createVendorKey(vendor: VendorFormData): string {
    // Create a key based on name and primary contact info
    const namePart = vendor.name.toLowerCase().replace(/\s+/g, '');
    const phonePart = vendor.phone ? vendor.phone.replace(/[^\d]/g, '') : '';
    const emailPart = vendor.email ? vendor.email.toLowerCase() : '';
    
    return `${namePart}-${phonePart}-${emailPart}`;
  }

  private ensureRequiredFields(vendor: Partial<VendorFormData>): VendorFormData {
    return {
      name: vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      contact_person: vendor.contact_person || '',
      contact_title: vendor.contact_title || '',
      vendor_type: vendor.vendor_type || 'service',
      status: vendor.status || 'active',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zip_code: vendor.zip_code || '',
      website: vendor.website || '',
      description: vendor.description || '',
      rating: vendor.rating || null
    };
  }
}
