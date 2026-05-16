import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    let query = supabase
      .from('topics')
      .select('*')
      .eq('teacher_id', user.id)
      .order('order_index', { ascending: true })

    if (bookId) {
      query = query.eq('book_id', bookId)
    }

    const { data: topics, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topics })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { book_id, title, description, page_number } = body

    if (!book_id || !title) {
      return NextResponse.json({ error: 'book_id and title are required' }, { status: 400 })
    }

    // Verify book belongs to this teacher
    const { data: book } = await supabase
      .from('books')
      .select('*')
      .eq('id', book_id)
      .eq('teacher_id', user.id)
      .single()

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Get next order index
    const { data: lastTopic } = await supabase
      .from('topics')
      .select('*')
      .eq('book_id', book_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const orderIndex = lastTopic ? lastTopic.order_index + 1 : 0

    const { data: topic, error } = await supabase
      .from('topics')
      .insert({
        book_id,
        teacher_id: user.id,
        title,
        description: description || null,
        page_number: page_number || null,
        order_index: orderIndex,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topic }, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
