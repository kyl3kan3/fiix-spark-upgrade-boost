import mammoth from 'mammoth';
import { analyzeAndCategorizeText, EntityClassification } from '../services/textAnalysisService';

// Convert EntityClassification to vendor format
function entityToVendor(entity: EntityClassification): any {
  const vendor: any = {
    name: entity.companyName || 'Unnamed Vendor',
    email: entity.email,
    phone: entity.phone,
    website: entity.website,
    address: entity.address,
    city: entity.city,
    state: entity.state,
    zip_code: entity.zipCode,
    contact_person: entity.contactPerson,
    vendor_type: 'service',
    status: 'active',
    raw_text: entity.rawText
  };
  
  // Combine products, services, and notes into a description
  const descriptionParts = [];
  if (entity.products && entity.products.length > 0) {
    descriptionParts.push(`Products: ${entity.products.join(', ')}`);
  }
  if (entity.services && entity.services.length > 0) {
    descriptionParts.push(`Services: ${entity.services.join(', ')}`);
  }
  if (entity.notes) {
    descriptionParts.push(`Notes: ${entity.notes}`);
  }
  
  if (descriptionParts.length > 0) {
    vendor.description = descriptionParts.join(' | ');
  }
  
  return vendor;
}

export async function parseDOCX(file: File, expectedCount?: number): Promise<any[]> {
  const data = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: data });
  
  const text = result.value.trim();
  
  // If expecting 1 vendor, treat entire document as single vendor
  if (expectedCount === 1) {
    const entity = analyzeAndCategorizeText(text);
    return [entityToVendor(entity)];
  }
  
  // Split by double line breaks first to respect document structure
  let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
  
  // If no clear paragraphs, try single line breaks but keep substantial content together
  if (paragraphs.length <= 1) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Group consecutive short lines together
    paragraphs = [];
    let currentGroup = '';
    
    for (const line of lines) {
      if (line.length < 100 && currentGroup.length < 300) {
        currentGroup += (currentGroup ? ' ' : '') + line;
      } else {
        if (currentGroup) {
          paragraphs.push(currentGroup);
        }
        currentGroup = line;
      }
    }
    
    if (currentGroup) {
      paragraphs.push(currentGroup);
    }
  }
  
  // If we have an expected count, try to match it
  if (expectedCount && expectedCount > 1) {
    if (paragraphs.length > expectedCount) {
      // Too many paragraphs - combine smallest ones
      while (paragraphs.length > expectedCount && paragraphs.length > 1) {
        // Find two shortest adjacent paragraphs to combine
        let minIndex = 0;
        let minLength = paragraphs[0].length + paragraphs[1].length;
        
        for (let i = 0; i < paragraphs.length - 1; i++) {
          const combinedLength = paragraphs[i].length + paragraphs[i + 1].length;
          if (combinedLength < minLength) {
            minLength = combinedLength;
            minIndex = i;
          }
        }
        
        // Combine the two paragraphs
        paragraphs[minIndex] = paragraphs[minIndex] + ' ' + paragraphs[minIndex + 1];
        paragraphs.splice(minIndex + 1, 1);
      }
    } else if (paragraphs.length < expectedCount) {
      // Too few paragraphs - try to split the largest ones
      while (paragraphs.length < expectedCount) {
        // Find the longest paragraph
        let maxIndex = 0;
        let maxLength = paragraphs[0].length;
        
        for (let i = 1; i < paragraphs.length; i++) {
          if (paragraphs[i].length > maxLength) {
            maxLength = paragraphs[i].length;
            maxIndex = i;
          }
        }
        
        // Try to split the longest paragraph
        const longest = paragraphs[maxIndex];
        const splitPoints = [
          longest.indexOf('. '),
          longest.indexOf('; '),
          longest.indexOf(' - '),
          longest.indexOf('\n')
        ].filter(pos => pos > 20 && pos < longest.length - 20);
        
        if (splitPoints.length > 0) {
          const splitPoint = splitPoints[0];
          const part1 = longest.substring(0, splitPoint + 1).trim();
          const part2 = longest.substring(splitPoint + 1).trim();
          
          paragraphs[maxIndex] = part1;
          paragraphs.splice(maxIndex + 1, 0, part2);
        } else {
          // Can't split further
          break;
        }
      }
    }
  }
  
  // Filter out very short paragraphs and analyze each one
  const vendors = paragraphs
    .filter(paragraph => paragraph.trim().length > 5)
    .map(paragraph => {
      const entity = analyzeAndCategorizeText(paragraph);
      return entityToVendor(entity);
    });
  
  return vendors.length > 0 ? vendors : [entityToVendor(analyzeAndCategorizeText(text))];
}
