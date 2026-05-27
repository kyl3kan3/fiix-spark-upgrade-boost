/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Button, Heading, Link, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './layout.tsx'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <EmailLayout preview={`Confirm your email for ${siteName}`}>
    <Heading style={styles.h1}>Welcome aboard 👋</Heading>
    <Text style={styles.text}>
      Thanks for signing up for <strong>{siteName}</strong>. Tap the button below
      to confirm <Link href={`mailto:${recipient}`} style={styles.link}>{recipient}</Link> and
      start managing your maintenance work.
    </Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>
        Confirm my email
      </Button>
    </div>
    <Text style={styles.hint}>
      Button not working? Paste this link into your browser:
    </Text>
    <Text style={styles.altLink}>{confirmationUrl}</Text>
    <Text style={styles.hint}>
      If you didn't create an account, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

export default SignupEmail
