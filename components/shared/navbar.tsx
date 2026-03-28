'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, Shield, Scan, Brain, Siren, Radio, AlertTriangle, Home, PlaySquare } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const navLinks = [
  { href: '/', label: 'Home', icon: Home, accent: 'cyan' },
  { href: '/scan', label: 'Scanner', icon: Scan, accent: 'cyan' },
  { href: '/deepfake', label: 'Deepfake', icon: Brain, accent: 'yellow' },
  { href: '/cyber-awareness', label: 'Cyber Awareness', icon: PlaySquare, accent: 'purple' },
  { href: '/community', label: 'Live Feed', icon: Radio, accent: 'red', pulse: true },
  { href: '/scam-alerts', label: 'Scam Alerts', icon: AlertTriangle, accent: 'orange' },
  { href: '/emergency', label: 'Safety Helpline', icon: Siren, accent: 'red' },
]

export function Navbar() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  const isLoggedIn = !!user

  const accentColor = (accent: string, active: boolean) => {
    if (active) {
      if (accent === 'red') return 'text-red-400'
      if (accent === 'yellow') return 'text-yellow-400'
      if (accent === 'orange') return 'text-orange-400'
      if (accent === 'purple') return 'text-purple-400'
      return 'text-cyan-400'
    }
    return 'text-gray-500 hover:text-cyan-400'
  }

  const dotColor = (accent: string) => {
    if (accent === 'red') return 'bg-red-500'
    if (accent === 'yellow') return 'bg-yellow-500'
    if (accent === 'orange') return 'bg-orange-500'
    if (accent === 'purple') return 'bg-purple-500'
    return 'bg-cyan-500'
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-mono">
      {/* Subtle top glow line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60" />

      <div className="bg-[#050505]/90 backdrop-blur-md border-b border-cyan-900/50">
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4 xl:px-8 py-3 flex items-center justify-between gap-2 xl:gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center group flex-shrink-0 mr-1 xl:mr-2">
            <Image src="/logo.png" alt="CivixShield Logo" width={200} height={50} className="object-contain w-[120px] lg:w-[130px] xl:w-[160px]" style={{ height: 'auto' }} priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[#0a0f14]/80 border border-cyan-900/40 rounded-sm px-1 xl:px-2 py-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center whitespace-nowrap gap-1.5 px-2 xl:px-3 py-1.5 text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.05em] xl:tracking-[0.12em] transition-all duration-200 ${accentColor(link.accent, isActive)} ${isActive ? 'bg-cyan-950/40' : 'hover:bg-cyan-950/20'}`}
                >
                  {link.pulse ? (
                    <span className={`w-1.5 h-1.5 ${dotColor(link.accent)} rounded-full animate-pulse`} />
                  ) : (
                    <Icon className="w-3 h-3 opacity-60" />
                  )}
                  {link.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-cyan-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 xl:gap-3 flex-shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />

            {isLoggedIn ? (
              <Button asChild variant="outline" className="hidden lg:inline-flex rounded-none border-cyan-500/60 text-cyan-400 bg-transparent hover:bg-cyan-900/30 uppercase tracking-widest font-bold text-[10px] h-8 px-3 xl:px-4 whitespace-nowrap">
                <Link href="/dashboard">{t('nav.dashboard')}</Link>
              </Button>
            ) : (
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                <Link href="/auth/login" className="whitespace-nowrap text-[10px] font-bold text-gray-400 hover:text-cyan-400 uppercase tracking-widest px-2 xl:px-3 py-1.5 border border-gray-800 hover:border-cyan-500/50 transition-all">
                  {t('nav.login')}
                </Link>
                <Button asChild className="whitespace-nowrap rounded-none bg-cyan-600 hover:bg-cyan-500 text-black border-b-2 border-cyan-900 uppercase tracking-widest font-bold text-[10px] h-8 px-3 xl:px-4">
                  <Link href="/auth/sign-up">{t('nav.getStarted')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile hamburger */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-900/20 rounded-none border border-cyan-900 w-9 h-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#050505] border-l border-cyan-900/50 p-0 font-mono w-[280px]">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="flex flex-col h-full pt-14 px-5 pb-6 overflow-y-auto">
                    <nav className="flex flex-col gap-1">
                      {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        const Icon = link.icon
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all ${accentColor(link.accent, isActive)} ${isActive ? 'bg-cyan-950/30 border-l-2 border-cyan-400' : 'border-l-2 border-transparent hover:bg-cyan-950/10'}`}
                          >
                            <Icon className="w-4 h-4" />
                            {link.label}
                          </Link>
                        )
                      })}
                    </nav>

                    <div className="mt-auto pt-8 space-y-3">
                      {isLoggedIn ? (
                        <Button asChild variant="outline" className="w-full rounded-none border-cyan-500 text-cyan-400 bg-transparent hover:bg-cyan-900/30 uppercase tracking-widest font-bold">
                          <Link href="/dashboard">{t('nav.dashboard')}</Link>
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <Button asChild className="w-full rounded-none bg-cyan-600 hover:bg-cyan-500 text-black uppercase tracking-widest font-bold h-12">
                            <Link href="/auth/sign-up">{t('nav.getStarted')}</Link>
                          </Button>
                          <Link href="/auth/login" className="text-center text-xs font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest py-2">
                            [ {t('nav.login')} ]
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
