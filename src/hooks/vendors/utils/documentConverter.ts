
/**
 * Converts DOCX files to images for better AI Vision processing
 */
export const convertDocxToImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Create a canvas to render the document content
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size for document-like dimensions
        canvas.width = 800;
        canvas.height = 1100; // A4-like ratio
        
        if (!ctx) {
          throw new Error('Cannot create canvas context');
        }
        
        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Extract text content from DOCX (simplified)
        const text = await extractTextFromDocx(arrayBuffer);
        
        // Render text on canvas
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        
        const lines = text.split('\n');
        const lineHeight = 16;
        let y = 30;
        
        for (const line of lines) {
          if (y > canvas.height - 30) break; // Stop if we run out of space
          
          // Wrap long lines
          const words = line.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > canvas.width - 60 && currentLine !== '') {
              ctx.fillText(currentLine, 30, y);
              currentLine = word + ' ';
              y += lineHeight;
              
              if (y > canvas.height - 30) break;
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine && y <= canvas.height - 30) {
            ctx.fillText(currentLine, 30, y);
            y += lineHeight;
          }
        }
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const imageFile = new File([blob], file.name.replace(/\.(docx|doc)$/i, '.png'), {
              type: 'image/png'
            });
            resolve(imageFile);
          } else {
            reject(new Error('Failed to create image from document'));
          }
        }, 'image/png');
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read document file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Simple DOCX text extraction (basic implementation)
 */
const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
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
