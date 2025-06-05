
export class PhoneNumberProcessor {
  private processedPhoneNumbers = new Set<string>();

  normalizePhone(phone: string): string {
    return phone.replace(/[\s\-\.()]/g, '');
  }

  extractPhoneWithContext(line: string): { phone: string; context: string } | null {
    const phoneMatch = line.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (!phoneMatch) return null;

    const phoneNumber = phoneMatch[1];
    const context = line.toLowerCase();
    let phoneWithContext = phoneNumber;
    
    if (context.includes('cell') || context.includes('mobile')) {
      phoneWithContext += ' (Cell)';
    } else if (context.includes('office')) {
      phoneWithContext += ' (Office)';
    } else if (context.includes('fax')) {
      phoneWithContext += ' (Fax)';
    }

    return { phone: phoneWithContext, context };
  }

  processPhoneNumber(line: string): string | null {
    const result = this.extractPhoneWithContext(line);
    if (!result) return null;

    const normalizedPhone = this.normalizePhone(result.phone);
    
    if (this.processedPhoneNumbers.has(normalizedPhone)) {
      console.log('[Phone Processor] Skipped duplicate phone:', result.phone);
      return null;
    }

    this.processedPhoneNumbers.add(normalizedPhone);
    console.log('[Phone Processor] Added phone:', result.phone);
    return result.phone;
  }

  processPhoneWithContext(line: string): string | null {
    const phoneWithContextMatch = line.match(/(?:cell|mobile|office|phone|tel)?\s*:?\s*(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i);
    if (!phoneWithContextMatch) return null;

    const phoneNumber = phoneWithContextMatch[1];
    const normalizedPhone = this.normalizePhone(phoneNumber);
    
    if (this.processedPhoneNumbers.has(normalizedPhone)) {
      return null;
    }

    this.processedPhoneNumbers.add(normalizedPhone);
    
    const context = line.toLowerCase();
    let phoneWithContext = phoneNumber;
    
    if (context.includes('cell') || context.includes('mobile')) {
      phoneWithContext += ' (Cell)';
    } else if (context.includes('office')) {
      phoneWithContext += ' (Office)';
    } else if (context.includes('fax')) {
      phoneWithContext += ' (Fax)';
    }
    
    console.log('[Phone Processor] Added phone with context:', phoneWithContext);
    return phoneWithContext;
  }

  reset(): void {
    this.processedPhoneNumbers.clear();
  }
}
