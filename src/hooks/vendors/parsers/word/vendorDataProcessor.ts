
import { VendorData } from './vendorDataTypes';
import { 
  isMainCompanyName, 
  isLikelyCompanyName, 
  isPersonName, 
  isAddressLine 
} from './vendorValidation';
import { isServiceLine } from './textProcessor';
import { PhoneNumberProcessor } from './phoneNumberProcessor';
import { DataExtractor } from './dataExtractor';

export class VendorDataProcessor {
  private phoneProcessor = new PhoneNumberProcessor();
  private dataExtractor = new DataExtractor();
  private hasFoundMainCompanyName = false;

  processLine(line: string, currentVendor: VendorData): { updated: boolean; hasData: boolean } {
    const trimmedLine = line.trim();
    let updated = false;
    let hasData = false;

    // Handle phone numbers
    const phoneNumber = this.phoneProcessor.processPhoneNumber(trimmedLine);
    if (phoneNumber) {
      if (!currentVendor.phone) {
        currentVendor.phone = phoneNumber;
      } else {
        currentVendor.phone += ', ' + phoneNumber;
      }
      return { updated: true, hasData: true };
    }

    // Handle phone with context
    const phoneWithContext = this.phoneProcessor.processPhoneWithContext(trimmedLine);
    if (phoneWithContext) {
      if (!currentVendor.phone) {
        currentVendor.phone = phoneWithContext;
      } else {
        currentVendor.phone += ', ' + phoneWithContext;
      }
      return { updated: true, hasData: true };
    }

    // Handle email addresses
    const email = this.dataExtractor.extractEmail(trimmedLine);
    if (email && !currentVendor.email) {
      currentVendor.email = email;
      return { updated: true, hasData: true };
    }

    // Handle website URLs
    const website = this.dataExtractor.extractWebsite(trimmedLine);
    if (website && !currentVendor.website) {
      currentVendor.website = website;
      return { updated: true, hasData: true };
    }

    // Handle address lines
    if (isAddressLine(trimmedLine)) {
      currentVendor.address = this.dataExtractor.addAddressInfo(currentVendor.address, trimmedLine);
      return { updated: true, hasData: true };
    }

    // Handle service lines for description
    if (isServiceLine(trimmedLine) && !currentVendor.description) {
      currentVendor.description = trimmedLine;
      console.log('[Data Processor] Added services description:', trimmedLine);
      return { updated: true, hasData: true };
    }

    // Priority 1: Look for main company name first
    if (!this.hasFoundMainCompanyName && isMainCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      this.hasFoundMainCompanyName = true;
      console.log('[Data Processor] Set main company name:', trimmedLine);
      return { updated: true, hasData: true };
    }

    // Priority 2: If we have a main company name, look for contact person
    if (this.hasFoundMainCompanyName && !currentVendor.contact_person && isPersonName(trimmedLine)) {
      currentVendor.contact_person = trimmedLine;
      console.log('[Data Processor] Set contact person:', trimmedLine);
      return { updated: true, hasData: true };
    }

    // Priority 3: If no main company name yet, check if this could be one
    if (!this.hasFoundMainCompanyName && isLikelyCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      this.hasFoundMainCompanyName = true;
      console.log('[Data Processor] Set company name:', trimmedLine);
      return { updated: true, hasData: true };
    }

    // For any other meaningful text, mark that we have data
    if (trimmedLine.length > 2 && !trimmedLine.match(/^[^a-zA-Z]*$/)) {
      console.log('[Data Processor] Added misc data:', trimmedLine);
      return { updated: false, hasData: true };
    }

    return { updated, hasData };
  }

  reset(): void {
    this.phoneProcessor.reset();
    this.hasFoundMainCompanyName = false;
  }

  getHasFoundMainCompanyName(): boolean {
    return this.hasFoundMainCompanyName;
  }
}
