import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [booksResult, topicsResult] = await Promise.all([
    supabase
      .from('books')
      .select('*')
      .eq('teacher_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('topics')
      .select('*')
      .eq('teacher_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <DashboardClient
      books={booksResult.data || []}
      topics={topicsResult.data || []}
      userId={user!.id}
    />
  )
}
