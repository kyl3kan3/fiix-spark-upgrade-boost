
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, AlertTriangle, CheckCircle, Save } from 'lucide-react'
import { saveAs } from 'file-saver'
import { createVendor } from '@/services/vendorService'
import { toast } from 'sonner'

interface VendorTableProps {
  vendors: any[]
  onSaveComplete?: () => void
}

export const VendorTable: React.FC<VendorTableProps> = ({ vendors, onSaveComplete }) => {
  const [isSaving, setIsSaving] = React.useState(false)

  const exportToCSV = () => {
    if (vendors.length === 0) return

    const headers = ['name', 'address', 'phone', 'email', 'notes', 'error_flag']
    const csvContent = [
      headers.join(','),
      ...vendors.map(vendor => 
        headers.map(header => {
          let value = vendor[header] || ''
          if (Array.isArray(value)) {
            value = value.join('; ')
          }
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `vendors_${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('CSV exported successfully')
  }

  const saveToSupabase = async () => {
    setIsSaving(true)
    try {
      const validVendors = vendors.filter(v => !v.error_flag && v.name)
      
      const results = await Promise.allSettled(
        validVendors.map(vendor => {
          const vendorData = {
            name: vendor.name,
            email: Array.isArray(vendor.email) ? vendor.email[0] : vendor.email || '',
            phone: Array.isArray(vendor.phone) ? vendor.phone[0] : vendor.phone || '',
            contact_person: '',
            contact_title: '',
            vendor_type: 'service' as const,
            status: 'active' as const,
            address: vendor.address || '',
            city: '',
            state: '',
            zip_code: '',
            website: '',
            description: Array.isArray(vendor.notes) ? vendor.notes.join('; ') : vendor.notes || '',
            rating: null
          }
          return createVendor(vendorData)
        })
      )
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      if (successful > 0) {
        toast.success(`Successfully saved ${successful} vendors to database`)
        if (onSaveComplete) onSaveComplete()
      }
      
      if (failed > 0) {
        toast.warning(`${failed} vendors failed to save`)
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save vendors')
    } finally {
      setIsSaving(false)
    }
  }

  const errorCount = vendors.filter(v => v.error_flag).length
  const validCount = vendors.length - errorCount

  if (vendors.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            Parsed Vendors
            <Badge variant="secondary">{vendors.length} found</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={saveToSupabase} 
              disabled={isSaving || validCount === 0}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : `Save ${validCount} to Database`}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorCount > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorCount} vendors have errors and will be skipped during save.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {vendors.map((vendor, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 ${
                vendor.error_flag ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-lg">{vendor.name || 'Unnamed Vendor'}</h4>
                <div className="flex items-center gap-2">
                  {vendor.error_flag ? (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Address:</span>
                  <p>{vendor.address || 'Not provided'}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <p>{Array.isArray(vendor.phone) ? vendor.phone.join(', ') : vendor.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p>{Array.isArray(vendor.email) ? vendor.email.join(', ') : vendor.email || 'Not provided'}</p>
                </div>
              </div>
              
              {vendor.notes && vendor.notes.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium text-gray-600">Notes:</span>
                  <p className="text-sm">{Array.isArray(vendor.notes) ? vendor.notes.join('; ') : vendor.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
