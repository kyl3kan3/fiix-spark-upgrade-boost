
// Constants for text analysis and categorization

// Common company suffixes and indicators
export const COMPANY_INDICATORS = [
  'Inc', 'LLC', 'Corp', 'Corporation', 'Company', 'Co', 'Ltd', 'Limited',
  'LLP', 'LP', 'PC', 'Professional', 'Associates', 'Group', 'Enterprises',
  'Solutions', 'Services', 'Systems', 'Technologies', 'Tech', 'Consulting',
  'Hardware', 'Supply', 'Supplies', 'Equipment', 'Store', 'Shop', 'Center',
  'Depot', 'Mart', 'Market', 'Industries', 'Manufacturing', 'Construction',
  'Hardware', 'Ace', 'Electric', 'Electrical'
];

// Product/service indicators - updated to be more specific
export const PRODUCT_INDICATORS = [
  'supply', 'supplies', 'equipment', 'tools', 'parts', 'materials',
  'products', 'items', 'inventory', 'stock', 'goods', 'merchandise',
  'purchase', 'purchased', 'order', 'ordered', 'buy', 'bought',
  'panels', 'panel', 'insulators', 'insulator', 'iso panels',
  'components', 'units', 'fixtures', 'fittings'
];

// Service indicators
export const SERVICE_INDICATORS = [
  'service', 'services', 'maintenance', 'repair', 'installation',
  'consulting', 'support', 'management', 'cleaning', 'security',
  'delivery', 'transportation', 'logistics', 'training', 'design'
];

// Contact person indicators
export const CONTACT_INDICATORS = [
  'contact', 'attn', 'attention', 'rep', 'representative', 'manager',
  'director', 'coordinator', 'specialist', 'agent', 'sales', 'account'
];

// Common city patterns that should NOT be company names
export const CITY_INDICATORS = [
  'of', 'in', 'at', 'located', 'city', 'town', 'village', 'township'
];

// Common US city names that should be recognized as cities, not companies
export const COMMON_CITIES = [
  'freeburg', 'chicago', 'new york', 'los angeles', 'houston', 'phoenix',
  'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
  'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte',
  'seattle', 'denver', 'boston', 'detroit', 'nashville', 'memphis',
  'portland', 'oklahoma city', 'las vegas', 'baltimore', 'milwaukee',
  'atlanta', 'colorado springs', 'raleigh', 'omaha', 'miami',
  'cleveland', 'tulsa', 'arlington', 'new orleans', 'wichita'
];
