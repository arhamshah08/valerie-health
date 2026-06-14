'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STAGES = [
  { id: 'perimenopause', label: 'Perimenopause', icon: '🌅', desc: 'Cycles becoming irregular, symptoms beginning' },
  { id: 'menopause', label: 'Menopause', icon: '🌸', desc: '12+ months without a period' },
  { id: 'surgical_menopause', label: 'Surgical Menopause', icon: '⚕️', desc: 'After oophorectomy or hysterectomy' },
  { id: 'not_sure', label: 'Not sure yet', icon: '🤔', desc: "I'm here to figure it out" },
]

const SYMPTOMS = [
  'Hot flashes','Night sweats','Sleep disruption','Brain fog',
  'Mood changes','Anxiety','Joint pain','Fatigue',
  'Heart palpitations','Low libido','Weight changes','Vaginal dryness',
]

const GOALS = [
  { id: 'understand', label: 'Understand my symptoms', icon: '🔍' },
  { id: 'track', label: 'Track for my doctor', icon: '📋' },
  { id: 'support', label: 'Feel less alone', icon: '💜' },
  { id: 'navigate', label: 'Find the right care', icon: '🧭' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [stage, setStage] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function toggleSymptom(s: string) {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  function toggleGoal(g: string) {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    )
  }

  async function finish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        stage,
        top_symptoms: symptoms,
        goals,
        onboarding_completed: true,
      }).eq('id', user.id)
    }
    router.push('/dashboard')
  }

  const STEPS = [
    // Step 0 — Welcome
    <div key="welcome" className="text-center animate-in">
      <div className="text-5xl mb-4">🌸</div>
      <h1 className="text-3xl font-black text-violet-950 mb-3">Welcome to Valerie.</h1>
      <p className="text-gray-500 mb-8 leading-relaxed max-w-sm mx-auto">
        Let&apos;s take 2 minutes to personalize your experience. Valerie works best when she understands where you are in your journey.
      </p>
      <Button size="lg" onClick={() => setStep(1)} className="px-10">
        Let&apos;s go →
      </Button>
    </div>,

    // Step 1 — Stage
    <div key="stage" className="animate-in w-full max-w-lg mx-auto">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2 text-center">Step 1 of 3</p>
      <h2 className="text-2xl font-black text-violet-950 text-center mb-6">Where are you in your journey?</h2>
      <div className="grid grid-cols-2 gap-3">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStage(s.id)}
            className={cn(
              'p-5 rounded-2xl border-2 text-left transition-all',
              stage === s.id
                ? 'border-violet-600 bg-violet-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-violet-300'
            )}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={cn('font-bold text-sm mb-1', stage === s.id ? 'text-violet-800' : 'text-gray-900')}>
              {s.label}
            </div>
            <div className="text-xs text-gray-500 leading-snug">{s.desc}</div>
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
        <Button onClick={() => setStep(2)} disabled={!stage}>Continue →</Button>
      </div>
    </div>,

    // Step 2 — Symptoms
    <div key="symptoms" className="animate-in w-full max-w-lg mx-auto">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2 text-center">Step 2 of 3</p>
      <h2 className="text-2xl font-black text-violet-950 text-center mb-1">What are you dealing with?</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Select all that apply — you can always change this later.</p>
      <div className="grid grid-cols-3 gap-2">
        {SYMPTOMS.map((s) => (
          <button
            key={s}
            onClick={() => toggleSymptom(s)}
            className={cn(
              'px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all',
              symptoms.includes(s)
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-violet-300'
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
        <Button onClick={() => setStep(3)} disabled={symptoms.length === 0}>Continue →</Button>
      </div>
    </div>,

    // Step 3 — Goals
    <div key="goals" className="animate-in w-full max-w-lg mx-auto">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2 text-center">Step 3 of 3</p>
      <h2 className="text-2xl font-black text-violet-950 text-center mb-1">What do you need most?</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Pick one or more. Valerie will lead with what matters to you.</p>
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={cn(
              'p-5 rounded-2xl border-2 text-center transition-all',
              goals.includes(g.id)
                ? 'border-violet-600 bg-violet-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-violet-300'
            )}
          >
            <div className="text-2xl mb-2">{g.icon}</div>
            <div className={cn('font-semibold text-sm', goals.includes(g.id) ? 'text-violet-800' : 'text-gray-900')}>
              {g.label}
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
        <Button onClick={finish} loading={saving} disabled={goals.length === 0}>
          Enter Valerie →
        </Button>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-[#fdfbff] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">V</div>
        <span className="font-bold text-violet-950 text-lg tracking-tight">valerie</span>
      </div>

      {/* Progress bar */}
      {step > 0 && (
        <div className="w-full max-w-lg mb-8">
          <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-lg">{STEPS[step]}</div>
    </div>
  )
}
