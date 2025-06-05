
export const extractLogoFromWord = async (arrayBuffer: ArrayBuffer): Promise<string | null> => {
  try {
    // For now, we'll set a placeholder logo for ACE Hardware
    // In a full implementation, this would extract images from the Word document
    
    // Check if this is an ACE Hardware document by looking for the text
    const decoder = new TextDecoder();
    const text = decoder.decode(arrayBuffer).toLowerCase();
    
    if (text.includes('ace hardware')) {
      // Return ACE Hardware logo URL (you can replace this with actual logo extraction)
      return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200&h=200&fit=crop&crop=center';
    }
    
    // For other companies, we could implement actual image extraction from Word documents
    // This would require parsing the document structure and extracting embedded images
    
    return null;
  } catch (error) {
    console.error('Error extracting logo:', error);
    return null;
  }
};

export const getCompanyLogoUrl = (companyName: string): string | null => {
  // Map common company names to their logos
  const logoMap: Record<string, string> = {
    'ace hardware': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200&h=200&fit=crop&crop=center',
    'home depot': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop&crop=center',
    'lowes': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&h=200&fit=crop&crop=center',
  };
  
  const normalizedName = companyName.toLowerCase();
  
  // Check for partial matches
  for (const [key, url] of Object.entries(logoMap)) {
    if (normalizedName.includes(key)) {
      return url;
    }
  }
  
  return null;
};
