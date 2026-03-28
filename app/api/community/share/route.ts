import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)

    // Obtain the user's email to attach it anonymously to the feed if needed, or just their email prefix.
    const userEmail = decodedToken.email || 'Anonymous'
    const handle = userEmail.split('@')[0]

    const { content, analysis_details, risk_level, risk_score } = await req.json()

    if (!content || !analysis_details) {
      return NextResponse.json({ error: 'Missing content or analysis details' }, { status: 400 })
    }

    // Insert scrubbed version into the community_scams collection
    await adminDb.collection('community_scams').add({
      handle: handle, // Display name for feed
      content: content,
      risk_level: risk_level,
      risk_score: risk_score,
      red_flags: analysis_details.red_flags || [],
      fraud_types: analysis_details.fraud_types || [],
      created_at: new Date().toISOString(), // Use ISO string for easier client-side parsing
      votes: 0 // For future upvoting feature
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Community share error:', error)
    return NextResponse.json({ error: 'Failed to share to community' }, { status: 500 })
  }
}
