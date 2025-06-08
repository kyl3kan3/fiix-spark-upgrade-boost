
export function extractEmail(text: string): string | undefined {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  return emailMatch ? emailMatch[0] : undefined;
}

export function extractPhone(text: string): string | undefined {
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\d{10})/);
  return phoneMatch ? phoneMatch[0] : undefined;
}

export function extractWebsite(text: string): string | undefined {
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
  if (websiteMatch && !websiteMatch[0].includes('@')) {
    return websiteMatch[0].startsWith('http') ? websiteMatch[0] : `https://${websiteMatch[0]}`;
  }
  return undefined;
}

export function extractAddress(text: string): string | undefined {
  const addressMatch = text.match(/\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Circle|Cir|Parkway|Pkwy)\b/i);
  return addressMatch ? addressMatch[0].trim() : undefined;
}

export function extractStateAndZip(text: string): { state?: string; zipCode?: string } {
  const stateZipMatch = text.match(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/);
  if (stateZipMatch) {
    const parts = stateZipMatch[0].split(/\s+/);
    return {
      state: parts[0],
      zipCode: parts[1]
    };
  }
  return {};
}
