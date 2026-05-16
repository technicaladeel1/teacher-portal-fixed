import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const topicId = formData.get('topicId') as string

    if (!file || !topicId) {
      return NextResponse.json({ error: 'File and topicId are required' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 })
    }

    // Fetch full row so TypeScript resolves all columns
    const { data: topic } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .eq('teacher_id', user.id)
      .single()

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Remove old infographic if it exists
    if (topic.infographic_path) {
      await supabase.storage.from('infographics').remove([topic.infographic_path])
    }

    // Upload new infographic
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}/${topicId}-${Date.now()}.${ext}`
    const fileBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('infographics')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL (infographics bucket is public)
    const { data: publicUrlData } = supabase.storage
      .from('infographics')
      .getPublicUrl(fileName)

    const infographicUrl = publicUrlData.publicUrl

    // Persist URL + path on the topic row
    const { data: updatedTopic, error: updateError } = await supabase
      .from('topics')
      .update({
        infographic_url: infographicUrl,
        infographic_path: fileName,
      })
      .eq('id', topicId)
      .eq('teacher_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ topic: updatedTopic, infographicUrl })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 })
    }

    // Fetch full row so TypeScript resolves all columns
    const { data: topic } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .eq('teacher_id', user.id)
      .single()

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    if (topic.infographic_path) {
      await supabase.storage.from('infographics').remove([topic.infographic_path])
    }

    await supabase
      .from('topics')
      .update({ infographic_url: null, infographic_path: null })
      .eq('id', topicId)
      .eq('teacher_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing infographic:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
