
import { VendorData } from './vendorDataTypes';
import { 
  isMainCompanyName, 
  isLikelyCompanyName, 
  isPersonName, 
  isAddressLine 
} from './vendorValidation';
import { isServiceLine, isProductListing } from './textProcessor';
import { PhoneNumberProcessor } from './phoneNumberProcessor';
import { DataExtractor } from './dataExtractor';

export class VendorDataProcessor {
  private phoneProcessor = new PhoneNumberProcessor();
  private dataExtractor = new DataExtractor();
  private hasFoundMainCompanyName = false;
  private productLines: string[] = [];

  processLine(line: string, currentVendor: VendorData): { updated: boolean; hasData: boolean } {
    const trimmedLine = line.trim();
    let updated = false;
    let hasData = false;

    // Handle phone numbers first
    const phoneNumber = this.phoneProcessor.processPhoneNumber(trimmedLine);
    if (phoneNumber) {
      if (!currentVendor.phone) {
        currentVendor.phone = phoneNumber;
      } else {
        currentVendor.phone += ', ' + phoneNumber;
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

    // Collect product lines for description
    if (isProductListing(trimmedLine) || isServiceLine(trimmedLine)) {
      this.productLines.push(trimmedLine);
      return { updated: false, hasData: true };
    }

    // Look for company name - be very strict
    if (!this.hasFoundMainCompanyName && isMainCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      this.hasFoundMainCompanyName = true;
      console.log('[Data Processor] Set company name:', trimmedLine);
      return { updated: true, hasData: true };
    }

    // Look for contact person only after we have company name
    if (this.hasFoundMainCompanyName && !currentVendor.contact_person && isPersonName(trimmedLine)) {
      currentVendor.contact_person = trimmedLine;
      return { updated: true, hasData: true };
    }

    // Mark as having data for any meaningful text
    if (trimmedLine.length > 2 && !trimmedLine.match(/^[^a-zA-Z]*$/)) {
      return { updated: false, hasData: true };
    }

    return { updated, hasData };
  }

  finalizeDescription(currentVendor: VendorData): void {
    if (this.productLines.length > 0 && !currentVendor.description) {
      const meaningfulProducts = this.productLines
        .filter(line => line.length > 10)
        .slice(0, 5);
      
      if (meaningfulProducts.length > 0) {
        currentVendor.description = meaningfulProducts.join('; ');
      }
    }
  }

  reset(): void {
    this.phoneProcessor.reset();
    this.hasFoundMainCompanyName = false;
    this.productLines = [];
  }

  getHasFoundMainCompanyName(): boolean {
    return this.hasFoundMainCompanyName;
  }
}
