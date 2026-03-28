import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle, ArrowRight, ShieldAlert, Newspaper, X } from 'lucide-react'

const alerts = [
  {
    id: 0,
    title: 'Payal Gaming Deepfake Case: Maharashtra Cyber Confirms Viral Video Was Fake',
    description:
      'A fake explicit video was circulated online targeting creator Payal Gaming (Payal Dhare). Maharashtra Cyber Police confirmed it was a deepfake, registered action, and arrested the uploader. Not every viral clip is real — deepfakes can target anyone. Victims should report quickly as cyber police do act in such cases.',
    tag: 'DEEPFAKE CASE',
    color: 'text-red-400',
    borderColor: 'border-red-500/40',
    link: 'https://www.indiatvnews.com/entertainment/news/payal-gaming-deepfake-case-maharashtra-cyber-police-confirms-viral-video-was-fake-2025-12-19-1022505',
  },
  {
    id: 0.5,
    title: 'Impersonation Scam: Fraudsters Pretended to Be GAIL Officials',
    description:
      'Police in Ranchi arrested three accused who posed as GAIL representatives and cheated a victim of ₹20 lakh. Scammers often impersonate trusted companies using official-looking identities. Always verify through official numbers and websites — a professional appearance does not guarantee legitimacy.',
    tag: 'IMPERSONATION FRAUD',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    link: 'https://timesofindia.indiatimes.com/city/ranchi/digital-fraud-alert-three-arrested-for-rs-20-lakh-cyber-fraud-victim-duped-by-fake-gail-representatives/articleshow/129703355.cms',
  },
  {
    id: 0.3,
    title: 'Fake Government App Scam: How a PM Kisan APK Was Used for Fraud',
    description:
      'Azamgarh police booked 17 people linked to a massive fraud operation using a fake PM Kisan Yojana app. Victims installed a malicious APK from messages, allowing scammers to steal OTPs and siphon money from bank accounts. Never install APK files from messages — government names are often misused in scams.',
    tag: 'MALWARE / APK FRAUD',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    link: 'https://timesofindia.indiatimes.com/city/varanasi/17-booked-for-rs110-cr-bank-fraud-in-azamgarh/articleshow/129641120.cms',
  },
  {
    id: 0.2,
    title: 'E-Challan Scam: One APK File Led to Bank Fraud',
    description:
      'A 74-year-old man in Rajkot received a WhatsApp message with an "RTO E-CHALAN.APK" from a known contact. After installing it, malware intercepted OTPs and ₹10.66 lakh was stolen. Even messages from known contacts can carry malware — never install APK files outside official app stores. Quick reporting helped freeze ₹1.86 lakh.',
    tag: 'APK MALWARE',
    color: 'text-pink-400',
    borderColor: 'border-pink-500/40',
    link: 'https://timesofindia.indiatimes.com/city/rajkot/malicious-e-challan-app-swindles-10-66l-from-74-year-old/articleshow/129723918.cms',
  },
  {
    id: 0.15,
    title: 'Behind Cyber Fraud: Police Trace Mule Accounts Used by Scammers',
    description:
      'Belagavi police flagged around 1,400 suspicious mule bank accounts and registered multiple cyberfraud cases. Several suspects were connected to fraud cases across states involving large sums. Cyber fraud is usually organized, not random — and police investigations can uncover wider networks behind the scenes.',
    tag: 'MULE ACCOUNTS',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    link: 'https://timesofindia.indiatimes.com/city/hubballi/1400-suspect-mule-accounts-flagged-in-belagavi-multiple-cyberfraud-cases-registered/articleshow/129758830.cms',
  },
  {
    id: 6,
    title: 'Digital Arrest Scam: How Fake Police Calls Trap Victims',
    description:
      'Nagaur police arrested 4 people from New Delhi, including a CA, who posed as Bengaluru police on video calls and put a retired doctor under "digital arrest" — extracting ₹34 lakh using threats of human trafficking charges. Police never demand money over video calls. Fear-based threats are a major red flag. Immediate reporting helped freeze ₹5 lakh.',
    tag: 'DIGITAL ARREST',
    color: 'text-violet-400',
    borderColor: 'border-violet-500/40',
    link: 'https://timesofindia.indiatimes.com/city/jaipur/ca-among-four-held-from-new-delhi-for-digital-arrest-of-doc/articleshow/129687079.cms',
  },
]

export default function ScamAlertsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden font-mono selection:bg-cyan-500/30">


      <main className="relative z-10 pt-28 pb-32">
        {/* Page Header */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#050505] border border-red-500 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-red-400" />
            </div>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-red-500/60 to-transparent" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-[0.1em] text-white uppercase mb-4">
            Scam Alerts &amp; Awareness
          </h1>
          <p className="text-base sm:text-lg text-cyan-600/80 uppercase tracking-widest max-w-3xl pl-4 border-l-2 border-cyan-500 mb-8">
            &gt; Stay informed about latest scams, deepfakes, and digital fraud
          </p>

          {/* Emergency Banner */}
          <Link href="/emergency" className="block group relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600 opacity-5 group-hover:opacity-10 transition-opacity" />
            <div className="relative border-2 border-red-500/40 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 group-hover:border-red-500 transition-colors">
              <div className="w-12 h-12 bg-red-900/20 border border-red-500 flex items-center justify-center animate-pulse">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">BEING SCAMMED RIGHT NOW?</h3>
                <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Access Global Cybercrime Hotlines instantly to your issue.</p>
              </div>
              <div className="bg-red-500 text-black px-4 py-2 text-xs font-black uppercase tracking-widest group-hover:bg-red-400 transition-colors shrink-0">
                GET HELP NOW
              </div>
            </div>
          </Link>
        </section>

        {/* Alert Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`group relative bg-[#0a0f14] border-2 ${alert.borderColor} p-6 sm:p-8 transition-all duration-300 hover:bg-[#0c131a] hover:shadow-[0_0_25px_rgba(34,211,238,0.07)] hover:-translate-y-1`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
              >
                {/* Corner accent */}
                <div className={`absolute top-0 right-0 w-4 h-4 bg-[#0a0f14] border-b border-l ${alert.borderColor} transform translate-x-[2px] -translate-y-[2px]`} />

                <div className="flex flex-col h-full gap-4">
                  {/* Tag */}
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${alert.color} shrink-0`} />
                    <span className={`text-xs font-bold ${alert.color} uppercase tracking-[0.2em]`}>
                      {alert.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide uppercase leading-tight">
                    {alert.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-400 leading-relaxed flex-1">
                    {alert.description}
                  </p>

                  {/* Read More */}
                  <Link
                    href={alert.link || '#'}
                    target={alert.link ? '_blank' : undefined}
                    rel={alert.link ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-2 text-sm font-bold text-cyan-500 hover:text-cyan-300 uppercase tracking-widest transition-colors group/link mt-2 w-fit"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t-2 border-cyan-900 bg-[#0a0f14] py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} CivixShield Inc.
          </p>
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-500 uppercase tracking-widest">
            <span className="w-2 h-2 bg-cyan-400 animate-pulse border border-cyan-800" />
            SYSTEMS OPERATIONAL
          </div>
        </div>
      </footer>
    </div>
  )
}
