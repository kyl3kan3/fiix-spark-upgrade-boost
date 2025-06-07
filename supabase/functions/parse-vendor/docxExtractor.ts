
export function extractTextFromDocx(arrayBuffer: ArrayBuffer): string {
  try {
    // Convert ArrayBuffer to Uint8Array for processing
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // DOCX files are ZIP archives, we need to find and extract document.xml
    const zipData = uint8Array;
    
    // Look for the document.xml file signature in the ZIP
    const documentXmlStart = findSequence(zipData, new TextEncoder().encode('word/document.xml'));
    
    if (documentXmlStart === -1) {
      console.log('[DOCX Extractor] Could not find document.xml in ZIP structure');
      return extractFallbackText(zipData);
    }
    
    // Find the actual XML content after the ZIP headers
    let xmlStartPos = documentXmlStart;
    
    // Look for XML declaration or document start
    const xmlPatterns = [
      new TextEncoder().encode('<?xml'),
      new TextEncoder().encode('<w:document'),
      new TextEncoder().encode('<document')
    ];
    
    let xmlContent = '';
    let foundXml = false;
    
    // Search for XML content in a reasonable range after finding the file reference
    for (let i = xmlStartPos; i < Math.min(zipData.length, xmlStartPos + 50000); i++) {
      const slice = zipData.slice(i, Math.min(i + 10000, zipData.length));
      const text = new TextDecoder('utf-8', { fatal: false }).decode(slice);
      
      if (text.includes('<w:document') || text.includes('<?xml')) {
        // Found XML content, extract it
        const xmlStart = text.indexOf('<');
        if (xmlStart !== -1) {
          const xmlPart = text.substring(xmlStart);
          const xmlEnd = xmlPart.lastIndexOf('>');
          if (xmlEnd !== -1) {
            xmlContent = xmlPart.substring(0, xmlEnd + 1);
            foundXml = true;
            break;
          }
        }
      }
    }
    
    if (!foundXml || !xmlContent) {
      console.log('[DOCX Extractor] Could not extract XML content, using fallback');
      return extractFallbackText(zipData);
    }
    
    console.log(`[DOCX Extractor] Found XML content, length: ${xmlContent.length}`);
    
    // Extract text from the XML content
    const extractedText = extractTextFromXml(xmlContent);
    
    if (extractedText.length < 50) {
      console.log('[DOCX Extractor] Extracted text too short, using fallback');
      return extractFallbackText(zipData);
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('[DOCX Extractor] Error:', error);
    return extractFallbackText(new Uint8Array(arrayBuffer));
  }
}

function findSequence(data: Uint8Array, sequence: Uint8Array): number {
  for (let i = 0; i <= data.length - sequence.length; i++) {
    let found = true;
    for (let j = 0; j < sequence.length; j++) {
      if (data[i + j] !== sequence[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}

function extractTextFromXml(xmlContent: string): string {
  try {
    // Extract text from <w:t> tags (Word text elements)
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    let extractedText = '';
    
    if (textMatches) {
      for (const match of textMatches) {
        const textContent = match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1');
        if (textContent.trim()) {
          extractedText += textContent + ' ';
        }
      }
    }
    
    // Also try to extract from any other text-containing elements
    const generalTextMatches = xmlContent.match(/>([^<]+)</g);
    if (generalTextMatches && extractedText.length < 100) {
      for (const match of generalTextMatches) {
        const text = match.replace(/^>([^<]+)<$/, '$1').trim();
        if (text.length > 3 && 
            !text.includes('xml') && 
            !text.includes('w:') &&
            /[a-zA-Z]/.test(text)) {
          extractedText += text + ' ';
        }
      }
    }
    
    return extractedText.trim();
  } catch (error) {
    console.error('[DOCX Extractor] XML parsing error:', error);
    return '';
  }
}

function extractFallbackText(zipData: Uint8Array): string {
  try {
    // Fallback: Look for readable text patterns in the raw data
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(zipData);
    
    // Split into chunks and look for readable text
    const lines = content.split(/[\r\n]+/);
    const readableLines = [];
    
    for (const line of lines) {
      const cleanLine = line
        .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII
        .replace(/\s+/g, ' ')
        .trim();
      
      // Look for lines that contain business/vendor information
      if (cleanLine.length > 15 && 
          (cleanLine.includes('@') || // emails
           cleanLine.match(/\b[A-Z][A-Za-z\s&.,'-]{8,60}\b/) || // company names
           cleanLine.match(/\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/) || // phone numbers
           cleanLine.includes('Inc') || cleanLine.includes('LLC') ||
           cleanLine.includes('Corp') || cleanLine.includes('Company') ||
           cleanLine.includes('Street') || cleanLine.includes('Ave') ||
           cleanLine.match(/\b\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive)\b/i))) {
        readableLines.push(cleanLine);
      }
    }
    
    const result = readableLines.slice(0, 100).join('\n'); // Limit to prevent too much data
    console.log(`[DOCX Extractor] Fallback extraction found ${readableLines.length} readable lines`);
    
    return result || 'No readable text found in document';
  } catch (error) {
    console.error('[DOCX Extractor] Fallback extraction error:', error);
    return 'Error extracting text from document';
  }
}
