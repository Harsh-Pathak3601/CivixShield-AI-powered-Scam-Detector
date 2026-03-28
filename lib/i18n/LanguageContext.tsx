'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('civix-lang') as Language
    if (saved && (translations as any)[saved]) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('civix-lang', lang)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let val: any = (translations as any)[language]
    for (const k of keys) {
      if (val === undefined) break
      val = val[k]
    }
    return val || key
  }

  // To prevent hydration mismatches, you could technically wait to render text or simply render fallback English if unmounted.
  // For safety, we will just pass down context normally.
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
