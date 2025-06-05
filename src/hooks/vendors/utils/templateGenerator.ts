
export const downloadTemplate = () => {
  const headers = [
    'name',
    'email',
    'phone',
    'contact_person',
    'contact_title',
    'vendor_type',
    'status',
    'address',
    'city',
    'state',
    'zip_code',
    'website',
    'description',
    'rating'
  ];

  const sampleData = [
    [
      'ABC Services Inc',
      'contact@abcservices.com',
      '555-0123',
      'John Smith',
      'Account Manager',
      'service',
      'active',
      '123 Main St',
      'Anytown',
      'CA',
      '12345',
      'https://www.abcservices.com',
      'Professional maintenance services',
      '4'
    ],
    [
      'XYZ Supplies Co',
      'sales@xyzsupplies.com',
      '555-0456',
      'Jane Doe',
      'Sales Representative',
      'supplier',
      'active',
      '456 Oak Ave',
      'Business City',
      'NY',
      '67890',
      'https://www.xyzsupplies.com',
      'Industrial parts and supplies',
      '5'
    ],
    [
      'Quality Contractors LLC',
      'info@qualitycontractors.com',
      '555-0789',
      'Mike Johnson',
      'Project Manager',
      'contractor',
      'active',
      '789 Pine Rd',
      'Constructor',
      'TX',
      '54321',
      'https://www.qualitycontractors.com',
      'Construction and renovation services',
      '3'
    ]
  ];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => 
      row.map(cell => {
        // Escape cells that contain commas or quotes
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'vendor_import_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
