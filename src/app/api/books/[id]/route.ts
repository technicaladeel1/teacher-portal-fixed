```ts id="8sv4wz"
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

    // Fetch book
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

    // Fix TypeScript issue
    const typedBook = book as any

    if (typedBook.teacher_id !== user.id) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Get topics
    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .eq('book_id', params.id)

    // Remove infographic files
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

    // Remove PDF file
    if (typedBook.file_path) {
      await supabase.storage
        .from('books')
        .remove([typedBook.file_path])
    }

    // Delete book
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
```
