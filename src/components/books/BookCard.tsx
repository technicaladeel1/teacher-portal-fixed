'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Book } from '@/types/database'
import { BookOpen, Trash2, Loader2, CheckCircle, AlertCircle, ImageIcon, Layers, Monitor, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface BookCardProps {
  book: Book
  topicCount: number
  infographicCount: number
  onDeleted: () => void
}

export default function BookCard({ book, topicCount, infographicCount, onDeleted }: BookCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success(`"${book.title}" deleted`)
      onDeleted()
    } catch {
      toast.error('Failed to delete book')
      setDeleting(false)
    }
  }

  const statusConfig = {
    ready: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Ready' },
    processing: { icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Processing...' },
    error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Error' },
  }

  const status = statusConfig[book.status]
  const StatusIcon = status.icon
  const fileSizeMB = book.file_size ? (book.file_size / 1024 / 1024).toFixed(1) : null

  return (
    <div className="topic-card group overflow-hidden">
      {/* Top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-board via-amber-glow/60 to-slate-board" />

      <div className="p-5">
        {/* Icon + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-slate-board/10 flex items-center justify-center">
            <BookOpen size={20} className="text-slate-board" />
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg}`}>
            <StatusIcon
              size={12}
              className={`${status.color} ${book.status === 'processing' ? 'animate-spin' : ''}`}
            />
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-slate-board text-base leading-tight mb-1 line-clamp-2">
          {book.title}
        </h3>
        {book.description && (
          <p className="text-chalk-500 text-xs line-clamp-2 mb-3">{book.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-chalk-400 mb-4">
          <span className="flex items-center gap-1">
            <Layers size={11} />
            {topicCount} topics
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon size={11} />
            {infographicCount} infographics
          </span>
          {fileSizeMB && (
            <span>{fileSizeMB} MB</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/books/${book.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-board text-cream text-xs font-medium rounded-lg hover:bg-slate-dark transition-colors"
          >
            <ExternalLink size={12} />
            Manage
          </Link>
          
          {book.status === 'ready' && topicCount > 0 && (
            <Link
              href={`/dashboard/books/${book.id}/presentation`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-glow/15 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-glow/25 transition-colors border border-amber-glow/30"
            >
              <Monitor size={12} />
              Present
            </Link>
          )}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-chalk-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs text-chalk-400 hover:text-chalk-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? '...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
