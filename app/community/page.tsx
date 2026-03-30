'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Activity, ShieldAlert, Users, Radar, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CommunityScam {
  id: string
  handle: string
  content: string
  risk_level: string
  risk_score: number
  red_flags: string[]
  fraud_types: string[]
  created_at: string
  votes: number
}

export default function CommunityPage() {
  const [scams, setScams] = useState<CommunityScam[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/community/feed')
      const data = await res.json()
      if (data.scams) {
        setScams(data.scams)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching community feed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchFeed()
    // Poll every 15 seconds to stay live
    const interval = setInterval(fetchFeed, 15000)
    return () => clearInterval(interval)
  }, [fetchFeed])


  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-500 border-red-500/50 bg-red-500/10'
      case 'high': return 'text-orange-500 border-orange-500/50 bg-orange-500/10'
      case 'medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10'
      default: return 'text-green-500 border-green-500/50 bg-green-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] font-mono selection:bg-cyan-500/30 text-white pt-24 pb-12 relative overflow-hidden">
      {/* Background Grid & Particles */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#050505] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-gray-800 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-900/20 border border-red-500/50 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Radar className="h-7 w-7 text-red-500 animate-[spin_3s_linear_infinite]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-[0.15em] uppercase drop-shadow-md">
                Global Threat Feed
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <p className="text-red-400 tracking-[0.2em] uppercase text-xs font-bold">
                  Live intelligence network • Active
                </p>
              </div>
            </div>
          </div>
          <Link href="/dashboard" className="w-full md:w-auto text-center px-6 py-3 bg-[#0a0f14] border border-cyan-500/30 text-cyan-500 hover:bg-cyan-950/30 hover:border-cyan-400 font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            Command Center
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Activity className="h-10 w-10 text-cyan-500 animate-pulse" />
            <p className="text-cyan-500 uppercase tracking-widest text-sm animate-pulse font-bold">Establishing secure connection...</p>
          </div>
        ) : scams.length === 0 ? (
          <div className="bg-[#0a0f14] border border-gray-800 p-8 text-center text-gray-500 uppercase tracking-widest py-32 border-dashed relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <ShieldAlert className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <p className="relative z-10">Waiting for intelligence. No threats detected in the current sector.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {scams.map((scam, idx) => (
              <div 
                key={scam.id}
                className="bg-[#0a0f14]/80 backdrop-blur-sm border border-gray-800 p-6 relative group hover:border-gray-700 transition-all shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Cyberpunk accent pixel */}
                <div className="absolute top-0 right-0 w-2 h-2 bg-gray-700 group-hover:bg-cyan-500 transition-colors" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent group-hover:via-cyan-900 transition-colors" />

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column: Risk Badge */}
                  <div className="flex-shrink-0 flex flex-row lg:flex-col items-center justify-between lg:justify-start gap-4 lg:w-32 border-b lg:border-b-0 lg:border-r border-gray-800 pb-4 lg:pb-0 lg:pr-6">
                    <div className="text-center">
                      <div className={`text-3xl font-black ${getRiskColor(scam.risk_level).split(' ')[0]}`}>
                        {scam.risk_score}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Risk Score</div>
                    </div>
                    <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${getRiskColor(scam.risk_level)}`}>
                      {scam.risk_level}
                    </div>
                  </div>

                  {/* Middle Column: Details */}
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden">
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-200">@{scam.handle}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                          Intercepted • {scam.created_at ? formatDistanceToNow(new Date(scam.created_at), { addSuffix: true }) : 'Recently'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/50 border border-gray-800 p-4 font-sans text-sm text-gray-300 leading-relaxed rounded-sm relative">
                      <div className="absolute top-2 left-2 text-gray-800">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <p className="pl-6 line-clamp-3 italic">"{scam.content}"</p>
                    </div>

                    {/* Threat Tags */}
                    {(scam.fraud_types?.length > 0 || scam.red_flags?.length > 0) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {scam.fraud_types?.map((type, i) => (
                           <span key={`f-${i}`} className="px-2 py-1 bg-red-950/30 border border-red-900/50 text-red-400 text-[10px] uppercase tracking-wider">
                             TARGET: {type}
                           </span>
                        ))}
                        {scam.red_flags?.slice(0, 3).map((flag, i) => (
                           <span key={`r-${i}`} className="px-2 py-1 bg-gray-900 border border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider">
                             FLAG: {flag.split(' ').slice(0, 3).join(' ')}...
                           </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
