
import { EntityClassification } from '../../services/types';

export function entityToVendor(entity: EntityClassification): any {
  const vendor: any = {
    id: `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
