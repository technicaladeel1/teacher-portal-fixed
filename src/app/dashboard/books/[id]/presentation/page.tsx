import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PresentationClient from '@/components/presentation/PresentationClient'

export default async function PresentationPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', params.id)
    .eq('teacher_id', user!.id)
    .single()

  if (!book) notFound()

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('book_id', params.id)
    .order('order_index', { ascending: true })

  return <PresentationClient book={book} topics={topics || []} />
}
