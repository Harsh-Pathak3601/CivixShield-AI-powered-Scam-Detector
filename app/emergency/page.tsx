'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShieldAlert, PhoneCall, Globe2, AlertTriangle, Search, ExternalLink, ArrowLeft, Siren, MapPin } from 'lucide-react'

const hotlines = [
  { country: 'India', flag: '🇮🇳', number: '1930', desc: 'National Cyber Crime Helpline', website: 'https://cybercrime.gov.in' },
  { country: 'United States', flag: '🇺🇸', number: 'IC3.gov', desc: 'FBI Internet Crime Complaint Center', website: 'https://www.ic3.gov' },
  { country: 'United Kingdom', flag: '🇬🇧', number: '0300 123 2040', desc: 'Action Fraud UK', website: 'https://www.actionfraud.police.uk' },
  { country: 'Canada', flag: '🇨🇦', number: '1-888-495-8501', desc: 'Canadian Anti-Fraud Centre', website: 'https://www.antifraudcentre-centreantifraude.ca' },
  { country: 'Australia', flag: '🇦🇺', number: '1300 292 371', desc: 'Australian Cyber Security Centre', website: 'https://www.cyber.gov.au/report' },
  { country: 'Germany', flag: '🇩🇪', number: '110', desc: 'Bundeskriminalamt (BKA)', website: 'https://www.bka.de' },
  { country: 'France', flag: '🇫🇷', number: '17', desc: 'Cybermalveillance.gouv.fr', website: 'https://www.cybermalveillance.gouv.fr' },
  { country: 'Japan', flag: '🇯🇵', number: '110', desc: 'National Police Agency Cyber Bureau', website: 'https://www.npa.go.jp/bureau/cyber/index.html' },
  { country: 'South Korea', flag: '🇰🇷', number: '118', desc: 'KISA Cyber Security Center', website: 'https://www.krcert.or.kr' },
  { country: 'Singapore', flag: '🇸🇬', number: '999', desc: 'Cyber Security Agency (CSA)', website: 'https://www.csa.gov.sg' },
  { country: 'UAE', flag: '🇦🇪', number: '999', desc: 'Dubai Police eCrime Platform', website: 'https://www.dubaipolice.gov.ae' },
  { country: 'Saudi Arabia', flag: '🇸🇦', number: '330330', desc: 'Communications & IT Commission', website: 'https://www.citc.gov.sa' },
  { country: 'Brazil', flag: '🇧🇷', number: '190', desc: 'Federal Police Cyber Division', website: 'https://www.gov.br/pf/pt-br' },
  { country: 'South Africa', flag: '🇿🇦', number: '10111', desc: 'SAPS Cybercrime Unit', website: 'https://www.saps.gov.za' },
  { country: 'Spain', flag: '🇪🇸', number: '017', desc: 'INCIBE Cybersecurity Helpline', website: 'https://www.incibe.es' },
  { country: 'Italy', flag: '🇮🇹', number: '112', desc: 'Polizia Postale', website: 'https://www.commissariatodips.it' },
  { country: 'Netherlands', flag: '🇳🇱', number: '0900-8844', desc: 'Fraudehelpdesk', website: 'https://www.fraudehelpdesk.nl' },
  { country: 'New Zealand', flag: '🇳🇿', number: '105', desc: 'CERT NZ – Cyber Security', website: 'https://www.cert.govt.nz' },
  { country: 'Switzerland', flag: '🇨🇭', number: '117', desc: 'National Cyber Security Centre', website: 'https://www.ncsc.admin.ch' },
  { country: 'Mexico', flag: '🇲🇽', number: '088', desc: 'CERT-MX Guardia Nacional', website: 'https://www.gob.mx/gncertmx' },
]

export default function EmergencyPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = hotlines.filter(h =>
    h.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.desc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#050505] font-mono text-white selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {/* ─── HERO ─── */}
        <div className="relative text-center mb-16">
          {/* Glow effect behind shield */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />

          <div className="relative inline-flex flex-col items-center">
            <div className="w-20 h-20 border-2 border-red-500/60 bg-gradient-to-b from-red-950/60 to-[#050505] flex items-center justify-center mb-6 relative" style={{ clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' }}>
              <Siren className="h-8 w-8 text-red-500" />
              {/* Animated ping */}
              <div className="absolute inset-0 border-2 border-red-500/30 animate-ping" style={{ clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' }} />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-[0.12em] mb-3">
              <span className="text-white">Emergency</span>{' '}
              <span className="text-red-500">Hub</span>
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-red-500/60" />
              <MapPin className="w-4 h-4 text-red-600" />
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-red-500/60" />
            </div>

            <p className="text-gray-500 uppercase tracking-[0.2em] text-xs font-bold max-w-md">
              Global Cybercrime Authority Contact Network — <span className="text-red-500">20 Jurisdictions</span>
            </p>
          </div>
        </div>

        {/* ─── SOS BANNER ─── */}
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-red-600/5 blur-xl group-hover:bg-red-600/10 transition-all" />
          <div className="relative border border-red-900/40 bg-[#0a0f14] p-5 flex flex-col sm:flex-row items-center gap-5 hover:border-red-500/60 transition-colors">
            <div className="w-12 h-12 bg-red-950/40 border border-red-600/50 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.1em] mb-1">Being scammed right now?</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest">Call your country&apos;s hotline below immediately. Time is critical for Reporting your issue.</p>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-800 px-4 py-2 bg-red-950/30 animate-pulse">
              ⚠ ACT NOW
            </div>
          </div>
        </div>

        {/* ─── SEARCH ─── */}
        <div className="mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f14] border border-gray-800 focus:border-red-500/50 text-white placeholder:text-gray-700 pl-11 pr-4 py-3 outline-none text-sm tracking-wider transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-700 font-bold uppercase tracking-widest">
              {filtered.length}/{hotlines.length}
            </span>
          </div>
        </div>

        {/* ─── GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((h, idx) => (
            <div key={idx} className="group bg-[#0a0f14] border border-gray-800/60 hover:border-red-500/40 transition-all duration-300 relative overflow-hidden">
              {/* Top colored line */}
              <div className="h-[2px] bg-gradient-to-r from-red-600 to-red-900 opacity-40 group-hover:opacity-100 transition-opacity" />

              <div className="p-5">
                {/* Country with flag */}
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-xl leading-none">{h.flag}</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.08em] leading-tight">
                    {h.country}
                  </h3>
                </div>

                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-4 leading-relaxed pl-[34px]">
                  {h.desc}
                </p>

                {/* Number */}
                <div className="flex items-center gap-2 mb-4 pl-[34px]">
                  <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-red-400 font-black tracking-wider text-base group-hover:text-red-300 transition-colors">
                    {h.number}
                  </span>
                </div>

                {/* Website button */}
                <a
                  href={h.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#050505] border border-gray-800 hover:border-cyan-700 text-gray-500 hover:text-cyan-400 py-2 text-[10px] uppercase tracking-[0.15em] font-bold transition-all"
                >
                  <Globe2 className="w-3 h-3" />
                  Report Online
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="border border-dashed border-gray-800 py-16 text-center">
            <AlertTriangle className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">
              No match for &quot;{searchTerm}&quot;
            </p>
          </div>
        )}

        {/* ─── FOOTER NOTE ─── */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] max-w-lg mx-auto mb-6">
            Country not listed? Dial your local emergency number (911, 112, 100) for immediate assistance.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-cyan-400 uppercase tracking-widest font-bold transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>

      </div>
    </div>
  )
}
