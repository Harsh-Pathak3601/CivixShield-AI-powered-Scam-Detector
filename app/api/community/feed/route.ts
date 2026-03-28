import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('community_scams')
      .orderBy('created_at', 'desc')
      .limit(50)
      .get()

    const scams = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ scams })
  } catch (error: any) {
    console.error('[Community Feed API] Error:', error.message)
    return NextResponse.json({ scams: [], error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await adminDb.collection('community_scams').doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Community Feed API] Delete Error:', error.message)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
