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
    const userId = decodedToken.uid

    const { timeframe = '30d' } = await req.json()

    // Fetch user analyses to generate a report
    const analysesSnapshot = await adminDb
      .collection('analyses')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .limit(100)
      .get()

    const analyses = analysesSnapshot.docs.map(doc => doc.data())

    const reportData = {
      total_analyzed: analyses?.length || 0,
      critical_threats: analyses?.filter(a => a.risk_level === 'critical').length || 0,
      high_threats: analyses?.filter(a => a.risk_level === 'high').length || 0,
      generated_at: new Date().toISOString(),
      timeframe
    }

    return NextResponse.json({
      success: true,
      message: 'Report generated successfully',
      data: reportData
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
