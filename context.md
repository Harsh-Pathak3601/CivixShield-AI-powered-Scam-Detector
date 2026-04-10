# CivixShield — System Design Document

> **Version:** 1.0.0 | **Last Updated:** 2026-03-28 | **Status:** Active Development (Hackathon MVP)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Application Pages & Routes](#4-application-pages--routes)
5. [API Layer (Backend)](#5-api-layer-backend)
6. [Core Library Modules](#6-core-library-modules)
7. [AI & External Integrations](#7-ai--external-integrations)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Data Persistence & Caching](#9-data-persistence--caching)
10. [UI Component Architecture](#10-ui-component-architecture)
11. [Internationalization (i18n)](#11-internationalization-i18n)
12. [Data Flow Diagrams](#12-data-flow-diagrams)
13. [Firestore Data Models](#13-firestore-data-models)
14. [Environment Variables & Configuration](#14-environment-variables--configuration)
15. [Security Considerations](#15-security-considerations)
16. [Performance Engineering](#16-performance-engineering)
17. [Deployment & Infrastructure](#17-deployment--infrastructure)
18. [Planned Features (Post-MVP)](#18-planned-features-post-mvp)
19. [Error Handling Strategy](#19-error-handling-strategy)
20. [Glossary](#20-glossary)

---

## 1. Project Overview

**CivixShield** is a full-stack, AI-powered cybersecurity platform designed to protect everyday citizens from online scams, phishing attacks, deepfakes, and social engineering threats. It democratizes access to enterprise-grade threat detection technology through an intuitive, dark-themed web interface.

### The CivixShield Ecosystem

CivixShield is a comprehensive, multi-platform suite comprising three core interconnected projects:
1. **CivixShieldWeb**: A Next.js web application functioning as the central AI-powered fraud detection platform and dashboard.
2. **CivixLauncher**: A native Android Kotlin background sentinel that monitors notifications, clipboard, and phone calls in real-time.
3. **CivixShieldApp**: A React Native/Expo mobile application serving as the primary device interface, ingesting real-time threat data from the Launcher via deep links.

### Core Value Proposition

| Problem | CivixShield Solution |
|---|---|
| Scam texts/emails hard to identify | AI-powered text analysis with risk scoring |
| Malicious URLs look legitimate | Real-time URL scanning via Google Safe Browsing |
| Deepfake images/videos mislead users | Hive AI deepfake detection with frame-level analysis |
| QR codes used as phishing vectors | In-browser QR payload extraction & inspection |
| No community threat-sharing platform | Live global threat feed — auto-populated from scans |
| Hard to find emergency cyber helplines | Curated international cybercrime hotline directory |

### Design Philosophy

- **Cyberpunk Aesthetic**: Dark terminal-inspired UI with neon cyan, electric yellow, and red accents using Tailwind CSS
- **AI-First**: Every scan goes through Gemini 2.5 Flash for semantic understanding before heuristic fallback
- **Community Intelligence**: Individual scans auto-contribute to a shared threat database
- **Graceful Degradation**: All AI and API dependencies have local fallback modes to ensure the UI always renders

---

## 2. Architecture Overview

CivixShield uses the **Next.js App Router** architecture, which collapses the traditional client/server boundary. Server-side API routes process sensitive data (API keys, Firebase Admin SDK, AI calls) while the React client handles the interactive UI.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                            │
│                                                                     │
│   React 19 + Next.js 16 App Router (RSC + "use client")            │
│   Framer Motion · Radix UI · Lucide Icons · Recharts               │
│                                                                     │
│   Pages: / · /scan · /deepfake · /community · /dashboard           │
│           /scam-alerts · /emergency · /auth/* · /settings           │
│           /organizations                                            │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTPS / fetch()
┌────────────────────────▼────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES (Edge/Node.js)              │
│                                                                     │
│   POST /api/analyze          → Fraud & URL scan                     │
│   POST /api/deepfake         → Hive AI deepfake detection           │
│   POST /api/community/share  → Authenticated share to feed          │
│   GET  /api/community/feed   → Public threat feed                   │
│   GET  /api/analyze/history  → User scan history                    │
│   POST /api/auth/*           → Auth helpers                         │
│   POST /api/reports          → Report submission                    │
└──────┬─────────────────────────────────────┬────────────────────────┘
       │                                     │
┌──────▼────────────┐              ┌──────────▼────────────────────────┐
│  UPSTASH REDIS    │              │   FIREBASE (Google Cloud)          │
│  (Edge Cache)     │              │                                    │
│                   │              │   Firebase Auth (JWT tokens)       │
│  - Fraud results  │              │   Firestore (NoSQL DB)             │
│  - URL check      │              │     /analyses                      │
│  - 24h TTL        │              │     /community_scams               │
│                   │              │     /organizations                 │
└───────────────────┘              └───────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────────┐
│                      EXTERNAL AI & THREAT APIS                      │
│                                                                     │
│   Google Gemini 2.5 Flash API   → Multimodal fraud analysis         │
│   Google Safe Browsing API v4   → URL threat classification         │
│   Hive AI V3 API                → Deepfake / AI-generated detection  │
└─────────────────────────────────────────────────────────────────────┘
```

### Architectural Patterns

- **BFF (Backend for Frontend)**: API routes act as a thin BFF, orchestrating calls to Firebase Admin SDK and external AI APIs without exposing credentials to the browser.
- **Layered Caching**: Redis (via Upstash) as L1 cache before hitting AI APIs, reducing latency and API cost on repeated content.
- **Server Components + Client Components**: Heavy data-fetching logic runs server-side; interactive components (forms, toasts, animations) use `"use client"`.
- **Graceful Fallback Chain**: Gemini API → Local Keyword Heuristics → UI still renders.

---

## 3. Technology Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.2.0 | Full-stack React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | 5.7.3 | Static type safety |
| Tailwind CSS | 4.2.0 | Utility-first styling |
| Framer Motion | 12.38.0 | Animations & scroll transforms |
| Radix UI | various | Accessible headless UI primitives |
| Lucide React | 0.564.0 | Icon system |
| Recharts | 2.15.0 | Data visualization (dashboard charts) |
| next-themes | 0.4.6 | Dark/light theme toggle |
| date-fns | 4.1.0 | Date formatting |
| Embla Carousel | 8.6.0 | Carousel components |
| cmdk | 1.1.1 | Command palette |
| react-hook-form | 7.54.1 | Form state management |
| Zod | 3.24.1 | Schema validation |
| sonner | 1.7.1 | Toast notifications |
| jsqr | 1.4.0 | Client-side QR code decoding |

### Backend / API

| Technology | Version | Role |
|---|---|---|
| Next.js API Routes | 16.2.0 | Serverless API endpoints |
| Firebase Admin SDK | 13.7.0 | Server-side Firestore & Auth |
| firebase (client) | 10.14.1 | Client-side auth & Firestore |
| @upstash/redis | 1.34.0 | Serverless Redis cache |
| @ai-sdk/google | 1.1.0 | Vercel AI SDK Google adapter |
| @google/genai | 1.45.0 | Google Generative AI client |
| ai (Vercel AI SDK) | 6.0.0 | Unified AI streaming interface |
| ffmpeg-static | 5.3.0 | FFmpeg binary for video processing |
| fluent-ffmpeg | 2.1.3 | FFmpeg Node.js wrapper |
| @vercel/analytics | 2.0.1 | Web analytics |

### Infrastructure & Build

| Technology | Role |
|---|---|
| Vercel | Hosting, Edge Network, Analytics |
| Firebase (GCP) | Authentication, Firestore NoSQL database |
| Upstash Redis | Serverless Redis (globally distributed caching) |
| pnpm | Package manager |
| PostCSS + Autoprefixer | CSS processing pipeline |
| tw-animate-css | Tailwind animation utilities |

---

## 4. Application Pages & Routes

All pages live under `app/` using Next.js App Router conventions.

### Page Inventory

| Route | File | Auth Required | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | No | Landing page — hero, feature bento grid, CTA |
| `/scan` | `app/scan/page.tsx` | No (history needs auth) | Multi-modal security scanner |
| `/deepfake` | `app/deepfake/page.tsx` | No | Image/video deepfake detector |
| `/community` | `app/community/page.tsx` | No | Live global threat intelligence feed |
| `/dashboard` | `app/dashboard/page.tsx` | Yes | User analytics dashboard with scan history |
| `/scam-alerts` | `app/scam-alerts/page.tsx` | No | Curated real-world scam case library |
| `/emergency` | `app/emergency/page.tsx` | No | International cybercrime hotline directory |
| `/organizations` | `app/organizations/page.tsx` | Yes | Organization/team management |
| `/settings` | `app/settings/page.tsx` | Yes | User preferences and account settings |
| `/auth/login` | `app/auth/login/page.tsx` | No | Login form (email/password + Google OAuth) |
| `/auth/sign-up` | `app/auth/sign-up/page.tsx` | No | Registration form |

### Layout Hierarchy

```
app/layout.tsx (root)
  └── Providers (AuthProvider, ThemeProvider, LanguageProvider)
      └── Navbar (fixed, sticky, responsive)
          └── page content (each route)
              └── Footer (on landing page)
```

The `app/layout.tsx` wraps every page with:
1. **`AuthProvider`** — Firebase auth context (`useAuth()` hook)
2. **`ThemeProvider`** — `next-themes` dark/light mode
3. **`LanguageProvider`** — i18n context for multi-language support
4. **`Navbar`** — Fixed top navigation bar

---

## 5. API Layer (Backend)

All API routes are under `app/api/` and run as Next.js Route Handlers (Node.js runtime by default, except where `maxDuration` is set).

### 5.1 `POST /api/analyze`

**File:** `app/api/analyze/route.ts`

**Purpose:** Core fraud and scam analysis endpoint. Orchestrates Gemini AI analysis, Google Safe Browsing URL check, and Firestore persistence.

**Request Body:**
```json
{
  "content": "string",         // Text/message to analyze
  "contentType": "text|url|screenshot|audio",
  "mediaBase64": "string",     // Optional: Base64 encoded image or audio
  "mediaType": "image/jpeg|image/png|audio/mp3|...",
  "userId": "string",          // Optional: Firebase UID
  "organizationId": "string"   // Optional: Org ID for quota tracking
}
```

**Processing Pipeline:**
```
Request body parse
    ↓
analyzeFraudRisk(content, mediaBase64?, mediaType?)    ← Gemini 2.5 Flash
    ↓
extractUrlsFromText(content)
    ↓
checkSafeBrowsingUrl(url) × N URLs                    ← Google Safe Browsing
    ↓
Risk Score Adjustment (+20 if unsafe URLs found)
    ↓
Persist to Firestore /analyses collection
    ↓
If userId → Update org.analyses_used counter
    ↓
If risk_score > 60 → Auto-publish to /community_scams
    ↓
Return JSON response
```

**Response:**
```json
{
  "risk_score": 85,
  "risk_level": "critical",
  "scam_patterns": ["urgency pressure", "impersonation"],
  "fraud_types": ["digital_arrest", "phishing"],
  "confidence": 92,
  "explanation": "...",
  "red_flags": ["..."],
  "recommendations": ["..."],
  "urls_found": 2,
  "unsafe_urls": 1,
  "url_threats": ["SOCIAL_ENGINEERING"]
}
```

**Auto-Community Share Logic:**
- If `risk_score > 60`, the scan is automatically submitted to the **community feed** (`/community_scams` Firestore collection) with the user's email prefix as handle.
- This creates a self-growing threat intelligence database without any extra user action.

---

### 5.2 `POST /api/deepfake`

**File:** `app/api/deepfake/route.ts`

**Purpose:** Analyzes uploaded image or video files for deepfake / AI-generated content signatures.

**Configuration:**
```typescript
export const maxDuration = 60  // Allow up to 60 seconds for video processing
const MAX_FILE_SIZE = 50 * 1024 * 1024  // 50 MB limit
```

**Supported Formats:**

| Category | MIME Types |
|---|---|
| Images | `image/jpeg`, `image/png`, `image/webp` |
| Videos | `video/mp4`, `video/webm` |

**Detection Pipeline:**
```
Multipart FormData parse
    ↓
File type & size validation
    ↓
Is HIVE_API_KEY set?
  YES → Call Hive AI V3 API (base64 encoded)
  NO  → Mock analysis (random score 0.1–0.7, 600ms delay)
    ↓
Parse Hive response: iterate frames → extract ai_generated + deepfake scores
    ↓
Final score = MAX of all frame scores (not average)
    ↓
Map to risk tier: Safe (<30) | Suspicious (30-64) | High Risk (≥65)
    ↓
Return JSON
```

**Risk Tier Logic:**

| Score Range | Risk Label | Explanation |
|---|---|---|
| 0 – 29% | Safe | No significant AI synthesis signatures |
| 30 – 64% | Suspicious | Unusual artifacts or minor manipulation detected |
| 65 – 99% | High Risk | High probability of deepfake or AI generation |

> **Note:** Score is capped to 99% (never 100%) as a UX best practice to avoid implying absolute mathematical certainty.

**Response:**
```json
{
  "score": 82,
  "risk": "High Risk",
  "explanation": "...",
  "frames_analyzed": 12,
  "is_mock": false
}
```

---

### 5.3 `POST /api/community/share`

**File:** `app/api/community/share/route.ts`

**Purpose:** Authenticated endpoint for users to manually submit a scan result to the community threat feed.

**Authentication:** Requires `Authorization: Bearer <firebase_id_token>` header. The Firebase Admin SDK verifies the JWT before processing.

**Request Body:**
```json
{
  "content": "string",
  "analysis_details": { ... },
  "risk_level": "high",
  "risk_score": 78
}
```

**Key Design Decisions:**
- User's full email is never stored; only the prefix (e.g., `john` from `john@example.com`) is used as `handle`.
- `votes` field is initialized to `0` for future upvoting feature.

---

### 5.4 `GET /api/community/feed`

**File:** `app/api/community/feed/route.ts`

**Purpose:** Returns the latest community scam reports for the live threat feed page.

---

### 5.5 `GET /api/analyze/history`

**File:** `app/api/analyze/history/route.ts`

**Purpose:** Returns a user's personal scan history, sorted by `created_at` descending.

**Query Parameters:**
```
GET /api/analyze/history?userId=<firebase-uid>
```

**Implementation Note:** Results are fetched without `orderBy` to avoid a composite Firestore index requirement, then sorted in-memory before returning.

---

### 5.6 `POST /api/reports` and `POST/GET /api/auth/*`

These routes handle report generation and custom auth flows respectively. Their structures follow the same Firebase Admin SDK + Firestore pattern as the above routes.

---

## 6. Core Library Modules

All shared utilities live under `lib/`.

### 6.1 `lib/fraud-detector.ts`

The central AI analysis engine. Contains three exported functions and two internal helper systems.

#### `analyzeFraudRisk(content, mediaBase64?, mediaType?)`

The primary function called by `/api/analyze`. It implements a **cache-first strategy** before hitting the Gemini API.

**Cache Key Construction:**
```typescript
const cacheStr = content + (mediaBase64 ? `${mediaBase64.length}_${mediaBase64.slice(-50)}` : '')
const cacheKey = `fraud_analysis_${Buffer.from(cacheStr).toString('base64').slice(0, 60)}`
```
> Using `length + last 50 chars` of base64 as a surrogate hash avoids JPEG EXIF header collisions while keeping cache key deterministic and fast.

**Gemini API Call:** Uses the `gemini-2.5-flash` model via the native `fetch` REST API (not the SDK) with:
- `system_instruction` block defining the expert cybersecurity analyst role
- `inline_data` block for optional multimodal media (image or audio)
- `response_mime_type: "application/json"` + `response_schema` for structured, schema-validated output

**Fallback Chain:**
```
Gemini API success → return structured analysis
      ↓ (on any error)
calculateLocalRiskScore(content) → return heuristic fallback with 50% confidence
```

**Fraud Keyword Categories:**

| Category | Example Keywords |
|---|---|
| `digital_arrest` | "arrest warrant", "federal agent", "court order", "bail" |
| `money_transfer` | "wire transfer", "urgent payment", "bitcoin", "gift card" |
| `romance_scam` | "i love you", "medical emergency", "stranded", "send money" |
| `phishing` | "verify account", "confirm password", "suspended account" |
| `identity_theft` | "social security", "ssn", "cvv", "mother maiden name" |

**Urgency Keywords:** `"urgent"`, `"immediately"`, `"right now"`, `"asap"`, `"limited time"`, `"hurry"`, `"act now"`

#### `checkSafeBrowsingUrl(url)`

Checks a single URL against Google Safe Browsing API v4.

**Threat Types Checked:**
- `MALWARE`
- `SOCIAL_ENGINEERING`
- `UNWANTED_SOFTWARE`
- `POTENTIALLY_HARMFUL_APPLICATION`

**Cache TTL:** 7 days (604,800 seconds). URLs don't change threat status frequently.

#### `calculateLocalRiskScore(text)`

Pure local heuristic scoring. No network calls. Used as the Gemini fallback.

**Scoring Rules:**
- Each urgency keyword match: +5 points
- Each fraud category keyword match: +3 points
- Each matching regex pattern: +5 points
- Maximum score: capped at 100

**Regex Patterns Detected:**
```regex
/(?:verify|confirm|update).{0,20}(password|account|login|identity)/i
/(?:click|tap).{0,20}(link|here|button)/i
/(act now|urgent|limited time|hurry)/gi
/(?:re-enter|re-confirm|re-verify).{0,20}(information|details|credentials)/i
```

---

### 6.2 `lib/firebase-admin.ts`

Singleton Firebase Admin SDK initialization using **service account credentials** from environment variables.

**Initialization Guard:** Uses `!admin.apps.length` to prevent duplicate initialization in hot-reload environments (Next.js development).

**Private Key Handling:**
```typescript
pk = pk.replace(/^\"|\"$/g, '')     // Strip surrounding quotes
const formattedKey = pk.replace(/\\n/g, '\n')  // Convert escaped \n to real newlines
```
> This handles the common `.env` file issue where multi-line PEM private keys are stored as single-line escaped strings.

**Fallback:** If any credential is missing, initializes with a dummy `projectId` to prevent crash. All Firestore operations will fail silently (errors caught per-call).

**Exports:** `adminDb` (Firestore), `adminAuth` (Auth), `admin` (namespace)

---

### 6.3 `lib/firebase.ts`

Client-side Firebase SDK initialization for browser-side auth flows.

**Exports:** `auth` (Firebase Auth), `db` (Firestore client), `googleProvider` (Google OAuth provider)

---

### 6.4 `lib/upstash.ts`

Thin wrapper around `@upstash/redis` with graceful no-op behavior when Redis is not configured.

**Cache Helper API:**

| Function | Signature | Description |
|---|---|---|
| `cacheSet` | `(key, value, ttl=3600)` | Serialize to JSON and store with TTL |
| `cacheGet` | `(key)` | Retrieve and deserialize JSON |
| `cacheDelete` | `(key)` | Remove a cache key |

**Connection Guard:**
```typescript
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('dummy')

export const redis = isRedisConfigured ? new Redis({...}) : null
```
> When `redis` is `null`, all cache helpers immediately return `null` — the calling code treats a cache miss as a no-op and proceeds to the real API.

---

### 6.5 `lib/utils.ts`

Standard `cn()` utility combining `clsx` + `tailwind-merge` for conditional Tailwind class resolution.

---

## 7. AI & External Integrations

### 7.1 Google Gemini 2.5 Flash

| Property | Value |
|---|---|
| Model | `gemini-2.5-flash` |
| API Endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` |
| Auth | API Key via query parameter |
| Input Modalities | Text (always) + Inline image/audio (optional) |
| Output Format | Structured JSON via `response_mime_type: "application/json"` + `response_schema` |
| Cache TTL | 24 hours (via Upstash Redis) |

**Zod Output Schema:**
```typescript
const FraudAnalysisSchema = z.object({
  risk_score: z.number().min(0).max(100),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  scam_patterns: z.array(z.string()),
  fraud_types: z.array(z.string()),
  confidence: z.number().min(0).max(100),
  explanation: z.string(),
  red_flags: z.array(z.string()),
  recommendations: z.array(z.string()),
})
```

**System Prompt Design:** The prompt instructs Gemini to act as an expert cybersecurity analyst evaluating 9 specific threat categories with a defined 0–100 risk scale. The scoring rubric is embedded directly in the system instruction for consistency.

---

### 7.2 Hive AI V3 (Deepfake Detection)

| Property | Value |
|---|---|
| Provider | [thehive.ai](https://thehive.ai) |
| API Endpoint | `https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection` |
| Auth | Bearer Token |
| Payload | Base64-encoded media in `input[].media_base64` |
| Max Duration | 60 seconds (set via `export const maxDuration = 60`) |
| Max File Size | 50 MB |

**Response Parsing:** The API returns per-frame class scores. CivixShield uses the **maximum frame score** (not average) because a deepfake might only appear in a few frames of a video clip.

**Mock Mode:** When `HIVE_API_KEY` is absent/empty, returns a deterministic random score (0.1–0.7) after a 600ms artificial delay. This keeps the UI demo-able without a paid API subscription.

---

### 7.3 Google Safe Browsing API v4

| Property | Value |
|---|---|
| Endpoint | `https://safebrowsing.googleapis.com/v4/threatMatches:find` |
| Auth | API Key in query param |
| Client ID | `cyber-safety-app` |
| Cache TTL | 7 days (URL statuses are stable) |

---

### 7.4 Vercel Analytics

Integrated via `@vercel/analytics` in `app/layout.tsx`. Provides zero-config page view tracking and Web Vitals metrics in the Vercel dashboard.

---

## 8. Authentication & Authorization

### Authentication Flow

```
User clicks "Sign In with Google" or email/password form
    ↓
Firebase Client SDK (browser)
    ↓
Firebase Auth Service (GCP)
    ↓
Returns: Firebase ID Token (JWT, 1-hour expiry)
    ↓
Stored client-side by Firebase SDK (IndexedDB)
    ↓
For protected API calls: token sent as "Authorization: Bearer <token>"
    ↓
Firebase Admin SDK on server: adminAuth.verifyIdToken(token)
    ↓
Returns: DecodedIdToken { uid, email, ... }
```

### Auth Provider (`components/providers/auth-provider.tsx`)

Wraps the entire application. Exposes `useAuth()` hook returning:
- `user`: Firebase `User` object or `null`
- `loading`: boolean (true during initial auth state resolution)

### Route Protection

Currently implemented at the **component level** (redirect to `/auth/login` when `!user`), not via Next.js middleware. Protected pages: `/dashboard`, `/settings`, `/organizations`.

### Authorization Model

| Role | Description | Firestore Access |
|---|---|---|
| Anonymous | No login required for scanning | Write-only to `/analyses` (via server API), read `/community_scams` |
| Authenticated User | Firebase email/Google user | Read own `/analyses`, write to `/community_scams` |
| Organization Owner | User who created an org | Read/write `/organizations/{orgId}` |

---

## 9. Data Persistence & Caching

### 9.1 Firebase Firestore Collections

All Firestore operations are performed **server-side** via the Firebase Admin SDK in API routes. This bypasses Firestore client-side security rules entirely.

#### `/analyses`
```
{
  user_id: string,           // Firebase UID or "anonymous"
  organization_id: string|null,
  content_type: string,      // "text" | "url" | "screenshot" | "audio"
  content: string,           // The scanned text/URL
  risk_score: number,        // 0-100
  risk_level: string,        // "low" | "medium" | "high" | "critical"
  scam_patterns: string[],
  detected_fraud_types: string[],
  confidence_score: number,
  gemini_response: object,   // Full raw Gemini output
  safe_browsing_result: {
    urls_checked: number,
    unsafe_urls: object[]
  },
  is_suspicious: boolean,    // true if risk_score > 50
  analysis_details: object,
  created_at: Timestamp      // Firestore server timestamp
}
```

#### `/community_scams`
```
{
  handle: string,            // Email prefix (anonymized)
  content: string,           // Scanned content (or "[Media Payload]")
  risk_level: string,
  risk_score: number,
  red_flags: string[],
  fraud_types: string[],
  created_at: string,        // ISO 8601 string
  votes: number              // For future upvoting (always 0 for now)
}
```

#### `/organizations`
```
{
  owner_id: string,          // Firebase UID of creator
  analyses_used: number,     // Incremented on each org scan (FieldValue.increment)
  // ... other org fields
}
```

### 9.2 Upstash Redis Cache

| Cache Key Pattern | Content | TTL |
|---|---|---|
| `fraud_analysis_<base64_hash>` | Full Gemini analysis result | 24 hours (86,400s) |
| `safe_browsing_<url>` | Safe Browsing result for URL | 7 days (604,800s) |

**Cache Hit Rate Optimization:**
- Content is normalized before hashing (same message = same cache key)
- For media, length + last 50 chars used as a lightweight fingerprint

---

## 10. UI Component Architecture

### Component Hierarchy

```
components/
├── providers/
│   └── auth-provider.tsx     # Firebase auth context
├── scanner/
│   ├── scanner.tsx           # Root scanner orchestrator component
│   ├── analysis-form.tsx     # Multi-tab input form (text/URL/screenshot/QR/audio)
│   ├── analysis-findings.tsx # Results display (patterns, flags, recommendations)
│   └── risk-indicator.tsx    # Animated radial risk score gauge
├── shared/
│   ├── navbar.tsx            # Fixed global navigation bar
│   ├── theme-toggle.tsx      # Dark/light mode switch
│   └── language-switcher.tsx # i18n language selector dropdown
└── ui/
    └── [50+ Radix UI components] # badge, button, card, dialog, sheet, tabs, etc.
```

### Key Component Details

#### `components/scanner/scanner.tsx`
The wrapper for the entire scan workflow. Manages:
- Active tab state (text / URL / screenshot / QR / audio)
- Submission dispatch to `/api/analyze`
- Loading and result state

#### `components/scanner/analysis-form.tsx`
The main input panel. Features:
- **Text tab**: Textarea for pasting messages/emails
- **URL tab**: URL input with paste detection
- **Screenshot tab**: Drag-and-drop or click-to-upload for images
- **QR tab**: Uses `jsqr` library for in-browser QR decode without server round-trip
- **Audio tab**: Audio file upload, sent as Base64 to Gemini for voice analysis
- Double-submission guard: Submit button is disabled while `isLoading` is true

#### `components/scanner/risk-indicator.tsx`
Animated circular gauge showing risk percentage (0–100). Color transitions:
- Green (safe) → Yellow (medium) → Orange (high) → Red (critical)

#### `components/shared/navbar.tsx`
Fixed top navigation with:
- Logo (Next.js `Image` with priority loading)
- Desktop nav (hidden below `lg` breakpoint)
- Mobile hamburger (Radix `Sheet` slide-in panel)
- `LanguageSwitcher` + `ThemeToggle`
- Auth-aware buttons: Login/Register or Dashboard

**Navigation Links:**

| Label | Route | Icon | Accent |
|---|---|---|---|
| Home | `/` | Home | cyan |
| Scanner | `/scan` | Scan | cyan |
| Deepfake | `/deepfake` | Brain | yellow |
| Live Feed | `/community` | Radio | red (pulsing) |
| Scam Alerts | `/scam-alerts` | AlertTriangle | orange |
| Safety Helpline | `/emergency` | Siren | red |

---

## 11. Internationalization (i18n)

**Location:** `lib/i18n/`

CivixShield implements a custom React Context-based i18n system (not `next-intl` or `i18next`).

**Architecture:**
- `LanguageContext.tsx`: Provides `{ t, language, setLanguage }` to the component tree
- `LanguageSwitcher` component lets users switch between supported locales at runtime
- `t('key')` function resolves keys like `'hero.subtitle'`, `'nav.login'`, `'nav.getStarted'`

**Usage in Components:**
```tsx
const { t } = useLanguage()
<p>{t('hero.subtitle')}</p>
```

---

## 12. Data Flow Diagrams

### 12.1 Text/URL Fraud Analysis Flow

```
User pastes text/URL → analysis-form.tsx
        ↓
POST /api/analyze
  {content, contentType, userId?}
        ↓
lib/fraud-detector.ts::analyzeFraudRisk()
        ↓
  ┌─────────────────────────────────────────┐
  │  Cache Hit? (Upstash Redis)             │
  │  YES → return cached result immediately │
  │  NO  → Call Gemini 2.5 Flash API        │
  │         ↓                               │
  │      Parse JSON response                │
  │         ↓                               │
  │      Store in Redis (24h TTL)           │
  └──────────────┬──────────────────────────┘
                 ↓
  extractUrlsFromText() if URLs found
        ↓
  checkSafeBrowsingUrl() for each URL (parallel Promise.all)
        ↓
  Aggregate risk score (+ 20 if unsafe URL found)
        ↓
  adminDb.collection('analyses').add(...)    ← Firestore write
        ↓
  If risk_score > 60:
    adminDb.collection('community_scams').add(...)
        ↓
  Return JSON: { risk_score, risk_level, red_flags, ... }
        ↓
risk-indicator.tsx + analysis-findings.tsx render results
```

### 12.2 Deepfake Detection Flow

```
User uploads image/video → deepfake page upload form
        ↓
POST /api/deepfake  (multipart/form-data)
        ↓
Validate file type + size
        ↓
HIVE_API_KEY set?
  YES → Convert to Buffer → Base64
         → POST to Hive AI V3 endpoint
         → Parse frame[] scores
         → score = max(all frame scores)
  NO  → Math.random() score (0.1–0.7) after 600ms delay
        ↓
Map score to risk tier (Safe / Suspicious / High Risk)
        ↓
Return { score, risk, explanation, frames_analyzed, is_mock }
        ↓
UI renders radial gauge + risk label + explanation
```

### 12.3 Community Feed Auto-Population

```
Any scan with risk_score > 60
        ↓
Server-side (inside /api/analyze):
  Try to fetch userRecord from Firebase Auth → get email prefix
        ↓
adminDb.collection('community_scams').add({
  handle, content, risk_level, risk_score,
  red_flags, fraud_types, created_at, votes: 0
})
        ↓
/community page fetches from /api/community/feed
        ↓
Live threat feed populated automatically
```

---

## 13. Firestore Data Models

### Collection: `analyses`

```typescript
interface AnalysisDocument {
  user_id: string                  // "anonymous" if not logged in
  organization_id: string | null
  content_type: 'text' | 'url' | 'screenshot' | 'audio'
  content: string
  risk_score: number               // 0–100
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  scam_patterns: string[]
  detected_fraud_types: string[]
  confidence_score: number         // 0–100
  gemini_response: FraudAnalysis   // Raw Gemini structured output
  safe_browsing_result: {
    urls_checked: number
    unsafe_urls: SafeBrowsingResult[]
  }
  is_suspicious: boolean           // risk_score > 50
  analysis_details: AnalysisResult
  created_at: FirebaseFirestore.Timestamp
}
```

### Collection: `community_scams`

```typescript
interface CommunityScamDocument {
  handle: string                   // Anonymized display name (email prefix)
  content: string                  // Scanned content
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_score: number
  red_flags: string[]
  fraud_types: string[]
  created_at: string               // ISO 8601 string
  votes: number                    // Reserved for future upvoting
}
```

### Collection: `organizations`

```typescript
interface OrganizationDocument {
  owner_id: string                 // Firebase UID
  analyses_used: number            // Incremented per scan
  // ... additional org metadata
}
```

---

## 14. Environment Variables & Configuration

All environment variables are defined in `.env.local` (gitignored). The `.env` file in the repo contains the keys with empty values as a reference template.

### Required Variables

| Variable | Used In | Description |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `lib/fraud-detector.ts` | Gemini 2.5 Flash API key |
| `SAFE_BROWSING_API_KEY` | `lib/fraud-detector.ts` | Google Safe Browsing v4 API key |
| `HIVE_API_KEY` | `app/api/deepfake/route.ts` | Hive AI deepfake detection API key |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `lib/firebase.ts` | Firebase client API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `lib/firebase.ts` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `lib/firebase.ts`, `lib/firebase-admin.ts` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `lib/firebase.ts` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `lib/firebase.ts` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `lib/firebase.ts` | Firebase app ID |
| `FIREBASE_CLIENT_EMAIL` | `lib/firebase-admin.ts` | Service account email |
| `FIREBASE_PRIVATE_KEY` | `lib/firebase-admin.ts` | Service account private key (PEM, escaped `\n`) |
| `UPSTASH_REDIS_REST_URL` | `lib/upstash.ts` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | `lib/upstash.ts` | Upstash Redis auth token |

### Variable Naming Convention

- `NEXT_PUBLIC_*`: Exposed to the **browser bundle** (safe for client-side Firebase config)
- Non-prefixed: **Server-only**, never exposed to the browser (API keys, service account credentials)

---

## 15. Security Considerations

### API Key Security
- All AI API keys and Firebase Admin credentials are server-side only (no `NEXT_PUBLIC_` prefix)
- The Gemini API key is extracted from potential full-URL format at runtime:
  ```typescript
  if (apiKey.includes('key=')) {
    apiKey = apiKey.split('key=')[1].split('&')[0]
  }
  ```

### Authentication & JWT Verification
- Every protected API route verifies the Firebase ID token using `adminAuth.verifyIdToken(token)`
- Tokens are short-lived (1 hour); Firebase handles refresh automatically client-side

### Data Anonymization
- Community feed entries only store the **email prefix** (`john` from `john@example.com`), not the full email
- No PII (Personally Identifiable Information) is stored in `/community_scams`

### Input Validation
- `content` and `mediaBase64` are validated as non-empty before processing
- File uploads are validated for MIME type and size (50 MB max) server-side
- Zod schemas validate all structured AI outputs before they're used

### Cache Key Collision Resistance
- Cache keys are Base64-encoded hashes of the content plus media fingerprint
- For images: `${base64.length}_${base64.slice(-50)}` is appended to avoid JPEG EXIF header collisions

### Rate Limiting (Planned)
- Upstash Redis is already integrated as the infrastructure layer
- Rate limiting middleware on `/api/analyze` can be added using `@upstash/ratelimit` package

---

## 16. Performance Engineering

### Cache Strategy

| Layer | Technology | TTL | Benefit |
|---|---|---|---|
| AI Response Cache | Upstash Redis | 24h | Avoid 2–5s Gemini API call on repeated content |
| URL Threat Cache | Upstash Redis | 7 days | Avoid Safe Browsing API quota usage |
| Next.js Static Generation | Built-in | Indefinite | Static pages (scam-alerts) served from edge |
| Browser Cache | HTTP headers | Standard | Assets served from Vercel CDN |

### Rendering Strategy

| Page | Strategy | Why |
|---|---|---|
| `/` (Landing) | Client-side (CSR) | Auth state needed (useAuth hook) |
| `/scan` | Client-side | Real-time form state |
| `/deepfake` | Client-side | File upload interaction |
| `/community` | Server Component + client hydration | SEO + live data |
| `/scam-alerts` | Can be SSG | Static content, no auth needed |
| `/emergency` | Can be SSG | Static content, no auth needed |

### Bundle Optimization

- Radix UI components are tree-shaken (each primitive imported separately)
- `lucide-react` icons imported individually (not the full bundle)
- Next.js `Image` component used for the logo (automatic WebP conversion + lazy loading)
- `framer-motion` animations use `useScroll` + `useTransform` for GPU-accelerated CSS transforms

### Dramatic Analysis Delay (UX)
Per the product requirements, a deliberate 1-second delay is added to scan results to create a "dramatic analysis" effect. This is implemented at the form submit level before rendering results, not at the API level.

---

## 17. Deployment & Infrastructure

### Production Deployment (Vercel)

```
GitHub Repository
    ↓ push to main
Vercel CD Pipeline
    ↓
pnpm install
next build
    ↓
Static assets → Vercel Edge CDN (global)
API Routes → Vercel Serverless Functions (Node.js runtime)
    ↓
Environment Variables → Vercel Dashboard (encrypted)
```

**Vercel Project Settings:**
- Framework: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Node.js version: 22.x (matches `@types/node: ^22`)

### Firebase Project Setup

1. **Firebase Console** → Create project → Enable Auth (Email/Password + Google provider)
2. **Firestore** → Create database in production mode
3. **Service Account** → Generate private key JSON → Extract `client_email` + `private_key`

### Upstash Redis Setup

1. Create database on [upstash.com](https://upstash.com) (free tier: 10,000 commands/day)
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

---

## 18. Planned Features (Post-MVP)

These features are outlined in `gemini.md` (project roadmap) and are not yet implemented.

### A. Real-Time Audio Scanner
- Dedicated audio waveform visualization component (neon cyan animated waveform)
- Stream audio to Gemini for speech-to-text + fraud analysis
- Mock/real endpoint toggle

### B. Suspicious Link Sandbox ("Visual Detonation Chamber")
- Screenshot API (e.g., ScreenshotOne, Playwright headless) to capture phishing page
- Display blurred screenshot with a neon "PHISHING SITE" stamp overlay
- Requires a headless browser or serverless screenshot service

### C. Live AI Copilot / Assistant
- Persistent chat widget (bottom-right) powered by Gemini via `@ai-sdk/react`
- Context: user's latest scan result injected into chat context
- Suggests running a scan when suspicious content is described

### D. Gamification System
- User scan count tracked in Firestore `/users/{uid}/stats`
- Points awarded per scan, per community report
- Leaderboard page: Top Defenders (read from Firestore, sorted by points)

### E. Browser Extension Integration
- Chrome Extension (Manifest V3) that highlights suspicious links on any page
- Extension communicates with CivixShield API for real-time checks
- Mock visualization: screenshot of Twitter/X with highlighted red links

### F. Rate Limiting
- `@upstash/ratelimit` middleware on `/api/analyze`
- Sliding window: 10 scans per IP per minute (unauthenticated)
- Higher limits for authenticated users and organization plans

### G. Composite Firestore Indexes
- Add `orderBy('created_at', 'desc')` to history query
- Requires creating composite index in Firebase Console

---

## 19. Error Handling Strategy

### API Layer

Every API route is wrapped in a `try/catch` block:

```typescript
try {
  // ... processing
  return NextResponse.json(result)
} catch (error) {
  console.error('...', error)
  return NextResponse.json({ error: 'User-friendly message' }, { status: 500 })
}
```

### AI Fallback Chain

```
Gemini API call
  └─ catch (any error)
       └─ calculateLocalRiskScore(content)
            └─ return fallback FraudAnalysis with:
                 confidence: 50 (explicitly marked as heuristic)
                 explanation: "AI endpoint failed. Showing local heuristic analysis."
```

### Database Error Isolation

Firestore write errors are caught **separately** from the main analysis logic:
```typescript
try {
  await adminDb.collection('analyses').add(...)
} catch (dbError) {
  console.error('Database error:', dbError)
  // Analysis result is still returned to user — db failure doesn't block the scan
}
```

### Firebase Admin Fallback

If the Admin SDK fails to initialize (missing credentials), it falls back to a dummy project ID. Individual Firestore operations then fail with Firestore errors that are caught per-call.

### Client-Side Loading States

- All form submissions set `isLoading = true` → disables submit button → prevents double-submission
- Loading spinners (`animate-spin border-b-2 border-primary`) shown during auth resolution and API calls

---

## 20. Glossary

| Term | Definition |
|---|---|
| **BFF** | Backend for Frontend — a server layer that aggregates APIs specifically for the frontend |
| **RSC** | React Server Components — Next.js server-side rendered components with no JS bundle cost |
| **JWT** | JSON Web Token — Firebase ID token used for auth verification |
| **Heuristic** | Local rule-based scoring without AI, used as a fallback when Gemini is unavailable |
| **TTL** | Time-To-Live — expiration duration for a Redis cache entry |
| **Admin SDK** | Firebase Admin SDK — server-side SDK with full database access, bypassing security rules |
| **PEM** | Privacy Enhanced Mail — format for RSA private keys (Firebase service account) |
| **Deepfake** | AI-generated or manipulated media designed to look/sound like a real person |
| **Safe Browsing** | Google's API that classifies URLs as malware, phishing, or unwanted software |
| **Edge CDN** | Content Delivery Network at the network edge — used by Vercel for static assets |
| **App Router** | Next.js 13+ routing system based on the `app/` directory and React Server Components |
| **CSR** | Client-Side Rendering — page rendered in the browser using JavaScript |
| **SSG** | Static Site Generation — page pre-rendered at build time |
| **Composite Index** | Firestore index required for queries combining `where()` + `orderBy()` on different fields |
| **FieldValue.serverTimestamp()** | Firestore function to write the server's current time (not the client's) |
| **EXIF** | Exchangeable Image File Format — metadata embedded in JPEG files that can cause cache key collisions |

---

*This document is auto-generated from source code analysis and kept in sync with the codebase. For implementation questions, refer to the linked source files. For deployment questions, refer to the Vercel and Firebase console dashboards.*
