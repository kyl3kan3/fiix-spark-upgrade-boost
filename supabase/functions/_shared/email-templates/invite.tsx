/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './layout.tsx'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  confirmationUrl,
}: InviteEmailProps) => (
  <EmailLayout preview={`You've been invited to join ${siteName}`}>
    <Heading style={styles.h1}>You've been invited 🎉</Heading>
    <Text style={styles.text}>
      You've been invited to join <strong>{siteName}</strong>. Accept the
      invitation to create your account and start collaborating with your team.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Accept invitation
      </Button>
    </div>
    <Text style={styles.hint}>
      Button not working? Paste this link into your browser:
    </Text>
    <Text style={styles.altLink}>{confirmationUrl}</Text>
    <Text style={styles.hint}>
      If you weren't expecting this invitation, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

export default InviteEmail
