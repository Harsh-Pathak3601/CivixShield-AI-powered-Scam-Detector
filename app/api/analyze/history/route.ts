import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Omit orderBy to avoid requiring a composite index in Firestore.
    // We will sort the results in memory instead.
    const snapshot = await adminDb
      .collection('analyses')
      .where('user_id', '==', userId)
      .get()

    const history = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to string for JSON serialization
        created_at: data.created_at?.toDate().toISOString() || new Date().toISOString()
      }
    })

    // Sort descending by created_at in memory
    history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ history })
  } catch (error: any) {
    console.error('[History API] Error fetching history:', error.message)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
