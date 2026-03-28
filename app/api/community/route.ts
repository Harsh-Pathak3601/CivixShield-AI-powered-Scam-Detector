import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    scams: [
      {
        id: '1',
        title: 'Deepfake Executive Phishing',
        description: 'AI voice cloning used to impersonate CEO asking for urgent wire transfer.',
        location: 'Global',
        reports: 142,
        verified: true,
        timestamp: new Date().toISOString()
      }
    ]
  })
}
