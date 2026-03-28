'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Language } from '@/lib/i18n/translations'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Extensive Map for UI Display
  const languageNames: Record<Language, string> = {
    en: 'English', es: 'Español', hi: 'हिन्दी', fr: 'Français', de: 'Deutsch',
    it: 'Italiano', pt: 'Português', zh: '中文', ja: '日本語', ko: '한국어', ru: 'Русский',
    ar: 'العربية', bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ', te: 'తెలుగు', mr: 'मराठी', ta: 'தமிழ்',
    tr: 'Türkçe', vi: 'Tiếng Việt', th: 'ไทย', id: 'Bahasa Indonesia',
    ms: 'Bahasa Melayu', fa: 'فارسی', ur: 'اردو', sw: 'Kiswahili', gu: 'ગુજરાતી',
    kn: 'ಕನ್ನಡ', ml: 'മലയാളം', or: 'ଓଡ଼ିଆ', nl: 'Nederlands', sv: 'Svenska'
  }

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-[#0a0f14] border border-cyan-500 hover:bg-cyan-900/40 transition-none text-cyan-400 focus:outline-none rounded-none"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 max-h-80 overflow-y-auto no-scrollbar rounded-none shadow-2xl bg-[#0a0f14] border-2 border-cyan-500 z-50 p-1">
          {(Object.keys(languageNames) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm rounded-none transition-none border-b border-cyan-900/30 last:border-0 ${language === lang
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold'
                  : 'text-gray-400 hover:bg-cyan-900/30 hover:text-cyan-400'
                }`}
            >
              {languageNames[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
