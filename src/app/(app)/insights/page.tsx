import { createClient } from '@/lib/supabase/server'
import { subDays, format, parseISO } from 'date-fns'
import InsightsClient from './InsightsClient'

export const dynamic = 'force-dynamic'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const since = format(subDays(new Date(), 90), 'yyyy-MM-dd')

  const [checkInsRes, insightsRes] = await Promise.all([
    supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user!.id)
      .gte('date', since)
      .order('date', { ascending: true }),
    supabase
      .from('insights')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  return (
    <InsightsClient
      checkIns={checkInsRes.data ?? []}
      insights={insightsRes.data ?? []}
    />
  )
}
