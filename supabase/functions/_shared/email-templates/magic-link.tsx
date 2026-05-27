/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './layout.tsx'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <EmailLayout preview={`Your login link for ${siteName}`}>
    <Heading style={styles.h1}>Your sign-in link 🔑</Heading>
    <Text style={styles.text}>
      Tap the button below to securely sign in to <strong>{siteName}</strong>.
      This link expires shortly and can only be used once.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Sign in
      </Button>
    </div>
    <Text style={styles.hint}>
      Button not working? Paste this link into your browser:
    </Text>
    <Text style={styles.altLink}>{confirmationUrl}</Text>
    <Text style={styles.hint}>
      If you didn't request this link, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

export default MagicLinkEmail
