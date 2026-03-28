'use client'

import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'

interface AnalysisFindingsProps {
  explanation: string
  redFlags: string[]
  fraudTypes: string[]
  scamPatterns: string[]
  recommendations: string[]
  urlThreats?: string[]
}

export function AnalysisFindings({
  explanation,
  redFlags,
  fraudTypes,
  scamPatterns,
  recommendations,
  urlThreats,
}: AnalysisFindingsProps) {
  return (
    <div className="space-y-6 font-mono animate-in fade-in duration-500">

      {/* Main Explanation */}
      <div className="bg-[#0a0f14] border border-cyan-500/50 p-6 sm:p-8 relative shadow-[0_0_15px_rgba(34,211,238,0.05)]">
        <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-500" />
        <h3 className="text-lg sm:text-xl font-bold tracking-[0.1em] text-cyan-400 uppercase mb-4 border-b border-cyan-900/50 pb-3">Analysis Summary</h3>
        <p className="text-sm sm:text-base leading-relaxed text-gray-300">
          &gt; {explanation}
        </p>
      </div>

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
