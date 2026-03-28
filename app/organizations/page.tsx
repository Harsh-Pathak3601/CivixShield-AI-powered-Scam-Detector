'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Users, Settings as SettingsIcon, Loader2, Copy, Check, Trash2, ShieldAlert, Menu, AlertTriangle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function OrganizationsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgDesc, setNewOrgDesc] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (user) {
      loadOrganizations(user.uid)
    }
  }, [user, loading, router])

  async function loadOrganizations(userId: string) {
    try {
      const q = query(collection(db, 'organizations'), where('owner_id', '==', userId))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setOrganizations(data)
    } catch (err) {
      console.error('Error loading organizations:', err)
    }
  }

  async function handleCreateOrganization(e: React.FormEvent) {
    e.preventDefault()
    if (!newOrgName.trim()) return

    setCreating(true)
    try {
      const docRef = await addDoc(collection(db, 'organizations'), {
        owner_id: user?.uid,
        name: newOrgName,
        description: newOrgDesc,
        subscription_tier: 'free',
        analyses_used: 0,
        analyses_limit: 100
      })

      setOrganizations([...organizations, {
        id: docRef.id,
        owner_id: user?.uid,
        name: newOrgName,
        description: newOrgDesc,
        subscription_tier: 'free',
        analyses_used: 0,
        analyses_limit: 100
      }])
      setNewOrgName('')
      setNewOrgDesc('')
    } catch (err) {
      console.error('Error creating organization:', err)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteOrganization(orgId: string) {
    if (!confirm('Are you sure? This will delete the organization and all associated data.')) return

    try {
      await deleteDoc(doc(db, 'organizations', orgId))
      setOrganizations(organizations.filter(o => o.id !== orgId))
      setSelectedOrg(null)
    } catch (err) {
      console.error('Error deleting organization:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />
          <p className="text-cyan-600 font-mono uppercase tracking-widest text-xs">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="border-b border-cyan-500/50 bg-[#050505]/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-900/20">
              <Link href="/dashboard" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('nav.dashboard')}
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-white uppercase tracking-widest hidden sm:block">Organizations</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/emergency" className="group">
              <Button size="sm" className="rounded-none bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black text-[10px] tracking-[0.2em] transition-all px-3 h-8 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                {t('nav.sos')}
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-none bg-cyan-900/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold text-[10px] tracking-widest h-8">
                  <Plus className="h-4 w-4 mr-2" />
                  NEW ORG
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border border-cyan-500/50 text-white font-mono">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400 uppercase tracking-widest">Create Organization</DialogTitle>
                  <DialogDescription className="text-gray-500 text-xs">
                    Set up a new organization for team collaboration
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOrganization} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Organization Name</label>
                    <Input
                      placeholder="Acme Corp"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      disabled={creating}
                      className="bg-[#050505] border-cyan-900 focus:border-cyan-500 text-white rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                    <Textarea
                      placeholder="Internal security group..."
                      value={newOrgDesc}
                      onChange={(e) => setNewOrgDesc(e.target.value)}
                      disabled={creating}
                      className="bg-[#050505] border-cyan-900 focus:border-cyan-500 text-white rounded-none min-h-24"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-widest rounded-none h-12" disabled={creating || !newOrgName.trim()}>
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Initialize Organization'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {organizations.length === 0 ? (
          <div className="border-2 border-dashed border-cyan-900/50 p-20 text-center space-y-6 bg-cyan-950/5">
            <Users className="h-16 w-16 text-cyan-900 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">No Active Units</h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm uppercase tracking-wider">
                Create an organization to manage team members and heuristic analyses together.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-widest rounded-none px-10 h-12">
                  Create Your First Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border border-cyan-500/50 text-white font-mono">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400 uppercase tracking-widest">Initial Setup</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateOrganization} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unit Name</label>
                    <Input
                      placeholder="Acme Corp"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      disabled={creating}
                      className="bg-[#050505] border-cyan-900 focus:border-cyan-500 text-white rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mission Statement</label>
                    <Textarea
                      placeholder="Protecting digital assets..."
                      value={newOrgDesc}
                      onChange={(e) => setNewOrgDesc(e.target.value)}
                      disabled={creating}
                      className="bg-[#050505] border-cyan-900 focus:border-cyan-500 text-white rounded-none min-h-24"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-widest rounded-none h-12" disabled={creating || !newOrgName.trim()}>
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      'Deploy Organization'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className="bg-[#0a0a0a] border-2 border-cyan-900 hover:border-cyan-400 transition-all cursor-pointer group rounded-none"
                onClick={() => setSelectedOrg(org)}
              >
                <CardHeader className="border-b border-cyan-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg font-black text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                      {org.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-cyan-900/20 text-cyan-400 border-cyan-500 uppercase rounded-none">
                      {org.subscription_tier}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-gray-500 line-clamp-2 uppercase tracking-tight">
                    {org.description || 'No data payload description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-600 uppercase font-black">Tier</p>
                      <p className="font-bold text-white uppercase text-xs tracking-widest">{org.subscription_tier}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-600 uppercase font-black">Duty Cycle</p>
                      <p className="font-bold text-white text-xs tracking-widest">{org.analyses_used}/{org.analyses_limit}</p>
                    </div>
                  </div>

                  <Dialog open={selectedOrg?.id === org.id} onOpenChange={(open) => !open && setSelectedOrg(null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-transparent border border-cyan-900 group-hover:border-cyan-400 text-cyan-500 hover:bg-cyan-400 hover:text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-none transition-all" onClick={(e) => e.stopPropagation()}>
                        <SettingsIcon className="h-4 w-4 mr-2" />
                        Command Center
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#0a0a0a] border border-cyan-500 text-white font-mono rounded-none">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-widest text-white">{org.name}</DialogTitle>
                        <DialogDescription className="text-cyan-600 text-[10px] uppercase font-bold tracking-[0.3em]">Operational Oversight & Management</DialogDescription>
                      </DialogHeader>

                      {selectedOrg?.id === org.id && (
                        <Tabs defaultValue="settings" className="space-y-6 mt-6">
                          <TabsList className="grid w-full grid-cols-3 bg-[#050505] rounded-none p-1">
                            <TabsTrigger value="settings" className="rounded-none data-[state=active]:bg-cyan-600 data-[state=active]:text-black text-[10px] font-black uppercase">Settings</TabsTrigger>
                            <TabsTrigger value="members" className="rounded-none data-[state=active]:bg-cyan-600 data-[state=active]:text-black text-[10px] font-black uppercase">Units</TabsTrigger>
                            <TabsTrigger value="danger" className="rounded-none data-[state=active]:bg-red-600 data-[state=active]:text-white text-[10px] font-black uppercase">Protocol X</TabsTrigger>
                          </TabsList>

                          <TabsContent value="settings" className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit Serial Number</label>
                              <div className="flex gap-2">
                                <Input
                                  value={org.id}
                                  readOnly
                                  className="bg-[#050505] border-cyan-900 font-mono text-xs text-cyan-400 rounded-none h-10"
                                />
                                <Button
                                  variant="outline"
                                  className="border-cyan-900 rounded-none hover:bg-cyan-900/50"
                                  onClick={() => copyToClipboard(org.id)}
                                >
                                  {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4 text-cyan-500" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Execution Tier</label>
                              <div className="px-3 py-2 border border-cyan-900 bg-cyan-950/20 text-cyan-400 text-xs font-black uppercase tracking-widest">
                                {org.subscription_tier}
                              </div>
                            </div>

                            <div className="p-4 border border-cyan-900/50 bg-[#050505]">
                              <p className="text-[10px] text-gray-500 uppercase font-black mb-2">Heuristic Capacity</p>
                              <div className="h-2 w-full bg-cyan-950 overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500"
                                  style={{ width: `${(org.analyses_used / org.analyses_limit) * 100}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-cyan-400 mt-2 font-bold uppercase">{org.analyses_used} / {org.analyses_limit} Analysis Vectors Deployed</p>
                            </div>
                          </TabsContent>

                          <TabsContent value="members" className="space-y-4">
                            <div className="p-10 border border-cyan-900 bg-[#050505] text-center">
                              <Users className="h-10 w-10 text-cyan-900 mx-auto mb-4" />
                              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                                Team member coordination protocols coming soon. Upgrade to Enterprise to unlock multi-agent oversight.
                              </p>
                            </div>
                          </TabsContent>

                          <TabsContent value="danger" className="space-y-4">
                            <div className="p-4 border border-red-900/50 bg-red-950/10 text-red-500">
                              <p className="text-[10px] font-black uppercase mb-1 flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3" /> Warning: Protocal X
                              </p>
                              <p className="text-[10px] uppercase font-bold tracking-tight">
                                Deleting this organization will permanently purge all associated heuristic data and logs from the mainframe.
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              className="w-full rounded-none bg-red-900 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] h-12"
                              onClick={() => handleDeleteOrganization(org.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Purge Organization
                            </Button>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
