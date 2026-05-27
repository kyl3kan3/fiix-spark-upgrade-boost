/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { EmailLayout } from '../email-templates/layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface GenericProps {
  subject?: string
  html?: string
  preheader?: string
}

const GenericEmail = ({ subject = '', html = '', preheader = '' }: GenericProps) => (
  <EmailLayout preview={preheader || subject || ''}>
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </EmailLayout>
)

export const template = {
  component: GenericEmail,
  subject: (data: GenericProps) => data.subject || 'Notification from MaintenEase',
  displayName: 'Generic Notification',
  previewData: { subject: 'Hello from MaintenEase', html: '<p>This is a sample notification.</p>' },
} satisfies TemplateEntry<GenericProps>