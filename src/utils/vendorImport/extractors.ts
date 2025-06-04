
import { sanitizeText } from './textSanitizer';

export const extractEmail = (text: string): string | null => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? sanitizeText(match[0]) : null;
};

export const extractPhone = (text: string): string | null => {
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? sanitizeText(match[0]) : null;
};

export const extractWebsite = (text: string): string | null => {
  const websiteRegex = /(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/;
  const match = text.match(websiteRegex);
  return match ? sanitizeText(match[0]) : null;
};
