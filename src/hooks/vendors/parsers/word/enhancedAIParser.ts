
import { VendorFormData } from '@/services/vendorService';

export interface VendorBlock {
  rawText: string;
  confidence: number;
  extractedData: Partial<VendorFormData>;
  processingNotes: string[];
}

export class EnhancedAIParser {
  private static readonly STRUCTURED_PARSE_PROMPT = `
You are an expert data extraction specialist. Parse the following vendor text block and extract structured information.

EXTRACTION RULES:
1. Extract the main company name (usually first line, all caps, or contains business words)
2. Find ALL phone numbers in various formats
3. Identify email addresses
4. Extract physical addresses (street, city, state, zip)
5. Identify contact person names (proper capitalization, 2-3 words)
6. Find website URLs
7. Extract services/products offered

Return ONLY a JSON object with these exact fields:
{
  "name": "Main company name",
  "address": "Full street address",
  "city": "City name", 
  "state": "State abbreviation",
  "zip_code": "ZIP code",
  "phone": "All phone numbers separated by commas",
  "email": "Primary email address",
  "contact_person": "Contact person name",
  "website": "Website URL",
  "description": "Services or products offered",
  "confidence": 0.9,
  "notes": ["Any processing notes or concerns"]
}

TEXT TO PARSE:
`;

  async parseVendorBlock(textBlock: string): Promise<VendorBlock> {
    try {
      // For now, we'll use an enhanced rule-based approach
      // In production, this would call an actual AI service
      const extracted = await this.enhancedRuleBasedExtraction(textBlock);
      
      return {
        rawText: textBlock,
        confidence: this.calculateConfidence(extracted),
        extractedData: extracted,
        processingNotes: this.generateProcessingNotes(extracted, textBlock)
      };
    } catch (error) {
      console.error('[Enhanced AI Parser] Error parsing block:', error);
      return {
        rawText: textBlock,
        confidence: 0.1,
        extractedData: {},
        processingNotes: ['Failed to parse block']
      };
    }
  }

  private async enhancedRuleBasedExtraction(text: string): Promise<Partial<VendorFormData>> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result: Partial<VendorFormData> = {
      vendor_type: 'service',
      status: 'active'
    };

    // Enhanced company name detection
    for (const line of lines) {
      if (!result.name && this.isStrongCompanyName(line)) {
        result.name = this.cleanCompanyName(line);
        break;
      }
    }

    // Extract all contact information
    const contactInfo = this.extractAllContactInfo(text);
    
    // Merge contact information
    if (contactInfo.phones.length > 0) {
      result.phone = contactInfo.phones.join(', ');
    }
    
    if (contactInfo.emails.length > 0) {
      result.email = contactInfo.emails[0];
    }
    
    if (contactInfo.websites.length > 0) {
      result.website = contactInfo.websites[0];
    }

    // Enhanced address extraction
    const addressInfo = this.extractFullAddress(lines);
    if (addressInfo.fullAddress) {
      result.address = addressInfo.fullAddress;
    }
    if (addressInfo.city) {
      result.city = addressInfo.city;
    }
    if (addressInfo.state) {
      result.state = addressInfo.state;
    }
    if (addressInfo.zipCode) {
      result.zip_code = addressInfo.zipCode;
    }

    // Contact person detection
    for (const line of lines) {
      if (!result.contact_person && this.isContactPerson(line)) {
        result.contact_person = line;
        break;
      }
    }

    // Services/description extraction
    const services = this.extractServices(lines);
    if (services.length > 0) {
      result.description = services.join('; ');
    }

    return result;
  }

  private isStrongCompanyName(line: string): boolean {
    // Very strict company name detection
    if (line.length < 5 || line.length > 100) return false;
    
    // Exclude obvious non-company patterns
    if (this.isPhoneNumber(line) || this.isEmail(line) || this.isWebsite(line)) {
      return false;
    }
    
    // Strong business indicators
    const businessWords = /\b(hardware|supply|company|corp|corporation|inc|incorporated|llc|ltd|limited|services|solutions|manufacturing|electric|construction|enterprises|industries|systems|technologies)\b/i;
    
    // Format indicators
    const isAllCaps = line === line.toUpperCase() && line.split(' ').length >= 2;
    const isTitleCase = /^[A-Z][A-Za-z\s&.,'-]*$/.test(line) && line.split(' ').length >= 2;
    
    return businessWords.test(line) && (isAllCaps || isTitleCase);
  }

  private cleanCompanyName(name: string): string {
    // Remove extra whitespace and clean up formatting
    return name.trim().replace(/\s+/g, ' ');
  }

  private extractAllContactInfo(text: string): {
    phones: string[];
    emails: string[];
    websites: string[];
  } {
    const phones: string[] = [];
    const emails: string[] = [];
    const websites: string[] = [];

    // Enhanced phone number patterns
    const phonePatterns = [
      /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g,
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g,
      /(\(\d{3}\)\s?\d{3}-\d{4})/g,
    ];

    phonePatterns.forEach(pattern => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        const phone = match[1].trim();
        if (this.isValidPhone(phone) && !phones.includes(phone)) {
          phones.push(phone);
        }
      });
    });

    // Email extraction
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emailMatches = Array.from(text.matchAll(emailPattern));
    emailMatches.forEach(match => {
      const email = match[1];
      if (!emails.includes(email)) {
        emails.push(email);
      }
    });

    // Website extraction
    const websitePatterns = [
      /(https?:\/\/[^\s]+)/g,
      /(www\.[^\s]+)/g,
      /([a-zA-Z0-9.-]+\.(com|org|net|edu|gov|biz|info)(?:\/[^\s]*)?)/g
    ];

    websitePatterns.forEach(pattern => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        let website = match[1];
        if (!website.startsWith('http')) {
          website = 'https://' + website;
        }
        if (!websites.includes(website)) {
          websites.push(website);
        }
      });
    });

    return { phones, emails, websites };
  }

  private extractFullAddress(lines: string[]): {
    fullAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } {
    for (const line of lines) {
      // Look for complete address with city, state, zip
      const fullAddressMatch = line.match(/^(.+),\s*([A-Z][a-z]+),?\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      if (fullAddressMatch) {
        return {
          fullAddress: fullAddressMatch[1].trim(),
          city: fullAddressMatch[2].trim(),
          state: fullAddressMatch[3].trim(),
          zipCode: fullAddressMatch[4].trim()
        };
      }

      // Look for street address
      if (/^\d+\s+[A-Za-z]/.test(line) && !this.isPhoneNumber(line)) {
        return { fullAddress: line };
      }
    }

    return {};
  }

  private isContactPerson(line: string): boolean {
    const words = line.trim().split(/\s+/);
    if (words.length < 2 || words.length > 3) return false;
    
    // All words should be capitalized
    const allCapitalized = words.every(word => /^[A-Z][a-z]+$/.test(word));
    const hasBusinessWords = /\b(hardware|company|corp|inc|llc|supply)\b/i.test(line);
    
    return allCapitalized && !hasBusinessWords && line !== line.toUpperCase();
  }

  private extractServices(lines: string[]): string[] {
    const services: string[] = [];
    
    for (const line of lines) {
      // Look for service/product indicators
      if (this.isServiceLine(line)) {
        services.push(line);
      }
    }
    
    return services.slice(0, 5); // Limit to first 5 services
  }

  private isServiceLine(line: string): boolean {
    const servicePatterns = [
      /^\s*[-•]\s*[A-Za-z]/, // Bullet points
      /^\s*\d+[\.)]\s*[A-Za-z]/, // Numbered lists
      /\b(repair|install|maintain|service|supply|provide|offer)\b/i,
    ];
    
    return servicePatterns.some(pattern => pattern.test(line)) && line.length > 10;
  }

  private isPhoneNumber(text: string): boolean {
    return /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(text);
  }

  private isEmail(text: string): boolean {
    return /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(text);
  }

  private isWebsite(text: string): boolean {
    return /(https?:\/\/[^\s]+|www\.[^\s]+)/.test(text);
  }

  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  }

  private calculateConfidence(extracted: Partial<VendorFormData>): number {
    let score = 0;
    let maxScore = 0;

    // Company name is critical
    maxScore += 0.4;
    if (extracted.name && extracted.name.length > 3) score += 0.4;

    // Contact information
    maxScore += 0.3;
    if (extracted.phone) score += 0.15;
    if (extracted.email) score += 0.15;

    // Address information
    maxScore += 0.2;
    if (extracted.address) score += 0.1;
    if (extracted.city && extracted.state) score += 0.1;

    // Additional details
    maxScore += 0.1;
    if (extracted.contact_person) score += 0.05;
    if (extracted.website) score += 0.05;

    return Math.min(score / maxScore, 1.0);
  }

  private generateProcessingNotes(extracted: Partial<VendorFormData>, originalText: string): string[] {
    const notes: string[] = [];

    if (!extracted.name) {
      notes.push('No clear company name identified');
    }

    if (!extracted.phone && !extracted.email) {
      notes.push('No contact information found');
    }

    if (!extracted.address) {
      notes.push('No address information found');
    }

    if (originalText.length < 50) {
      notes.push('Very short text block - may be incomplete');
    }

    return notes;
  }
}
