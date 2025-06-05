
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

    // Handle product listings - collect them but don't treat as service description immediately
    if (isProductListing(trimmedLine) || isServiceLine(trimmedLine)) {
      this.productLines.push(trimmedLine);
      console.log('[Data Processor] Added product line:', trimmedLine);
      return { updated: false, hasData: true };
    }

    // Priority 1: Look for main company name first - be more strict
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

    // Priority 3: Only if no main company name and this looks very much like a company
    if (!this.hasFoundMainCompanyName && isLikelyCompanyName(trimmedLine)) {
      // Be more conservative - only if we haven't collected product lines recently
      if (this.productLines.length < 3) {
        currentVendor.name = trimmedLine;
        this.hasFoundMainCompanyName = true;
        console.log('[Data Processor] Set likely company name:', trimmedLine);
        return { updated: true, hasData: true };
      }
    }

    // For any other meaningful text, mark that we have data but don't add it as company info
    if (trimmedLine.length > 2 && !trimmedLine.match(/^[^a-zA-Z]*$/)) {
      console.log('[Data Processor] Added misc data:', trimmedLine);
      return { updated: false, hasData: true };
    }

    return { updated, hasData };
  }

  finalizeDescription(currentVendor: VendorData): void {
    // If we have product lines and no description, create one from the product lines
    if (this.productLines.length > 0 && !currentVendor.description) {
      // Take the first few meaningful product lines
      const meaningfulProducts = this.productLines
        .filter(line => line.length > 10)
        .slice(0, 5);
      
      if (meaningfulProducts.length > 0) {
        currentVendor.description = meaningfulProducts.join('; ');
        console.log('[Data Processor] Set description from products:', currentVendor.description);
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
