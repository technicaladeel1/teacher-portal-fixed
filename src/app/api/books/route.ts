import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 50MB.' }, { status: 400 })
    }

    const fileBuffer = await file.arrayBuffer()
    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from('books')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = await supabase.storage
      .from('books')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365)

    const fileUrl = urlData?.signedUrl || ''

    const { data: book, error: dbError } = await supabase
      .from('books')
      .insert({
        teacher_id: user.id,
        title,
        description: description || null,
        file_path: fileName,
        file_url: fileUrl,
        file_size: file.size,
        status: 'processing',
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      await supabase.storage.from('books').remove([fileName])
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    }

    // Fire-and-forget background extraction (non-blocking)
    extractTopicsInBackground(book.id, user.id, fileBuffer, supabase)

    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function extractTopicsInBackground(
  bookId: string,
  userId: string,
  fileBuffer: ArrayBuffer,
  supabase: SupabaseClient<Database>
) {
  try {
    const pdfParse = (await import('pdf-parse')).default
    const buffer = Buffer.from(fileBuffer)
    const pdfData = await pdfParse(buffer)

    const text = pdfData.text
    const pageCount = pdfData.numpages

    const topics = extractTopicsFromText(text)

    await supabase
      .from('books')
      .update({ status: 'ready', page_count: pageCount })
      .eq('id', bookId)

    if (topics.length > 0) {
      const topicInserts = topics.map((topic, index) => ({
        book_id: bookId,
        teacher_id: userId,
        title: topic.title,
        description: topic.description,
        page_number: topic.pageNumber,
        order_index: index,
      }))
      await supabase.from('topics').insert(topicInserts)
    }
  } catch (error) {
    console.error('Topic extraction error:', error)
    await supabase
      .from('books')
      .update({ status: 'ready' })
      .eq('id', bookId)
  }
}

interface ExtractedTopic {
  title: string
  description: string | null
  pageNumber: number | null
}

function extractTopicsFromText(text: string): ExtractedTopic[] {
  const topics: ExtractedTopic[] = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  const headingPatterns = [
    /^(chapter\s+[\divxlc]+[.:]\s*.+)/i,
    /^(chapter\s+\d+\s*[-–—]\s*.+)/i,
    /^(\d+\.\d*\s+[A-Z][^.!?]{5,60})$/,
    /^(\d+\s+[A-Z][^.!?]{5,60})$/,
    /^([A-Z][A-Z\s]{4,50})$/,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,8})$/,
    /^(introduction|conclusion|summary|overview|background|methodology|results|discussion|references|appendix|abstract|preface|foreword|bibliography|glossary|index)$/i,
    /^(unit\s+\d+[.:]\s*.+)/i,
    /^(module\s+\d+[.:]\s*.+)/i,
    /^(section\s+\d+[.:]\s*.+)/i,
    /^(lesson\s+\d+[.:]\s*.+)/i,
    /^(part\s+[\divxlc]+[.:]\s*.+)/i,
    /^(topic\s+\d+[.:]\s*.+)/i,
  ]

  const seen = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.length < 4 || line.length > 120) continue
    if (line.includes('. ') && line.length > 80) continue

    for (const pattern of headingPatterns) {
      if (pattern.test(line)) {
        const normalized = line.toLowerCase().trim()
        if (!seen.has(normalized)) {
          seen.add(normalized)
          const descLines = lines
            .slice(i + 1, i + 4)
            .filter((l) => l.length > 20 && !headingPatterns.some((p) => p.test(l)))
            .slice(0, 2)

          topics.push({
            title: line.replace(/^\d+\.\s*/, '').trim(),
            description: descLines.join(' ').slice(0, 200) || null,
            pageNumber: null,
          })
          break
        }
      }
    }

    if (topics.length >= 30) break
  }

  if (topics.length === 0) {
    const candidates = lines
      .filter((l) => l.length >= 10 && l.length <= 80 && /^[A-Z]/.test(l))
      .slice(0, 10)

    candidates.forEach((title) => {
      topics.push({ title, description: null, pageNumber: null })
    })
  }

  return topics.slice(0, 25)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
