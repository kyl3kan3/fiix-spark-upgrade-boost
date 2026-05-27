/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

/**
 * Shared branded layout for all MaintenEase emails.
 * Renders a gradient header band, white card content area on a soft
 * page background, and a small branded footer.
 */

export const BRAND = {
  name: 'MaintenEase',
  tagline: 'Maintenance made simple',
  url: 'https://maintenease.com',
  primary: 'hsl(212, 88%, 50%)',
  primaryGlow: 'hsl(212, 92%, 62%)',
  ink: 'hsl(220, 30%, 18%)',
  body: 'hsl(220, 20%, 32%)',
  muted: 'hsl(220, 15%, 55%)',
  page: 'hsl(210, 40%, 97%)',
  card: '#ffffff',
  border: 'hsl(215, 25%, 92%)',
  radius: '20px',
}

const fontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

export const EmailLayout: React.FC<{
  preview: string
  children: React.ReactNode
}> = ({ preview, children }) => (
  <Html lang="en" dir="ltr">
    <Head>
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light" />
    </Head>
    <Preview>{preview}</Preview>
    <Body
      style={{
        backgroundColor: BRAND.page,
        fontFamily: fontStack,
        margin: 0,
        padding: '32px 12px',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <Container
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: BRAND.card,
          borderRadius: BRAND.radius,
          overflow: 'hidden',
          border: `1px solid ${BRAND.border}`,
          boxShadow: '0 12px 32px -16px hsl(220, 30%, 18%, 0.18)',
        }}
      >
        {/* Gradient brand header */}
        <Section
          style={{
            background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryGlow})`,
            padding: '28px 32px',
            textAlign: 'center' as const,
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {BRAND.name}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '13px',
              margin: '4px 0 0',
              fontWeight: 500,
            }}
          >
            {BRAND.tagline}
          </Text>
        </Section>

        {/* Content */}
        <Section style={{ padding: '36px 40px 28px' }}>{children}</Section>

        <Hr style={{ borderColor: BRAND.border, margin: '0 32px' }} />

        {/* Footer */}
        <Section style={{ padding: '20px 40px 28px', textAlign: 'center' as const }}>
          <Text style={{ fontSize: '12px', color: BRAND.muted, margin: '0 0 6px' }}>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </Text>
          <Text style={{ fontSize: '12px', color: BRAND.muted, margin: 0 }}>
            <Link href={BRAND.url} style={{ color: BRAND.primary, textDecoration: 'none' }}>
              {BRAND.url.replace('https://', '')}
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const styles = {
  h1: {
    fontSize: '26px',
    fontWeight: 700,
    color: BRAND.ink,
    margin: '0 0 16px',
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  } as React.CSSProperties,
  text: {
    fontSize: '15px',
    color: BRAND.body,
    lineHeight: 1.6,
    margin: '0 0 18px',
  } as React.CSSProperties,
  link: { color: BRAND.primary, textDecoration: 'underline' } as React.CSSProperties,
  button: {
    display: 'inline-block',
    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryGlow})`,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: BRAND.radius,
    padding: '14px 28px',
    textDecoration: 'none',
    boxShadow: '0 8px 20px -8px hsl(212, 88%, 50%, 0.55)',
  } as React.CSSProperties,
  buttonWrap: { textAlign: 'center' as const, margin: '8px 0 28px' } as React.CSSProperties,
  hint: {
    fontSize: '13px',
    color: BRAND.muted,
    lineHeight: 1.6,
    margin: '20px 0 0',
  } as React.CSSProperties,
  altLink: {
    fontSize: '12px',
    color: BRAND.muted,
    wordBreak: 'break-all' as const,
    margin: '4px 0 0',
  } as React.CSSProperties,
  code: {
    display: 'inline-block',
    fontFamily: '"SF Mono", Menlo, Consolas, monospace',
    fontSize: '32px',
    fontWeight: 700,
    color: BRAND.ink,
    letterSpacing: '0.4em',
    padding: '18px 28px',
    background: BRAND.page,
    border: `1px solid ${BRAND.border}`,
    borderRadius: BRAND.radius,
    margin: '0 0 24px',
  } as React.CSSProperties,
}