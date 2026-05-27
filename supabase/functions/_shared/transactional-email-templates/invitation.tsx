/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface InvitationProps {
  companyName?: string
  inviteUrl?: string
}

const InvitationEmail = ({ companyName = 'your team', inviteUrl = '#' }: InvitationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're invited to join {companyName} on MaintenEase</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}>
      <Container style={{ padding: '20px 25px', maxWidth: '600px' }}>
        <Heading style={{ fontSize: '22px', color: 'hsl(220, 30%, 18%)', margin: '0 0 20px' }}>
          You're invited to join {companyName}!
        </Heading>
        <Text style={{ fontSize: '14px', color: 'hsl(220, 20%, 28%)', lineHeight: '1.5', margin: '0 0 25px' }}>
          You've been invited to join <strong>{companyName}</strong> on MaintenEase, a maintenance management platform.
        </Text>
        <Text style={{ fontSize: '14px', color: 'hsl(220, 20%, 28%)', lineHeight: '1.5', margin: '0 0 25px' }}>
          Click the button below to accept your invitation and create your account:
        </Text>
        <Button href={inviteUrl} style={{ backgroundColor: 'hsl(212, 88%, 50%)', color: '#ffffff', fontSize: '14px', borderRadius: '20px', padding: '12px 24px', textDecoration: 'none' }}>
          Accept Invitation
        </Button>
        <Text style={{ fontSize: '12px', color: '#999', margin: '30px 0 0' }}>
          Or paste this link into your browser: <Link href={inviteUrl}>{inviteUrl}</Link>
        </Text>
        <Text style={{ fontSize: '12px', color: '#999' }}>This invitation expires in 7 days.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InvitationEmail,
  subject: (data: InvitationProps) => `You're invited to join ${data.companyName || 'a team'} on MaintenEase`,
  displayName: 'Team Invitation',
  previewData: { companyName: 'Acme Co', inviteUrl: 'https://maintenease.com/auth?signup=true&token=demo' },
} satisfies TemplateEntry<InvitationProps>