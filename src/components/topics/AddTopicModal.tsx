'use client'

import { useState } from 'react'
import type { Topic } from '@/types/database'
import { X, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddTopicModalProps {
  bookId: string
  onClose: () => void
  onAdded: (topic: Topic) => void
}

export default function AddTopicModal({ bookId, onClose, onAdded }: AddTopicModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          title: title.trim(),
          description: description.trim() || null,
          page_number: pageNumber ? parseInt(pageNumber) : null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add topic')

      toast.success('Topic added!')
      onAdded(data.topic)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add topic'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-chalk-100">
          <h2 className="font-display text-xl font-bold text-slate-board">Add Topic</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-chalk-100 text-chalk-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-chalk-600 mb-1.5">
              Topic Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Water Cycle"
              required
              autoFocus
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-chalk-600 mb-1.5">
              Description <span className="text-chalk-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this topic..."
              rows={3}
              className="input-base resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-chalk-600 mb-1.5">
              Page Number <span className="text-chalk-400">(optional)</span>
            </label>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder="e.g. 42"
              min="1"
              className="input-base"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim() || loading} className="btn-primary flex-1">
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Adding...</>
              ) : (
                <><Plus size={15} /> Add Topic</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
