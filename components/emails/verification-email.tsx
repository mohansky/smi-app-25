import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export default function VerificationEmail({
  name,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              Welcome! Please verify your email address by clicking the button below.
            </Text>
            <Button style={button} href={verificationUrl}>
              Verify Email Address
            </Button>
            <Text style={paragraph}>
              Or copy and paste this URL into your browser:
            </Text>
            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>
            <Text style={paragraph}>
              This link will expire in 24 hours for security reasons.
            </Text>
            <Text style={paragraph}>
              If you didn&apos;t create this account, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const button = {
  backgroundColor: '#656ee8',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '10px',
};

const link = {
  color: '#656ee8',
  fontSize: '14px',
  textDecoration: 'underline',
};