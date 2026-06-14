import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STATS = [
  { n: '47M', label: 'American women in perimenopause or menopause' },
  { n: '$150B', label: 'lost in economic productivity annually' },
  { n: '7 yrs', label: 'average wait for a proper diagnosis' },
  { n: '73%', label: 'feel unsupported by their current healthcare' },
]

const FEATURES = [
  {
    icon: '📓',
    title: 'Daily Symptom Tracking',
    desc: 'A 2-minute check-in that builds a real picture of your health over time — not just what you remember in a 15-minute appointment.',
  },
  {
    icon: '✨',
    title: 'AI-Powered Insights',
    desc: "Valerie learns your patterns and tells you what they mean. Sleep and mood correlated? Hot flashes worse on certain days? You'll know.",
  },
  {
    icon: '🧭',
    title: 'Care Navigation',
    desc: 'Find menopause-literate providers, generate appointment briefs, and arrive at every visit with 90 days of real data.',
  },
  {
    icon: '💬',
    title: 'Always There',
    desc: 'Chat with Valerie any time — 3am hot flash, brain fog at work, or just needing someone who actually understands. She always answers.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdfbff]">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-violet-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
              V
            </div>
            <span className="font-bold text-violet-950 text-lg tracking-tight">valerie</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Start free trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-bold px-4 py-2 rounded-full mb-6 animate-in">
            <span>🌸</span>
            <span>Built for perimenopause and menopause</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-violet-950 leading-[0.95] tracking-tighter mb-6 animate-in">
            You deserve more than
            <br />
            <span className="text-violet-600">15 minutes</span> a year.
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Valerie is the AI companion that tracks your symptoms daily, spots patterns your doctor can't see, and helps you navigate care — so you never feel alone in this again.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8">
                Start your free 14-day trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-base">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">No credit card required · Cancel any time</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-violet-200 text-sm font-semibold uppercase tracking-widest mb-10">
            The problem we're solving
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-white mb-2">{s.n}</div>
                <div className="text-violet-200 text-sm leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-violet-950 mb-3">
              Everything in one place.
            </h2>
            <p className="text-gray-500">No more Googling, guessing, or feeling dismissed.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md hover:border-violet-100 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-6 bg-violet-50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl text-gray-700 italic leading-relaxed mb-6">
            &ldquo;For the first time in three years, I felt like someone was actually listening — even if it was an app. I walked into my appointment with real data, and my doctor finally took me seriously.&rdquo;
          </p>
          <p className="text-sm text-violet-500 font-semibold">— Sarah M., 47 · Perimenopause · Valerie user</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-violet-950 mb-2">Simple pricing.</h2>
            <p className="text-gray-500">Start free. Upgrade when it clicks.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free trial */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Free Trial</div>
              <div className="text-4xl font-black text-gray-900 mb-1">$0</div>
              <div className="text-sm text-gray-400 mb-6">14 days, no credit card</div>
              <ul className="space-y-3 text-sm text-gray-700 mb-8">
                {['Daily check-in logging','Basic symptom trends','Chat with Valerie (limited)','Provider directory access'].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="text-violet-500">✓</span>{i}</li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full">Start free trial</Button>
              </Link>
            </div>
            {/* Premium */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Most popular</div>
              <div className="text-sm font-bold text-violet-200 uppercase tracking-wide mb-3">Premium</div>
              <div className="text-4xl font-black mb-1">$18<span className="text-2xl text-violet-300">/mo</span></div>
              <div className="text-sm text-violet-300 mb-6">or $149/year (save 31%)</div>
              <ul className="space-y-3 text-sm text-violet-100 mb-8">
                {[
                  'Everything in Free',
                  'Unlimited AI chat',
                  'Full insights + 90-day trends',
                  'Appointment prep PDF export',
                  'Wearable sync (Apple Health, Oura)',
                  'Priority provider matching',
                ].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="text-white">✓</span>{i}</li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block">
                <button className="w-full bg-white text-violet-700 font-bold py-3 rounded-xl hover:bg-violet-50 transition-colors">
                  Start free, upgrade anytime
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-white font-black text-xs">V</div>
          <span className="font-bold text-violet-950">valerie</span>
        </div>
        <p className="text-xs text-gray-400">
          Valerie is not a medical provider. Always consult your healthcare team for medical decisions.
        </p>
        <p className="text-xs text-gray-300 mt-2">© 2025 Valerie Health Inc.</p>
      </footer>
    </div>
  )
}
