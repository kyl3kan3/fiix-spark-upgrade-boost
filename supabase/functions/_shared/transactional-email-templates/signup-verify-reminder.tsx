/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, BRAND } from '../email-templates/layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  verifyUrl?: string
}

const SignupVerifyReminderEmail = ({ firstName, verifyUrl }: Props) => {
  const url = verifyUrl || `${BRAND.url}/auth`
  return (
    <EmailLayout preview="Confirm your email to start using MaintenEase">
      <Heading style={h1}>
        {firstName ? `Hi ${firstName}, one quick step left` : 'One quick step left'}
      </Heading>
      <Text style={text}>
        You signed up for {BRAND.name} but haven't confirmed your email yet.
        Verify your address to activate your account and start managing your
        maintenance operations.
      </Text>
      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <Button href={url} style={button}>Confirm my email</Button>
      </Section>
      <Text style={small}>
        If you didn't sign up for {BRAND.name}, you can safely ignore this email.
      </Text>
    </EmailLayout>
  )
}

export const template = {
  component: SignupVerifyReminderEmail,
  subject: 'Confirm your email to start using MaintenEase',
  displayName: 'Signup verification reminder',
  previewData: { firstName: 'Alex', verifyUrl: 'https://maintenease.com/auth' },
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