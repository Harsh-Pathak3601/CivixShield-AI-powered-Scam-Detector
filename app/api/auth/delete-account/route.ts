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

    // Delete user's analyses
    const analysesSnapshot = await adminDb.collection('analyses').where('user_id', '==', userId).get()
    const batch = adminDb.batch()
    analysesSnapshot.forEach(doc => batch.delete(doc.ref))
    await batch.commit()

    // Delete the user
    await adminAuth.deleteUser(userId)

    return NextResponse.json({ success: true, message: 'Account data deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
