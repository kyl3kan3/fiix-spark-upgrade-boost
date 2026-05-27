/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface GenericProps {
  subject?: string
  html?: string
  preheader?: string
}

const GenericEmail = ({ subject = '', html = '', preheader = '' }: GenericProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preheader || subject}</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}>
      <Container style={{ padding: '20px 25px', maxWidth: '600px' }}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: GenericEmail,
  subject: (data: GenericProps) => data.subject || 'Notification from MaintenEase',
  displayName: 'Generic Notification',
  previewData: { subject: 'Hello from MaintenEase', html: '<p>This is a sample notification.</p>' },
} satisfies TemplateEntry<GenericProps>