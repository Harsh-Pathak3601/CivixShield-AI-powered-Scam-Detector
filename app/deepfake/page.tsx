'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CloudUpload, ShieldAlert, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

interface DeepfakeResult {
  score: number;
  risk: string;
  explanation: string;
  frames_analyzed: number;
  is_mock: boolean;
}

export default function DeepfakeDetector() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DeepfakeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)
    setError(null)

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file) return
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/deepfake', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze media')
      }

      setResult(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An unexpected error occurred during analysis.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
  }

  const getRiskColors = (risk: string) => {
    if (risk === 'High Risk') return {
      text: 'text-red-500',
      border: 'border-red-600',
      bgDark: 'bg-red-950/20',
      bgLight: 'bg-red-600',
      shadow: 'shadow-[0_0_15px_rgba(220,38,38,0.2)]'
    }
    if (risk === 'Suspicious') return {
      text: 'text-yellow-500',
      border: 'border-yellow-600',
      bgDark: 'bg-yellow-950/20',
      bgLight: 'bg-yellow-600',
      shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]'
    }
    return {
      text: 'text-emerald-500',
      border: 'border-emerald-600',
      bgDark: 'bg-emerald-950/20',
      bgLight: 'bg-emerald-600',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]'
    }
  }

  return (
    <div className="min-h-screen relative bg-[#0a0f14] font-mono selection:bg-cyan-500/30 text-white pt-24 pb-12">

      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-[0.1em] uppercase text-white">
            Deepfake <span className="text-[#ffff00]" style={{ textShadow: '3px 3px 0px #dc2626' }}>DETECTOR</span>
          </h1>
          {/* Cyan dash separator */}
          <div className="w-48 h-1 bg-cyan-900 mx-auto relative overflow-hidden">
            <div className="w-1/2 h-full bg-cyan-500 absolute left-1/4" />
          </div>
          <p className="text-cyan-600 font-bold uppercase tracking-[0.2em] text-sm max-w-lg mx-auto leading-relaxed mt-4">
            &gt; UPLOAD AN IMAGE OR VIDEO TO DETECT AI-GENERATED OR MANIPULATED MEDIA
          </p>
        </div>

        {/* Dynamic Main Body Area */}
        <div className="w-full relative">

          {/* STATE 1: NO FILE YET (DROPZONE) */}
          {!file && !result && (
            <div className="w-full relative bg-[#05080a] p-1 shadow-[0_0_30px_rgba(34,211,238,0.05)] border-2 border-cyan-800" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
              <div className="absolute top-0 right-0 w-6 h-6 bg-[#0a0f14] border-b-2 border-l-2 border-cyan-800 transform translate-x-[2px] -translate-y-[2px] z-10" />

              <div className="bg-[#05080a] p-8 md:p-16 h-full border border-dashed border-cyan-900/50 hover:border-cyan-500/80 transition-all duration-300">
                <div
                  className={`flex flex-col items-center justify-center text-center p-8 border-2 border-dashed transition-all cursor-pointer ${isDragging ? 'border-cyan-400 bg-cyan-950/20' : 'border-cyan-900/40 hover:border-cyan-700 hover:bg-[#080d12]'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                    onChange={handleFileChange}
                  />

                  <div className="w-16 h-16 bg-[#0a0f14] border border-cyan-500 flex items-center justify-center mb-6 relative">
                    <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-500" />
                    <CloudUpload className="h-8 w-8 text-cyan-400" />
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.1em] mb-2">
                    DROP MEDIA HERE
                  </h3>
                  <p className="text-cyan-600/60 font-bold tracking-[0.2em] text-sm uppercase mb-8 hover:text-cyan-400 transition-colors">
                    OR CLICK TO BROWSE
                  </p>

                  <div className="text-xs font-bold text-gray-600 uppercase tracking-widest px-4 border-t border-cyan-900/30 pt-4">
                    JPG - PNG - WEBP - GIF - MP4 - WEBM - MAX 50 MB
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEDIA PREVIEW (Always visible if file is selected) */}
          {file && previewUrl && (
            <div className="flex flex-col space-y-6 w-full mb-6 relative">
              {/* Reset Media Button (Only before scan) */}
              {!result && !isLoading && (
                <button
                  onClick={handleReset}
                  className="absolute -top-3 -right-3 w-10 h-10 bg-[#050505] border-2 border-cyan-500 text-gray-400 hover:text-red-500 hover:border-red-500 flex items-center justify-center z-20 shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
                  title="Remove Media"
                >
                </button>
              )}
              {/* Media Preview Box */}
              <div className="w-full relative bg-[#05080a] p-1 border-2 border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                <div className="p-4 md:p-6 flex items-center justify-center bg-[#000000]">
                  {file.type.startsWith('video/') ? (
                    <video src={previewUrl} controls className="max-h-[500px] w-auto max-w-full obj-contain border border-cyan-900 shadow-xl" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={previewUrl} alt="Preview" className="max-h-[500px] w-auto max-w-full obj-contain border border-cyan-900 shadow-xl" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCAN BUTTON (Only visible if file selected and NO result/loading) */}
          {file && previewUrl && !result && !isLoading && (
            <div className="w-full mb-6">
              <button
                onClick={handleAnalyze}
                className="w-full relative h-[72px] bg-[#9C941A] hover:bg-[#b0a720] text-black font-bold uppercase tracking-[0.2em] rounded-none border-b-[6px] border-red-700 transition-all group overflow-hidden flex items-center justify-center"
              >
                {/* Corner cutouts */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#0a0f14] transform -translate-x-1.5 -translate-y-1.5 rotate-45 z-10" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#0a0f14] transform translate-x-1.5 -translate-y-1.5 rotate-45 z-10" />
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-700 transform -translate-x-1.5 translate-y-1.5 rotate-45 z-10" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-700 transform translate-x-1.5 translate-y-1.5 rotate-45 z-10" />

                <span className="relative z-20 flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5" /> SCAN FOR DEEPFAKE
                </span>

                {/* Scanline hover effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out" />
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="w-full relative bg-[#05080a] border-2 border-cyan-800 p-16 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.1)]">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-cyan-500 animate-pulse text-center">
                Executing Neural Forensics...
              </h3>
              <p className="text-gray-500 text-xs tracking-widest uppercase mt-4 text-center">
                Analyzing frames for synthetic manipulation signatures
              </p>
            </div>
          )}

          {/* RESULT STATE */}
          {result && !isLoading && (() => {
            const style = getRiskColors(result.risk)
            return (
              <div className="flex flex-col space-y-6 w-full">
                {/* Top Risk Box */}
                <div className={`relative w-full border border-t-[8px] ${style.border} ${style.bgDark} ${style.shadow} p-6 sm:p-8 flex flex-col`}>

                  {/* Top corner accent */}
                  <div className={`absolute top-0 left-0 w-3 h-3 ${style.bgLight} transform -translate-x-1.5 -translate-y-4`} />

                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end w-full mb-6">

                    <div className="flex flex-col">
                      <div className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">
                        Deepfake Risk Level
                      </div>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-8 h-8 ${style.text}`} />
                        <h2 className={`text-4xl font-black uppercase tracking-wider ${style.text}`}>
                          {result.risk}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-col items-end mt-4 sm:mt-0">
                      <div className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2 text-right">
                        AI Manipulation Score
                      </div>
                      <h2 className={`text-5xl font-black ${style.text}`}>
                        {result.score}<span className="text-3xl">%</span>
                      </h2>
                    </div>

                  </div>

                  {/* Progress Bar entirely mirroring screenshot */}
                  <div className="w-full mt-4">
                    <div className="w-full h-3 bg-[#000000] border border-gray-800 relative overflow-hidden mb-2">
                      <div
                        className={`h-full ${style.bgLight} transition-all duration-1000 ease-out`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[#3b596b] text-[10px] font-bold uppercase tracking-widest font-mono">
                      <span>Safe (0%)</span>
                      <span>High Risk (100%)</span>
                    </div>
                  </div>

                </div>

                {/* Analysis Report Box */}
                <div className="relative w-full border border-cyan-900 bg-[#05080a] p-6 sm:p-8 shadow-lg">
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-500 transform translate-x-1 -translate-y-1" />

                  <h3 className="text-cyan-400 font-black uppercase tracking-[0.1em] text-lg mb-6 border-b border-cyan-900/50 pb-4">
                    Analysis Report
                  </h3>

                  <p className="text-gray-300 font-mono text-sm sm:text-base leading-relaxed">
                    &gt; {result.explanation}
                  </p>

                  {result.is_mock && (
                    <p className="mt-8 text-xs text-yellow-600 font-bold uppercase">
                      * Results generated via demonstration logic (Hive API unconfigured in environment).
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <button
                  onClick={handleReset}
                  className="w-full h-16 bg-[#05080a] border border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] font-bold text-sm flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-4 h-4" /> SCAN ANOTHER FILE
                </button>

              </div>
            )
          })()}

          {/* Any global errors */}
          {error && !isLoading && (
            <div className="mt-6 bg-red-950/40 border border-red-800 text-red-500 p-4 w-full text-center font-bold tracking-widest uppercase text-sm">
              [ ERROR ] {error}
            </div>
          )}

        </div>

        {/* Info Cards Row (always visible at bottom) */}
        {!result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-10 px-2 sm:px-0">
            {/* Box 1: Images */}
            <div className="bg-[#050505] border-t-2 border-cyan-500 px-5 py-4 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold text-gray-500 shadow-lg flex items-center justify-between transition-colors hover:bg-[#080808]">
              <span>Images Supported</span>
              {/* Minimalist status indicator */}
              <div className="h-1 w-3 bg-cyan-500/30" />
            </div>

            {/* Box 2: Video */}
            <div className="bg-[#050505] border-t-2 border-yellow-500 px-5 py-4 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold text-gray-500 shadow-lg flex items-center justify-between transition-colors hover:bg-[#080808]">
              <span>Video Supported</span>
              {/* Minimalist status indicator */}
              <div className="h-1 w-3 bg-yellow-500/30" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
