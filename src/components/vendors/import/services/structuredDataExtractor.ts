
import { EntityClassification } from './types';
import { extractEmail, extractPhone, extractWebsite, extractStateAndZip } from './textExtractors';

export function extractStructuredData(text: string, instructions?: string): EntityClassification & { hasStructuredData: boolean } {
  const result: EntityClassification & { hasStructuredData: boolean } = { rawText: text, hasStructuredData: false };
  
  // More flexible patterns for structured data
  const patterns = {
    company: /(?:Company|Business|Organization|Name)\s*:?\s*(.+?)(?:\n|$)/i,
    address: /(?:Address|Location)\s*:?\s*(.+?)(?:\n|$)/i,
    contact: /(?:Contact\s*Person|Contact\s*Name|Representative)\s*:?\s*(.+?)(?:\n|$)/i,
    phone: /(?:Phone|Contact\s*Number|Contact\s*#|Tel|Telephone|Number)\s*:?\s*(.+?)(?:\n|$)/i,
    email: /(?:Email|E-mail|E\s*mail)\s*:?\s*(.+?)(?:\n|$)/i,
    website: /(?:Website|Web|URL|Site)\s*:?\s*(.+?)(?:\n|$)/i
  };
  
  let foundStructuredData = false;
  
  // Extract company name - handle "Company :" format
  const companyMatch = text.match(patterns.company);
  if (companyMatch) {
    result.companyName = companyMatch[1].trim();
    foundStructuredData = true;
  }
  
  // Extract address
  const addressMatch = text.match(patterns.address);
  if (addressMatch) {
    const fullAddress = addressMatch[1].trim();
    result.address = fullAddress;
    
    // Try to extract city, state, zip from the address
    const { state, zipCode } = extractStateAndZip(fullAddress);
    if (state) result.state = state;
    if (zipCode) result.zipCode = zipCode;
    
    // Extract city (word before state)
    if (state) {
      const beforeState = fullAddress.split(state)[0].trim();
      const words = beforeState.split(/\s+/);
      if (words.length > 0) {
        result.city = words[words.length - 1];
      }
    }
    
    foundStructuredData = true;
  }
  
  // Extract contact person
  const contactMatch = text.match(patterns.contact);
  if (contactMatch) {
    result.contactPerson = contactMatch[1].trim();
    foundStructuredData = true;
  }
  
  // Extract phone - now handles "Contact Number"
  const phoneMatch = text.match(patterns.phone);
  if (phoneMatch) {
    result.phone = phoneMatch[1].trim();
    foundStructuredData = true;
  } else {
    // Fall back to regex extraction
    const phone = extractPhone(text);
    if (phone) {
      result.phone = phone;
      foundStructuredData = true;
    }
  }
  
  // Extract email
  const emailMatch = text.match(patterns.email);
  if (emailMatch) {
    result.email = emailMatch[1].trim();
    foundStructuredData = true;
  } else {
    // Fall back to regex extraction
    const email = extractEmail(text);
    if (email) {
      result.email = email;
      foundStructuredData = true;
    }
  }
  
  // Extract website
  const websiteMatch = text.match(patterns.website);
  if (websiteMatch) {
    const website = websiteMatch[1].trim();
    result.website = website.startsWith('http') ? website : `https://${website}`;
    foundStructuredData = true;
  } else {
    // Fall back to regex extraction
    const website = extractWebsite(text);
    if (website) {
      result.website = website;
      foundStructuredData = true;
    }
  }
  
  result.hasStructuredData = foundStructuredData;
  return result;
}
