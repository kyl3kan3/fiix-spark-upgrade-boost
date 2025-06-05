
import { VendorData } from './vendorDataTypes';
import { isEmailAddress, isWebsiteUrl } from './vendorValidation';

export class DataExtractor {
  extractEmail(line: string): string | null {
    if (!isEmailAddress(line)) return null;
    
    const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      console.log('[Data Extractor] Added email:', emailMatch[1]);
      return emailMatch[1];
    }
    return null;
  }

  extractWebsite(line: string): string | null {
    if (!isWebsiteUrl(line)) return null;
    
    const websiteMatch = line.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
    if (websiteMatch) {
      let website = websiteMatch[1];
      if (!website.startsWith('http')) {
        website = 'https://' + website;
      }
      console.log('[Data Extractor] Added website:', website);
      return website;
    }
    return null;
  }

  addAddressInfo(currentAddress: string, newAddressLine: string): string {
    if (!currentAddress) {
      console.log('[Data Extractor] Added address info:', newAddressLine);
      return newAddressLine;
    } else {
      const updatedAddress = currentAddress + ', ' + newAddressLine;
      console.log('[Data Extractor] Added address info:', newAddressLine);
      return updatedAddress;
    }
  }
}
