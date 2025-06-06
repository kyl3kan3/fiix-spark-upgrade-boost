
import { VendorFormData } from '@/services/vendorService';

export interface VendorBlock {
  rawText: string;
  confidence: number;
  extractedData: Partial<VendorFormData>;
}

export class AIVendorParser {
  private static readonly AI_PARSE_PROMPT = `
You are a data extraction specialist. Extract vendor information from the following text block and return a JSON object with these exact fields:
{
  "name": "company name",
  "address": "full address",
  "phone": "phone number(s)",
  "email": "email address",
  "contact_person": "contact person name",
  "website": "website URL",
  "description": "services or products offered",
  "confidence": 0.9
}

Rules:
1. If a field is missing or unclear, set it to null
2. For phone numbers, include all found numbers separated by commas
3. Set confidence between 0.1-1.0 based on data clarity
4. Extract the main company name, not person names
5. Include full address if available

Text to parse:
`;

  async parseVendorBlock(textBlock: string): Promise<VendorBlock> {
    try {
      // For now, we'll use a rule-based approach that mimics AI parsing
      // In a real implementation, this would call an AI service
      const extracted = this.extractUsingRules(textBlock);
      
      return {
        rawText: textBlock,
        confidence: this.calculateConfidence(extracted),
        extractedData: extracted
      };
    } catch (error) {
      console.error('[AI Vendor Parser] Error parsing block:', error);
      return {
        rawText: textBlock,
        confidence: 0.1,
        extractedData: {}
      };
    }
  }

  private extractUsingRules(text: string): Partial<VendorFormData> {
    const result: Partial<VendorFormData> = {
      vendor_type: 'service',
      status: 'active'
    };

    // Extract company name (usually the first meaningful line or all caps)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines) {
      // Company name detection
      if (!result.name && this.isLikelyCompanyName(line)) {
        result.name = line;
        continue;
      }

      // Phone number extraction
      const phones = this.extractPhoneNumbers(line);
      if (phones.length > 0) {
        result.phone = result.phone ? `${result.phone}, ${phones.join(', ')}` : phones.join(', ');
      }

      // Email extraction
      const email = this.extractEmail(line);
      if (email && !result.email) {
        result.email = email;
      }

      // Website extraction
      const website = this.extractWebsite(line);
      if (website && !result.website) {
        result.website = website;
      }

      // Address detection
      if (this.isLikelyAddress(line) && !result.address) {
        result.address = line;
      }

      // Contact person detection
      if (!result.contact_person && this.isLikelyPersonName(line)) {
        result.contact_person = line;
      }
    }

    return result;
  }

  private isLikelyCompanyName(line: string): boolean {
    // Company name is usually all caps, contains business words, or is prominently placed
    const businessWords = /\b(hardware|supply|company|corp|inc|llc|ltd|services|solutions|electric|construction)\b/i;
    const isAllCaps = line === line.toUpperCase() && line.split(' ').length >= 2;
    const hasBusinessWords = businessWords.test(line);
    
    return (isAllCaps || hasBusinessWords) && line.length >= 5 && line.length <= 100;
  }

  private extractPhoneNumbers(text: string): string[] {
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
    return Array.from(text.matchAll(phoneRegex)).map(match => match[1]);
  }

  private extractEmail(text: string): string | null {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const match = text.match(emailRegex);
    return match ? match[1] : null;
  }

  private extractWebsite(text: string): string | null {
    const websiteRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/;
    const match = text.match(websiteRegex);
    if (match) {
      let website = match[1];
      if (!website.startsWith('http')) {
        website = 'https://' + website;
      }
      return website;
    }
    return null;
  }

  private isLikelyAddress(line: string): boolean {
    // Address usually contains numbers, street names, state abbreviations
    const addressPatterns = [
      /^\d+\s+[A-Za-z]/,  // Starts with number + street name
      /\b(street|st|avenue|ave|drive|dr|road|rd|lane|ln|boulevard|blvd)\b/i,
      /\b[A-Z]{2}\s+\d{5}(-\d{4})?$/,  // State + ZIP
    ];
    
    return addressPatterns.some(pattern => pattern.test(line));
  }

  private isLikelyPersonName(line: string): boolean {
    const words = line.trim().split(/\s+/);
    if (words.length < 2 || words.length > 3) return false;
    
    // Check if all words are capitalized (typical person name format)
    const allCapitalized = words.every(word => /^[A-Z][a-z]+$/.test(word));
    const hasBusinessWords = /\b(hardware|electric|construction|supply|company|corp|inc|llc|ltd)\b/i.test(line);
    
    return allCapitalized && !hasBusinessWords && line !== line.toUpperCase();
  }

  private calculateConfidence(extracted: Partial<VendorFormData>): number {
    let score = 0;
    let maxScore = 0;

    // Name is most important
    maxScore += 0.4;
    if (extracted.name && extracted.name.length > 3) score += 0.4;

    // Contact info
    maxScore += 0.3;
    if (extracted.phone) score += 0.15;
    if (extracted.email) score += 0.15;

    // Address
    maxScore += 0.2;
    if (extracted.address) score += 0.2;

    // Additional info
    maxScore += 0.1;
    if (extracted.contact_person) score += 0.05;
    if (extracted.website) score += 0.05;

    return Math.min(score / maxScore, 1.0);
  }
}
