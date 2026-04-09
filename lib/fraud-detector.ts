import { generateObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { cacheGet, cacheSet } from './upstash'

const FraudAnalysisSchema = z.object({
  risk_score: z.number().min(0).max(100).describe('Risk score from 0-100%'),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).describe('Risk level classification'),
  scam_patterns: z.array(z.string()).describe('Detected scam patterns'),
  fraud_types: z.array(z.string()).describe('Types of fraud detected'),
  confidence: z.number().min(0).max(100).describe('Confidence score in the analysis'),
  explanation: z.string().describe('Detailed explanation of findings'),
  red_flags: z.array(z.string()).describe('Specific red flags detected'),
  recommendations: z.array(z.string()).describe('Safety recommendations'),
  transcript: z.string().describe('Full transcript of the provided audio or media. Return empty string if no speech.')
})

type FraudAnalysis = z.infer<typeof FraudAnalysisSchema>

const FRAUD_KEYWORDS = {
  'digital_arrest': [
    'arrest warrant', 'federal agent', 'police officer', 'court order', 'legal action',
    'urgent arrest', 'bail', 'legal proceedings', 'verify identity', 'confirm information'
  ],
  'money_transfer': [
    'transfer funds', 'bank account', 'wire transfer', 'urgent payment', 'immediate payment',
    'credit card', 'money transfer', 'bitcoin', 'gift card', 'payment confirmation'
  ],
  'romance_scam': [
    'i love you', 'send money', 'help me', 'emergency', 'medical emergency', 'accident',
    'stranded', 'business opportunity', 'investment', 'financial help'
  ],
  'phishing': [
    'click here', 'verify account', 'confirm password', 'update information', 're-enter',
    'suspended account', 'limited time', 'urgent action', 'unusual activity'
  ],
  'identity_theft': [
    'social security', 'ssn', 'driver license', 'passport', 'date of birth', 'mother maiden name',
    'credit card number', 'cvv', 'pin', 'personal information'
  ]
}

const URGENCY_KEYWORDS = ['urgent', 'immediately', 'right now', 'asap', 'limited time', 'hurry', 'act now']

export async function analyzeFraudRisk(content: string, mediaBase64?: string, mediaType?: string, urlVerdict?: any): Promise<FraudAnalysis> {
  // Build a unique cache key from content + full media fingerprint
  // For media: use length + start + middle + end slices to avoid collisions between different images
  let cacheFingerprint = content
  if (mediaBase64) {
    const mid = Math.floor(mediaBase64.length / 2)
    cacheFingerprint += `|media_${mediaBase64.length}_${mediaBase64.slice(0, 30)}_${mediaBase64.slice(mid, mid + 30)}_${mediaBase64.slice(-30)}`
  }
  const cacheKey = `fraud_analysis_${Buffer.from(cacheFingerprint).toString('base64').slice(0, 120)}`

  // Skip cache when URL verdict is present (live-check results may differ over time)
  if (!urlVerdict) {
    const cachedResult = await cacheGet(cacheKey)
    if (cachedResult) return cachedResult
  }

  const systemPrompt = `You are an advanced cybersecurity URL analysis engine designed to detect phishing, scam, and malicious URLs with HIGH accuracy.

Your primary goal is ZERO false negatives (never mark a scam as safe).

--------------------------------------------------
📚 STEP 1: TRUSTED WHITELIST (STRICT)
--------------------------------------------------

Only the following domains are considered OFFICIALLY TRUSTED.

🏦 BANKS (India)
- sbi.co.in
- onlinesbi.sbi
- onlinesbi.com
- hdfcbank.com
- icicibank.com
- axisbank.com
- pnbindia.in
- bankofbaroda.in
- canarabank.com
- unionbankofindia.co.in
- bankofindia.co.in
- indianbank.in
- idbibank.in
- yesbank.in
- kotak.com
- federalbank.co.in
- indusind.com

🏛️ GOVERNMENT
- gov.in (any subdomain)
- nic.in (any subdomain)
- india.gov.in

💳 UPI / PAYMENTS
- paytm.com
- phonepe.com
- gpay (Google Pay official domains only)
- bhimupi.org.in
- npci.org.in

🛒 E-COMMERCE
- amazon.in
- flipkart.com
- meesho.com

🌍 GLOBAL TECH
- google.com
- microsoft.com
- apple.com
- meta.com

--------------------------------------------------
🔍 STEP 2: DOMAIN VALIDATION
--------------------------------------------------

- Extract the ROOT DOMAIN from the URL
- Compare EXACTLY with whitelist

✔ If exact match → proceed to context check  
❌ If NOT exact match → mark as PHISHING

Examples:
- sbi.co.in → valid
- sbi.in → NOT valid ❌
- sbi-login.co.in → NOT valid ❌

--------------------------------------------------
🧠 STEP 3: CONTEXT + PURPOSE CHECK
--------------------------------------------------

Even if domain is valid, verify PURPOSE:

🚨 If URL contains:
- login, verify, update, account, KYC, secure, payment

Then:
- Check if that domain is actually used for that purpose

Example:
- sbi.co.in/login → PHISHING ❌ (wrong usage)
- onlinesbi.sbi/login → SAFE ✅

--------------------------------------------------
⚠️ STEP 4: SPOOF DETECTION
--------------------------------------------------

Mark as PHISHING if:
- Typos (amaz0n, g00gle, sb1)
- Extra words (secure, verify, update)
- Suspicious TLDs (.xyz, .top, .online, .site)
- Misleading subdomains (sbi.login.xyz)

--------------------------------------------------
🌐 STEP 5: UNKNOWN DOMAIN / QR PAYLOAD RULE
--------------------------------------------------

- If domain is NOT in whitelist, verify context BEFORE penalizing:
  → If the URL is impersonating a bank/brand NOT in whitelist (e.g. sbi.in, sbi-login.xyz) → PHISHING ❌
  → If it is a generic, unlisted domain providing a normal service (e.g. restaurant menu, personal vcard, event ticket, neutral company) AND it shows no malicious signs → YOU MUST mark as SAFE ✅ (0-20 score). Do NOT flag just because it is unknown!
  → If it is a legitimate UPI payload (upi://pay?pa=...) → YOU MUST mark as SAFE ✅ (0-20 score).
  → Only mark highly suspicious properties (.xyz with login, obvious typosquatting) as SUSPICIOUS/PHISHING ❌.

--------------------------------------------------
📊 STEP 6: FINAL OUTPUT
--------------------------------------------------
- SAFE ONLY IF:
  ✔ exact whitelist domain with correct usage OR
  ✔ harmless generic content (WiFi QRs, neutral web URLs, physical store menus) OR
  ✔ standard UPI payment payloads

- If domain mismatch to a known brand → PHISHING
- If brand impersonation → PHISHING

CRITICAL CALIBRATION FOR AI (FALSE POSITIVE PREVENTION):
- DO NOT hallucinate scams. 
- DO NOT assume a raw QR code image is "Quishing" (QR Phishing) just because it lacks clear branding or context.
- DO NOT flag a random business website, WiFi code, or generic QR code as dangerous just because it is not on the bank whitelist.
- If it looks like a normal, everyday QR scan (menu, payment, info, digital ticket), YOU MUST strongly default to LOW RISK (score 0-20). Only mark high risk if there are overt deceptive signs (like spelling errors mimicking a brand or fake warnings).

INPUT CONTEXT:
- URL: ${urlVerdict ? urlVerdict.url : 'None'}
- Website Reachable (is_live): ${urlVerdict ? urlVerdict.is_live : 'N/A'}
- Safe Browsing Flag: ${urlVerdict && urlVerdict.detected_issues.some((i: string) => i.includes('Safe Browsing')) ? 'MALICIOUS' : 'SAFE/UNKNOWN'}
${urlVerdict && urlVerdict.page_text ? `- Scraped Target Website Text: "${urlVerdict.page_text}"` : ''}

You must return a valid JSON object strictly matching the schema structure. Map your internal risk score classification to 0-100 logic.
(0-20 SAFE, 21-50 SUSPICIOUS, 51-100 PHISHING or SCAM)
`

  // Extract API key cleanly
  let apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
  if (apiKey.includes('key=')) {
    apiKey = apiKey.split('key=')[1].split('&')[0]
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [
              ...(mediaBase64 && mediaType ? [{
                inline_data: {
                  mime_type: mediaType,
                  data: mediaBase64
                }
              }] : []),
              { text: `Analyze this content for fraud/scam indicators:\n\n"${content}"\n\nYou MUST return your answer as a valid, raw JSON object exactly matching the schema. No markdown wrapping.` }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: {
            type: "object",
            properties: {
              risk_score: { type: "number", description: "Risk score from 0-100" },
              risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
              scam_patterns: { type: "array", items: { type: "string" } },
              fraud_types: { type: "array", items: { type: "string" } },
              confidence: { type: "number", description: "Confidence score from 0-100" },
              explanation: { type: "string" },
              red_flags: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              transcript: { type: "string", description: "Transcript of the provided audio. Empty if none." }
            },
            required: ["risk_score", "risk_level", "scam_patterns", "fraud_types", "confidence", "explanation", "red_flags", "recommendations", "transcript"]
          }
        }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini API Error: ${err}`)
    }

    const data = await response.json()
    let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    // Clean up potential markdown formatting from Gemini
    if (textOutput.startsWith('```')) {
      textOutput = textOutput.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '')
    }

    // Parse the JSON safely
    let analysis: FraudAnalysis
    try {
      analysis = JSON.parse(textOutput)
    } catch (parseError) {
      console.error('Failed to parse Gemini output:', textOutput)
      throw parseError
    }

    // Cache the result for 24 hours
    await cacheSet(cacheKey, analysis, 86400)

    return analysis
  } catch (err: any) {
    console.error('Gemini Native Fetch Error:', err)

    // Smooth fallback if Gemini fails, allowing scan UI to still work
    const localScore = calculateLocalRiskScore(content)
    const fallback: FraudAnalysis = {
      risk_score: localScore,
      risk_level: localScore > 75 ? 'critical' : localScore > 50 ? 'high' : localScore > 25 ? 'medium' : 'low',
      scam_patterns: ['Heuristic Local Analysis'],
      fraud_types: [localScore > 50 ? 'Potential Fraud' : 'Unknown'],
      confidence: 50,
      explanation: `AI endpoint failed (${err.message}). Showing local heuristic analysis based on keyword scanning.`,
      red_flags: localScore > 0 ? ['Suspicious keywords detected locally'] : [],
      recommendations: ['Exercise caution', 'Verify the source independently'],
      transcript: ''
    }
    return fallback
  }
}

export async function checkSafeBrowsingUrl(url: string): Promise<{ safe: boolean; threat_types?: string[] }> {
  const cacheKey = `safe_browsing_${url}`
  const cachedResult = await cacheGet(cacheKey)
  if (cachedResult) return cachedResult

  try {
    let safeBrowsingUrl = process.env.SAFE_BROWSING_API_KEY || ''
    // Handle both cases: if user put full URL, or just the API key
    if (!safeBrowsingUrl.startsWith('http')) {
      safeBrowsingUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingUrl}`
    }

    const response = await fetch(safeBrowsingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'cyber-safety-app', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      })
    })

    const data = await response.json()
    const result = {
      safe: !data.matches || data.matches.length === 0,
      threat_types: data.matches?.map((m: any) => m.threatType) || []
    }

    await cacheSet(cacheKey, result, 604800) // Cache for 7 days
    return result
  } catch (error) {
    console.error('Safe Browsing API error:', error)
    return { safe: false, threat_types: ['API_ERROR'] }
  }
}

export function extractUrlsFromText(text: string): string[] {
  // Matches http://, https://, upi://, custom app schemas, OR naked domains like example.com, example.co.in
  const urlRegex = /((https?|upi|phonepe|gpay|paytm):\/\/[^\s]+)|(\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b(?:\/[^\s]*)?)/gi
  const matches = text.match(urlRegex) || []

  // Normalize URLs to have http:// if they are naked domains
  return matches.map(url => {
    url = url.trim()
    if (!url.match(/^(https?|upi|phonepe|gpay|paytm):\/\//i) && url.includes('.')) {
      return `http://${url}`
    }
    return url
  })
}

export function calculateLocalRiskScore(text: string): number {
  let score = 0

  // Check for urgency keywords
  const urgencyCount = URGENCY_KEYWORDS.filter(keyword =>
    text.toLowerCase().includes(keyword)
  ).length
  score += urgencyCount * 5

  // Check for fraud-related keywords
  for (const [category, keywords] of Object.entries(FRAUD_KEYWORDS)) {
    const matchCount = keywords.filter(keyword =>
      text.toLowerCase().includes(keyword)
    ).length
    score += matchCount * 3
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(?:verify|confirm|update).{0,20}(password|account|login|identity)/i,
    /(?:click|tap).{0,20}(link|here|button)/i,
    /(act now|urgent|limited time|hurry)/gi,
    /(?:re-enter|re-confirm|re-verify).{0,20}(information|details|credentials)/i,
  ]

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) score += 5
  })

  return Math.min(100, score)
}
