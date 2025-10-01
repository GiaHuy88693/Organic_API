import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import * as React from 'react'

interface OTPEmailProps {
  code: string
  title: string
}

export default function OTPEmail({ code, title }: OTPEmailProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Body style={main}>
        <Preview>Mã xác thực từ Organic Store</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={headerSection}>
              <Text style={brandText}>Organic Store</Text>
            </Section>
            <Section style={contentSection}>
              <Heading style={h1}>Xác thực địa chỉ email của bạn</Heading>
              <Text style={mainText}>
                Cảm ơn bạn đã tin tưởng và mua sắm tại <b>Organic Store</b>!  
                Vui lòng nhập mã xác thực bên dưới để hoàn tất quá trình đăng ký.
              </Text>
              <Section style={codeContainer}>
                <Text style={codeText}>{code}</Text>
              </Section>
              <Text style={validityText}>Mã xác thực có hiệu lực trong 5 phút</Text>
            </Section>
            <Hr style={divider} />
            <Section style={footerSection}>
              <Text style={footerText}>
                © Organic Store. Mang đến cho bạn hoa quả sạch và an toàn mỗi ngày.  
                Ăn sạch - sống khỏe 
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6fdf7',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  padding: '20px',
  margin: '0 auto',
  maxWidth: '480px',    
}

const coverSection = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  border: '1px solid #d1e7dd',
  overflow: 'hidden',
}

const headerSection = {
  backgroundColor: '#16a34a', 
  padding: '20px',
  textAlign: 'center' as const,
}

const brandText = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
  letterSpacing: '0.5px',
}

const contentSection = {
  padding: '25px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#14532d',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const mainText = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 20px 0',
  lineHeight: '1.6',
}

const codeContainer = {
  backgroundColor: '#ecfdf5',
  border: '2px dashed #16a34a',
  borderRadius: '6px',
  padding: '15px',
  margin: '15px 0',
}

const codeText = {
  color: '#14532d',
  fontWeight: 'bold',
  fontSize: '32px',
  margin: '0',
  textAlign: 'center' as const,
  letterSpacing: '3px',
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
}

const validityText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '10px 0 0 0',
}

const footerSection = {
  padding: '15px 25px',
  backgroundColor: '#f0fdf4',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#4b5563',
  fontSize: '12px',
  margin: '0',
}

const divider = {
  borderColor: '#d1e7dd',
  margin: '0',
}
