export interface UrlVerdictResult {
  url: string
  domain: string
  verdict: 'Legitimate' | 'Suspicious' | 'Phishing'
  confidence: 'Low' | 'Medium' | 'High'
  risk_score: number
  reason: string
  detected_issues: string[]
  matched_brand?: string
  is_live: boolean | 'unknown'
  page_text?: string
}

const TRUSTED_DOMAINS: Record<string, string> = {
  // ═══════════════════════════════════════════
  // INDIAN GOVERNMENT PORTALS
  // ═══════════════════════════════════════════
  'india.gov.in': 'Government of India',
  'nic.in': 'National Informatics Centre',
  'digitalindia.gov.in': 'Digital India',
  'incometax.gov.in': 'Income Tax India',
  'incometaxindiaefiling.gov.in': 'Income Tax eFiling',
  'epfindia.gov.in': 'EPFO India',
  'passportindia.gov.in': 'Passport Seva',
  'uidai.gov.in': 'UIDAI (Aadhaar)',
  'digilocker.gov.in': 'DigiLocker',
  'cowin.gov.in': 'CoWIN',
  'irctc.co.in': 'IRCTC',
  'indianrailways.gov.in': 'Indian Railways',
  'rbi.org.in': 'Reserve Bank of India',
  'sebi.gov.in': 'SEBI',
  'gst.gov.in': 'GST Portal',
  'pmjay.gov.in': 'Ayushman Bharat',
  'nrega.nic.in': 'MGNREGA',
  'parivahan.gov.in': 'Parivahan (Transport)',
  'ecourts.gov.in': 'eCourts India',
  'cybercrime.gov.in': 'Cyber Crime Portal',
  'mygov.in': 'MyGov India',
  'umang.gov.in': 'UMANG App',
  'nvsp.in': 'Voter Portal',

  // ═══════════════════════════════════════════
  // INDIAN BANKS
  // ═══════════════════════════════════════════
  'onlinesbi.com': 'State Bank of India',
  'onlinesbi.sbi': 'State Bank of India',
  'sbi.co.in': 'State Bank of India',
  'hdfcbank.com': 'HDFC Bank',
  'icicibank.com': 'ICICI Bank',
  'axisbank.com': 'Axis Bank',
  'kotak.com': 'Kotak Mahindra Bank',
  'kotakbank.com': 'Kotak Mahindra Bank',
  'pnbindia.in': 'Punjab National Bank',
  'bankofindia.co.in': 'Bank of India',
  'bankofbaroda.in': 'Bank of Baroda',
  'canarabank.com': 'Canara Bank',
  'unionbankofindia.co.in': 'Union Bank of India',
  'indianbank.in': 'Indian Bank',
  'iob.in': 'Indian Overseas Bank',
  'idbibank.in': 'IDBI Bank',
  'yesbank.in': 'Yes Bank',
  'federalbank.co.in': 'Federal Bank',
  'southindianbank.com': 'South Indian Bank',
  'rblbank.com': 'RBL Bank',
  'indusind.com': 'IndusInd Bank',
  'centralbankofindia.co.in': 'Central Bank of India',
  'ucobank.com': 'UCO Bank',
  'mahabank.co.in': 'Bank of Maharashtra',

  // ═══════════════════════════════════════════
  // UPI / PAYMENT PLATFORMS
  // ═══════════════════════════════════════════
  'paytm.com': 'Paytm',
  'phonepe.com': 'PhonePe',
  'pay.google.com': 'Google Pay',
  'bhimupi.org.in': 'BHIM UPI',
  'npci.org.in': 'NPCI',
  'razorpay.com': 'Razorpay',
  'paypal.com': 'PayPal',
  'stripe.com': 'Stripe',
  'freecharge.in': 'Freecharge',
  'mobikwik.com': 'MobiKwik',
  'cred.club': 'CRED',
  'simpl.co': 'Simpl',
  'lazypay.in': 'LazyPay',

  // ═══════════════════════════════════════════
  // E-COMMERCE
  // ═══════════════════════════════════════════
  'amazon.in': 'Amazon India',
  'amazon.com': 'Amazon',
  'flipkart.com': 'Flipkart',
  'myntra.com': 'Myntra',
  'ajio.com': 'AJIO',
  'meesho.com': 'Meesho',
  'snapdeal.com': 'Snapdeal',
  'nykaa.com': 'Nykaa',
  'tatacliq.com': 'Tata CLiQ',
  'jiomart.com': 'JioMart',
  'bigbasket.com': 'BigBasket',
  'swiggy.com': 'Swiggy',
  'zomato.com': 'Zomato',
  'blinkit.com': 'Blinkit',
  'ebay.com': 'eBay',
  'ebay.in': 'eBay India',
  'alibaba.com': 'Alibaba',
  'shopify.com': 'Shopify',

  // ═══════════════════════════════════════════
  // TELECOM
  // ═══════════════════════════════════════════
  'jio.com': 'Reliance Jio',
  'airtel.in': 'Airtel',
  'myvi.in': 'Vi (Vodafone Idea)',
  'bsnl.co.in': 'BSNL',

  // ═══════════════════════════════════════════
  // INSURANCE
  // ═══════════════════════════════════════════
  'licindia.in': 'LIC of India',
  'policybazaar.com': 'PolicyBazaar',
  'starhealth.in': 'Star Health Insurance',
  'icicilombard.com': 'ICICI Lombard',
  'hdfcergo.com': 'HDFC ERGO',

  // ═══════════════════════════════════════════
  // TECH / SOCIAL MEDIA / GLOBAL PLATFORMS
  // ═══════════════════════════════════════════
  'google.com': 'Google',
  'gmail.com': 'Gmail (Google)',
  'youtube.com': 'YouTube',
  'microsoft.com': 'Microsoft',
  'live.com': 'Microsoft Live',
  'outlook.com': 'Microsoft Outlook',
  'office.com': 'Microsoft Office',
  'apple.com': 'Apple',
  'icloud.com': 'Apple iCloud',
  'facebook.com': 'Facebook',
  'meta.com': 'Meta',
  'instagram.com': 'Instagram',
  'whatsapp.com': 'WhatsApp',
  'twitter.com': 'X (Twitter)',
  'x.com': 'X (Twitter)',
  'linkedin.com': 'LinkedIn',
  'netflix.com': 'Netflix',
  'spotify.com': 'Spotify',
  'github.com': 'GitHub',
  'zoom.us': 'Zoom',
  'telegram.org': 'Telegram',
  'reddit.com': 'Reddit',
  'wikipedia.org': 'Wikipedia',
  'yahoo.com': 'Yahoo',
  'dropbox.com': 'Dropbox',
  'adobe.com': 'Adobe',
  'slack.com': 'Slack',
  'notion.so': 'Notion',
  'canva.com': 'Canva',
  'openai.com': 'OpenAI',
  'chatgpt.com': 'ChatGPT',

  // ═══════════════════════════════════════════
  // TRAVEL / BOOKING
  // ═══════════════════════════════════════════
  'makemytrip.com': 'MakeMyTrip',
  'goibibo.com': 'Goibibo',
  'cleartrip.com': 'Cleartrip',
  'yatra.com': 'Yatra',
  'booking.com': 'Booking.com',
  'trivago.com': 'Trivago',
  'airbnb.com': 'Airbnb',
  'oyo.com': 'OYO Rooms',

  // ═══════════════════════════════════════════
  // EDUCATION
  // ═══════════════════════════════════════════
  'byjus.com': 'BYJU\'S',
  'unacademy.com': 'Unacademy',
  'udemy.com': 'Udemy',
  'coursera.org': 'Coursera',
}

const BRAND_NAMES = Object.values(TRUSTED_DOMAINS).map(b => b.toLowerCase())
const BRAND_KEYWORDS = [
  // Banks
  'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'canara', 'idbi', 'rbl', 'indusind',
  // UPI / Payments
  'paytm', 'phonepe', 'googlepay', 'bhim', 'razorpay', 'paypal', 'mobikwik', 'freecharge', 'cred',
  // E-Commerce
  'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'snapdeal', 'nykaa', 'jiomart', 'bigbasket', 'swiggy', 'zomato', 'blinkit', 'ebay', 'shopify',
  // Government
  'aadhaar', 'uidai', 'digilocker', 'irctc', 'epfo', 'passport', 'incometax', 'gst',
  // Tech / Platforms
  'google', 'microsoft', 'apple', 'facebook', 'instagram', 'whatsapp', 'netflix', 'linkedin', 'twitter', 'youtube', 'telegram', 'github',
  // Telecom
  'airtel', 'jio', 'bsnl',
  // Insurance
  'lic', 'policybazaar',
  // Travel
  'makemytrip', 'goibibo', 'cleartrip', 'booking', 'airbnb', 'oyo',
]

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.info', '.tk', '.ml', '.ga', '.cc', '.buzz', '.loan', '.icu', '.club', '.online', '.vip', '.gq', '.cf', '.work', '.zip']

const NLP_INTENT_KEYWORDS = [
  'login', 'verify', 'update', 'secure', 'account', 'otp', 'bank', 'banking', 'payment', 'refund',
  'alert', 'blocked', 'kyc', 'support', 'help', 'auth', 'authorize', 'recovery',
  'suspended', 'suspend', 'restricted', 'free', 'gift', 'prize', 'winner'
]

const SHORT_DOMAINS = [
  "bit.ly", "tinyurl.com", "t.co", "lnk.ing", "tiny.jio.com", "lihi.cc", "bitli.in"
]


function isSSRFSafe(hostname: string): boolean {
  if (hostname === 'localhost') return false
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false
  return true
}

export async function analyzeUrlStrict(inputUrl: string): Promise<UrlVerdictResult> {
  const result: UrlVerdictResult = {
    url: inputUrl,
    domain: '',
    verdict: 'Legitimate',
    confidence: 'Medium',
    risk_score: 0,
    reason: '',
    detected_issues: [],
    is_live: 'unknown'
  }

  // 1. Extract and sanitize URL
  let parsedUrl: URL
  try {
    // try prepending http:// if not present just to parse
    const urlToParse = inputUrl.startsWith('http') ? inputUrl : `http://${inputUrl}`
    parsedUrl = new URL(urlToParse)
  } catch (e) {
    result.verdict = 'Suspicious'
    result.confidence = 'Low'
    result.risk_score = 50
    result.reason = 'Maloformed or unparseable URL provided.'
    result.detected_issues.push('Invalid URL format')
    return result
  }

  // 2. Active Live Check & Redirect Expansion
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    // Using GET over HEAD so we can follow redirects and identify the final destination
    const response = await fetch(parsedUrl.toString(), {
      method: 'GET', 
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'CyberSecurityScanner/1.0' }
    })

    clearTimeout(timeoutId)
    result.is_live = true
    
    // Automatically use the final redirected URL for all subsequent security analysis
    if (response.url && response.url !== parsedUrl.toString()) {
       parsedUrl = new URL(response.url)
    }

    // Extract page text for deep AI analysis
    try {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/html')) {
        const html = await response.text()
        const cleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        result.page_text = cleanText.substring(0, 1500) // Keep first ~250 words
      }
    } catch (e) {
      // Ignore text extraction errors gracefully
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      result.is_live = false
      result.detected_issues.push('Website did not respond within 6 seconds (Timeout)')
    } else {
      result.is_live = false
      result.detected_issues.push('Website appears to be down or unreachable')
    }
  }

  // 3. Extract final root domain from the resolved URL
  const hostname = parsedUrl.hostname.toLowerCase()
  result.domain = hostname

  // Basic root domain extraction
  let rootDomain = hostname
  const parts = hostname.split('.')
  if (parts.length > 2) {
    const last = parts[parts.length - 1]
    const secondLast = parts[parts.length - 2]
    if (['co', 'com', 'org', 'net', 'edu', 'gov', 'in'].includes(secondLast)) {
      rootDomain = parts.slice(-3).join('.')
    } else {
      rootDomain = parts.slice(-2).join('.')
    }
  }

  // Security check: Prevent SSRF
  if (!isSSRFSafe(hostname)) {
    result.verdict = 'Suspicious'
    result.confidence = 'High'
    result.risk_score = 100
    result.reason = 'URL resolves to an internal network address (SSRF attempt blocked).'
    result.detected_issues.push('Internal IP address detected')
    result.is_live = false
    return result
  }

  // 2. Strict Domain Match
  if (TRUSTED_DOMAINS[rootDomain]) {
    // Only trust it if the root domain strictly matches
    result.verdict = 'Legitimate'
    result.confidence = 'High'
    result.risk_score = 0
    result.matched_brand = TRUSTED_DOMAINS[rootDomain]
    result.reason = `Domain successfully verified as an official ${TRUSTED_DOMAINS[rootDomain]} entity.`

    // Slight check for HTTP on trusted domains
    if (parsedUrl.protocol === 'http:') {
      result.detected_issues.push('Insecure HTTP connection on trusted domain')
      result.verdict = 'Suspicious'
      result.risk_score += 40
      result.reason += ' However, the link uses insecure HTTP instead of HTTPS, which might indicate a Man-in-the-Middle attack or incorrect link.'
    }
    return result
  }

  // If not exactly trusted, begin Suspicious / Phishing checks
  let score = 0
  const issues: string[] = []

  // 3. Safe Browsing API Check (External Threat Intel)
  try {
    const safeBrowsingUrl = process.env.SAFE_BROWSING_API_KEY;
    if (safeBrowsingUrl) {
      const sbResponse = await fetch(safeBrowsingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'civixshield', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url: parsedUrl.toString() }]
          }
        })
      });
      if (sbResponse.ok) {
        const sbData = await sbResponse.json();
        if (sbData.matches && sbData.matches.length > 0) {
          result.verdict = 'Phishing';
          result.confidence = 'High';
          result.risk_score = 100;
          result.reason = `Critical Warning: Google Safe Browsing flagged this URL as a known ${sbData.matches[0].threatType} threat.`;
          result.detected_issues.push(`Flagged by Safe Browsing API (${sbData.matches[0].threatType})`);
          return result;
        }
      }
    }
  } catch (e) {
    // Silently ignore safe browsing fetch errors to ensure script continues offline
  }

  // 4. Phishing Signals Detection

  // A. Short URL Detection
  const isShortUrl = SHORT_DOMAINS.some(d => hostname === d || hostname.endsWith("." + d));
  if (isShortUrl) {
    score += 50;
    issues.push('URL shortening service detected (commonly used to obscure identity)');
  }

  // B. Brand Impersonation Check (Brand in subdomain or path but not root domain)
  let impersonatedBrand = ''
  for (const keyword of BRAND_KEYWORDS) {
    if (hostname.includes(keyword) || parsedUrl.pathname.toLowerCase().includes(keyword)) {
      impersonatedBrand = keyword
      score += 60
      issues.push(`Brand impersonation attempt ('${keyword}')`)
      break
    }
  }

  // B. NLP Intent Keywords (login, verify, otp, etc.)
  let intentMatchCount = 0
  for (const keyword of NLP_INTENT_KEYWORDS) {
    if (hostname.includes(keyword) || parsedUrl.pathname.toLowerCase().includes(keyword)) {
      intentMatchCount++
      issues.push(`Suspicious keyword ('${keyword}') commonly used in phishing`)
      score += 25
    }
  }

  // C. Suspicious TLDs
  for (const tld of SUSPICIOUS_TLDS) {
    if (hostname.endsWith(tld)) {
      score += 40
      issues.push(`Suspicious Top-Level Domain (${tld})`)
      break
    }
  }

  // D. Hyphens or Long URLs
  const hyphenCount = (hostname.match(/-/g) || []).length
  if (hyphenCount >= 2) {
    score += 20
    issues.push(`Multiple hyphens in domain name (typical of fake sites)`)
  }
  if (hostname.length > 30) {
    score += 15
    issues.push('Unusually long domain name')
  }

  // E. HTTP protocol
  if (parsedUrl.protocol === 'http:') {
    score += 10
    issues.push('Insecure connection (HTTP instead of HTTPS)')
  }

  // F. IP Address as host
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  if (isIpAddress) {
    score += 50
    issues.push('URL uses an IP address instead of a domain name')
  }

  // 4. Final Decision Logic
  result.risk_score = Math.min(100, score)
  result.detected_issues = issues

  if (result.risk_score >= 60) {
    result.verdict = 'Phishing'
    result.confidence = 'High'
    if (impersonatedBrand) {
      result.reason = `High risk of brand impersonation. The domain structure mimics known entities but fails authenticity checks.`
    } else {
      result.reason = `Critical security warning: The URL exhibits multiple phishing indicators and manipulative patterns.`
    }
  } else if (result.risk_score >= 30) {
    result.verdict = 'Suspicious'
    result.confidence = 'Medium'
    result.reason = `Analysis flagged anomalous structural patterns. Verification of the source is strongly recommended before proceeding.`
  } else {
    // Low score, but not in trusted list
    if (result.risk_score >= 15) {
      result.verdict = 'Suspicious'
      result.confidence = 'Medium'
      result.reason = `Analysis flagged anomalous structural patterns. Proceed with caution.`
    } else {
      result.verdict = 'Legitimate'
      result.confidence = 'Low'
      result.reason = `No explicit phishing indicators detected, but the domain's authenticity is unverified. Proceed with standard caution.`
      if (result.detected_issues.length === 0) {
        result.detected_issues.push('Unverified external domain')
      }
    }
  }

  // Final context for dead links
  if (!result.is_live) {
    result.verdict = 'Phishing'
    result.confidence = 'High'
    result.risk_score = Math.max(result.risk_score, 85) // Non-existent links are aggressively marked as unsafe/scam
    result.reason = `CRITICAL ALERT: This website does not exist, is completely offline, or is unreachable. Links pointing to dead or non-existent domains are a massive indicator of a fake website or a scam.`
    if (!result.detected_issues.includes('Website appears to be down or unreachable')) {
      result.detected_issues.push('Website does not exist (Offline/Unreachable)')
    }
  }

  return result
}
