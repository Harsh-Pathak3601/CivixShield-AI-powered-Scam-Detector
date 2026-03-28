'use client'

import { useState } from 'react'
import { AnalysisForm } from '@/Chaat-Masala-Hack4Innovation-26/components/scanner/analysis-form'
import { RiskIndicator } from '@/Chaat-Masala-Hack4Innovation-26/components/scanner/risk-indicator'
import { AnalysisFindings } from '@/Chaat-Masala-Hack4Innovation-26/components/scanner/analysis-findings'
import { useAuth } from '@/Chaat-Masala-Hack4Innovation-26/components/providers/auth-provider'
import { toast } from 'sonner'
import { Button } from '@/Chaat-Masala-Hack4Innovation-26/components/ui/button'
import { Share2 } from 'lucide-react'

export interface AnalysisResult {
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  explanation: string
  red_flags: string[]
  fraud_types: string[]
  scam_patterns: string[]
  recommendations: string[]
  urls_found: number
  unsafe_urls: number
  url_threats: string[]
}

interface ScannerProps {
  onComplete?: () => void
}

export function Scanner({ onComplete }: ScannerProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [lastContent, setLastContent] = useState('')

  async function handleAnalyze(content: string, type: string, mediaBase64?: string, mediaType?: string) {
    setLoading(true)
    setLastContent(content)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType: type,
          mediaBase64,
          mediaType,
          userId: user?.uid,
        }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setResult(data)
      onComplete?.()
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleShare() {
    if (!result || !user) return
    setSharing(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/community/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: lastContent,
          analysis_details: result,
          risk_level: result.risk_level,
          risk_score: result.risk_score
        }),
      })

      if (!response.ok) throw new Error('Share failed')
      toast.success('Scam successfully shared to the community feed!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to share to community.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      <div className={`grid ${result ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-4 sm:gap-8`}>
        <div className={result ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <AnalysisForm onAnalyze={handleAnalyze} isLoading={loading} />
        </div>

        {result && (
          <div className="lg:col-span-1">
            <RiskIndicator
              riskScore={result.risk_score}
              riskLevel={result.risk_level}
              confidence={result.confidence}
            />
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          <AnalysisFindings
            explanation={result.explanation}
            redFlags={result.red_flags}
            fraudTypes={result.fraud_types}
            scamPatterns={result.scam_patterns}
            recommendations={result.recommendations}
            urlThreats={result.url_threats}
          />

          {user ? (
            <div className="flex justify-end pt-2">
              <Button onClick={handleShare} disabled={sharing} className="gap-2">
                <Share2 className="h-4 w-4" />
                {sharing ? 'Sharing...' : 'Share to Community Feed'}
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm mt-4 pt-4 border-t border-border flex flex-col items-center gap-2">
              <p className="text-muted-foreground">
                High-risk threats are automatically shared anonymously to protect the community.
              </p>
              <p className="text-cyan-500 font-medium">
                Create an account to save your personal scan history and manually share alerts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
