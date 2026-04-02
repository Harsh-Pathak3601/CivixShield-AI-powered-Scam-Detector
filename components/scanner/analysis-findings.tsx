'use client'

import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'

interface AnalysisFindingsProps {
  explanation: string
  redFlags: string[]
  fraudTypes: string[]
  scamPatterns: string[]
  recommendations: string[]
  urlThreats?: string[]
  urlVerdict?: {
    url: string
    domain: string
    verdict: 'Legitimate' | 'Suspicious' | 'Phishing'
    confidence: 'Low' | 'Medium' | 'High'
    risk_score: number
    reason: string
    detected_issues: string[]
    matched_brand?: string
  }
}

export function AnalysisFindings({
  explanation,
  redFlags,
  fraudTypes,
  scamPatterns,
  recommendations,
  urlThreats,
  urlVerdict,
}: AnalysisFindingsProps) {
  return (
    <div className="space-y-6 font-mono animate-in fade-in duration-500">

      {/* URL Scanner Engine Verdict (Shown if available) */}
      {urlVerdict && (
        <div className={`border p-6 sm:p-8 relative shadow-sm ${urlVerdict.verdict === 'Legitimate' ? 'bg-[#05110a] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
            urlVerdict.verdict === 'Suspicious' ? 'bg-[#141005] border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.05)]' :
              'bg-[#1a0505] border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
          }`}>
          <div className={`absolute top-0 right-0 w-2 h-2 ${urlVerdict.verdict === 'Legitimate' ? 'bg-emerald-500' :
              urlVerdict.verdict === 'Suspicious' ? 'bg-yellow-500' :
                'bg-red-500'
            }`} />
          <h3 className={`flex items-center gap-3 text-lg sm:text-xl font-bold tracking-[0.1em] uppercase mb-4 border-b pb-3 ${urlVerdict.verdict === 'Legitimate' ? 'text-emerald-400 border-emerald-900/50' :
              urlVerdict.verdict === 'Suspicious' ? 'text-yellow-400 border-yellow-900/50' :
                'text-red-400 border-red-900/50'
            }`}>
            <Lightbulb className="h-5 w-5" /> URL Security Engine Analysis
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <span className="text-gray-400 uppercase text-xs tracking-widest min-w-[120px]">Root Domain:</span>
              <span className="text-gray-200 font-bold bg-black/40 px-3 py-1 rounded border border-gray-800 font-mono tracking-tight">{urlVerdict.domain}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <span className="text-gray-400 uppercase text-xs tracking-widest min-w-[120px]">Verdict:</span>
              <span className={`font-bold px-3 py-1 rounded text-sm uppercase tracking-wider ${urlVerdict.verdict === 'Legitimate' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' :
                  urlVerdict.verdict === 'Suspicious' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-950/40 text-red-400 border border-red-500/30'
                }`}>
                {urlVerdict.verdict} ({urlVerdict.confidence} Confidence)
              </span>
            </div>

            {urlVerdict.matched_brand && (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-start text-sm mt-4">
                <span className="text-gray-400 uppercase text-xs tracking-widest mt-0.5 min-w-[120px]">Match:</span>
                <span className="text-emerald-300">Verified as official domain for <strong>{urlVerdict.matched_brand}</strong>.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:items-start text-sm mt-4">
              <span className="text-gray-400 uppercase text-xs tracking-widest mt-0.5 min-w-[120px]">Reason:</span>
              <span className="text-gray-300 leading-relaxed">&gt; {urlVerdict.reason}</span>
            </div>

            {urlVerdict.detected_issues.length > 0 && urlVerdict.verdict !== 'Legitimate' && (
              <div className="mt-4 pt-4 border-t border-gray-800/50">
                <span className="block text-gray-400 uppercase text-xs tracking-widest mb-3">Detected Flags:</span>
                <div className="flex flex-wrap gap-2">
                  {urlVerdict.detected_issues.map((issue, i) => (
                    <span key={i} className="text-xs bg-red-950/30 text-red-300 border border-red-900/50 px-2 py-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3" /> {issue}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="bg-[#0a0f14] border border-red-700/50 p-6 sm:p-8 relative shadow-[0_0_15px_rgba(220,38,38,0.05)]">
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
          <h3 className="flex items-center gap-3 text-lg sm:text-xl font-bold tracking-[0.1em] text-red-500 uppercase mb-4 border-b border-red-900/50 pb-3">
            <AlertTriangle className="h-5 w-5" /> Red Flags Detected
          </h3>
          <ul className="space-y-3">
            {redFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-300 leading-relaxed">
                <span className="inline-block w-2 h-2 bg-red-600 mt-1.5 flex-shrink-0" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fraud Types */}
      {fraudTypes.length > 0 && (
        <div className="bg-[#0a0f14] border border-orange-500/50 p-6 sm:p-8 relative shadow-[0_0_15px_rgba(249,115,22,0.05)]">
          <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500" />
          <h3 className="text-lg sm:text-xl font-bold tracking-[0.1em] text-orange-400 uppercase mb-2">Potential Fraud Types</h3>
          <p className="text-xs sm:text-sm text-orange-600/80 uppercase tracking-widest mb-4 border-b border-orange-900/50 pb-3">
            [ Categories detected in the analysis ]
          </p>
          <div className="flex flex-wrap gap-2">
            {fraudTypes.map((type) => (
              <span
                key={type}
                className="px-3 py-1.5 bg-orange-950/30 border border-orange-500/50 text-orange-400 text-xs sm:text-sm uppercase tracking-wider"
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scam Patterns */}
      {scamPatterns.length > 0 && (
        <div className="bg-[#0a0f14] border border-cyan-500/50 p-6 sm:p-8 relative">
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-500" />
          <h3 className="text-lg sm:text-xl font-bold tracking-[0.1em] text-cyan-400 uppercase mb-2">Scam Patterns Found</h3>
          <p className="text-xs sm:text-sm text-cyan-600/80 uppercase tracking-widest mb-4 border-b border-cyan-900/50 pb-3">
            [ Common scam tactics detected ]
          </p>
          <div className="space-y-3">
            {scamPatterns.map((pattern) => (
              <div
                key={pattern}
                className="flex items-center gap-3 p-3 border border-cyan-900/50 bg-[#050505] text-sm sm:text-base text-gray-300"
              >
                <CheckCircle2 className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                <span className="uppercase tracking-wider">{pattern.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL Threats */}
      {urlThreats && urlThreats.length > 0 && (
        <div className="bg-red-950/20 border-l-4 border-red-600 p-4 sm:p-6 shadow-inner">
          <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-[0.1em] mb-3">
            <AlertTriangle className="h-5 w-5" />
            <span>Malicious URLs Detected:</span>
          </div>
          <div className="space-y-2 pl-7">
            {urlThreats.map((threat) => (
              <div key={threat} className="text-xs sm:text-sm text-red-400 break-all font-medium">
                &gt; {threat}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-[#050505] border border-cyan-500/30 p-6 sm:p-8 relative">
          <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-600" />
          <h3 className="flex items-center gap-3 text-lg sm:text-xl font-bold tracking-[0.1em] text-cyan-500 uppercase mb-4 border-b border-cyan-900/30 pb-3">
            <Lightbulb className="h-5 w-5" /> Recommended Actions
          </h3>
          <ol className="space-y-4">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-4 text-sm sm:text-base text-gray-300">
                <span className="flex items-center justify-center w-6 h-6 border border-cyan-500 bg-cyan-950/30 text-cyan-400 text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
