
export function extractTextFromDocx(arrayBuffer: ArrayBuffer): string {
  try {
    console.log('[DOCX Extractor] Starting extraction from ArrayBuffer');
    
    // Convert ArrayBuffer to Uint8Array for processing
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // DOCX files are ZIP archives - we need to find and parse the central directory
    const zipData = uint8Array;
    
    // Look for the End of Central Directory Record (ZIP file signature: 0x06054b50)
    const eocdSignature = new Uint8Array([0x50, 0x4b, 0x05, 0x06]);
    let eocdIndex = -1;
    
    // Search from the end of the file backwards (EOCD is typically at the end)
    for (let i = zipData.length - 22; i >= 0; i--) {
      if (zipData[i] === eocdSignature[0] && 
          zipData[i + 1] === eocdSignature[1] && 
          zipData[i + 2] === eocdSignature[2] && 
          zipData[i + 3] === eocdSignature[3]) {
        eocdIndex = i;
        break;
      }
    }
    
    if (eocdIndex === -1) {
      console.log('[DOCX Extractor] No ZIP End of Central Directory found');
      return extractFallbackText(zipData);
    }
    
    console.log('[DOCX Extractor] Found EOCD at index:', eocdIndex);
    
    // Read central directory offset from EOCD
    const centralDirOffset = new DataView(zipData.buffer, eocdIndex + 16, 4).getUint32(0, true);
    console.log('[DOCX Extractor] Central directory offset:', centralDirOffset);
    
    // Parse central directory to find document.xml
    let documentXmlOffset = -1;
    let documentXmlCompressedSize = 0;
    let documentXmlUncompressedSize = 0;
    
    let currentOffset = centralDirOffset;
    
    while (currentOffset < eocdIndex) {
      // Check for Central Directory File Header signature (0x02014b50)
      const signature = new DataView(zipData.buffer, currentOffset, 4).getUint32(0, true);
      if (signature !== 0x02014b50) {
        break;
      }
      
      // Read file info from central directory entry
      const compressedSize = new DataView(zipData.buffer, currentOffset + 20, 4).getUint32(0, true);
      const uncompressedSize = new DataView(zipData.buffer, currentOffset + 24, 4).getUint32(0, true);
      const fileNameLength = new DataView(zipData.buffer, currentOffset + 28, 2).getUint16(0, true);
      const extraFieldLength = new DataView(zipData.buffer, currentOffset + 30, 2).getUint16(0, true);
      const fileCommentLength = new DataView(zipData.buffer, currentOffset + 32, 2).getUint16(0, true);
      const relativeOffset = new DataView(zipData.buffer, currentOffset + 42, 4).getUint32(0, true);
      
      // Extract filename
      const filenameBytes = zipData.slice(currentOffset + 46, currentOffset + 46 + fileNameLength);
      const filename = new TextDecoder('utf-8').decode(filenameBytes);
      
      console.log('[DOCX Extractor] Found file:', filename);
      
      if (filename === 'word/document.xml') {
        documentXmlOffset = relativeOffset;
        documentXmlCompressedSize = compressedSize;
        documentXmlUncompressedSize = uncompressedSize;
        console.log('[DOCX Extractor] Found document.xml at offset:', documentXmlOffset);
        break;
      }
      
      // Move to next central directory entry
      currentOffset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
    }
    
    if (documentXmlOffset === -1) {
      console.log('[DOCX Extractor] document.xml not found in central directory');
      return extractFallbackText(zipData);
    }
    
    // Read the local file header to get the actual data offset
    const localHeaderSignature = new DataView(zipData.buffer, documentXmlOffset, 4).getUint32(0, true);
    if (localHeaderSignature !== 0x04034b50) {
      console.log('[DOCX Extractor] Invalid local file header signature');
      return extractFallbackText(zipData);
    }
    
    const localFileNameLength = new DataView(zipData.buffer, documentXmlOffset + 26, 2).getUint16(0, true);
    const localExtraFieldLength = new DataView(zipData.buffer, documentXmlOffset + 28, 2).getUint16(0, true);
    
    const dataOffset = documentXmlOffset + 30 + localFileNameLength + localExtraFieldLength;
    const xmlData = zipData.slice(dataOffset, dataOffset + documentXmlCompressedSize);
    
    console.log('[DOCX Extractor] Extracted XML data, size:', xmlData.length);
    
    // Try to decode the XML (it might be compressed or uncompressed)
    let xmlContent = '';
    try {
      // First try to decode as UTF-8 (uncompressed)
      xmlContent = new TextDecoder('utf-8').decode(xmlData);
      
      // Check if it looks like valid XML
      if (!xmlContent.includes('<?xml') && !xmlContent.includes('<w:document')) {
        console.log('[DOCX Extractor] Data appears to be compressed, trying deflate');
        // If it doesn't look like XML, it's probably compressed
        // For now, we'll use a simple approach and fall back to pattern matching
        return extractFallbackText(zipData);
      }
    } catch (error) {
      console.log('[DOCX Extractor] Error decoding XML:', error);
      return extractFallbackText(zipData);
    }
    
    console.log('[DOCX Extractor] Successfully decoded XML, length:', xmlContent.length);
    console.log('[DOCX Extractor] XML sample:', xmlContent.substring(0, 200));
    
    // Extract text from the XML content
    const extractedText = extractTextFromXml(xmlContent);
    
    if (extractedText.length < 50) {
      console.log('[DOCX Extractor] Extracted text too short, using fallback');
      return extractFallbackText(zipData);
    }
    
    console.log('[DOCX Extractor] Successfully extracted text, length:', extractedText.length);
    return extractedText;
    
  } catch (error) {
    console.error('[DOCX Extractor] Error:', error);
    return extractFallbackText(new Uint8Array(arrayBuffer));
  }
}

function extractTextFromXml(xmlContent: string): string {
  try {
    console.log('[DOCX Extractor] Extracting text from XML');
    
    // Extract text from <w:t> tags (Word text elements)
    const textPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    const textMatches = [];
    let match;
    
    while ((match = textPattern.exec(xmlContent)) !== null) {
      const textContent = match[1];
      if (textContent && textContent.trim()) {
        textMatches.push(textContent.trim());
      }
    }
    
    console.log('[DOCX Extractor] Found', textMatches.length, 'text elements');
    
    if (textMatches.length > 0) {
      const result = textMatches.join(' ');
      console.log('[DOCX Extractor] Extracted text sample:', result.substring(0, 200));
      return result;
    }
    
    // Fallback: try to extract any text content between tags
    const fallbackPattern = />([^<]+)</g;
    const fallbackMatches = [];
    
    while ((match = fallbackPattern.exec(xmlContent)) !== null) {
      const text = match[1].trim();
      if (text.length > 3 && 
          !text.includes('xml') && 
          !text.includes('w:') &&
          /[a-zA-Z]/.test(text)) {
        fallbackMatches.push(text);
      }
    }
    
    console.log('[DOCX Extractor] Fallback found', fallbackMatches.length, 'text elements');
    return fallbackMatches.slice(0, 500).join(' '); // Limit to prevent too much noise
    
  } catch (error) {
    console.error('[DOCX Extractor] XML parsing error:', error);
    return '';
  }
}

function extractFallbackText(zipData: Uint8Array): string {
  try {
    console.log('[DOCX Extractor] Using fallback text extraction');
    
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
