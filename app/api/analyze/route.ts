import { NextRequest, NextResponse } from 'next/server'
import { analyzeFraudRisk, checkSafeBrowsingUrl, extractUrlsFromText } from '@/lib/fraud-detector'
import { admin, adminAuth, adminDb } from '@/lib/firebase-admin'
import { analyzeUrlStrict } from '@/lib/url-analyzer'

export async function POST(req: NextRequest) {
  try {
    const { content, contentType, mediaBase64, mediaType, userId, organizationId } = await req.json()

    if (!content && !mediaBase64) {
      return NextResponse.json({ error: 'Content or media is required' }, { status: 400 })
    }

    // Check URLs if present
    const urls = extractUrlsFromText(content)
    let urlVerdict = undefined

    // Evaluate main URL using strict analyzer
    if (urls.length > 0) {
      urlVerdict = await analyzeUrlStrict(urls[0])
    }

    // Perform fraud analysis (multimodal text + image/audio) with URL context if available
    const fraudAnalysis = await analyzeFraudRisk(content, mediaBase64, mediaType, urlVerdict)

    const urlCheckResults = await Promise.all(
      urls.map(url => checkSafeBrowsingUrl(url))
    )

    // Determine if any URLs are unsafe
    const unsafeUrls = urlCheckResults.filter(result => !result.safe)
    const hasUnsafeUrl = unsafeUrls.length > 0

    // Adjust risk score based on URL findings
    let finalRiskScore = fraudAnalysis.risk_score

    // Safety Net: Enforce minimum risk floors based on strict heuristic URL results
    // The upgraded AI model handles this naturally, but this protects the system 
    // if the AI API fails over to offline-fallback mode.
    if (urlVerdict) {
      if (urlVerdict.verdict === 'Phishing') {
        finalRiskScore = Math.max(finalRiskScore, 85) // Ensure High/Critical bucket
        if (!urlVerdict.is_live && !fraudAnalysis.red_flags.includes('Domain does not exist or is fully offline')) {
          fraudAnalysis.red_flags.unshift('Domain does not exist or is fully offline')
        }
      } else if (urlVerdict.verdict === 'Suspicious') {
        finalRiskScore = Math.max(finalRiskScore, 40) // Ensure Medium bucket
      }
    }

    if (hasUnsafeUrl) {
      finalRiskScore = Math.min(100, finalRiskScore + 50) // Google Safe Browsing flag is critical
    }

    // Determine risk level based on adjusted score
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (finalRiskScore <= 20) riskLevel = 'low'
    else if (finalRiskScore <= 50) riskLevel = 'medium'
    else if (finalRiskScore <= 80) riskLevel = 'high'
    else riskLevel = 'critical'

    const analysisResult = {
      risk_score: Math.round(finalRiskScore),
      risk_level: riskLevel,
      scam_patterns: fraudAnalysis.scam_patterns,
      fraud_types: fraudAnalysis.fraud_types,
      confidence: fraudAnalysis.confidence,
      explanation: fraudAnalysis.explanation,
      red_flags: fraudAnalysis.red_flags,
      recommendations: fraudAnalysis.recommendations,
      urls_found: urls.length,
      unsafe_urls: unsafeUrls.length,
      url_threats: unsafeUrls.flatMap(r => r.threat_types || []),
      url_verdict: urlVerdict || null
    }

    // Save to database regardless of login status
    try {
      await adminDb.collection('analyses').add({
        user_id: userId || 'anonymous',
        organization_id: organizationId || null,
        content_type: contentType || 'text',
        content,
        risk_score: finalRiskScore,
        risk_level: riskLevel,
        scam_patterns: fraudAnalysis.scam_patterns,
        detected_fraud_types: fraudAnalysis.fraud_types,
        confidence_score: fraudAnalysis.confidence,
        gemini_response: fraudAnalysis,
        safe_browsing_result: {
          urls_checked: urls.length,
          unsafe_urls: unsafeUrls,
        },
        is_suspicious: finalRiskScore > 50,
        analysis_details: analysisResult,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Update user's analysis count if they are logged in and have an organization
      if (userId) {
        const orgsSnapshot = await adminDb.collection('organizations').where('owner_id', '==', userId).limit(1).get()
        if (!orgsSnapshot.empty) {
          const orgDoc = orgsSnapshot.docs[0]
          await orgDoc.ref.update({
            analyses_used: admin.firestore.FieldValue.increment(1)
          })
        }
      }

      // Auto-share to community feed if risk score is high enough (e.g. > 60)
      if (finalRiskScore > 60) {
        try {
          // Best effort to get the user's handle from Firebase Auth if logged in
          let handle = 'Anonymous'
          if (userId) {
            try {
              const userRecord = await adminAuth.getUser(userId)
              if (userRecord.email) {
                handle = userRecord.email.split('@')[0]
              }
            } catch (authErr) {
              console.error('Could not fetch user for handle:', authErr)
            }
          }

          await adminDb.collection('community_scams').add({
            handle,
            content: content || '[Media Payload]',
            risk_level: riskLevel,
            risk_score: finalRiskScore,
            red_flags: fraudAnalysis.red_flags || [],
            fraud_types: fraudAnalysis.fraud_types || [],
            created_at: new Date().toISOString(),
            votes: 0
          })
        } catch (shareErr) {
          console.error('Failed to auto-share suspicious scan to community feed:', shareErr)
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
