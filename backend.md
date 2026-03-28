# CivixShield Backend Architecture

This document outlines the backend architecture, services, and API endpoints for the CivixShield application. It is designed to provide a clear technical overview of how data flows, how AI models are integrated, and how the system remains secure and performant.

## 1. Core Technologies & Infrastructure

- **Framework:** Next.js 14 App Router (`app/api/...`)
- **Database architecture:** Firebase Firestore (NoSQL Document Store) 
- **Authentication:** Firebase Authentication & Firebase Admin SDK
- **Caching Layer:** Upstash Redis (for API rate-limiting and response caching)
- **External AI Integrations:** 
  - Google Gemini 2.5 Flash (Multimodal Scam & Fraud Detection)
  - Hive AI V3 (Deepfake & AI-Generated Media Detection)
  - Google Safe Browsing API (Malicious URL Detection)

---

## 2. Key Backend Services (Libraries)

### `lib/fraud-detector.ts`
The core brain of the application's text and image-based threat detection.
- Uses **Google Gemini 2.5 Flash** with rigid `response_schema` enforcements to return parsed JSON directly.
- Implements a caching mechanism via **Upstash Redis** to prevent redundant LLM API calls for identical media and text payloads.
- Integrates **Google Safe Browsing** to concurrently process any URLs extracted from the user's input.
- Includes a deterministic **heuristic fallback** (`calculateLocalRiskScore`) that calculates a risk score based on keyword frequency if the Gemini API is temporarily unavailable or rate-limited.

### `lib/firebase-admin.ts`
Establishes the server-side, privileged connection to Firestore using Service Account credentials. This allows the backend to securely query, insert, and delete data without exposing Firestore rules to the client-side.

---

## 3. API Endpoints

### 🛡️ Core Analysis & Deepfake Engines

**`POST /api/analyze` (Multimodal Fraud Scanner)**
- **Purpose:** Analyzes text, emails, screenshots, and audio snippets.
- **Flow:** 
  1. Accepts text content and/or `mediaBase64`.
  2. Passes data to `analyzeFraudRisk()` -> Gemini 2.5 Flash.
  3. Extracts URLs and evaluates them against Google Safe Browsing.
  4. Aggregates the threat score (adds penalties if unsafe URLs are found).
  5. Determines an overall risk level (Low, Medium, High, Critical).
  6. **Saves history:** Regardless of login status, saves the scan to Firestore collection `analyses`. If the user is authenticated, updates their organization scan tally.
  7. **Auto-sharing:** If the risk score exceeds 60%, automatically scrubs PII and shares the scam payload anonymously to the `community_scams` feed to warn others.

**`POST /api/deepfake` (Deepfake Media Engine)**
- **Purpose:** Handles large file uploads (up to 50MB) of Images or Videos for synthetic media detection.
- **Flow:**
  1. Validates MIME types (JPEG, PNG, WEBP, MP4, WEBM).
  2. Converts file to Base64 and triggers **Hive AI** (`ai-generated-and-deepfake-content-detection`).
  3. Iterates over frames. The final AI percentage score is the **maximum** score found in any single frame (since deepfakes sometimes only fail for a few frames).
  4. Surfaces a ceiling score of 99% (instead of 100%) to align with the UX best practice of AI certainty phrasing.

---

## 4. User Data & Community

**`GET /api/analyze/history`**
- **Purpose:** Fetches a user's chronological scanning history.
- **Flow:** Queries the `analyses` Firestore collection by `user_id` and sorts them in-memory by timestamp to bypass complex Firestore composite index requirements.

**`GET /api/community/feed`**
- **Purpose:** Retrieves the most recent community-flagged scams.
- **Flow:** Queries `community_scams` from Firestore, limited to the top 50, ordered chronologically.

**`POST /api/community/share`**
- **Purpose:** Allows an authenticated user to manually share a scam analysis to the community wall.
- **Security:** Verifies Bearer tokens using `adminAuth.verifyIdToken`. Creates an anonymized handle out of their email prefix.

**`DELETE /api/community/feed`**
- **Purpose:** Deletes a specific community scam entry by its document ID.

---

## 5. Account Management & Reporting

**`POST /api/reports/generate`**
- **Purpose:** Compiles a statistical safety report for a specific user.
- **Flow:** Authenticates the user via Bearer token, fetches up to 100 of their most recent `analyses`, and calculates metrics like total items analyzed and total critical threats identified.

**`POST /api/auth/delete-account`**
- **Purpose:** Handles GDPR-compliant account deletion.
- **Flow:** 
  1. Validates the Firebase ID token.
  2. Executes a Firestore Batch deletion, scrubbing all scan history in `analyses` referencing the `user_id`.
  3. Permanently deletes the user from Firebase Auth via `adminAuth.deleteUser()`.

**`GET /api/videos`**
- **Purpose:** Serves a static JSON array of educational cybersecurity and threat-awareness YouTube videos (e.g., RBI Digital Arrest warnings).

## Summary for Judges
The backend is completely serverless. By putting the logic within the App Router API handlers, we guarantee that API keys for Gemini, Hive AI, Upstash, and Google Safe Browsing are never exposed to the client browser. Firebase Admin prevents malicious clients from bypassing client-side security rules, keeping read/write access and caching secure and tightly controlled.
