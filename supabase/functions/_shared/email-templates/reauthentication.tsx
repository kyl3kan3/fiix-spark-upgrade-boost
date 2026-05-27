/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Heading, Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './layout.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <EmailLayout preview="Your verification code">
    <Heading style={styles.h1}>Verify it's you 🛡️</Heading>
    <Text style={styles.text}>
      Use the code below to confirm your identity. It expires shortly.
    </Text>
    <div style={{ textAlign: 'center', margin: '8px 0 8px' }}>
      <span style={styles.code}>{token}</span>
    </div>
    <Text style={styles.hint}>
      If you didn't request this code, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

export default ReauthenticationEmail
