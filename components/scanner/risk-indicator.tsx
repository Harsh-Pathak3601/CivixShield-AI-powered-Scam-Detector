'use client'

import { AlertTriangle, AlertOctagon, AlertCircle, CheckCircle2 } from 'lucide-react'

interface RiskIndicatorProps {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
}

export function RiskIndicator({ riskScore, riskLevel, confidence }: RiskIndicatorProps) {
  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return { color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-950/20', fill: 'bg-red-500' }
      case 'high':
        return { color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-950/20', fill: 'bg-red-500' }
      case 'medium':
        return { color: 'text-orange-400', border: 'border-orange-500', bg: 'bg-orange-950/20', fill: 'bg-orange-500' }
      case 'low':
        return { color: 'text-cyan-400', border: 'border-cyan-500', bg: 'bg-cyan-950/20', fill: 'bg-cyan-500' }
      default:
        return { color: 'text-gray-400', border: 'border-gray-500', bg: 'bg-gray-900/20', fill: 'bg-gray-500' }
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertOctagon className="h-8 w-8" />
      case 'high':
        return <AlertTriangle className="h-8 w-8" />
      case 'medium':
        return <AlertCircle className="h-8 w-8" />
      case 'low':
        return <CheckCircle2 className="h-8 w-8" />
      default:
        return null
    }
  }

  const style = getRiskStyle(riskLevel)

  return (
    <div className={`relative p-6 sm:p-8 font-mono border-2 ${style.border} ${style.bg} shadow-[0_0_20px_rgba(34,211,238,0.05)] h-full flex flex-col justify-between`}>
      {/* Decorative Terminal Corners */}
      <div className={`absolute top-0 right-0 w-3 h-3 ${style.fill}`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 ${style.fill}`} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-8 border-b border-white/10 pb-4">
        <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">&gt; ASSESSMENT</span>
        <span className={`px-3 py-1 border ${style.border} ${style.color} text-xs font-bold uppercase tracking-widest`}>
          [ {riskLevel} ]
        </span>
      </div>

      {/* Main Score Readout */}
      <div className="flex flex-col items-center justify-center space-y-4 mb-8">
        <div className={`text-6xl sm:text-7xl font-bold tracking-tighter ${style.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
          {riskScore}%
        </div>
        <div className="text-white font-bold uppercase tracking-[0.2em] text-sm">
          THREAT PROBABILITY
        </div>
      </div>

      {/* Risk Description Level */}
      <div className="space-y-4">
        <div className={`flex items-center gap-4 ${style.color}`}>
          {getRiskIcon(riskLevel)}
          <div>
            <div className="font-bold uppercase tracking-widest text-lg">LEVEL: {riskLevel}</div>
            <div className="text-sm text-gray-400 uppercase tracking-widest mt-1">
              {riskLevel === 'critical' && 'EXTREMELY LIKELY TO BE FRAUDULENT'}
              {riskLevel === 'high' && 'VERY LIKELY TO BE FRAUDULENT'}
              {riskLevel === 'medium' && 'CONCERNING ELEMENTS DETECTED'}
              {riskLevel === 'low' && 'APPEARS TO BE LEGITIMATE'}
            </div>
          </div>
        </div>
        
        {/* Confidence Matrix block */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">AI CONFIDENCE SCORE</span>
            <span className={`text-sm font-bold ${style.color}`}>[{confidence}%]</span>
          </div>
          <div className={`w-full h-1 bg-black border border-white/10 relative overflow-hidden`}>
            <div 
              className={`absolute top-0 left-0 h-full ${style.fill} transition-all duration-1000`} 
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}
