
export function extractEmail(text: string): string | undefined {
 for (const token of text.split(/\s+/)) {
   if (token.length > 254) continue;
   const candidate = token.replace(/^[<(]+|[>),;]+$/g, '');
   if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(candidate)) return candidate;
 }
 return undefined;
}

export function extractPhone(text: string): string | undefined {
 const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\d{10})/);
 return phoneMatch ? phoneMatch[0] : undefined;
}

export function extractWebsite(text: string): string | undefined {
 for (const token of text.split(/\s+/)) {
   if (token.length > 2048 || token.includes('@')) continue;
   if (/^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/.test(token)) {
     return /^https?:/.test(token) ? token : `https://${token}`;
   }
 }
 return undefined;
}

export function extractAddress(text: string): string | undefined {
 // Bounded token scans avoid restarting a greedy suffix search at every digit.
 const suffix = /^(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Circle|Cir|Parkway|Pkwy)[.,]?$/i;
 for (const line of text.split(/\r?\n/)) {
   const words = line.trim().split(/\s+/);
   for (let start = 0; start < words.length; start++) {
     if (!/^\d{1,10}[A-Za-z]?$/.test(words[start])) continue;
     for (let end = start + 2; end < Math.min(start + 22, words.length); end++) {
       if (suffix.test(words[end])) return words.slice(start, end + 1).join(' ');
     }
   }
 }
 return undefined;
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
