
import { EntityClassification } from './types';
import {
  isCompanyName,
  isPersonName,
  containsProductInfo,
  containsServiceInfo,
  isContactReference,
  isCityName
} from './textClassifiers';
import {
  extractEmail,
  extractPhone,
  extractWebsite,
  extractAddress,
  extractStateAndZip
} from './textExtractors';

export type { EntityClassification } from './types';

export function analyzeAndCategorizeText(text: string): EntityClassification {
  const result: EntityClassification = { rawText: text };
  
  // First, try to extract structured data using labels
  const structuredData = extractStructuredData(text);
  if (structuredData.hasStructuredData) {
    return { ...result, ...structuredData };
  }
  
  // Fall back to the original analysis method
  return analyzeUnstructuredText(text, result);
}

function extractStructuredData(text: string): EntityClassification & { hasStructuredData: boolean } {
  const result: EntityClassification & { hasStructuredData: boolean } = { rawText: text, hasStructuredData: false };
  
  // Common patterns for structured data
  const patterns = {
    company: /(?:Company|Business|Organization|Name)\s*:?\s*(.+?)(?:\n|$)/i,
    address: /(?:Address|Location)\s*:?\s*(.+?)(?:\n|$)/i,
    contact: /(?:Contact\s*Person|Contact\s*Name|Representative)\s*:?\s*(.+?)(?:\n|$)/i,
    phone: /(?:Phone|Contact\s*Number|Tel|Telephone)\s*:?\s*(.+?)(?:\n|$)/i,
    email: /(?:Email|E-mail)\s*:?\s*(.+?)(?:\n|$)/i,
    website: /(?:Website|Web|URL)\s*:?\s*(.+?)(?:\n|$)/i
  };
  
  let foundStructuredData = false;
  
  // Extract company name
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
    
    // Extract city (word before state or last substantial word)
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
  
  // Extract phone
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

function analyzeUnstructuredText(text: string, result: EntityClassification): EntityClassification {
  let workingText = text;
  
  // Extract email
  const email = extractEmail(workingText);
  if (email) {
    result.email = email;
    workingText = workingText.replace(email, '').trim();
  }
  
  // Extract phone
  const phone = extractPhone(workingText);
  if (phone) {
    result.phone = phone;
    workingText = workingText.replace(phone, '').trim();
  }
  
  // Extract website
  const website = extractWebsite(workingText);
  if (website) {
    result.website = website;
    workingText = workingText.replace(website.replace('https://', ''), '').trim();
  }
  
  // Extract address
  const address = extractAddress(workingText);
  if (address) {
    result.address = address;
    workingText = workingText.replace(address, '').trim();
  }
  
  // Extract state and ZIP
  const { state, zipCode } = extractStateAndZip(workingText);
  if (state) result.state = state;
  if (zipCode) result.zipCode = zipCode;
  if (state || zipCode) {
    const stateZipPattern = state && zipCode ? `${state}\\s+${zipCode}` : state || zipCode;
    workingText = workingText.replace(new RegExp(stateZipPattern, 'i'), '').trim();
  }
  
  // Split remaining text into lines for analysis
  const lines = workingText.split(/\n|;|,/).map(line => line.trim()).filter(line => line.length > 0);
  
  // Analyze each line to categorize content
  const products: string[] = [];
  const services: string[] = [];
  let companyName = '';
  let contactPerson = '';
  let cityName = '';
  const notes: string[] = [];
  
  for (const line of lines) {
    if (line.length < 3) continue;
    
    // Check for contact person (with context indicators)
    if (isContactReference(line) || (isPersonName(line) && !companyName)) {
      if (!contactPerson) {
        // Extract the actual name from contact references
        const nameMatch = line.match(/(?:Contact|Attn|Attention):\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i) || 
                         line.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/);
        if (nameMatch) {
          contactPerson = nameMatch[1] || nameMatch[0];
        }
      }
    }
    // Check for company name
    else if (isCompanyName(line) && !companyName) {
      companyName = line;
    }
    // Check for city name
    else if (isCityName(line) && !cityName && !companyName.toLowerCase().includes(line.toLowerCase())) {
      cityName = line;
    }
    // Check for product information
    else if (containsProductInfo(line)) {
      products.push(line);
    }
    // Check for service information
    else if (containsServiceInfo(line)) {
      services.push(line);
    }
    // If it looks like a company name but we already have one, might be a product/service
    else if (isCompanyName(line) && companyName) {
      notes.push(line);
    }
    // If it's a person name but we already have a contact, might be additional info
    else if (isPersonName(line) && contactPerson) {
      notes.push(line);
    }
    // If it's a city but we already have one, add to notes
    else if (isCityName(line) && cityName) {
      notes.push(line);
    }
    // Everything else goes to notes
    else {
      notes.push(line);
    }
  }
  
  // If no clear company name found, look for the longest substantial line that's not a city or person
  if (!companyName && lines.length > 0) {
    const potentialCompanies = lines.filter(line => 
      line.length > 3 && 
      !isPersonName(line) && 
      !isCityName(line) &&
      !containsProductInfo(line) &&
      !containsServiceInfo(line)
    );
    
    if (potentialCompanies.length > 0) {
      // Take the longest one as it's likely to be the most complete company name
      companyName = potentialCompanies.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      );
      
      // Remove it from notes if it was added there
      const index = notes.indexOf(companyName);
      if (index > -1) notes.splice(index, 1);
    } else {
      // If still no company name, take the first substantial line
      const firstSubstantialLine = lines.find(line => line.length > 5);
      if (firstSubstantialLine) {
        companyName = firstSubstantialLine;
        // Remove it from notes if it was added there
        const index = notes.indexOf(companyName);
        if (index > -1) notes.splice(index, 1);
      }
    }
  }
  
  // Set city from our analysis or extract from remaining text if not found
  if (cityName) {
    result.city = cityName;
  } else if (!result.city) {
    const cityMatch = workingText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/);
    if (cityMatch && cityMatch[0].length > 2 && !isPersonName(cityMatch[0]) && cityMatch[0] !== companyName) {
      if (isCityName(cityMatch[0])) {
        result.city = cityMatch[0];
      }
    }
  }
  
  // Assign results
  result.companyName = companyName || 'Unnamed Vendor';
  result.contactPerson = contactPerson;
  result.products = products.length > 0 ? products : undefined;
  result.services = services.length > 0 ? services : undefined;
  result.notes = notes.length > 0 ? notes.join('; ') : undefined;
  
  return result;
}
