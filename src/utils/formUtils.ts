
export const parseFullName = (fullName: string) => {
  const nameParts = fullName.trim().split(' ');
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || ''
  };
};

export const formatDisplayName = (firstName?: string, lastName?: string, fallback = 'User') => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  return fallback;
};

export const sanitizeFormData = (data: Record<string, any>) => {
  const sanitized: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};
