import { createClient } from '@/lib/supabase/server'
import ChatClient from './ChatClient'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileRes, recentCheckInsRes] = await Promise.all([
    supabase.from('profiles').select('stage, top_symptoms, goals').eq('id', user!.id).single(),
    supabase
      .from('check_ins')
      .select('date, overall_score, mood_score, energy_level, sleep_hours, hot_flash_count, brain_fog_level, note')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(7),
  ])

  return (
    <ChatClient
      profile={profileRes.data}
      recentCheckIns={recentCheckInsRes.data ?? []}
    />
  )
}
