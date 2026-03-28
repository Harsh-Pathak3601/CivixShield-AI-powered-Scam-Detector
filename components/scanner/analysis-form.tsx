'use client'

import { useState } from 'react'
import { Button } from '@/Chaat-Masala-Hack4Innovation-26/components/ui/button'
import { Textarea } from '@/Chaat-Masala-Hack4Innovation-26/components/ui/textarea'
import { Input } from '@/Chaat-Masala-Hack4Innovation-26/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Chaat-Masala-Hack4Innovation-26/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Chaat-Masala-Hack4Innovation-26/components/ui/tabs'
import { Alert, AlertDescription } from '@/Chaat-Masala-Hack4Innovation-26/components/ui/alert'
import { Loader2, Copy, Check, Image, Mic, Link as LinkIcon, MessageSquare, QrCode, Shield, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/Chaat-Masala-Hack4Innovation-26/lib/i18n/LanguageContext'
import jsQR from 'jsqr'

interface AnalysisFormProps {
  onAnalyze: (content: string, type: string, mediaBase64?: string, mediaType?: string) => Promise<void>
  isLoading: boolean
}

export function AnalysisForm({ onAnalyze, isLoading }: AnalysisFormProps) {
  const { t } = useLanguage()
  const [content, setContent] = useState('')
  const [activeTab, setActiveTab] = useState('message')
  const [copied, setCopied] = useState(false)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve((reader.result as string).split(',')[1]) // Get raw base64 data
      reader.onerror = error => reject(error)
    })
  }

  const handleAnalyze = async () => {
    let finalContent = activeTab === 'link' && url ? `${url}\n${content}` : content
    let mediaBase64: string | undefined = undefined
    let mediaMimeType: string | undefined = undefined

    if (activeTab === 'screenshot' && screenshotFile) {
      mediaBase64 = await getBase64(screenshotFile)
      mediaMimeType = screenshotFile.type

      // Fallback robust MIME typing for Gemini (fixes WhatsApp desktop / registry issues)
      if (!mediaMimeType || mediaMimeType === 'application/octet-stream') {
        const ext = screenshotFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'png') mediaMimeType = 'image/png';
        else if (ext === 'webp') mediaMimeType = 'image/webp';
        else if (ext === 'heic') mediaMimeType = 'image/heic';
        else mediaMimeType = 'image/jpeg';
      }

      if (!finalContent) finalContent = "Please analyze this image for any fraud, phishing, or scam indicators."
    } else if (activeTab === 'audio' && audioFile) {
      mediaBase64 = await getBase64(audioFile)
      mediaMimeType = audioFile.type

      // Fallback audio MIME
      if (!mediaMimeType || mediaMimeType === 'application/octet-stream') {
        mediaMimeType = 'audio/mp3';
      }

      if (!finalContent) finalContent = "Please transcribe and analyze this audio for any fraud, phishing, or scam indicators."
    } else if (!finalContent.trim()) {
      return // Require text if no media
    }

    await onAnalyze(finalContent, activeTab, mediaBase64, mediaMimeType)
  }

  const copyContent = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maxChars = 5000
  const charCount = content.length

  return (
    <div className="relative w-full max-w-4xl mx-auto font-mono">

      {/* Outer Wrapper for perfectly continuous border along the clip-path cut */}
      <div
        className="w-full bg-cyan-500 p-[2px] shadow-[0_0_30px_rgba(34,211,238,0.1)]"
        style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)' }}
      >
        {/* Inner Terminal Block */}
        <div
          className="relative bg-[#0a0f14] z-10 p-4 sm:p-8 md:p-12 h-full"
          style={{ clipPath: 'polygon(0 0, calc(100% - 23px) 0, 100% 23px, 100% 100%, 0 100%)' }}
        >

          {/* Header Block */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-wider text-white">
              Security Scanner
            </h1>

          </div>

          {/* Tabs Control */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full h-auto p-1 bg-[#17202A] rounded-xl border border-[#1f2937] justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1 mb-8">
              <TabsTrigger value="link" className="flex items-center justify-center flex-1 sm:flex-none text-xs sm:text-sm py-2 px-3 sm:px-6 rounded-lg data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=inactive]:text-gray-400 font-semibold transition-all duration-300 gap-1 sm:gap-2">
                <LinkIcon className="h-4 w-4 shrink-0" />
                <span>Link</span>
              </TabsTrigger>
              <TabsTrigger value="message" className="flex items-center justify-center flex-1 sm:flex-none text-xs sm:text-sm py-2 px-3 sm:px-6 rounded-lg data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=inactive]:text-gray-400 font-semibold transition-all duration-300 gap-1 sm:gap-2">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span>Message</span>
              </TabsTrigger>
              <TabsTrigger value="screenshot" className="flex items-center justify-center flex-1 sm:flex-none text-xs sm:text-sm py-2 px-3 sm:px-6 rounded-lg data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=inactive]:text-gray-400 font-semibold transition-all duration-300 gap-1 sm:gap-2">
                <Image className="h-4 w-4 shrink-0" />
                <span>Screenshot</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center justify-center flex-1 sm:flex-none text-xs sm:text-sm py-2 px-3 sm:px-6 rounded-lg data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=inactive]:text-gray-400 font-semibold transition-all duration-300 gap-1 sm:gap-2">
                <Mic className="h-4 w-4 shrink-0" />
                <span>Audio</span>
              </TabsTrigger>
            </TabsList>

            {/* Link Tab */}
            <TabsContent value="link" className="space-y-6 mt-0">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="h-16 bg-[#05080a] border border-cyan-900/50 rounded-none pl-12 text-lg text-gray-200 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:border-cyan-400 transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-gray-500" />
                <span>
                  <a href="/login" className="text-cyan-400 underline hover:text-cyan-300 decoration-cyan-400/50 underline-offset-4">Sign in</a> to share to the Community Ledger
                </span>
              </div>
            </TabsContent>

            {/* Message Tab */}
            <TabsContent value="message" className="space-y-6 mt-0">
              <div className="relative group">
                <div className="absolute top-5 left-4 pointer-events-none z-10">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                </div>
                <Textarea
                  placeholder="Paste suspicious text or message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
                  disabled={isLoading}
                  className="min-h-[120px] bg-[#05080a] border border-cyan-900/50 rounded-none pl-12 pt-4 text-base text-gray-200 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:border-cyan-400 transition-all shadow-inner resize-y"
                />
              </div>

              <div className="flex justify-between items-center text-xs text-cyan-700">
                <span>{charCount}/{maxChars} chars parsed</span>
                <button onClick={copyContent} className="hover:text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy Data'}
                </button>
              </div>
            </TabsContent>

            <TabsContent value="screenshot" className="space-y-6 mt-0">
              <div className="border border-dashed border-cyan-800/50 bg-[#05080a] p-10 text-center hover:border-cyan-500 transition-colors cursor-pointer group relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setScreenshotFile(e.target.files[0])
                    }
                  }}
                  className="hidden"
                  id="screenshot-input"
                  disabled={isLoading}
                />
                <label htmlFor="screenshot-input" className="cursor-pointer block min-h-[140px] flex flex-col items-center justify-center">
                  {!screenshotFile ? (
                    <>
                      <Image className="h-10 w-10 text-cyan-600 mx-auto mb-4 group-hover:text-cyan-400" />
                      <p className="text-base text-gray-300">Click to upload image payload</p>
                      <p className="text-sm text-cyan-800 mt-2">PNG, JPG, GIF max 10MB</p>
                    </>
                  ) : (
                    <div className="relative w-full max-w-[300px] aspect-auto mx-auto border-2 border-cyan-500/50 rounded-md overflow-hidden bg-black/50">
                      <img
                        src={URL.createObjectURL(screenshotFile)}
                        alt="Upload preview"
                        className="w-full h-auto object-contain max-h-[250px]"
                      />
                      <div className="absolute inset-0 bg-cyan-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="text-cyan-400 font-bold bg-black/60 px-3 py-1 rounded">Click to Change Image</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-6 mt-0">
              <div className="border border-dashed border-cyan-800/50 bg-[#05080a] p-10 text-center hover:border-cyan-500 transition-colors cursor-pointer group">
                <input type="file" accept="audio/*" onChange={(e) => { if (e.target.files?.[0]) setAudioFile(e.target.files[0]) }} className="hidden" id="audio-input" disabled={isLoading} />
                <label htmlFor="audio-input" className="cursor-pointer block">
                  <Mic className="h-10 w-10 text-cyan-600 mx-auto mb-4 group-hover:text-cyan-400" />
                  <p className="text-base text-gray-300">Click to upload voice payload</p>
                  <p className="text-sm text-cyan-800 mt-2">MP3, WAV, M4A max 25MB</p>
                  {audioFile && <p className="text-sm text-cyan-400 mt-4">&gt; Payload Loaded: {audioFile.name}</p>}
                </label>
              </div>
            </TabsContent>
          </Tabs>

          {/* Global Action Button */}
          <div className="mt-12 relative">
            {/* Black cutout corners simulated with absolute positioned boxes matching bg */}
            <Button
              onClick={handleAnalyze}
              disabled={(!content.trim() && !screenshotFile && !audioFile && !url) || isLoading}
              className="w-full relative h-14 sm:h-16 bg-[#9C941A] hover:bg-[#b0a720] text-black font-bold uppercase tracking-[0.2em] rounded-none border-b-4 border-red-700 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
              size="lg"
            >
              {/* Corner cutouts */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#0a0f14] transform -translate-x-1.5 -translate-y-1.5 rotate-45 z-10" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#0a0f14] transform translate-x-1.5 -translate-y-1.5 rotate-45 z-10" />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-700 transform -translate-x-1.5 translate-y-1.5 rotate-45 z-10" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-700 transform translate-x-1.5 translate-y-1.5 rotate-45 z-10" />

              <span className="relative z-20 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    EXECUTING INTEGRITY SCAN...
                  </>
                ) : (
                  <>
                    <Shield className="mr-3 h-5 w-5" />
                    ANALYZE {activeTab.toUpperCase()} INTEGRITY
                  </>
                )}
              </span>

              {/* Scanline hover effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
