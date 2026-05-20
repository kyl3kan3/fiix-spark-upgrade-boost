export function splitTextIntoSections(
 text: string, 
 pageTexts: string[], 
 expectedCount?: number
): string[] {
 console.log('🔄 Splitting text into sections');
 console.log('📝 Text length:', text.length);
 console.log('🎯 Expected count:', expectedCount || 'Not specified');
 
 // If the text is very short, don't split it
 if (text.trim().length < 50) {
 console.log('📋 Text too short, returning as single section');
 return [text];
 }
 
 // Split by double line breaks first to respect document structure
 let sections = text.split(/\n\s*\n/).filter(s => s.trim().length > 10);
 console.log('📄 Initial sections from double line breaks:', sections.length);
 
 // If no clear sections, try page breaks
 if (sections.length <= 1 && pageTexts.length > 1) {
 sections = pageTexts.filter(pageText => pageText.trim().length > 10);
 console.log('📄 Using page breaks as sections:', sections.length);
 }
 
 // If still no clear sections, try single line breaks but keep substantial content together
 if (sections.length <= 1) {
 const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
 console.log('📝 Total lines found:', lines.length);
 
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
 
 console.log('📋 Grouped sections from lines:', sections.length);
 }
 
 // If we have an expected count, try to match it
 if (expectedCount && expectedCount > 1) {
 console.log('🎯 Adjusting sections to match expected count');
 sections = adjustSectionsToExpectedCount(sections, expectedCount);
 }
 
 const finalSections = sections.filter(section => section.trim().length > 5);
 console.log('✅ Final sections count:', finalSections.length);
 
 return finalSections;
}

function adjustSectionsToExpectedCount(sections: string[], expectedCount: number): string[] {
 console.log('⚖️ Adjusting sections:', sections.length, '→', expectedCount);
 
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
 console.log('🔗 Combined sections, now have:', sections.length);
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
 console.log('✂️ Split section, now have:', sections.length);
 } else {
 // Can't split further
 console.log('🚫 Cannot split further');
 break;
 }
 }
 }
 
 return sections;
}
