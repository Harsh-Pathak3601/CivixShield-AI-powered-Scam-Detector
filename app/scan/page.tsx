'use client'

import React from 'react'
import Link from 'next/link'
import { Scanner } from '@/components/scanner/scanner'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-[#050505] font-mono selection:bg-cyan-500/30 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Render the preserved Scanner Component */}
        <Scanner />

        <div className="mt-12 text-center">
          <Link href="/" className="text-cyan-500 hover:text-cyan-300 uppercase tracking-widest font-bold text-sm border-b border-cyan-500/50 pb-1 inline-flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
