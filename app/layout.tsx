import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { Navbar } from '@/components/shared/navbar'
import Script from 'next/script'
import './globals.css'

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'CivixShield - AI Fraud Detection',
  description: 'Protect yourself from digital fraud, scams, and phishing with AI-powered real-time fraud detection. Analyze messages, emails, URLs, and social media for security threats.',
  generator: 'v0.app',
  keywords: 'fraud detection, scam detection, phishing, cybersecurity, AI security, digital safety',
  openGraph: {
    title: 'CivixShield - Protect from Digital Fraud',
    description: 'AI-powered fraud detection platform for individuals and organizations',
    type: 'website',
    images: [{ url: '/logo.png' }],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-mono bg-background text-foreground antialiased min-h-screen relative" suppressHydrationWarning>
        {/* Global Red Cyberpunk Grid Background */}
        <div
          className="fixed inset-0 pointer-events-none z-[-1]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 0, 0, 0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 0, 0, 0.07) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: 'center center'
          }}
        />
        <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-red-900/10 to-transparent z-[-1] pointer-events-none" />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <LanguageProvider>
              <Navbar />
              {children}
            </LanguageProvider>
          </AuthProvider>
          <Analytics />
        </ThemeProvider>

        <div id="google_translate_element" style={{ display: "none" }}></div>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
      </body>
    </html>
  )
}
