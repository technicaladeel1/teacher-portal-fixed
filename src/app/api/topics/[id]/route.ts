import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, page_number } = body

    const { data: topic, error } = await supabase
      .from('topics')
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(page_number !== undefined && { page_number }),
      })
      .eq('id', params.id)
      .eq('teacher_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topic })
  } catch (error) {
    console.error('Error updating topic:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Fetch full row so TypeScript knows all fields
    const { data: topic } = await supabase
      .from('topics')
      .select('*')
      .eq('id', params.id)
      .eq('teacher_id', user.id)
      .single()

    if (topic?.infographic_path) {
      await supabase.storage.from('infographics').remove([topic.infographic_path])
    }

    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', params.id)
      .eq('teacher_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
