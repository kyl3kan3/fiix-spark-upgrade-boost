
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { parseVendorsFromFile } from '@/utils/parseVendors'
import { toast } from 'sonner'

interface VendorUploaderProps {
  onVendorsParsed: (vendors: any[]) => void
}

export const VendorUploader: React.FC<VendorUploaderProps> = ({ onVendorsParsed }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      toast.error('Please upload a PDF or DOCX file')
      return
    }

    setIsProcessing(true)
    try {
      const vendors = await parseVendorsFromFile(file)
      onVendorsParsed(vendors)
      toast.success(`Successfully parsed ${vendors.length} vendors`)
    } catch (error) {
      console.error('Parse error:', error)
      toast.error('Failed to parse file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Vendor Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-gray-600">Processing document with AI...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">Drop your file here</p>
                <p className="text-gray-500">or click to browse</p>
              </div>
              <Input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileInput}
                className="max-w-xs"
              />
              <p className="text-sm text-gray-400">
                Supports PDF and DOCX files with AI-powered extraction
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
