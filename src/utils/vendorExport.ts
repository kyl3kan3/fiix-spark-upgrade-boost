
export const exportVendorsToCSV = (vendors: any[]) => {
  const headers = [
    'Name',
    'Type',
    'Status',
    'Email',
    'Phone',
    'Contact Person',
    'Contact Title',
    'Address',
    'City',
    'State',
    'ZIP Code',
    'Website',
    'Rating',
    'Description',
    'Created Date'
  ];

  const csvData = vendors.map(vendor => [
    vendor.name,
    vendor.vendor_type,
    vendor.status,
    vendor.email || '',
    vendor.phone || '',
    vendor.contact_person || '',
    vendor.contact_title || '',
    vendor.address || '',
    vendor.city || '',
    vendor.state || '',
    vendor.zip_code || '',
    vendor.website || '',
    vendor.rating || '',
    vendor.description || '',
    new Date(vendor.created_at).toLocaleDateString()
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `vendors_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportVendorsToPDF = async (vendors: any[]) => {
  // This would require jsPDF - using simple text export for now
  const content = vendors.map(vendor => {
    return `
Name: ${vendor.name}
Type: ${vendor.vendor_type}
Status: ${vendor.status}
Email: ${vendor.email || 'N/A'}
Phone: ${vendor.phone || 'N/A'}
Contact: ${vendor.contact_person || 'N/A'}
Address: ${[vendor.address, vendor.city, vendor.state, vendor.zip_code].filter(Boolean).join(', ') || 'N/A'}
Rating: ${vendor.rating ? `${vendor.rating}/5` : 'N/A'}
Description: ${vendor.description || 'N/A'}
Created: ${new Date(vendor.created_at).toLocaleDateString()}
----------------------------
`;
  }).join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `vendors_${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
