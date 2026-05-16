import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use select('*') so TypeScript resolves all columns including teacher_id
    const { data: book } = await supabase
      .from('books')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!book || book.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Get topics to clean up infographic storage files
    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .eq('book_id', params.id)

    if (topics && topics.length > 0) {
      const infographicPaths = topics
        .filter((t) => t.infographic_path)
        .map((t) => t.infographic_path as string)

      if (infographicPaths.length > 0) {
        await supabase.storage.from('infographics').remove(infographicPaths)
      }
    }

    // Delete book PDF from storage
    await supabase.storage.from('books').remove([book.file_path])

    // Delete book row (topics cascade via FK)
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', params.id)
      .eq('teacher_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
