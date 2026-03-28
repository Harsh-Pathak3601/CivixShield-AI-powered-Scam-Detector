# Personal Protection System against Social Media Scams and Digital Fraud

An intelligent cyber-safety application natively designed to detect social media scams, suspicious messages, and specifically **“digital arrest”** fraud patterns using AI/NLP techniques.

Below is a complete breakdown of where and how the "Digital Arrest" safety pipeline is implemented throughout the CivixShield application.

---

## 1. AI/NLP Detection Engine (`lib/fraud-detector.ts`)

The core of the application's intelligence relies on both advanced LLM evaluation and localized keyword NLP heuristics.

### A. Gemini 2.5 Flash Instruction
When parsing emails, texts, or performing Optical Character Recognition (OCR) on screenshots sent to the `POST /api/analyze` endpoint, the system sends an explicit directive to the Gemini model to identify digital arrests:

```typescript
const systemPrompt = `You are an expert cybersecurity analyst specializing in detecting scams...
Consider:
1. Digital arrest scams (impersonating law enforcement)
2. Money transfer/payment scams
...`
```

### B. Local NLP Heuristics (Deterministic Fallback)
To ensure the app can identify digital arrests even during AI api outages or rate limits, social media messages are matched against a local string matrix. If these NLP tokens appear, the localized risk score triggers a "Suspicious" or "High Risk" alert.

```typescript
const FRAUD_KEYWORDS = {
  'digital_arrest': [
    'arrest warrant', 'federal agent', 'police officer', 'court order', 'legal action',
    'urgent arrest', 'bail', 'legal proceedings', 'verify identity', 'confirm information'
  ]
}
```

---

## 2. Educational & Cyber Awareness Video API (`app/api/videos/route.ts`)

To ensure proactive prevention of digital arrests, the platform integrates an awareness module serving curated verified PSAs and official warnings about the scam. Three of the primary videos distributed in the network are heavily focused on this exact fraud pattern:

1. **Digital Arrest Scam (ft. Nana Patekar) - Watch & Learn**
   *Description:* A crucial PSA about the 'Digital Arrest' scam, where scammers pose as law enforcement agencies over video calls.
2. **RBI Digital Arrest Warning - Handcuff Scam**
   *Description:* An official public interest message from the Reserve Bank of India (RBI). Learn how scammers fake 'Digital Arrests' using fake police setups to extort money.
3. **RBI Digital Arrest Warning - Interrogation Scam**
   *Description:* Learn how scammers fake 'Digital Arrests' using fake interrogation tactics to extort money.

---

## 3. Real-World Case Studies UI (`app/scam-alerts/page.tsx`)

To educate the public, the dedicated **Scam Alerts** dashboard features a real-world, verified digital arrest case that demonstrates exactly how social engineering hooks the victims:

- **Tag:** `DIGITAL ARREST`
- **Headline:** Digital Arrest Scam: How Fake Police Calls Trap Victims
- **Verified Event Snippet:** 
  > *Nagaur police arrested 4 people from New Delhi, including a CA, who posed as Bengaluru police on video calls and put a retired doctor under "digital arrest" — extracting ₹34 lakh using threats of human trafficking charges. Police never demand money over video calls. Fear-based threats are a major red flag. Immediate reporting helped freeze ₹5 lakh.*

---

## Summary of Implementation

By uniting **AI-powered context evaluation (Gemini)**, **NLP keyword-matching**, **community alert propagation**, and **proactive video education**, CivixShield builds a comprehensive behavioral shield capable of stopping users before they fall victim to high-pressure "Digital Arrest" social media scams.
