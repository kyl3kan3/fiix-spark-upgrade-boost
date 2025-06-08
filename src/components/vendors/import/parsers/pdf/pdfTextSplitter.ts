export function splitTextIntoSections(
  text: string, 
  pageTexts: string[], 
  expectedCount?: number
): string[] {
  // Split by double line breaks first to respect document structure
  let sections = text.split(/\n\s*\n/).filter(s => s.trim().length > 10);
  
  // If no clear sections, try page breaks
  if (sections.length <= 1 && pageTexts.length > 1) {
    sections = pageTexts.filter(pageText => pageText.trim().length > 10);
  }
  
  // If still no clear sections, try single line breaks but keep substantial content together
  if (sections.length <= 1) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Group consecutive short lines together
    sections = [];
    let currentGroup = '';
    
    for (const line of lines) {
      if (line.length < 100 && currentGroup.length < 300) {
        currentGroup += (currentGroup ? ' ' : '') + line;
      } else {
        if (currentGroup) {
          sections.push(currentGroup);
        }
        currentGroup = line;
      }
    }
    
    if (currentGroup) {
      sections.push(currentGroup);
    }
  }
  
  // If we have an expected count, try to match it
  if (expectedCount && expectedCount > 1) {
    sections = adjustSectionsToExpectedCount(sections, expectedCount);
  }
  
  return sections.filter(section => section.trim().length > 5);
}

function adjustSectionsToExpectedCount(sections: string[], expectedCount: number): string[] {
  if (sections.length > expectedCount) {
    // Too many sections - combine smallest ones
    while (sections.length > expectedCount && sections.length > 1) {
      // Find two shortest adjacent sections to combine
      let minIndex = 0;
      let minLength = sections[0].length + sections[1].length;
      
      for (let i = 0; i < sections.length - 1; i++) {
        const combinedLength = sections[i].length + sections[i + 1].length;
        if (combinedLength < minLength) {
          minLength = combinedLength;
          minIndex = i;
        }
      }
      
      // Combine the two sections
      sections[minIndex] = sections[minIndex] + ' ' + sections[minIndex + 1];
      sections.splice(minIndex + 1, 1);
    }
  } else if (sections.length < expectedCount) {
    // Too few sections - try to split the largest ones
    while (sections.length < expectedCount) {
      // Find the longest section
      let maxIndex = 0;
      let maxLength = sections[0].length;
      
      for (let i = 1; i < sections.length; i++) {
        if (sections[i].length > maxLength) {
          maxLength = sections[i].length;
          maxIndex = i;
        }
      }
      
      // Try to split the longest section
      const longest = sections[maxIndex];
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
        
        sections[maxIndex] = part1;
        sections.splice(maxIndex + 1, 0, part2);
      } else {
        // Can't split further
        break;
      }
    }
  }
  
  return sections;
}
