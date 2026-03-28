import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 })
    }

    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
    }

    const hiveApiKey = process.env.HIVE_API_KEY
    const isMock = !hiveApiKey || hiveApiKey === ""

    let scores: number[] = []

    const analyzeMedia = async (mediaFile: File) => {
      if (isMock) {
        // Mock analysis for demo purposes when keys aren't provided
        await new Promise((r) => setTimeout(r, 600))
        return (Math.floor(Math.random() * 60) + 10) / 100 // 0.1 to 0.7
      }

      let data: any
      
      try {
        const buffer = Buffer.from(await mediaFile.arrayBuffer())
        const base64String = buffer.toString('base64')

        const res = await fetch('https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${hiveApiKey}`,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            input: [{
              media_base64: base64String
            }]
          }),
        })
        
        data = await res.json()
        console.log(`[deepfake] Hive HTTP Status: ${res.status}`)
        console.log(`[deepfake] Hive Response Body:`, JSON.stringify(data, null, 2))

        // Strict error throwing, no mocking!
        if (!res.ok || data.status_code === 405 || data.return_code === 403 || data.return_code === 401 || data.error) {
          const hiveError = data.message || data.error || `HTTP ${res.status}`
          throw new Error(`Hive API Error: ${hiveError}`)
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to communicate with Hive API')
      }

      // Robust extraction based on Hive V3 Playground API response over all frames
      let highestOverallScore = 0
      try {
        const frames = data?.output || []

        for (let i = 0; i < frames.length; i++) {
          const classes = frames[i].classes || []
          let aiGeneratedScore = 0
          let deepfakeScore = 0

          for (const c of classes) {
            if (c.class === 'ai_generated') aiGeneratedScore = c.value
            if (c.class === 'deepfake') deepfakeScore = c.value
          }

          const maxFrameScore = Math.max(aiGeneratedScore, deepfakeScore)
          if (maxFrameScore > highestOverallScore) {
            highestOverallScore = maxFrameScore
          }
          scores.push(maxFrameScore)
        }

        return highestOverallScore // Hive returns 0-1 range
      } catch (e) {
        console.error('[deepfake] Failed to parse Hive response:', e)
      }

      return 0
    }

    // Process Image or Video natively in a single API call!
    await analyzeMedia(file)

    if (scores.length === 0) scores.push(0)

    // 📊 Final score MUST be max of frames, not avg, because a deepfake might only be visible in a few frames
    const rawMax = Math.max(...scores)

    // Convert to percentage. AI certainty UX best practice: Avoid showing exactly "100%" 
    // to prevent implying absolute mathematical perfection, ceiling it at 99%.
    let finalScore = Math.floor(rawMax * 100)
    if (finalScore >= 100) finalScore = 99
    if (finalScore < 0) finalScore = 0

    let risk: 'Safe' | 'Suspicious' | 'High Risk' = 'Safe'
    let explanation = 'Analysis shows no significant signs of AI generation. The media appears authentic.'

    if (finalScore >= 65) {
      risk = 'High Risk'
      explanation = 'Extremely high probability of AI generation or deepfake manipulation detected. This media exhibits strong synthetic signatures.'
    } else if (finalScore >= 30) {
      risk = 'Suspicious'
      explanation = 'Our AI forensics detected unusual artifacts or minor manipulations that are sometimes associated with AI generation. Exercise caution.'
    }

    return NextResponse.json({
      score: finalScore,
      risk,
      explanation,
      frames_analyzed: scores.length,
      is_mock: isMock,
    })

  } catch (err: any) {
    console.error('[deepfake] Error:', err)
    // Surface the real error message (Hive account issues, etc.) to the browser
    return NextResponse.json({ error: err?.message || 'Processing failed' }, { status: 500 })
  }
}