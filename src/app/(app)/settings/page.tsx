'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { stageLabel, isTrialActive } from '@/lib/utils'
import { format } from 'date-fns'
import type { Profile } from '@/lib/supabase/database.types'

const SYMPTOMS = [
  'Hot flashes','Night sweats','Sleep disruption','Brain fog',
  'Mood changes','Anxiety','Joint pain','Fatigue',
  'Heart palpitations','Low libido','Weight changes','Vaginal dryness',
]

export default function SettingsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
        setName(data.full_name ?? '')
        setSymptoms(data.top_symptoms ?? [])
      }
    }
    load()
  }, [])

  function toggleSymptom(s: string) {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: name, top_symptoms: symptoms }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleUpgrade() {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  const trialActive = profile ? isTrialActive(profile.trial_ends_at) : false
  const isPremium = profile?.subscription_status === 'active'

  return (
    <main className="flex-1 px-4 md:px-8 py-8 max-w-2xl mx-auto w-full pb-24 md:pb-8">
      <h1 className="text-2xl font-black text-gray-900 mb-7">Settings</h1>

      {/* Subscription */}
      <Card className="mb-5">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Subscription</CardTitle>
            <Badge variant={isPremium ? 'green' : trialActive ? 'violet' : 'amber'}>
              {isPremium ? '⭐ Premium' : trialActive ? '🌸 Free trial' : '⚠️ Trial ended'}
            </Badge>
          </div>

          {isPremium ? (
            <div>
              <p className="text-sm text-gray-600 mb-1">You&apos;re on Valerie Premium — thank you!</p>
              <p className="text-xs text-gray-400">To manage or cancel, visit your billing portal.</p>
              <Button variant="outline" size="sm" className="mt-3">Manage billing</Button>
            </div>
          ) : trialActive ? (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Trial ends {profile ? format(new Date(profile.trial_ends_at), 'MMM d, yyyy') : '…'}
              </p>
              <p className="text-xs text-gray-400 mb-3">Upgrade to keep full access to AI insights and unlimited chat.</p>
              <div className="flex gap-2">
                <Button onClick={handleUpgrade} size="sm">Upgrade to Premium — $18/mo</Button>
                <Button variant="secondary" size="sm">$149/year (save 31%)</Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-rose-600 mb-3">Your trial has ended. Upgrade to continue using Valerie.</p>
              <Button onClick={handleUpgrade}>Upgrade now</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="mb-5">
        <CardContent>
          <CardTitle className="mb-4">Your profile</CardTitle>
          <div className="space-y-4">
            <Input
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Menopause stage</p>
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5">
                {stageLabel(profile?.stage ?? null)}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">To change your stage, contact support</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracked symptoms */}
      <Card className="mb-5">
        <CardContent>
          <CardTitle className="mb-1">Tracked symptoms</CardTitle>
          <p className="text-xs text-gray-400 mb-4">These help Valerie personalise your insights</p>
          <div className="grid grid-cols-3 gap-2">
            {SYMPTOMS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`px-2 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                  symptoms.includes(s)
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-violet-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected devices (UI only) */}
      <Card className="mb-5">
        <CardContent>
          <CardTitle className="mb-1">Connected devices</CardTitle>
          <p className="text-xs text-gray-400 mb-4">Passive data syncs automatically when connected</p>
          <div className="space-y-3">
            {[
              { name: 'Apple Health', icon: '🍎', status: 'Connect' },
              { name: 'Oura Ring', icon: '💍', status: 'Connect' },
              { name: 'Fitbit', icon: '⌚', status: 'Connect' },
            ].map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{d.name}</span>
                </div>
                <Button variant="outline" size="sm">{d.status}</Button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Device sync requires the Valerie iOS or Android app</p>
        </CardContent>
      </Card>

      {/* Notifications (UI only) */}
      <Card className="mb-8">
        <CardContent>
          <CardTitle className="mb-4">Daily reminder</CardTitle>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Check-in reminder</p>
              <p className="text-xs text-gray-400">We&apos;ll nudge you at your chosen time</p>
            </div>
            <Input
              type="time"
              defaultValue="20:00"
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} loading={saving} className="w-full">
        {saved ? '✓ Saved!' : 'Save changes'}
      </Button>
    </main>
  )
}
