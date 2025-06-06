
import { VendorData } from './vendorDataTypes';
import { 
  isMainCompanyName, 
  isPersonName, 
  isAddressLine,
  isLocationLine
} from './vendorValidation';
import { isServiceLine, isProductListing } from './textProcessor';
import { PhoneNumberProcessor } from './phoneNumberProcessor';
import { DataExtractor } from './dataExtractor';

export class VendorDataProcessor {
  private phoneProcessor = new PhoneNumberProcessor();
  private dataExtractor = new DataExtractor();
  private hasFoundMainCompanyName = false;
  private productLines: string[] = [];
  private pendingLines: string[] = []; // Store lines until we find a company name

  processLine(line: string, currentVendor: VendorData): { updated: boolean; hasData: boolean } {
    const trimmedLine = line.trim();
    let updated = false;
    let hasData = false;

    // Skip location lines completely - they're not vendor data
    if (isLocationLine(trimmedLine)) {
      console.log('[Data Processor] Skipping location line:', trimmedLine);
      return { updated: false, hasData: false };
    }

    // Handle phone numbers first
    const phoneNumber = this.phoneProcessor.processPhoneNumber(trimmedLine);
    if (phoneNumber) {
      if (!currentVendor.phone) {
        currentVendor.phone = phoneNumber;
      } else if (!currentVendor.phone.includes(phoneNumber)) {
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

    // If we haven't found a company name yet, check if this is one
    if (!this.hasFoundMainCompanyName && isMainCompanyName(trimmedLine)) {
      currentVendor.name = trimmedLine;
      this.hasFoundMainCompanyName = true;
      console.log('[Data Processor] Set company name:', trimmedLine);
      
      // Process any pending lines now that we have a company name
      this.processPendingLines(currentVendor);
      
      return { updated: true, hasData: true };
    }

    // If we don't have a company name yet, store this line as pending
    if (!this.hasFoundMainCompanyName) {
      // Don't store obvious non-vendor lines
      if (trimmedLine.length > 2 && !trimmedLine.match(/^[^a-zA-Z]*$/)) {
        this.pendingLines.push(trimmedLine);
        return { updated: false, hasData: true };
      }
      return { updated: false, hasData: false };
    }

    // We have a company name, so process this line normally
    return this.processLineWithCompanyName(trimmedLine, currentVendor);
  }

  private processPendingLines(currentVendor: VendorData): void {
    for (const pendingLine of this.pendingLines) {
      this.processLineWithCompanyName(pendingLine, currentVendor);
    }
    this.pendingLines = [];
  }

  private processLineWithCompanyName(trimmedLine: string, currentVendor: VendorData): { updated: boolean; hasData: boolean } {
    // Handle address lines
    if (isAddressLine(trimmedLine)) {
      currentVendor.address = this.dataExtractor.addAddressInfo(currentVendor.address, trimmedLine);
      return { updated: true, hasData: true };
    }
    
    // Look for contact person only if it's clearly a person name
    if (!currentVendor.contact_person && isPersonName(trimmedLine)) {
      currentVendor.contact_person = trimmedLine;
      console.log('[Data Processor] Set contact person:', trimmedLine);
      return { updated: true, hasData: true };
    }

    // Collect product lines for description
    if (isProductListing(trimmedLine) || isServiceLine(trimmedLine)) {
      this.productLines.push(trimmedLine);
      return { updated: false, hasData: true };
    }

    // For any other meaningful text, consider it has data but don't process it
    if (trimmedLine.length > 2 && !trimmedLine.match(/^[^a-zA-Z]*$/)) {
      return { updated: false, hasData: true };
    }

    return { updated: false, hasData: false };
  }

  finalizeDescription(currentVendor: VendorData): void {
    if (this.productLines.length > 0 && !currentVendor.description) {
      const meaningfulProducts = this.productLines
        .filter(line => line.length > 5)
        .slice(0, 10);
      
      if (meaningfulProducts.length > 0) {
        currentVendor.description = meaningfulProducts.join('; ');
      }
    }
  }

  reset(): void {
    this.phoneProcessor.reset();
    this.hasFoundMainCompanyName = false;
    this.productLines = [];
    this.pendingLines = [];
  }

  getHasFoundMainCompanyName(): boolean {
    return this.hasFoundMainCompanyName;
  }
}
