
import React from 'react';

interface VendorTableProps {
  vendors: any[];
}

const VendorTable: React.FC<VendorTableProps> = ({ vendors }) => {
  if (!vendors.length) return null;
  
  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0 mt-4">
    <table className="min-w-full border text-xs">
      <thead>
        <tr>
          {Object.keys(vendors[0]).map((col) => (
            <th key={col} className="px-2 py-1 border bg-gray-50 whitespace-nowrap">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {vendors.map((row, i) => (
          <tr key={i} className="border-b">
            {Object.values(row).map((val, j) => (
              <td key={j} className="px-2 py-1 border whitespace-nowrap">
                {Array.isArray(val) ? val.join(', ') : String(val)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default VendorTable;
