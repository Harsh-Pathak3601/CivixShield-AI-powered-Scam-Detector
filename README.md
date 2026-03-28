# Cyber Safety - AI-Powered Fraud Detection Platform

A comprehensive web application that detects social media scams, "digital arrest" fraud patterns, and suspicious messages using AI/NLP techniques powered by Gemini AI, Google Safe Browsing, Supabase, Firebase, Upstash Redis, and Stripe.

## Features

### Core Functionality
- **Real-time Fraud Detection**: Analyze text, emails, URLs, and social media content for scam indicators
- **Digital Arrest Scams**: Detect impersonations of law enforcement and legal threats
- **Phishing Detection**: Identify credential harvesting and account takeover attempts
- **Romance Scams**: Spot relationship-based manipulation and financial exploitation
- **Money Transfer Scams**: Detect requests for financial transactions
- **Risk Scoring**: 0-100% confidence rating with detailed explanations
- **URL Validation**: Google Safe Browsing integration for malicious link detection

### Platform Features
- **Dual B2C/B2B Support**: Individual users and organization team management
- **User Authentication**: Firebase authentication with email/password support
- **Analysis History**: Track and review past analyses with 6-month retention
- **PDF Reports**: Generate downloadable fraud analysis reports
- **Real-time Caching**: Upstash Redis for fast analysis caching
- **Subscription Tiers**: Free (5/month), Pro (100/month), Enterprise (unlimited)
- **Stripe Integration**: Secure payment processing and subscription management

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account (database & auth)
- Google Gemini API key
- Google Safe Browsing API key
- Firebase project
- Upstash Redis instance
- Stripe account

## Setup Instructions

### 1. Environment Variables

Copy the template file and fill in your API keys:

```bash
cp .env.example .env.local
```

**Required environment variables:**

```env
# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key

# Google Safe Browsing
NEXT_PUBLIC_SAFE_BROWSING_API_KEY=your_api_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your_instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

Create the database schema in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query and paste the contents of `scripts/01-create-tables.sql`
3. Execute the query

This creates:
- `users` - User accounts and subscription info
- `organizations` - B2B organization accounts
- `organization_members` - Team member management
- `analyses` - Fraud analysis results
- `reports` - Generated PDF reports
- `audit_logs` - Activity logging
- `threat_intelligence` - Threat pattern database
- `subscription_logs` - Payment event tracking

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to access the application.

## API Routes

### POST `/api/analyze`

Analyze content for fraud patterns.

**Request:**
```json
{
  "content": "The text to analyze",
  "contentType": "text|email|url|social_media|image",
  "userId": "user-uuid (optional)",
  "organizationId": "org-uuid (optional)"
}
```

**Response:**
```json
{
  "risk_score": 75,
  "risk_level": "high",
  "scam_patterns": ["urgency_tactic", "payment_demand"],
  "fraud_types": ["money_transfer_scam"],
  "confidence": 85,
  "explanation": "Detailed analysis...",
  "red_flags": ["Act now!", "Send payment immediately"],
  "recommendations": ["Do not respond", "Report to authorities"],
  "urls_found": 1,
  "unsafe_urls": 1,
  "url_threats": ["MALWARE"]
}
```

## Fraud Detection Logic

The system analyzes content for:

1. **Urgency Keywords**: urgent, immediately, limited time, hurry
2. **Payment Requests**: bank account, wire transfer, gift card, Bitcoin
3. **Personal Info Requests**: SSN, password, credit card, identity documents
4. **Impersonation**: law enforcement, government agencies, financial institutions
5. **Suspicious Patterns**: click here, verify account, unusual activity alerts
6. **URL Safety**: Google Safe Browsing checks for malware, phishing, unwanted software

## Architecture

```
app/
├── page.tsx                 # Landing page
├── dashboard/
│   └── page.tsx            # Main analysis dashboard
├── auth/
│   ├── login/              # Authentication
│   ├── sign-up/
│   └── sign-up-success/
├── settings/               # User settings
└── api/
    └── analyze/            # Fraud analysis endpoint

components/
├── analysis-form.tsx       # Input form for content
├── risk-indicator.tsx      # Risk score display
└── analysis-findings.tsx   # Detailed findings display

lib/
├── fraud-detector.ts       # Core fraud detection engine
├── firebase.ts             # Firebase setup
├── upstash.ts              # Redis caching
└── supabase/
    ├── client.ts           # Client setup
    ├── server.ts           # Server setup
    └── proxy.ts            # Session handling
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **AI/ML**: Google Gemini AI, Vercel AI SDK 6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Auth + Supabase Auth
- **Caching**: Upstash Redis
- **Payments**: Stripe
- **Safety Checks**: Google Safe Browsing API
- **Deployment**: Vercel

## Project Structure

- `/scripts/` - Database migration scripts
- `/app/` - Next.js app router pages and API routes
- `/components/` - Reusable React components
- `/lib/` - Utilities and integrations
- `/public/` - Static assets

## Subscription Plans

- **Free**: 5 analyses/month, basic text analysis
- **Pro**: 100 analyses/month, includes URL analysis and PDF reports
- **Enterprise**: Unlimited analyses, team management, API access

## Security Features

- Row Level Security (RLS) on all database tables
- HTTP-only authentication cookies
- Firebase password hashing
- API rate limiting via Upstash
- HTTPS only
- Secure session management
- Data encryption in transit

## Deployment

### Deploy to Vercel

```bash
# Connect your GitHub repository to Vercel
# Push to main branch
git push origin main
```

Vercel will automatically:
1. Build the Next.js application
2. Run migrations (if configured)
3. Deploy to CDN
4. Set environment variables from dashboard

### Configure Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Redeploy

## Monitoring & Logging

- **Error Tracking**: Implement Sentry integration
- **Analytics**: Vercel Analytics enabled
- **Database Logs**: Supabase audit logs
- **Security Logs**: audit_logs table

## Future Enhancements

- [ ] OCR for image analysis
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] WhatsApp integration
- [ ] SMS analysis
- [ ] Machine learning model training
- [ ] Community threat database
- [ ] Real-time alert notifications
- [ ] Advanced team collaboration features

## Support & Documentation

- [Gemini AI Docs](https://ai.google.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Disclosure

If you discover a security vulnerability, please email security@cybersafety.local instead of using the issue tracker.

---

**Created with ❤️ for digital safety**
