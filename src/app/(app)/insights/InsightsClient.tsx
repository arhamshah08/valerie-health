'use client'
import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { format, parseISO, subDays } from 'date-fns'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CheckIn, Insight } from '@/lib/supabase/database.types'

type Range = '7d' | '30d' | '90d'

const RANGE_DAYS: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90 }

const METRICS = [
  { key: 'overall_score',    label: 'Overall',    color: '#7c3aed', icon: '⭐' },
  { key: 'mood_score',       label: 'Mood',       color: '#ec4899', icon: '💜' },
  { key: 'energy_level',     label: 'Energy',     color: '#f59e0b', icon: '⚡' },
  { key: 'sleep_hours',      label: 'Sleep (h)',  color: '#3b82f6', icon: '😴' },
  { key: 'hot_flash_count',  label: 'Hot flashes',color: '#ef4444', icon: '🔥' },
  { key: 'brain_fog_level',  label: 'Brain fog',  color: '#8b5cf6', icon: '🧠' },
]

interface Props {
  checkIns: CheckIn[]
  insights: Insight[]
}

export default function InsightsClient({ checkIns, insights }: Props) {
  const [range, setRange] = useState<Range>('30d')
  const [activeMetrics, setActiveMetrics] = useState(['overall_score', 'mood_score', 'energy_level'])

  const cutoff = subDays(new Date(), RANGE_DAYS[range])
  const filtered = checkIns.filter((c) => parseISO(c.date) >= cutoff)

  const chartData = filtered.map((c) => ({
    date: format(parseISO(c.date), range === '7d' ? 'EEE' : 'MMM d'),
    overall_score: c.overall_score,
    mood_score: c.mood_score,
    energy_level: c.energy_level,
    sleep_hours: c.sleep_hours,
    hot_flash_count: c.hot_flash_count,
    brain_fog_level: c.brain_fog_level,
    anxiety_level: c.anxiety_level,
    irritability_level: c.irritability_level,
  }))

  function toggleMetric(key: string) {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // Summary stats
  const summaryStats = METRICS.slice(0, 4).map((m) => {
    const vals = filtered
      .map((c) => (c as unknown as Record<string, number>)[m.key])
      .filter((v) => v !== null && v !== undefined)
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
    return { ...m, avg }
  })

  const totalHotFlashes = filtered.reduce((s, c) => s + (c.hot_flash_count ?? 0), 0)

  return (
    <main className="flex-1 px-4 md:px-8 py-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Your Insights</h1>
          <p className="text-gray-500 text-sm">Patterns, trends, and what they mean</p>
        </div>
        {/* Range toggle */}
        <div className="flex items-center bg-gray-100 rounded-full p-1 gap-0.5">
          {(['7d','30d','90d'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                range === r ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-violet-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {checkIns.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="font-bold text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-500 text-sm">Complete a few check-ins and your trends will appear here.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {summaryStats.map((s) => (
              <Card key={s.key}>
                <CardContent className="py-4">
                  <div className="text-xl mb-2">{s.icon}</div>
                  <div className="font-black text-2xl leading-none text-gray-900 mb-1">{s.avg}</div>
                  <div className="text-xs text-gray-500">{s.label} avg</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metric selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                  activeMetrics.includes(m.key)
                    ? 'border-current text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
                style={activeMetrics.includes(m.key) ? { background: m.color, borderColor: m.color } : {}}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Main trend chart */}
          <Card className="mb-6">
            <CardContent>
              <CardTitle className="mb-4">Trends over {range}</CardTitle>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    {METRICS.filter((m) => activeMetrics.includes(m.key)).map((m) => (
                      <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={m.color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  {METRICS.filter((m) => activeMetrics.includes(m.key)).map((m) => (
                    <Area
                      key={m.key}
                      type="monotone"
                      dataKey={m.key}
                      name={m.label}
                      stroke={m.color}
                      fill={`url(#grad-${m.key})`}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hot flash bar chart */}
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>🔥 Hot flashes</CardTitle>
                  <Badge variant="rose">{totalHotFlashes} total</Badge>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    <Bar dataKey="hot_flash_count" name="Hot flashes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sleep quality */}
            <Card>
              <CardContent>
                <CardTitle className="mb-4">😴 Sleep hours</CardTitle>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="sleep-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="sleep_hours" name="Sleep (h)" stroke="#3b82f6" fill="url(#sleep-grad)" strokeWidth={2} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {insights.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>✨</span> Valerie&apos;s observations
              </h2>
              <div className="space-y-3">
                {insights.map((ins) => (
                  <Card key={ins.id} className="border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                    <CardContent className="py-4">
                      <p className="text-xs text-violet-400 font-medium mb-1">
                        Week of {format(parseISO(ins.week_start), 'MMM d')}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{ins.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
