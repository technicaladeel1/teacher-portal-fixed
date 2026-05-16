import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookDetailClient from '@/components/books/BookDetailClient'

export default async function BookPage({ params }: { params: { id: string } }) {
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

  return <BookDetailClient book={book} topics={topics || []} userId={user!.id} />
}
