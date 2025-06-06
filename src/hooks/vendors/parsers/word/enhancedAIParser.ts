import { getOpenAI, isOpenAIAvailable } from '@/utils/parsers/openaiClient';

export interface VendorBlock {
  extractedData: {
    name: string;
    email: string;
    phone: string;
    contact_person: string;
    contact_title: string;
    vendor_type: string;
    status: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    website: string;
    description: string;
    rating: number | null;
  };
  confidence: number;
  rawText: string;
  processingNotes: string[];
}

export class EnhancedAIParser {
  async parseVendorBlock(blockContent: string): Promise<VendorBlock> {
    console.log('[Enhanced AI Parser] Checking OpenAI availability...');
    
    if (!isOpenAIAvailable()) {
      console.error('[Enhanced AI Parser] OpenAI client not available - falling back to basic extraction');
      return this.fallbackParsing(blockContent);
    }

    const openai = getOpenAI()!;
    console.log('[Enhanced AI Parser] Processing block with AI:', blockContent.substring(0, 100) + '...');

    const prompt = `You are an expert at extracting vendor/company information from business documents. Extract vendor information from the following text block, even if some information is missing or unclear.

IMPORTANT: Be aggressive in identifying company names - even if they appear unconventional, extract them if they seem to represent a business entity.

Text block:
"""
${blockContent}
"""

Extract the following information and return ONLY valid JSON:

{
  "name": "Company/vendor name (extract even if unclear or unconventional)",
  "email": "Email address if found",
  "phone": "Primary phone number if found",
  "contact_person": "Contact person name if found",
  "contact_title": "Contact person title if found", 
  "vendor_type": "service",
  "status": "active",
  "address": "Full street address if found",
  "city": "City name if found",
  "state": "State if found",
  "zip_code": "ZIP code if found",
  "website": "Website URL if found",
  "description": "Brief description of services/products if mentioned",
  "rating": null
}

Rules:
- Extract company name even if it's just a business-looking phrase
- Combine address components into the address field
- Extract all phone numbers and combine them in phone field
- If multiple pieces of contact info exist, extract the primary ones
- Return empty strings for missing fields, not null
- Be permissive - extract partial information rather than rejecting entries`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content || '';
      
      // Extract JSON more reliably
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('[Enhanced AI Parser] No JSON found in AI response, falling back');
        return this.fallbackParsing(blockContent);
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      
      // Calculate confidence based on extracted data completeness
      const confidence = this.calculateConfidence(extractedData, blockContent);
      
      const processingNotes: string[] = [];
      
      // Add processing notes for quality assessment
      if (!extractedData.name || extractedData.name.length < 3) {
        processingNotes.push('Company name unclear or missing');
      }
      
      if (!extractedData.phone && !extractedData.email && !extractedData.address) {
        processingNotes.push('No contact information found');
      }

      console.log('[Enhanced AI Parser] Successfully parsed with AI, confidence:', confidence);

      return {
        extractedData,
        confidence,
        rawText: blockContent,
        processingNotes
      };
      
    } catch (error) {
      console.error('[Enhanced AI Parser] Error parsing block with AI:', error);
      console.log('[Enhanced AI Parser] Falling back to basic extraction');
      return this.fallbackParsing(blockContent);
    }
  }
  
  private fallbackParsing(blockContent: string): VendorBlock {
    console.log('[Enhanced AI Parser] Using fallback parsing for block');
    
    const lines = blockContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Basic extraction logic
    const extractedData = {
      name: this.extractBasicName(blockContent) || 'Unknown Company',
      email: this.extractEmail(blockContent) || '',
      phone: this.extractPhone(blockContent) || '',
      contact_person: '',
      contact_title: '',
      vendor_type: 'service' as const,
      status: 'active' as const,
      address: this.extractAddress(blockContent) || '',
      city: '',
      state: '',
      zip_code: '',
      website: this.extractWebsite(blockContent) || '',
      description: blockContent.substring(0, 200),
      rating: null
    };

    return {
      extractedData,
      confidence: 0.4, // Lower confidence for fallback
      rawText: blockContent,
      processingNotes: ['Parsed using fallback method - AI processing not available']
    };
  }

  private extractEmail(text: string): string | null {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  }

  private extractPhone(text: string): string | null {
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
  }

  private extractWebsite(text: string): string | null {
    const websiteRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;
    const match = text.match(websiteRegex);
    return match ? match[0] : null;
  }

  private extractAddress(text: string): string | null {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Look for lines that might contain addresses (contain numbers and street indicators)
    for (const line of lines) {
      if (/\d+.*\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/i.test(line)) {
        return line;
      }
    }
    
    return null;
  }
  
  private calculateConfidence(data: any, rawText: string): number {
    let confidence = 0.3; // Base confidence
    
    // Boost for having a name
    if (data.name && data.name.length >= 3) {
      confidence += 0.3;
    }
    
    // Boost for contact information
    if (data.phone) confidence += 0.15;
    if (data.email) confidence += 0.15;
    if (data.address) confidence += 0.1;
    
    // Boost for business indicators in raw text
    if (/\b(inc\.?|llc\.?|corp\.?|ltd\.?|company|co\.?|services|systems|supply)\b/i.test(rawText)) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }
  
  private extractBasicName(text: string): string | null {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 0) return null;
    
    // Look for lines that might be company names
    for (const line of lines.slice(0, 3)) { // Check first few lines
      if (line.length > 3 && line.length < 100) {
        // If it contains business indicators, likely a company name
        if (/\b(inc\.?|llc\.?|corp\.?|ltd\.?|company|co\.?|services|systems|supply)\b/i.test(line)) {
          return line;
        }
        
        // If it's mostly uppercase, might be a company name
        if (line === line.toUpperCase() && line.split(' ').length <= 6) {
          return line;
        }
      }
    }
    
    // Fallback to first substantial line
    return lines[0] && lines[0].length > 3 ? lines[0] : null;
  }
}
