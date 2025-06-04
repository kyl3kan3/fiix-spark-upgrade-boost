
// Helper function to sanitize text for database storage
export const sanitizeText = (text: string | null | undefined): string | null => {
  if (!text) return null;
  
  // Remove null characters and other problematic Unicode characters
  return text
    .replace(/\u0000/g, '') // Remove null characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control characters
    .trim() || null;
};
