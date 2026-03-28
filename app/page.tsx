'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, Zap, BarChart3, Lock, Users, ArrowRight, Scan, Activity, Database, Sparkles, ChevronRight, Menu } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { Scanner } from '@/components/scanner/scanner'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const isLoggedIn = !!user

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-mono selection:bg-cyan-500/30">




      <main className="relative z-10 pt-16 pb-32">
        {/* Terminal Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto">

            <div className="border border-cyan-500/50 bg-[#0a0f14] px-4 py-1.5 flex items-center gap-3 text-sm shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-400 uppercase tracking-widest">SYSTEM INITIALIZED</span>
              <Link href="/auth/sign-up" className="text-cyan-400 hover:underline uppercase tracking-widest font-bold">
                Deploy Core Operations <ChevronRight className="h-3 w-3 inline" />
              </Link>
            </div>

            <div className="space-y-4 mb-4">
              <h1 className="text-6xl sm:text-7xl md:text-7xl font-black tracking-tighter text-gray-200 leading-[1] font-sans">
                Your AI Guardian <br />
                Against <span className="text-[#ffff00]" style={{ textShadow: '4px 4px 0px #dc2626' }}>ONLINE</span> <br />
                <span className="text-[#ffff00]" style={{ textShadow: '4px 4px 0px #dc2626', marginLeft: '0.1em' }}>SCAMS</span>
              </h1>
              {/* Terminal Decorative Bar */}
              <div className="w-full h-1 bg-cyan-900 mt-8 relative overflow-hidden">
                <div className="w-1/3 h-full bg-cyan-400 absolute left-0" />
              </div>
            </div>

            <p className="text-lg sm:text-xl text-cyan-600/80 max-w-3xl leading-relaxed uppercase tracking-widest font-medium">
              &gt; {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-8">
              <Button asChild className="relative h-16 px-10 rounded-none bg-[#9C941A] hover:bg-[#b0a720] text-black font-bold uppercase tracking-[0.2em] border-b-4 border-red-700 w-full sm:w-auto overflow-hidden group">
                <Link href="/scan">
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#050505] transform -translate-x-1.5 -translate-y-1.5 rotate-45 z-10" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#050505] transform translate-x-1.5 -translate-y-1.5 rotate-45 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-20 flex items-center">
                    {t('hero.startScanning')} <ArrowRight className="ml-3 h-5 w-5" />
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 rounded-none border-cyan-500 text-cyan-400 bg-transparent hover:bg-cyan-900/30 uppercase tracking-[0.2em] font-bold w-full sm:w-auto">
                <Link href="#features">EXPLORE PROTOCOLS</Link>
              </Button>
            </div>
          </div>
        </section>


        {/* Bento Grid Features - Terminal Reconstruction */}
        <section id="features" className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-[0.1em] text-white uppercase">
              THE COMPLETE INTELLIGENCE STACK

            </h2>
            <p className="text-lg text-cyan-600/80 max-w-2xl mx-auto uppercase tracking-widest pl-4 border-l-2 border-cyan-500 inline-block text-left">
              &gt; EVERYTHING YOU NEED TO SECURE YOUR DIGITAL FOOTPRINT, PACKED INTO ONE BLAZING-FAST INTELLIGENCE PLATFORM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            {/* Box 1 */}
            <div className="md:col-span-2 relative bg-[#0a0f14] border-2 border-cyan-500 p-8 group transition-colors hover:bg-[#0c131a]" style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)' }}>
              <div className="absolute top-0 right-0 w-6 h-6 bg-[#0a0f14] border-b-2 border-l-2 border-cyan-500 transform translate-x-[2px] -translate-y-[2px]" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-[#050505] border border-cyan-500 flex items-center justify-center shadow-lg relative">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-500" />
                  <AlertTriangle className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 tracking-[0.1em] uppercase text-white">Heuristic Text Analysis</h3>
                  <p className="text-cyan-600/80 text-base max-w-md uppercase tracking-wider">
                    Deep structural and semantic analysis of any pasted text or message to find manipulative urgency and social engineering patterns instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="relative bg-[#0a0f14] border-2 border-cyan-500 p-8 group transition-colors hover:bg-[#0c131a]">
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-500" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-[#050505] border border-cyan-500 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 tracking-[0.1em] uppercase text-white">URL Scanning</h3>
                  <p className="text-cyan-600/80 text-sm uppercase tracking-wider">
                    Cross-references active links against global threat databases & Google Safe Browsing.
                  </p>
                </div>
              </div>
            </div>

            {/* Box 3 */}
            <div className="relative bg-[#0a0f14] border-2 border-cyan-500 p-8 group transition-colors hover:bg-[#0c131a]">
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-500" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-[#050505] border border-cyan-500 flex items-center justify-center">
                  <Scan className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 tracking-[0.1em] uppercase text-white">QR Payload Intercept</h3>
                  <p className="text-cyan-600/80 text-sm uppercase tracking-wider">
                    Extract hidden payloads from malicious QR matrices without triggering them.
                  </p>
                </div>
              </div>
            </div>

            {/* Box 4 */}
            <div className="md:col-span-2 relative bg-[#0a0f14] border-2 border-cyan-500 p-8 group transition-colors hover:bg-[#0c131a]" style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)' }}>
              <div className="absolute top-0 right-0 w-6 h-6 bg-[#0a0f14] border-b-2 border-l-2 border-cyan-500 transform translate-x-[2px] -translate-y-[2px]" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 bg-[#050505] border border-cyan-500 flex items-center justify-center">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  <Database className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 tracking-[0.1em] uppercase text-white">Global Threat Analytics</h3>
                  <p className="text-cyan-600/80 text-base max-w-md uppercase tracking-wider">
                    A continuously updating community feed mapping global threat vectors, giving you visibility into zero-day attacks before they hit your inbox.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Terminal */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="relative bg-[#050505] border-2 border-cyan-500 p-12 md:p-20 text-center shadow-[0_0_40px_rgba(34,211,238,0.1)]">
            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-bold tracking-[0.2em] uppercase text-white">
                READY TO SECURE SYSTEM BOUNDARIES?
              </h2>
              <p className="text-sm md:text-base text-cyan-600/80 max-w-2xl mx-auto tracking-widest uppercase">
                &gt; AUTHORIZATION REQUIRED TO INITIALIZE HISTORY PROTOCOLS AND ONGOING THREAT TRACKING.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 w-full">
                <Link href="/scan" className="px-8 py-4 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors w-full sm:w-auto text-center shrink-0">
                  [ AUTHORIZE DEPLOYMENT ]
                </Link>
                <Link href="/community" className="px-8 py-4 border border-cyan-900 text-cyan-500 font-bold uppercase tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-colors w-full sm:w-auto text-center shrink-0 bg-[#050505]">
                  ACCESS GLOBAL FEED
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Terminal Block */}
      <footer className="border-t-2 border-cyan-900 bg-[#0a0f14] pt-20 pb-12 relative z-10 w-full mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
            <div className="col-span-2 md:col-span-2">
              <div className="mt-2 mb-8">
                <Image src="/logo.png" alt="CivixShield Logo" width={200} height={50} className="object-contain w-[160px] md:w-[200px] h-auto" />
              </div>
              <p className="text-cyan-600/80 text-sm max-w-sm leading-relaxed uppercase tracking-wider">
                &gt; Advancing digital security globally through next-generation AI-powered threat detection and community intelligence.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm text-white uppercase tracking-[0.2em]">Platform</h4>
              <ul className="space-y-4">
                <li><Link href="#features" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Features</Link></li>
                <li><Link href="/scan" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Scanner</Link></li>
                <li><Link href="#" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm text-white uppercase tracking-[0.2em]">Resources</h4>
              <ul className="space-y-4">
                <li><Link href="/community" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Community Feed</Link></li>
                <li><Link href="#" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Threat Database</Link></li>
                <li><Link href="#" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm text-white uppercase tracking-[0.2em]">Data Core</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">About</Link></li>
                <li><Link href="#" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-sm font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-cyan-900/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} CivixShield Inc.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-500 uppercase tracking-widest">
              <span className="w-2 h-2 bg-cyan-400 animate-pulse border border-cyan-800" />
              SYSTEMS OPERATIONAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
