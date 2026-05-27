/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './layout.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <EmailLayout preview={`Reset your password for ${siteName}`}>
    <Heading style={styles.h1}>Reset your password 🔒</Heading>
    <Text style={styles.text}>
      We received a request to reset the password for your{' '}
      <strong>{siteName}</strong> account. Tap the button below to choose a new one.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Reset password
      </Button>
    </div>
    <Text style={styles.hint}>
      Button not working? Paste this link into your browser:
    </Text>
    <Text style={styles.altLink}>{confirmationUrl}</Text>
    <Text style={styles.hint}>
      If you didn't request a reset, you can safely ignore this email — your
      password won't change.
    </Text>
  </EmailLayout>
)

export default RecoveryEmail
