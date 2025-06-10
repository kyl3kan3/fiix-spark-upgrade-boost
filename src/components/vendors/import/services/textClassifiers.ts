
import {
  COMPANY_INDICATORS,
  PRODUCT_INDICATORS,
  SERVICE_INDICATORS,
  CONTACT_INDICATORS,
  CITY_INDICATORS,
  COMMON_CITIES
} from './constants';

export function isCompanyName(text: string): boolean {
  const upperText = text.toUpperCase();
  const lowerText = text.toLowerCase();
  
  // Check if it contains company indicators
  const hasCompanyIndicator = COMPANY_INDICATORS.some(indicator => 
    upperText.includes(indicator.toUpperCase())
  ) || /\b(INC|LLC|CORP|LTD|CO)\b/i.test(text);
  
  // Check if it's a common city name (only single words that are exactly city names)
  const isExactCityMatch = COMMON_CITIES.some(city => 
    lowerText.trim() === city
  );
  
  // Check if it has city context indicators
  const hasCityContext = CITY_INDICATORS.some(indicator => 
    lowerText.includes(indicator)
  );
  
  // If it has company indicators, it's likely a company
  if (hasCompanyIndicator) {
    return true;
  }
  
  // If it's an exact city match without any company context, it's not a company
  if (isExactCityMatch && !hasCompanyIndicator) {
    return false;
  }
  
  // If it has city context, it's not a company
  if (hasCityContext) {
    return false;
  }
  
  // For multi-word phrases, be more lenient (likely company names)
  const words = text.trim().split(/\s+/);
  if (words.length > 1 && text.length > 10) {
    return true;
  }
  
  return false;
}

export function isPersonName(text: string): boolean {
  // Check if it's a typical person name pattern (First Last or First Middle Last)
  const namePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/;
  return namePattern.test(text.trim()) && !isCompanyName(text);
}

export function containsProductInfo(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PRODUCT_INDICATORS.some(indicator => lowerText.includes(indicator));
}

export function containsServiceInfo(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SERVICE_INDICATORS.some(indicator => lowerText.includes(indicator));
}

export function isContactReference(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CONTACT_INDICATORS.some(indicator => lowerText.includes(indicator));
}

export function isCityName(text: string): boolean {
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
