
/**
 * Simple DOCX text extraction (basic implementation)
 */
export const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    
    // Convert to string and look for XML content
    const content = decoder.decode(uint8Array);
    
    // Find document.xml content (the main document content in DOCX)
    const documentXmlMatch = content.match(/word\/document\.xml.*?<w:document[^>]*>(.*?)<\/w:document>/s);
    let textContent = '';
    
    if (documentXmlMatch) {
      const xmlContent = documentXmlMatch[1];
      // Extract text from XML tags, specifically <w:t> tags which contain text
      const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatches) {
        textContent = textMatches
          .map(match => match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1'))
          .join(' ');
      }
    }
    
    // If no structured content found, try to extract any readable text
    if (!textContent || textContent.length < 50) {
      const lines = content.split(/[\r\n]+/);
      const readableLines = [];
      
      for (const line of lines) {
        // Look for lines with readable ASCII text that might contain vendor info
        const cleanLine = line
          .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII
          .replace(/\s+/g, ' ')
          .trim();
        
        // Only include lines that look like they contain meaningful text
        if (cleanLine.length > 10 && 
            (cleanLine.includes('@') || // emails
             cleanLine.match(/\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/) || // phone numbers
             cleanLine.match(/\b[A-Z][A-Za-z\s&.,]{5,50}\b/) || // company-like names
             cleanLine.includes('Inc') || cleanLine.includes('LLC') ||
             cleanLine.includes('Corp') || cleanLine.includes('Company') ||
             cleanLine.match(/\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard)/i))) { // addresses
          readableLines.push(cleanLine);
        }
      }
      
      textContent = readableLines.join('\n');
    }
    
    return textContent || 'No readable text found in document';
  } catch (error) {
    console.error('DOCX text extraction error:', error);
    return 'Error extracting text from document';
  }
};
