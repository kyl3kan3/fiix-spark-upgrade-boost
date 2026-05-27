/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Link, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './layout.tsx'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address. For the NEW-recipient half of a
  // secure email_change fanout, `email` equals the recipient (NEW), so we
  // render oldEmail to read "from OLD to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <EmailLayout preview={`Confirm your email change for ${siteName}`}>
    <Heading style={styles.h1}>Confirm your new email ✉️</Heading>
    <Text style={styles.text}>
      You requested to change the email on your <strong>{siteName}</strong> account
      from <Link href={`mailto:${oldEmail}`} style={styles.link}>{oldEmail}</Link>{' '}
      to <Link href={`mailto:${newEmail}`} style={styles.link}>{newEmail}</Link>.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Confirm change
      </Button>
    </div>
    <Text style={styles.hint}>
      Button not working? Paste this link into your browser:
    </Text>
    <Text style={styles.altLink}>{confirmationUrl}</Text>
    <Text style={styles.hint}>
      If you didn't request this change, please secure your account immediately.
    </Text>
  </EmailLayout>
)

export default EmailChangeEmail
