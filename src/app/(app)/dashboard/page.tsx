import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { scoreToLabel, stageLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileRes, checkInsRes, insightRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user!.id)
      .gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd'))
      .order('date', { ascending: false }),
    supabase
      .from('insights')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const profile = profileRes.data
  const checkIns = checkInsRes.data ?? []
  const latestInsight = insightRes.data
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayCheckIn = checkIns.find((c) => c.date === todayStr)
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  // Compute 7-day average wellness
  const avgScore =
    checkIns.length > 0
      ? Math.round(checkIns.reduce((s, c) => s + (c.overall_score ?? 5), 0) / checkIns.length)
      : null

  const scoreInfo = avgScore ? scoreToLabel(avgScore) : null

  const QUICK_STATS = [
    { label: 'Check-ins this week', value: checkIns.length, icon: '📓', unit: `of 7` },
    {
      label: 'Avg sleep',
      value: checkIns.length
        ? (checkIns.reduce((s, c) => s + (c.sleep_hours ?? 0), 0) / checkIns.filter((c) => c.sleep_hours).length || 0).toFixed(1)
        : '—',
      icon: '😴',
      unit: 'hrs/night',
    },
    {
      label: 'Hot flashes (7d)',
      value: checkIns.reduce((s, c) => s + (c.hot_flash_count ?? 0), 0),
      icon: '🔥',
      unit: 'total',
    },
    { label: 'Stage', value: stageLabel(profile?.stage ?? null), icon: '🌸', unit: '' },
  ]

  return (
    <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        {!todayCheckIn && (
          <Link href="/check-in">
            <Button size="sm">📓 Log today</Button>
          </Link>
        )}
      </div>

      {/* Wellness ring + today CTA */}
      <div className="grid md:grid-cols-3 gap-5 mb-6">
        {/* Ring card */}
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <WellnessRing score={avgScore} />
            <p className="text-sm text-gray-500 mt-4 text-center">
              {avgScore ? `7-day avg — ${scoreInfo?.label}` : 'Start logging to see your score'}
            </p>
          </CardContent>
        </Card>

        {/* Today's check-in */}
        <Card className="md:col-span-2">
          <CardContent className="h-full flex flex-col justify-center py-8">
            {todayCheckIn ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm font-semibold text-gray-700">Today logged</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Overall', val: todayCheckIn.overall_score + '/10', icon: '⭐' },
                    { label: 'Sleep', val: todayCheckIn.sleep_hours ? `${todayCheckIn.sleep_hours}h` : '—', icon: '😴' },
                    { label: 'Energy', val: todayCheckIn.energy_level + '/10', icon: '⚡' },
                    { label: 'Mood', val: todayCheckIn.mood_score + '/10', icon: '💜' },
                  ].map((s) => (
                    <div key={s.label} className="bg-violet-50 rounded-xl p-3 text-center">
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className="font-bold text-gray-900 text-sm">{s.val}</div>
                      <div className="text-[10px] text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
                {todayCheckIn.note && (
                  <p className="text-sm text-gray-500 italic mt-4 bg-gray-50 rounded-xl px-4 py-3">
                    &ldquo;{todayCheckIn.note}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">📓</div>
                <h3 className="font-bold text-gray-900 mb-2">How are you feeling today?</h3>
                <p className="text-sm text-gray-500 mb-5">A 2-minute check-in builds a picture your doctor will actually find useful.</p>
                <Link href="/check-in">
                  <Button>Start today's check-in</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {QUICK_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <div className="text-xl mb-2">{s.icon}</div>
              <div className="font-black text-lg text-gray-900 leading-none mb-0.5">{s.value}</div>
              <div className="text-[10px] text-gray-400 font-medium">{s.label}</div>
              {s.unit && <div className="text-[10px] text-violet-400">{s.unit}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insight card */}
      {latestInsight && (
        <Card className="mb-6 border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0">✨</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-1">Valerie's insight</p>
                <p className="text-sm text-gray-700 leading-relaxed">{latestInsight.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/insights', icon: '📊', label: 'View trends' },
          { href: '/chat', icon: '💬', label: 'Talk to Valerie' },
          { href: '/providers', icon: '🧭', label: 'Find a provider' },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <Card hover>
              <CardContent className="py-5 text-center">
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{a.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}

function WellnessRing({ score }: { score: number | null }) {
  const s = score ?? 0
  const pct = s / 10
  const R = 44
  const circ = 2 * Math.PI * R
  const dash = pct * circ
  const info = score ? scoreToLabel(score) : null

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#ede9fe" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={R} fill="none"
          stroke="#7c3aed" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score ? (
          <>
            <span className="text-2xl font-black text-gray-900">{score}</span>
            <span className={`text-xs font-semibold ${info?.color}`}>{info?.label}</span>
          </>
        ) : (
          <span className="text-2xl">—</span>
        )}
      </div>
    </div>
  )
}
