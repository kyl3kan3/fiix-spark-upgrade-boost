/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from '../email-templates/layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface InvitationProps {
  companyName?: string
  inviteUrl?: string
}

const InvitationEmail = ({ companyName = 'your team', inviteUrl = '#' }: InvitationProps) => (
  <EmailLayout preview={`You're invited to join ${companyName} on MaintenEase`}>
    <Heading style={styles.h1}>Join {companyName} 🎉</Heading>
    <Text style={styles.text}>
      You've been invited to join <strong>{companyName}</strong> on MaintenEase —
      the simple way to manage maintenance work, assets, and your team.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={inviteUrl}>
        Accept invitation
      </Button>
    </div>
    <Text style={styles.hint}>
      Button not working? Paste this link into your browser:
    </Text>
    <Text style={styles.altLink}>{inviteUrl}</Text>
    <Text style={styles.hint}>This invitation expires in 7 days.</Text>
  </EmailLayout>
)

export const template = {
  component: InvitationEmail,
  subject: (data: InvitationProps) => `You're invited to join ${data.companyName || 'a team'} on MaintenEase`,
  displayName: 'Team Invitation',
  previewData: { companyName: 'Acme Co', inviteUrl: 'https://maintenease.com/auth?signup=true&token=demo' },
} satisfies TemplateEntry<InvitationProps>