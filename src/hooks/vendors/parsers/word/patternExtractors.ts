
export const extractEmail = (text: string): string | null => {
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return emailMatch ? emailMatch[1] : null;
};

export const extractPhone = (text: string): string | null => {
  const phoneMatch = text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  return phoneMatch ? phoneMatch[1] : null;
};

export const extractWebsite = (text: string): string | null => {
  const websiteMatch = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
  return websiteMatch ? websiteMatch[1] : null;
};

export const isCompanyName = (line: string): boolean => {
  if (line.length < 2 || line.length > 100) return false;
  
  // Look for company indicators or capitalized words
  return !!(line.match(/^[A-Z][a-zA-Z\s&.,'-]+$/) || 
           line.match(/(inc|llc|corp|ltd|company|services|solutions|group)/i));
};
