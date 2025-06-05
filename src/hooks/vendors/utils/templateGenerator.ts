
export const downloadTemplate = () => {
  const headers = [
    'name',
    'email',
    'phone',
    'contact_person',
    'vendor_type',
    'status',
    'address',
    'city',
    'state',
    'zip_code',
    'website',
    'description'
  ];

  const sampleData = [
    'ABC Services',
    'contact@abcservices.com',
    '555-0123',
    'John Smith',
    'service',
    'active',
    '123 Main St',
    'New York',
    'NY',
    '10001',
    'https://abcservices.com',
    'Professional maintenance services'
  ];

  const csvContent = [
    headers.join(','),
    sampleData.join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vendor-import-template.csv';
  link.click();
  URL.revokeObjectURL(url);
};
