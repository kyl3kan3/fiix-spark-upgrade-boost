
// Service for analyzing and categorizing text content
export interface EntityClassification {
  companyName?: string;
  contactPerson?: string;
  products?: string[];
  services?: string[];
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  rawText: string;
}

// Common company suffixes and indicators
const COMPANY_INDICATORS = [
  'Inc', 'LLC', 'Corp', 'Corporation', 'Company', 'Co', 'Ltd', 'Limited',
  'LLP', 'LP', 'PC', 'Professional', 'Associates', 'Group', 'Enterprises',
  'Solutions', 'Services', 'Systems', 'Technologies', 'Tech', 'Consulting',
  'Hardware', 'Supply', 'Supplies', 'Equipment', 'Store', 'Shop', 'Center',
  'Depot', 'Mart', 'Market', 'Industries', 'Manufacturing', 'Construction'
];

// Product/service indicators
const PRODUCT_INDICATORS = [
  'supply', 'supplies', 'equipment', 'tools', 'parts', 'materials',
  'products', 'items', 'inventory', 'stock', 'goods', 'merchandise',
  'purchase', 'purchased', 'order', 'ordered', 'buy', 'bought'
];

// Service indicators
const SERVICE_INDICATORS = [
  'service', 'services', 'maintenance', 'repair', 'installation',
  'consulting', 'support', 'management', 'cleaning', 'security',
  'delivery', 'transportation', 'logistics', 'training', 'design'
];

// Contact person indicators
const CONTACT_INDICATORS = [
  'contact', 'attn', 'attention', 'rep', 'representative', 'manager',
  'director', 'coordinator', 'specialist', 'agent', 'sales', 'account'
];

// Common city patterns that should NOT be company names
const CITY_INDICATORS = [
  'of', 'in', 'at', 'located', 'city', 'town', 'village', 'township'
];

// Common US city names that should be recognized as cities, not companies
const COMMON_CITIES = [
  'freeburg', 'chicago', 'new york', 'los angeles', 'houston', 'phoenix',
  'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
  'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte',
  'seattle', 'denver', 'boston', 'detroit', 'nashville', 'memphis',
  'portland', 'oklahoma city', 'las vegas', 'baltimore', 'milwaukee',
  'atlanta', 'colorado springs', 'raleigh', 'omaha', 'miami',
  'cleveland', 'tulsa', 'arlington', 'new orleans', 'wichita'
];

function isCompanyName(text: string): boolean {
  const upperText = text.toUpperCase();
  const lowerText = text.toLowerCase();
  
  // Check if it contains company indicators
  const hasCompanyIndicator = COMPANY_INDICATORS.some(indicator => 
    upperText.includes(indicator.toUpperCase())
  ) || /\b(INC|LLC|CORP|LTD|CO)\b/i.test(text);
  
  // Check if it's a common city name
  const isCommonCity = COMMON_CITIES.some(city => 
    lowerText === city || lowerText.includes(city)
  );
  
  // Check if it has city context indicators
  const hasCityContext = CITY_INDICATORS.some(indicator => 
    lowerText.includes(indicator)
  );
  
  // Return true only if it has company indicators and is not a city
  return hasCompanyIndicator && !isCommonCity && !hasCityContext;
}

function isPersonName(text: string): boolean {
  // Check if it's a typical person name pattern (First Last or First Middle Last)
  const namePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/;
  return namePattern.test(text.trim()) && !isCompanyName(text);
}

function containsProductInfo(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PRODUCT_INDICATORS.some(indicator => lowerText.includes(indicator));
}

function containsServiceInfo(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SERVICE_INDICATORS.some(indicator => lowerText.includes(indicator));
}

function isContactReference(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CONTACT_INDICATORS.some(indicator => lowerText.includes(indicator));
}

function isCityName(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check if it's a common city name
  const isCommonCity = COMMON_CITIES.some(city => 
    lowerText === city || (city.length > 3 && lowerText.includes(city))
  );
  
  // Check if it has city context indicators
  const hasCityContext = CITY_INDICATORS.some(indicator => 
    lowerText.includes(indicator)
  );
  
  // Check if it's a single word that could be a city (but not obviously a company)
  const isSingleWordCity = /^[A-Z][a-z]+$/.test(text.trim()) && 
    !isCompanyName(text) && 
    !isPersonName(text);
  
  return isCommonCity || hasCityContext || (isSingleWordCity && text.length > 2);
}

export function analyzeAndCategorizeText(text: string): EntityClassification {
  const result: EntityClassification = { rawText: text };
  let workingText = text;
  
  // Extract email
  const emailMatch = workingText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    result.email = emailMatch[0];
    workingText = workingText.replace(emailMatch[0], '').trim();
  }
  
  // Extract phone
  const phoneMatch = workingText.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\d{10})/);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
    workingText = workingText.replace(phoneMatch[0], '').trim();
  }
  
  // Extract website
  const websiteMatch = workingText.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
  if (websiteMatch && !websiteMatch[0].includes('@')) {
    result.website = websiteMatch[0].startsWith('http') ? websiteMatch[0] : `https://${websiteMatch[0]}`;
    workingText = workingText.replace(websiteMatch[0], '').trim();
  }
  
  // Extract address
  const addressMatch = workingText.match(/\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Circle|Cir|Parkway|Pkwy)\b/i);
  if (addressMatch) {
    result.address = addressMatch[0].trim();
    workingText = workingText.replace(addressMatch[0], '').trim();
  }
  
  // Extract state and ZIP
  const stateZipMatch = workingText.match(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/);
  if (stateZipMatch) {
    const parts = stateZipMatch[0].split(/\s+/);
    result.state = parts[0];
    result.zipCode = parts[1];
    workingText = workingText.replace(stateZipMatch[0], '').trim();
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
    // Check for company name (must have clear company indicators)
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
      line.length > 5 && 
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
