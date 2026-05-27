/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, BRAND } from '../email-templates/layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  onboardingUrl?: string
}

const OnboardingReminderEmail = ({ firstName, onboardingUrl }: Props) => {
  const url = onboardingUrl || `${BRAND.url}/onboarding`
  return (
    <EmailLayout preview="Finish setting up your MaintenEase account">
      <Heading style={h1}>
        {firstName ? `${firstName}, finish setting up your workspace` : 'Finish setting up your workspace'}
      </Heading>
      <Text style={text}>
        You're just a couple of steps away from creating work orders, tracking
        assets, and inviting your team to {BRAND.name}.
      </Text>
      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <Button href={url} style={button}>Finish setup</Button>
      </Section>
      <Text style={small}>
        Prefer to use {BRAND.name} solo? You can switch to a personal account
        from the onboarding screen.
      </Text>
    </EmailLayout>
  )
}

export const template = {
  component: OnboardingReminderEmail,
  subject: 'Finish setting up your MaintenEase workspace',
  displayName: 'Onboarding reminder',
  previewData: { firstName: 'Alex', onboardingUrl: 'https://maintenease.com/onboarding' },
} satisfies TemplateEntry<Props>

const h1 = { fontSize: '22px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }
const text = { fontSize: '15px', color: BRAND.body, lineHeight: '1.6', margin: '0 0 16px' }
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