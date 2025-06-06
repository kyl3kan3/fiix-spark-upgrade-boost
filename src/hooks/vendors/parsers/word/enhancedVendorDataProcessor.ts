
import { VendorFormData } from '@/services/vendorService';
import { AIVendorParser, VendorBlock } from './aiVendorParser';
import { VendorBlockSegmenter, TextBlock } from './vendorBlockSegmenter';
import { RegexFallbackExtractor } from './regexFallbackExtractor';

export interface ProcessedVendorData {
  vendors: VendorFormData[];
  blocks: TextBlock[];
  confidence: number;
  warnings: string[];
}

export class EnhancedVendorDataProcessor {
  private aiParser = new AIVendorParser();
  private segmenter = new VendorBlockSegmenter();
  private fallbackExtractor = new RegexFallbackExtractor();

  async processDocument(lines: string[]): Promise<ProcessedVendorData> {
    console.log('[Enhanced Processor] Starting document processing with', lines.length, 'lines');
    
    // Step 1: Segment into vendor blocks
    const blocks = this.segmenter.segmentIntoVendorBlocks(lines);
    console.log('[Enhanced Processor] Segmented into', blocks.length, 'blocks');

    // Step 2: Process each block with AI parser
    const vendorBlocks: VendorBlock[] = [];
    const warnings: string[] = [];

    for (const block of blocks) {
      try {
        const vendorBlock = await this.aiParser.parseVendorBlock(block.content);
        vendorBlocks.push(vendorBlock);
        
        if (vendorBlock.confidence < 0.5) {
          warnings.push(`Low confidence (${(vendorBlock.confidence * 100).toFixed(0)}%) for block starting with: ${block.content.substring(0, 50)}...`);
        }
      } catch (error) {
        console.error('[Enhanced Processor] Error processing block:', error);
        warnings.push(`Failed to process block: ${block.content.substring(0, 50)}...`);
      }
    }

    // Step 3: Apply regex fallbacks to enhance data
    const enhancedVendors: VendorFormData[] = [];
    
    for (const vendorBlock of vendorBlocks) {
      let vendor = { ...vendorBlock.extractedData } as VendorFormData;
      
      // Apply fallback extraction
      vendor = this.fallbackExtractor.enhanceVendorData(vendor, vendorBlock.rawText) as VendorFormData;
      
      // Fill in default values for required fields
      vendor = this.ensureRequiredFields(vendor);
      
      // Only include vendors with at least a name
      if (vendor.name && vendor.name.trim().length > 0) {
        enhancedVendors.push(vendor);
      }
    }

    // Calculate overall confidence
    const overallConfidence = vendorBlocks.length > 0 
      ? vendorBlocks.reduce((sum, block) => sum + block.confidence, 0) / vendorBlocks.length
      : 0;

    console.log('[Enhanced Processor] Processed', enhancedVendors.length, 'vendors with', (overallConfidence * 100).toFixed(0), '% confidence');

    return {
      vendors: enhancedVendors,
      blocks,
      confidence: overallConfidence,
      warnings
    };
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
