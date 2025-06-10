
import { EntityClassification } from './types';
import {
  isCompanyName,
  isPersonName,
  containsProductInfo,
  containsServiceInfo,
  isContactReference,
  isCityName,
  isProductName
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
  console.log('🔍 Analyzing text:', text);
  const result: EntityClassification = { rawText: text };
  
  // First, try to extract structured data using labels
  const structuredData = extractStructuredData(text);
  if (structuredData.hasStructuredData) {
    console.log('✅ Found structured data:', structuredData);
    return { ...result, ...structuredData };
  }
  
  // Fall back to the original analysis method
  console.log('⚠️ No structured data found, falling back to unstructured analysis');
  const unstructuredResult = analyzeUnstructuredText(text, result);
  console.log('📊 Unstructured analysis result:', unstructuredResult);
  return unstructuredResult;
}

function extractStructuredData(text: string): EntityClassification & { hasStructuredData: boolean } {
  const result: EntityClassification & { hasStructuredData: boolean } = { rawText: text, hasStructuredData: false };
  
  // More flexible patterns for structured data - handle various formats
  const patterns = {
    company: /(?:Company|Business|Organization|Name|Vendor)\s*:?\s*(.+?)(?:\n|$)/i,
    address: /(?:Address|Location|Street)\s*:?\s*(.+?)(?:\n|$)/i,
    contact: /(?:Contact\s*Person|Contact\s*Name|Representative|Contact)\s*:?\s*(.+?)(?:\n|$)/i,
    phone: /(?:Phone|Contact\s*Number|Contact\s*#|Tel|Telephone|Number|Mobile|Cell\s*#)\s*:?\s*(.+?)(?:\n|$)/i,
    email: /(?:Email|E-mail|E\s*mail|Mail)\s*:?\s*(.+?)(?:\n|$)/i,
    website: /(?:Website|Web|URL|Site|WWW)\s*:?\s*(.+?)(?:\n|$)/i
  };
  
  let foundStructuredData = false;
  
  // Extract company name - look for common business suffixes or clear company indicators
  const companyMatch = text.match(patterns.company) || 
                      text.match(/([A-Z][A-Z\s&]+(?:INC|LLC|CORP|COMPANY|CO|HARDWARE|ELECTRIC|SYSTEMS|INSULATORS)[A-Z\s]*)/i) ||
                      text.match(/^([A-Z][A-Za-z\s&]+(?:Electric|Hardware|Systems|Construction|Depot|Supply))/im);
  if (companyMatch && companyMatch[1] && companyMatch[1].trim().length > 0) {
    const potentialCompany = companyMatch[1].trim();
    // Make sure it's not a product name
    if (!isProductName(potentialCompany)) {
      result.companyName = potentialCompany;
      foundStructuredData = true;
      console.log('📝 Found company:', result.companyName);
    } else {
      console.log('⚠️ Rejected company candidate (is product):', potentialCompany);
    }
  }
  
  // Extract address
  const addressMatch = text.match(patterns.address) ||
                      text.match(/(\d+\s+[A-Z][A-Za-z\s]+(?:DRIVE|STREET|AVENUE|BLVD|ROAD|ST|AVE|DR|RD))/i);
  if (addressMatch && addressMatch[1] && addressMatch[1].trim().length > 0) {
    const fullAddress = addressMatch[1].trim();
    result.address = fullAddress;
    
    // Try to extract city, state, zip from the address
    const { state, zipCode } = extractStateAndZip(text);
    if (state) result.state = state;
    if (zipCode) result.zipCode = zipCode;
    
    // Extract city (word before state)
    if (state) {
      const beforeState = text.split(state)[0].trim();
      const words = beforeState.split(/\s+/);
      if (words.length > 0) {
        const potentialCity = words[words.length - 1];
        if (potentialCity && potentialCity.length > 2) {
          result.city = potentialCity;
        }
      }
    }
    
    foundStructuredData = true;
    console.log('📍 Found address:', result.address);
  }
  
  // Extract contact person - look for names after specific patterns
  const contactMatch = text.match(patterns.contact) ||
                      text.match(/(?:Contact|Attn|Attention):\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i) ||
                      text.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+(?:CELL|Phone|Tel))/i);
  if (contactMatch && contactMatch[1] && contactMatch[1].trim().length > 0) {
    result.contactPerson = contactMatch[1].trim();
    foundStructuredData = true;
    console.log('👤 Found contact:', result.contactPerson);
  }
  
  // Extract phone - enhanced pattern matching
  const phoneMatch = text.match(patterns.phone) ||
                    text.match(/(?:CELL\s*#|Phone|Tel):\s*([0-9\-\(\)\s]+)/i);
  if (phoneMatch && phoneMatch[1] && phoneMatch[1].trim().length > 0) {
    result.phone = phoneMatch[1].trim();
    foundStructuredData = true;
    console.log('📞 Found phone:', result.phone);
  } else {
    // Fall back to regex extraction
    const phone = extractPhone(text);
    if (phone) {
      result.phone = phone;
      foundStructuredData = true;
      console.log('📞 Found phone (regex):', result.phone);
    }
  }
  
  // Extract email
  const emailMatch = text.match(patterns.email);
  if (emailMatch && emailMatch[1] && emailMatch[1].trim().length > 0) {
    result.email = emailMatch[1].trim();
    foundStructuredData = true;
    console.log('📧 Found email:', result.email);
  } else {
    // Fall back to regex extraction
    const email = extractEmail(text);
    if (email) {
      result.email = email;
      foundStructuredData = true;
      console.log('📧 Found email (regex):', result.email);
    }
  }
  
  // Extract website
  const websiteMatch = text.match(patterns.website);
  if (websiteMatch && websiteMatch[1] && websiteMatch[1].trim().length > 0) {
    const website = websiteMatch[1].trim();
    result.website = website.startsWith('http') ? website : `https://${website}`;
    foundStructuredData = true;
    console.log('🌐 Found website:', result.website);
  } else {
    // Fall back to regex extraction
    const website = extractWebsite(text);
    if (website) {
      result.website = website;
      foundStructuredData = true;
      console.log('🌐 Found website (regex):', result.website);
    }
  }
  
  result.hasStructuredData = foundStructuredData;
  console.log('📋 Structured data extraction complete. Found data:', foundStructuredData);
  return result;
}

function analyzeUnstructuredText(text: string, result: EntityClassification): EntityClassification {
  console.log('🔄 Starting unstructured analysis on text:', text.substring(0, 100) + '...');
  let workingText = text;
  
  // Extract email
  const email = extractEmail(workingText);
  if (email) {
    result.email = email;
    workingText = workingText.replace(email, '').trim();
    console.log('📧 Extracted email:', email);
  }
  
  // Extract phone
  const phone = extractPhone(workingText);
  if (phone) {
    result.phone = phone;
    workingText = workingText.replace(phone, '').trim();
    console.log('📞 Extracted phone:', phone);
  }
  
  // Extract website
  const website = extractWebsite(workingText);
  if (website) {
    result.website = website;
    workingText = workingText.replace(website.replace('https://', ''), '').trim();
    console.log('🌐 Extracted website:', website);
  }
  
  // Extract address
  const address = extractAddress(workingText);
  if (address) {
    result.address = address;
    workingText = workingText.replace(address, '').trim();
    console.log('📍 Extracted address:', address);
  }
  
  // Extract state and ZIP
  const { state, zipCode } = extractStateAndZip(workingText);
  if (state) {
    result.state = state;
    console.log('🏛️ Extracted state:', state);
  }
  if (zipCode) {
    result.zipCode = zipCode;
    console.log('📮 Extracted zip:', zipCode);
  }
  if (state || zipCode) {
    const stateZipPattern = state && zipCode ? `${state}\\s+${zipCode}` : state || zipCode;
    workingText = workingText.replace(new RegExp(stateZipPattern, 'i'), '').trim();
  }
  
  // Split remaining text into lines for analysis
  const lines = workingText.split(/\n|;|,/).map(line => line.trim()).filter(line => line.length > 0);
  console.log('📄 Lines to analyze:', lines);
  
  // Look for company name - be more aggressive in finding business names
  let companyName = result.companyName || '';
  if (!companyName) {
    console.log('🔍 Searching for company name in lines...');
    
    // First pass: Look for obvious business names with common indicators
    const businessLines = lines.filter(line => {
      const isObviousBusiness = /(?:INC|LLC|CORP|COMPANY|CO|HARDWARE|ELECTRIC|SYSTEMS|CONSTRUCTION|DEPOT|SUPPLY|MATERIALS|INSULATORS)\b/i.test(line);
      const isNotProduct = !isProductName(line);
      const isNotPerson = !isPersonName(line);
      const isSubstantial = line.length > 5;
      
      console.log(`  Evaluating "${line}": business=${isObviousBusiness}, notProduct=${isNotProduct}, notPerson=${isNotPerson}, substantial=${isSubstantial}`);
      
      return isObviousBusiness && isNotProduct && isNotPerson && isSubstantial;
    });
    
    if (businessLines.length > 0) {
      companyName = businessLines[0];
      console.log('✅ Found company from business indicators:', companyName);
    } else {
      // Second pass: Look for substantial lines that could be company names
      console.log('🔍 No obvious business found, looking for substantial company candidates...');
      const candidateLines = lines.filter(line => {
        const isSubstantial = line.length > 3;
        const isNotProduct = !isProductName(line);
        const isNotPerson = !isPersonName(line);
        const isNotCity = !isCityName(line);
        const hasCapitalization = /^[A-Z]/.test(line);
        
        console.log(`  Candidate "${line}": substantial=${isSubstantial}, notProduct=${isNotProduct}, notPerson=${isNotPerson}, notCity=${isNotCity}, capitalized=${hasCapitalization}`);
        
        return isSubstantial && isNotProduct && isNotPerson && isNotCity && hasCapitalization;
      });
      
      if (candidateLines.length > 0) {
        // Prefer lines with multiple words or business-like terms
        const prioritized = candidateLines.sort((a, b) => {
          const aWords = a.split(/\s+/).length;
          const bWords = b.split(/\s+/).length;
          const aBusinessy = /(?:HARDWARE|ELECTRIC|SYSTEMS|CONSTRUCTION|DEPOT|SUPPLY|MATERIALS)/i.test(a) ? 10 : 0;
          const bBusinessy = /(?:HARDWARE|ELECTRIC|SYSTEMS|CONSTRUCTION|DEPOT|SUPPLY|MATERIALS)/i.test(b) ? 10 : 0;
          return (bWords + bBusinessy) - (aWords + aBusinessy);
        });
        
        companyName = prioritized[0];
        console.log('✅ Found company from candidates:', companyName);
      }
    }
  }
  
  // Analyze each line to categorize content
  const products: string[] = [];
  const services: string[] = [];
  let contactPerson = '';
  let cityName = '';
  const notes: string[] = [];
  
  for (const line of lines) {
    if (line.length < 3) continue;
    
    console.log(`🔍 Analyzing line: "${line}"`);
    
    // Check for contact person (with context indicators)
    if (isContactReference(line) || (isPersonName(line) && !companyName)) {
      if (!contactPerson) {
        // Extract the actual name from contact references
        const nameMatch = line.match(/(?:Contact|Attn|Attention):\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i) || 
                         line.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/);
        if (nameMatch) {
          contactPerson = nameMatch[1] || nameMatch[0];
          console.log('👤 Found contact person:', contactPerson);
        }
      }
    }
    // Check for city name
    else if (isCityName(line) && !cityName && !companyName.toLowerCase().includes(line.toLowerCase())) {
      cityName = line;
      console.log('🏙️ Found city:', cityName);
    }
    // Check for product information
    else if (containsProductInfo(line)) {
      products.push(line);
      console.log('📦 Added to products:', line);
    }
    // Check for service information
    else if (containsServiceInfo(line)) {
      services.push(line);
      console.log('🔧 Added to services:', line);
    }
    // Everything else goes to notes (less restrictive)
    else if (line !== companyName && line !== contactPerson && line !== cityName) {
      notes.push(line);
      console.log('📝 Added to notes:', line);
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
  
  // Assign results - ensure we ALWAYS have at least a company name from the text
  if (!companyName && lines.length > 0) {
    // Last resort: use the first substantial line as company name
    const firstSubstantialLine = lines.find(line => line.length > 3 && !/^\d+$/.test(line));
    if (firstSubstantialLine) {
      companyName = firstSubstantialLine;
      console.log('🚨 Using first substantial line as company name:', companyName);
    } else {
      companyName = 'Unknown Vendor';
      console.log('🚨 No company name found, using fallback');
    }
  }
  
  result.companyName = companyName;
  result.contactPerson = contactPerson;
  result.products = products.length > 0 ? products : undefined;
  result.services = services.length > 0 ? services : undefined;
  result.notes = notes.length > 0 ? notes.join('; ') : undefined;
  
  console.log('🎯 Final vendor data from unstructured analysis:', {
    companyName: result.companyName,
    contactPerson: result.contactPerson,
    email: result.email,
    phone: result.phone,
    address: result.address,
    city: result.city,
    state: result.state,
    zipCode: result.zipCode,
    products: result.products,
    services: result.services,
    notes: result.notes
  });
  
  return result;
}
