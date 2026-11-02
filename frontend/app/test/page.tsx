import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return <pre>{JSON.stringify(data?.claims ?? 'not signed in', null, 2)}</pre>
}