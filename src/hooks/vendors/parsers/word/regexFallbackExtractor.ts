
import { VendorFormData } from '@/services/vendorService';

export interface FallbackExtractionResult {
  phones: string[];
  emails: string[];
  websites: string[];
  addresses: string[];
  potentialNames: string[];
  potentialContacts: string[];
}

export class RegexFallbackExtractor {
  extractAll(text: string): FallbackExtractionResult {
    return {
      phones: this.extractPhones(text),
      emails: this.extractEmails(text),
      websites: this.extractWebsites(text),
      addresses: this.extractAddresses(text),
      potentialNames: this.extractPotentialCompanyNames(text),
      potentialContacts: this.extractPotentialContactNames(text)
    };
  }

  enhanceVendorData(vendor: Partial<VendorFormData>, text: string): Partial<VendorFormData> {
    const fallback = this.extractAll(text);
    const enhanced = { ...vendor };

    // Enhance phone numbers
    if (!enhanced.phone && fallback.phones.length > 0) {
      enhanced.phone = fallback.phones.join(', ');
    } else if (enhanced.phone && fallback.phones.length > 0) {
      // Add any missed phone numbers
      const existingPhones = enhanced.phone.split(',').map(p => p.trim());
      const newPhones = fallback.phones.filter(phone => 
        !existingPhones.some(existing => this.normalizePhone(existing) === this.normalizePhone(phone))
      );
      if (newPhones.length > 0) {
        enhanced.phone += ', ' + newPhones.join(', ');
      }
    }

    // Enhance email
    if (!enhanced.email && fallback.emails.length > 0) {
      enhanced.email = fallback.emails[0]; // Take the first valid email
    }

    // Enhance website
    if (!enhanced.website && fallback.websites.length > 0) {
      enhanced.website = fallback.websites[0];
    }

    // Enhance address if missing
    if (!enhanced.address && fallback.addresses.length > 0) {
      enhanced.address = fallback.addresses[0];
    }

    // Enhance company name if missing or weak
    if (!enhanced.name && fallback.potentialNames.length > 0) {
      enhanced.name = fallback.potentialNames[0];
    }

    // Enhance contact person if missing
    if (!enhanced.contact_person && fallback.potentialContacts.length > 0) {
      enhanced.contact_person = fallback.potentialContacts[0];
    }

    return enhanced;
  }

  private extractPhones(text: string): string[] {
    const patterns = [
      /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, // Standard US format
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g, // Without parentheses
      /(\(\d{3}\)\s?\d{3}-\d{4})/g, // (xxx) xxx-xxxx
    ];

    const phones = new Set<string>();
    
    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        const phone = match[1].trim();
        // Validate it's actually a phone number (not other numbers)
        if (this.isValidPhone(phone)) {
          phones.add(phone);
        }
      });
    }

    return Array.from(phones);
  }

  private extractEmails(text: string): string[] {
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const matches = Array.from(text.matchAll(emailPattern));
    return matches.map(match => match[1]).filter(email => this.isValidEmail(email));
  }

  private extractWebsites(text: string): string[] {
    const patterns = [
      /(https?:\/\/[^\s]+)/g,
      /(www\.[^\s]+)/g,
      /([a-zA-Z0-9.-]+\.(com|org|net|edu|gov|biz|info)(?:\/[^\s]*)?)/g
    ];

    const websites = new Set<string>();
    
    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        let website = match[1];
        if (!website.startsWith('http')) {
          website = 'https://' + website;
        }
        websites.add(website);
      });
    }

    return Array.from(websites);
  }

  private extractAddresses(text: string): string[] {
    const addressPatterns = [
      /\d+\s+[A-Za-z][A-Za-z\s,]+(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd|Lane|Ln|Boulevard|Blvd)[^,\n]*/gi,
      /P\.?O\.?\s+Box\s+\d+[^,\n]*/gi,
      /\d+\s+[A-Za-z][^,\n]*,\s*[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}(-\d{4})?/g
    ];

    const addresses: string[] = [];
    
    for (const pattern of addressPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        const address = match[0].trim();
        if (address.length >= 10 && address.length <= 200) {
          addresses.push(address);
        }
      });
    }

    return addresses;
  }

  private extractPotentialCompanyNames(text: string): string[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const companyNames: string[] = [];

    for (const line of lines) {
      if (this.couldBeCompanyName(line)) {
        companyNames.push(line);
      }
    }

    return companyNames;
  }

  private extractPotentialContactNames(text: string): string[] {
    const namePattern = /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
    const matches = Array.from(text.matchAll(namePattern));
    
    return matches
      .map(match => match[1])
      .filter(name => this.couldBePersonName(name))
      .slice(0, 3); // Limit to first 3 potential names
  }

  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@') && email.includes('.') && email.length >= 5;
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[^\d]/g, '');
  }

  private couldBeCompanyName(line: string): boolean {
    // Basic heuristics for company names
    const hasBusinessWords = /\b(company|corp|inc|llc|ltd|services|solutions|hardware|supply|electric|construction)\b/i.test(line);
    const isProperCase = /^[A-Z]/.test(line) && line.length >= 5 && line.length <= 100;
    const hasMultipleWords = line.split(' ').length >= 2;
    
    return hasBusinessWords || (isProperCase && hasMultipleWords);
  }

  private couldBePersonName(name: string): boolean {
    const words = name.split(' ');
    if (words.length < 2 || words.length > 3) return false;
    
    // All words should start with capital letter
    const allCapitalized = words.every(word => /^[A-Z][a-z]+$/.test(word));
    const hasBusinessWords = /\b(hardware|company|corp|inc|llc|supply)\b/i.test(name);
    
    return allCapitalized && !hasBusinessWords;
  }
}
