import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";

const languageGroups = [
  {
    category: "Global",
    items: [
      { code: "en", name: "English", country: "us" },
      { code: "zh-CN", name: "中文 (Chinese)", country: "cn" },
      { code: "es", name: "Español (Spanish)", country: "es" },
      { code: "ar", name: "العربية (Arabic)", country: "sa" },
      { code: "fr", name: "Français (French)", country: "fr" },
      { code: "ru", name: "Русский (Russian)", country: "ru" },
      { code: "pt", name: "Português", country: "br" },
      { code: "de", name: "Deutsch (German)", country: "de" },
      { code: "ja", name: "日本語 (Japanese)", country: "jp" },
      { code: "ko", name: "한국어 (Korean)", country: "kr" },
    ]
  },
  {
    category: "Indian",
    items: [
      { code: "hi", name: "हिन्दी (Hindi)", country: "in" },
      { code: "bn", name: "বাংলা (Bengali)", country: "in" },
      { code: "te", name: "తెలుగు (Telugu)", country: "in" },
      { code: "mr", name: "मराठी (Marathi)", country: "in" },
      { code: "ta", name: "தமிழ் (Tamil)", country: "in" },
      { code: "ur", name: "اردو (Urdu)", country: "in" },
      { code: "gu", name: "ગુજરાતી (Gujarati)", country: "in" },
      { code: "kn", name: "ಕನ್ನಡ (Kannada)", country: "in" },
      { code: "ml", name: "മലയാളം (Malayalam)", country: "in" },
      { code: "or", name: "ଓଡ଼ିଆ (Odia)", country: "in" },
      { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", country: "in" },
    ]
  }
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match) {
      const lang = match[1].split('/')[2];
      if (lang) setCurrentLang(lang);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (langCode: string) => {
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/`;
    setIsOpen(false);
    window.location.reload(); 
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-1.5 px-3 h-8 transition-all duration-300 border ${
          isOpen 
            ? "bg-cyan-950/40 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
            : "bg-[#0a0f14]/80 border-cyan-900/60 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-950/20"
        } focus:outline-none font-bold text-[11px] tracking-widest uppercase rounded-sm group`}
        aria-label="Change Language"
      >
        <Globe className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
        <span className="mt-[1px]">{currentLang === "en" ? "EN" : currentLang}</span>
        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180 opacity-100" : "group-hover:opacity-100"}`} />
      </button>
      
      <div 
        className={`absolute right-0 mt-3 w-64 bg-[#050505]/95 backdrop-blur-xl border border-cyan-900/60 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-sm z-50 transition-all duration-300 ease-out origin-top-right ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        
        <div className="max-h-[350px] overflow-y-auto py-2 no-scrollbar">
          
          {languageGroups.map((group, groupIdx) => (
            <div key={group.category}>
              
              <div className="px-4 py-2 mb-1 z-10 sticky top-0 bg-[#050505]/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-[1px] flex-1 bg-cyan-900/30"></div>
                  <span className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-[0.2em]">{group.category}</span>
                  <div className="h-[1px] flex-1 bg-cyan-900/30"></div>
                </div>
              </div>
              
              <div className="flex flex-col mb-2 px-2 gap-0.5">
                {group.items.map((lang) => {
                  const isActive = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className={`w-full text-left px-3 py-2 rounded-sm flex items-center justify-between transition-all duration-200 group ${
                        isActive 
                          ? "bg-cyan-950/40 text-cyan-400 font-medium border border-cyan-500/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]" 
                          : "bg-transparent text-gray-400 hover:bg-cyan-950/20 hover:text-cyan-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] w-6 font-mono tracking-widest transition-opacity ${isActive ? "opacity-100 text-cyan-400" : "opacity-50 group-hover:opacity-80"}`}>
                          {lang.code.toUpperCase()}
                        </span>
                        <span className={`text-sm transition-transform duration-200 ${isActive ? "translate-x-1" : "group-hover:translate-x-1"}`}>
                          {lang.name}
                        </span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
