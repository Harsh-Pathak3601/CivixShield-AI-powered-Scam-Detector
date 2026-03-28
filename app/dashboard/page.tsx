'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogOut, BarChart3, History, Settings, Users, Shield, Menu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore'
import { Scanner } from '@/components/scanner/scanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

interface AnalysisResult {
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  threat_categories: string[]
  analysis: string
  recommendation: string
}

interface ScanHistory {
  id: string
  content_type: string
  created_at: any
  result: AnalysisResult | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [history, setHistory] = useState<ScanHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (user) {
      loadAnalysisHistory(user.uid)
    }
  }, [user, loading, router])

  const loadAnalysisHistory = async (userId: string) => {
    try {
      const res = await fetch(`/api/analyze/history?userId=${userId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Failed to load analysis history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-low-risk bg-low-risk/10 border-low-risk/20'
      case 'medium': return 'text-medium-risk bg-medium-risk/10 border-medium-risk/20'
      case 'high': return 'text-high-risk bg-high-risk/10 border-high-risk/20'
      case 'critical': return 'text-critical-risk bg-critical-risk/10 border-critical-risk/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  return (
    <div className="min-h-screen flex bg-background relative selection:bg-primary/20">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0 pointer-events-none" />
      <div className="glow-orb w-[400px] h-[400px] bg-blue-500/10 top-0 left-0" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl hidden md:flex flex-col relative z-10 glass-panel">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center group">
            <Image src="/logo.png" alt="CivixShield Logo" width={160} height={40} className="object-contain w-[140px] h-auto" priority />
          </Link>
        </div>

        <div className="p-4 flex-1">
          <nav className="space-y-1.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Community Feed</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-xs font-semibold">{user.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 max-h-screen overflow-y-auto">
        <header className="sticky top-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl h-16 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground mr-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-[#050505] border-r border-white/5 p-0 font-mono w-[280px]">
                  <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
                  <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center px-6 border-b border-white/5">
                      <Link href="/" className="flex items-center group">
                        <Image src="/logo.png" alt="CivixShield Logo" width={160} height={40} className="object-contain w-[140px] h-auto" priority />
                      </Link>
                    </div>

                    <div className="p-4 flex-1">
                      <nav className="space-y-1.5">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Overview</span>
                        </Link>
                        <Link
                          href="/community"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                        >
                          <Users className="h-4 w-4" />
                          <span>Community Feed</span>
                        </Link>
                      </nav>
                    </div>

                    <div className="p-4 border-t border-white/5">
                      <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-xs font-semibold">{user.email?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Dashboard Overview</h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back.</h1>
            <p className="text-muted-foreground">Monitor your history and perform zero-day scans directly from your protected console.</p>
          </div>

          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="mb-4 bg-muted/50 p-1 glass-panel border border-white/5 rounded-xl">
              <TabsTrigger value="analyze" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">New Scan</TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Scan History</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Scanner onComplete={() => user && loadAnalysisHistory(user.uid)} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
              <Card className="glass-panel border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Analysis Log</CardTitle>
                      <CardDescription>Your recently intercepted cyber threats and verified content.</CardDescription>
                    </div>
                    <History className="h-5 w-5 text-muted-foreground opacity-50" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {historyLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/50 bg-background/50">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <History className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-medium">No analyses yet</p>
                      <p className="text-muted-foreground text-sm mt-1">Run your first scan to see history here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, idx) => (
                        <div
                          key={item.id}
                          style={{ animationDelay: `${idx * 50}ms` }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
                        >
                          <div className="mb-2 sm:mb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={`px-2 py-0.5 text-xs border ${getRiskColor(item.result?.risk_level)}`}>
                                {(item.result?.risk_level || 'UNKNOWN').toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium capitalize text-foreground">{item.content_type.replace('_', ' ')}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              {new Date(item.created_at || Date.now()).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                              <span>Score: {item.result?.risk_score}/100</span>
                            </div>
                          </div>

                          {item.result?.threat_categories && item.result.threat_categories.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {item.result.threat_categories.slice(0, 2).map((cat, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 rounded-md">
                                  {cat}
                                </Badge>
                              ))}
                              {item.result.threat_categories.length > 2 && (
                                <Badge variant="secondary" className="text-[10px] uppercase bg-white/5 border border-white/10 rounded-md">
                                  +{item.result.threat_categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
