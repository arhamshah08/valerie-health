'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FormData = {
  overall_score: number
  hot_flash_count: number
  sleep_hours: number
  sleep_quality: number
  pain_level: number
  anxiety_level: number
  brain_fog_level: number
  irritability_level: number
  mood_score: number
  energy_level: number
  note: string
}

const defaultForm: FormData = {
  overall_score: 5,
  hot_flash_count: 0,
  sleep_hours: 7,
  sleep_quality: 3,
  pain_level: 0,
  anxiety_level: 0,
  brain_fog_level: 0,
  irritability_level: 0,
  mood_score: 5,
  energy_level: 5,
  note: '',
}

function Slider({ label, value, min = 0, max = 10, step = 1, onChange, leftLabel, rightLabel }: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void; leftLabel?: string; rightLabel?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-violet-600">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">{leftLabel}</span>
          <span className="text-[10px] text-gray-400">{rightLabel}</span>
        </div>
      )}
    </div>
  )
}

function CounterInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center hover:bg-violet-200 transition-colors">−</button>
        <span className="text-lg font-black text-gray-900 w-6 text-center">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center hover:bg-violet-200 transition-colors">+</button>
      </div>
    </div>
  )
}

const STEPS = ['Overall', 'Physical', 'Mental', 'Energy & Note']

export default function CheckInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function saveCheckIn() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      ...form,
      note: form.note || null,
    }

    const { error } = await supabase
      .from('check_ins')
      .upsert(payload, { onConflict: 'user_id,date' })

    setSaving(false)
    if (!error) {
      setSaved(true)
      // Generate insight after saving
      await fetch('/api/insights', { method: 'POST' }).catch(() => {})
      setTimeout(() => router.push('/dashboard'), 1800)
    }
  }

  if (saved) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="text-5xl mb-4 animate-bounce">✅</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Logged!</h2>
        <p className="text-gray-500">Heading back to your dashboard…</p>
      </main>
    )
  }

  const stepContent = [
    // Step 0 — Overall
    <div key="overall" className="space-y-8 animate-in">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">How are you today?</p>
        <h2 className="text-2xl font-black text-gray-900">Overall feeling</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <Slider
          label="Overall wellbeing"
          value={form.overall_score}
          min={1} max={10}
          onChange={(v) => update('overall_score', v)}
          leftLabel="Rough"
          rightLabel="Great"
        />

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">How would you sum up today?</label>
          <div className="grid grid-cols-5 gap-2">
            {['😣','😔','😐','🙂','😄'].map((emoji, i) => (
              <button
                key={emoji}
                onClick={() => update('overall_score', (i + 1) * 2)}
                className={cn(
                  'flex flex-col items-center py-3 rounded-xl border-2 transition-all text-2xl',
                  form.overall_score >= (i + 1) * 2 - 1 && form.overall_score <= (i + 1) * 2 + 1
                    ? 'border-violet-600 bg-violet-50'
                    : 'border-gray-200 hover:border-violet-200'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,

    // Step 1 — Physical
    <div key="physical" className="space-y-6 animate-in">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">Physical</p>
        <h2 className="text-2xl font-black text-gray-900">Body check</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <CounterInput
          label="🔥 Hot flashes today"
          value={form.hot_flash_count}
          onChange={(v) => update('hot_flash_count', v)}
        />

        <div className="border-t border-gray-100 pt-6">
          <Slider
            label="😴 Sleep last night (hours)"
            value={form.sleep_hours}
            min={0} max={12} step={0.5}
            onChange={(v) => update('sleep_hours', v)}
            leftLabel="0h"
            rightLabel="12h"
          />
        </div>

        <Slider
          label="Sleep quality"
          value={form.sleep_quality}
          min={1} max={5}
          onChange={(v) => update('sleep_quality', v)}
          leftLabel="Terrible"
          rightLabel="Great"
        />

        <div className="border-t border-gray-100 pt-6">
          <Slider
            label="🤕 Pain / discomfort"
            value={form.pain_level}
            min={0} max={10}
            onChange={(v) => update('pain_level', v)}
            leftLabel="None"
            rightLabel="Severe"
          />
        </div>
      </div>
    </div>,

    // Step 2 — Mental
    <div key="mental" className="space-y-6 animate-in">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">Mental & mood</p>
        <h2 className="text-2xl font-black text-gray-900">Mind check</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <Slider
          label="💜 Mood"
          value={form.mood_score}
          min={1} max={10}
          onChange={(v) => update('mood_score', v)}
          leftLabel="Low"
          rightLabel="High"
        />

        <Slider
          label="😰 Anxiety"
          value={form.anxiety_level}
          min={0} max={10}
          onChange={(v) => update('anxiety_level', v)}
          leftLabel="None"
          rightLabel="Intense"
        />

        <Slider
          label="🧠 Brain fog"
          value={form.brain_fog_level}
          min={0} max={10}
          onChange={(v) => update('brain_fog_level', v)}
          leftLabel="Clear"
          rightLabel="Foggy"
        />

        <Slider
          label="😤 Irritability"
          value={form.irritability_level}
          min={0} max={10}
          onChange={(v) => update('irritability_level', v)}
          leftLabel="Calm"
          rightLabel="On edge"
        />
      </div>
    </div>,

    // Step 3 — Energy & Note
    <div key="energy" className="space-y-6 animate-in">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">Almost done</p>
        <h2 className="text-2xl font-black text-gray-900">Energy & anything else</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <Slider
          label="⚡ Energy level"
          value={form.energy_level}
          min={1} max={10}
          onChange={(v) => update('energy_level', v)}
          leftLabel="Exhausted"
          rightLabel="Energised"
        />

        <div className="border-t border-gray-100 pt-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Anything else to note? <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.note}
            onChange={(e) => update('note', e.target.value)}
            placeholder="e.g. stressful day at work, ate late, started new supplement…"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none"
          />
        </div>
      </div>
    </div>,
  ]

  return (
    <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full pb-24 md:pb-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'h-1.5 rounded-full flex-1 transition-all duration-300',
              i <= step ? 'bg-violet-600' : 'bg-violet-100'
            )} />
          </div>
        ))}
      </div>

      {stepContent[step]}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => step > 0 ? setStep(step - 1) : router.push('/dashboard')}
        >
          ← {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Continue →
          </Button>
        ) : (
          <Button onClick={saveCheckIn} loading={saving}>
            Save check-in ✓
          </Button>
        )}
      </div>
    </main>
  )
}
