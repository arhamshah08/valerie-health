import { createClient } from '@/lib/supabase/server'
import ProvidersClient from './ProvidersClient'

export const dynamic = 'force-dynamic'

export default async function ProvidersPage() {
  const supabase = await createClient()
  const { data: providers } = await supabase
    .from('providers')
    .select('*')
    .order('menopause_cert', { ascending: false })

  return <ProvidersClient providers={providers ?? []} />
}
