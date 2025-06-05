
export const parseKeyValuePair = (line: string, vendor: any) => {
  const trimmedLine = line.trim();
  
  // Check for email addresses
  const emailMatch = trimmedLine.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch && !vendor.email) {
    vendor.email = emailMatch[1];
    console.log('[Key-Value Parser] Found email:', emailMatch[1]);
    return;
  }

  // Check for phone numbers with context (cell, office, etc.)
  const phoneWithContextMatch = trimmedLine.match(/(?:cell|mobile|office|phone|tel)?\s*:?\s*(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i);
  if (phoneWithContextMatch) {
    const phoneNumber = phoneWithContextMatch[1];
    const context = trimmedLine.toLowerCase();
    
    if (!vendor.phone) {
      vendor.phone = phoneNumber;
      console.log('[Key-Value Parser] Found phone:', phoneNumber);
    } else {
      // Append additional phone numbers with context
      if (context.includes('cell') || context.includes('mobile')) {
        vendor.phone += ' (Cell: ' + phoneNumber + ')';
      } else if (context.includes('office')) {
        vendor.phone += ' (Office: ' + phoneNumber + ')';
      } else {
        vendor.phone += ', ' + phoneNumber;
      }
      console.log('[Key-Value Parser] Added additional phone:', phoneNumber);
    }
    return;
  }

  // Check for simple phone numbers
  const phoneMatch = trimmedLine.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    if (!vendor.phone) {
      vendor.phone = phoneMatch[1];
      console.log('[Key-Value Parser] Found phone:', phoneMatch[1]);
    } else {
      // If we already have a phone, append this one
      vendor.phone += ', ' + phoneMatch[1];
      console.log('[Key-Value Parser] Added additional phone:', phoneMatch[1]);
    }
    return;
  }

  // Check for website URLs
  const websiteMatch = trimmedLine.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
  if (websiteMatch && !vendor.website) {
    let website = websiteMatch[1];
    if (!website.startsWith('http')) {
      website = 'https://' + website;
    }
    vendor.website = website;
    console.log('[Key-Value Parser] Found website:', website);
    return;
  }

  // Look for explicit key-value pairs (colon separated)
  const colonIndex = trimmedLine.indexOf(':');
  if (colonIndex > 0 && colonIndex < trimmedLine.length - 1) {
    const key = trimmedLine.substring(0, colonIndex).trim().toLowerCase();
    const value = trimmedLine.substring(colonIndex + 1).trim();
    
    if (!value) return;

    switch (key) {
      case 'name':
      case 'company':
      case 'company name':
      case 'vendor':
      case 'business':
        if (!vendor.name) vendor.name = value;
        break;
      case 'contact':
      case 'contact person':
      case 'representative':
      case 'rep':
        if (!vendor.contact_person) vendor.contact_person = value;
        break;
      case 'title':
      case 'position':
      case 'job title':
        if (!vendor.contact_title) vendor.contact_title = value;
        break;
      case 'phone':
      case 'telephone':
      case 'tel':
      case 'cell':
      case 'mobile':
      case 'office':
        if (!vendor.phone) {
          vendor.phone = value;
        } else {
          vendor.phone += ', ' + value;
        }
        break;
      case 'email':
      case 'e-mail':
      case 'email address':
        if (!vendor.email) vendor.email = value;
        break;
      case 'address':
      case 'street':
      case 'location':
        if (!vendor.address) vendor.address = value;
        break;
      case 'city':
        if (!vendor.city) vendor.city = value;
        break;
      case 'state':
      case 'province':
        if (!vendor.state) vendor.state = value;
        break;
      case 'zip':
      case 'zip code':
      case 'postal code':
        if (!vendor.zip_code) vendor.zip_code = value;
        break;
      case 'website':
      case 'web':
      case 'url':
      case 'site':
        if (!vendor.website) {
          vendor.website = value.startsWith('http') ? value : `https://${value}`;
        }
        break;
      case 'type':
      case 'category':
      case 'service type':
        const lowerType = value.toLowerCase();
        if (['service', 'supplier', 'contractor', 'consultant'].includes(lowerType)) {
          vendor.vendor_type = lowerType;
        } else if (lowerType.includes('supplier')) {
          vendor.vendor_type = 'supplier';
        } else if (lowerType.includes('contractor')) {
          vendor.vendor_type = 'contractor';
        } else if (lowerType.includes('consultant')) {
          vendor.vendor_type = 'consultant';
        }
        break;
    }
    
    console.log('[Key-Value Parser] Parsed key-value:', key, '=', value);
  }
};
