import { isCompanyName, isCityName, isPersonName } from '../../services/textClassifiers';
import { extractPhone, extractEmail, extractWebsite, extractAddress } from '../../services/textExtractors';

function isNameLine(line: string): boolean {
  if (line.includes(':') || extractPhone(line) || extractEmail(line) || extractWebsite(line) || extractAddress(line)) return false;
  return isCompanyName(line) || (/^[\p{L}][\p{L}&'.-]+$/u.test(line) && !isCityName(line) && !isPersonName(line));
}

// Split only the supplied text. Preserve contact fields across Word paragraphs.
export function splitTextIntoSections(text: string, _pageTexts: string[], expectedCount?: number, instructions?: string): string[] {
  if (!text.trim()) return [];
  if (expectedCount === 1) return [text.trim()];
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (/one vendor per line|each line (?:is|contains|has) (?:a|one) vendor/i.test(instructions || '') ||
      (lines.length > 1 && lines.every(isNameLine))) return lines;
  const paragraphs = text.split(/\n[ \t]*\n/).map(section => section.trim()).filter(Boolean);
  const sections: string[] = [];
  for (const paragraph of paragraphs) {
    const firstLine = paragraph.split('\n')[0].trim();
    const startsVendor = isNameLine(firstLine) || /^(?:company|business|organization|name)\s*[:=]/i.test(firstLine);
    if (!sections.length || startsVendor) sections.push(paragraph);
    else sections[sections.length - 1] += '\n' + paragraph;
  }
  return sections;
}
