
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VendorCsvTableProps {
  vendors: any[];
}

export default function VendorCsvTable({ vendors }: VendorCsvTableProps) {
  if (vendors.length === 0) return null;

  const columns = Object.keys(vendors[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview ({vendors.length} vendors)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col} className="whitespace-nowrap">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.slice(0, 10).map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j} className="max-w-xs truncate">
                      {Array.isArray(row[col]) ? row[col].join(', ') : String(row[col] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {vendors.length > 10 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Showing first 10 of {vendors.length} vendors
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
