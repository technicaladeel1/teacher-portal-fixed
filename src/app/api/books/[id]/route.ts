import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', params.id)
      .single()

    if (bookError || !book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    const typedBook: any = book

    if (typedBook.teacher_id !== user.id) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .eq('book_id', params.id)

    if (topics && topics.length > 0) {
      const infographicPaths = topics
        .filter((t: any) => t.infographic_path)
        .map((t: any) => t.infographic_path)

      if (infographicPaths.length > 0) {
        await supabase.storage
          .from('infographics')
          .remove(infographicPaths)
      }
    }

    if (typedBook.file_path) {
      await supabase.storage
        .from('books')
        .remove([typedBook.file_path])
    }

    const { error: deleteError } = await supabase
      .from('books')
      .delete()
      .eq('id', params.id)
      .eq('teacher_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
