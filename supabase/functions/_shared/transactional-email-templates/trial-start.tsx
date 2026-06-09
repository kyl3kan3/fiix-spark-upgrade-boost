/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, BRAND } from '../email-templates/layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  companyName?: string
  trialDays?: number
  trialEndsAt?: string
  appUrl?: string
}

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

const TrialStartEmail = ({
  firstName,
  companyName,
  trialDays = 7,
  trialEndsAt,
  appUrl,
}: Props) => {
  const url = appUrl || `${BRAND.url}/dashboard`
  const endsOn = formatDate(trialEndsAt)
  const greeting = firstName ? `Welcome, ${firstName}` : 'Welcome to MaintenEase'
  const cancelByDay = trialDays + 1

  return (
    <EmailLayout preview={`Your ${trialDays}-day MaintenEase trial has started`}>
      <Heading style={h1}>{greeting}</Heading>
      <Text style={text}>
        Your <strong>{trialDays}-day free trial</strong>
        {companyName ? <> for <strong>{companyName}</strong></> : null} is now
        active. You have full access to assets, work orders, inspections, and
        team collaboration.
      </Text>
      {endsOn ? (
        <Text style={callout}>
          Trial ends on <strong>{endsOn}</strong>. Cancel before day{' '}
          {cancelByDay} to avoid any charges.
        </Text>
      ) : null}
      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <Button href={url} style={button}>Open MaintenEase</Button>
      </Section>
      <Heading as="h2" style={h2}>Get the most out of your {trialDays} days</Heading>
      <Text style={li}>1. Add your first 10 assets or import a list.</Text>
      <Text style={li}>2. Create a preventive maintenance schedule.</Text>
      <Text style={li}>3. Invite a teammate to assign work orders.</Text>
      <Text style={small}>
        Questions? Reply to this email and a real human will get back to you.
      </Text>
    </EmailLayout>
  )
}

export const template = {
  component: TrialStartEmail,
  subject: (data: Props) =>
    `Your ${data.trialDays ?? 7}-day MaintenEase trial has started`,
  displayName: 'Trial start',
  previewData: {
    firstName: 'Alex',
    companyName: 'Acme Facilities',
    trialDays: 7,
    trialEndsAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    appUrl: 'https://maintenease.com/dashboard',
  },
} satisfies TemplateEntry<Props>

const h1 = { fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }
const h2 = { fontSize: '17px', fontWeight: 700, color: BRAND.ink, margin: '28px 0 12px' }
const text = { fontSize: '15px', color: BRAND.body, lineHeight: '1.6', margin: '0 0 16px' }
const li = { fontSize: '14px', color: BRAND.body, lineHeight: '1.6', margin: '0 0 8px' }
const callout = {
  fontSize: '14px',
  color: BRAND.ink,
  lineHeight: '1.5',
  margin: '0 0 16px',
  padding: '12px 14px',
  backgroundColor: BRAND.page,
  border: `1px solid ${BRAND.border}`,
  borderRadius: '10px',
}
const small = { fontSize: '13px', color: BRAND.muted, lineHeight: '1.5', margin: '24px 0 0' }
const button = {
  backgroundColor: BRAND.primary,
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '15px',
  textDecoration: 'none',
}