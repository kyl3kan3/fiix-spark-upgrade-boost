
import {
 COMPANY_INDICATORS,
 PRODUCT_INDICATORS,
 SERVICE_INDICATORS,
 CONTACT_INDICATORS,
 CITY_INDICATORS,
 COMMON_CITIES
} from './constants';

// Unambiguous catalog headings are not company identities.
export function isProductHeading(text: string): boolean {
 return /^(?:\d+\s+)?(?:pipe fittings?|spare parts?|building materials?|products?|inventory|items?|repair services?)$/i.test(text.trim());
}

export function isCompanyName(text: string): boolean {
 if (isProductHeading(text)) return false;
 if (/^\d+\s/.test(text) || !/[\p{L}]/u.test(text)) return false;
 const lowerText = text.toLowerCase();
 
 // Check if it contains company indicators
 const hasCompanyIndicator = COMPANY_INDICATORS.some(indicator => 
 new RegExp('\\b' + indicator + '\\b', 'i').test(text)
 ) || /\b(INC|LLC|CORP|LTD|CO)\b/i.test(text);
 
 // Check if it's a common city name (only single words that are exactly city names)
 const isExactCityMatch = COMMON_CITIES.some(city => 
 lowerText.trim() === city
 );
 
 // Check if it has city context indicators
 const hasCityContext = CITY_INDICATORS.some(indicator => 
 new RegExp('\\b' + indicator + '\\b', 'i').test(text)
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
 
 if (/^[A-Z]{2,}$/.test(text.trim())) return true;

 // For multi-word phrases, be more lenient (likely company names)
 const words = text.trim().split(/\s+/);
 if (words.length > 1 && (text.length > 10 || /^(?:vendor|supplier|company)\s+\S+/i.test(text) || /\b[A-Z]{2,}\b/.test(text))) {
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
 return PRODUCT_INDICATORS.some(indicator => new RegExp('\\b' + indicator + '\\b', 'i').test(text));
}

export function containsServiceInfo(text: string): boolean {
 return SERVICE_INDICATORS.some(indicator => new RegExp('\\b' + indicator + '\\b', 'i').test(text));
}

export function isContactReference(text: string): boolean {
 return CONTACT_INDICATORS.some(indicator => new RegExp('\\b' + indicator + '\\b', 'i').test(text));
}

export function isCityName(text: string): boolean {
 const lowerText = text.toLowerCase();
 
 // Check if it's a common city name
 const isCommonCity = COMMON_CITIES.some(city => 
 lowerText.trim() === city
 );
 
 return isCommonCity || /^(?:city|town|village|township)\s*(?:of|:)\s+\S/i.test(text.trim());
}
