import { createClient } from '@/lib/supabase/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { format, subDays, startOfWeek } from 'date-fns'

export async function POST() {
  try {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    // Get last 7 days of check-ins
    const since = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', since)
      .order('date', { ascending: true })

    if (!checkIns || checkIns.length < 2) {
      return Response.json({ insight: null, reason: 'Not enough data' })
    }

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

    // Check if insight already exists for this week
    const { data: existing } = await supabase
      .from('insights')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    if (existing) return Response.json({ insight: existing })

    // Generate insight with Claude
    const checkInSummary = checkIns.map((c) => ({
      date: c.date,
      overall: c.overall_score,
      mood: c.mood_score,
      energy: c.energy_level,
      sleep_h: c.sleep_hours,
      hot_flashes: c.hot_flash_count,
      brain_fog: c.brain_fog_level,
      anxiety: c.anxiety_level,
      note: c.note,
    }))

    const { text: content } = await generateText({
      model: google('gemini-2.0-flash'),
      maxTokens: 200,
      prompt: `You are Valerie, a warm AI health companion for women in menopause.

Based on this week's check-in data, write ONE warm, specific, actionable insight in 2-3 sentences.
Focus on a real pattern you see. Be empathetic and human, not clinical.
Start with what you noticed, then connect it to something actionable.
Never use the word "data". Write in second person ("your").

Check-in data:
${JSON.stringify(checkInSummary, null, 2)}

Write the insight only. No label, no intro, just the insight.`,
    })

    // Save insight
    const { data: insight } = await supabase
      .from('insights')
      .insert({ user_id: user.id, week_start: weekStart, content })
      .select()
      .single()

    return Response.json({ insight })
  } catch (error) {
    console.error('Insight generation error:', error)
    return new Response('Internal error', { status: 500 })
  }
}
