'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Provider } from '@/lib/supabase/database.types'

const SPECIALTIES = ['All', 'OB-GYN', 'Internal Medicine', 'Integrative Medicine', 'Mental Health', 'Pelvic Floor PT']

interface Props { providers: Provider[] }

export default function ProvidersClient({ providers }: Props) {
  const [filter, setFilter] = useState('All')
  const [telehealth, setTelehealth] = useState(false)
  const [certOnly, setCertOnly] = useState(false)
  const [selected, setSelected] = useState<Provider | null>(null)

  const filtered = providers.filter((p) => {
    if (filter !== 'All' && p.specialty !== filter) return false
    if (telehealth && !p.telehealth) return false
    if (certOnly && !p.menopause_cert) return false
    return true
  })

  return (
    <main className="flex-1 px-4 md:px-8 py-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
      <div className="mb-7">
        <h1 className="text-2xl font-black text-gray-900">Find Care</h1>
        <p className="text-gray-500 text-sm">Menopause-literate providers, filtered for you</p>
      </div>

      {/* Appointment prep CTA */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-start gap-4">
          <div className="text-3xl shrink-0">📋</div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">Heading to an appointment?</h3>
            <p className="text-violet-200 text-sm mb-3">
              Valerie can generate a personalized summary of your last 90 days — symptoms, trends, and your top questions — ready to hand to your provider.
            </p>
            <button className="bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors">
              Generate appointment brief →
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',
                filter === s
                  ? 'border-violet-600 bg-violet-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={telehealth}
              onChange={(e) => setTelehealth(e.target.checked)}
              className="accent-violet-600"
            />
            <span className="text-sm text-gray-700">Telehealth only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={certOnly}
              onChange={(e) => setCertOnly(e.target.checked)}
              className="accent-violet-600"
            />
            <span className="text-sm text-gray-700">Menopause-certified only</span>
          </label>
        </div>
      </div>

      {/* Provider grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500">No providers match your filters. Try adjusting them.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} hover className={selected?.id === p.id ? 'border-violet-400' : ''}>
              <CardContent className="py-5" onClick={() => setSelected(selected?.id === p.id ? null : p)}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-200 to-purple-300 flex items-center justify-center text-violet-700 font-black text-base shrink-0">
                    {p.name.split(' ').pop()?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.title}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        {p.menopause_cert && (
                          <Badge variant="violet" className="text-[9px]">✓ Menopause cert.</Badge>
                        )}
                        {p.telehealth && (
                          <Badge variant="green" className="text-[9px]">📱 Telehealth</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>🏥 {p.specialty}</span>
                      {p.city && <span>📍 {p.city}, {p.state}</span>}
                    </div>

                    {p.approach && (
                      <p className="text-xs text-gray-500 mt-2 leading-snug">{p.approach}</p>
                    )}

                    {selected?.id === p.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">{p.bio}</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">Book appointment</Button>
                          {p.telehealth && (
                            <Button size="sm" variant="secondary" className="flex-1">Book telehealth</Button>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                          Booking opens in your browser — Valerie doesn&apos;t store payment info
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center mt-8">
        Provider listings are curated by Valerie Health. Always verify credentials and insurance before booking.
      </p>
    </main>
  )
}
