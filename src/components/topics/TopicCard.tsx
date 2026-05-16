'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Topic } from '@/types/database'
import { Upload, Trash2, ImageIcon, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface TopicCardProps {
  topic: Topic
  onUploadInfographic: () => void
  onDeleted: () => void
  onInfographicRemoved: () => void
}

export default function TopicCard({ topic, onUploadInfographic, onDeleted, onInfographicRemoved }: TopicCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [removingInfographic, setRemovingInfographic] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/topics/${topic.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Topic deleted')
      onDeleted()
    } catch {
      toast.error('Failed to delete topic')
      setDeleting(false)
    }
  }

  async function handleRemoveInfographic(e: React.MouseEvent) {
    e.stopPropagation()
    setRemovingInfographic(true)
    try {
      const res = await fetch(`/api/infographics?topicId=${topic.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove')
      toast.success('Infographic removed')
      onInfographicRemoved()
    } catch {
      toast.error('Failed to remove infographic')
    } finally {
      setRemovingInfographic(false)
    }
  }

  return (
    <>
      <div className="topic-card overflow-hidden flex flex-col">
        {/* Infographic preview */}
        {topic.infographic_url ? (
          <div
            className="relative h-32 bg-chalk-100 cursor-pointer group/img overflow-hidden"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={topic.infographic_url}
              alt={topic.title}
              fill
              className="object-cover transition-transform duration-300 group-hover/img:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
              <Eye size={24} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
            </div>
            {/* Remove infographic */}
            <button
              onClick={handleRemoveInfographic}
              disabled={removingInfographic}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors opacity-0 group-hover/img:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={onUploadInfographic}
            className="h-32 bg-chalk-50 hover:bg-chalk-100 transition-colors flex flex-col items-center justify-center gap-2 border-b border-chalk-100 group/upload"
          >
            <div className="w-9 h-9 rounded-xl bg-chalk-200 group-hover/upload:bg-amber-glow/20 flex items-center justify-center transition-colors">
              <ImageIcon size={17} className="text-chalk-400 group-hover/upload:text-amber-700 transition-colors" />
            </div>
            <span className="text-xs text-chalk-400 group-hover/upload:text-amber-700 transition-colors font-medium">
              Add infographic
            </span>
          </button>
        )}

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-amber-glow/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-700 text-[10px] font-bold">{topic.order_index + 1}</span>
            </div>
            <h3 className="font-semibold text-slate-board text-sm leading-tight line-clamp-2">
              {topic.title}
            </h3>
          </div>

          {topic.description && (
            <p className="text-chalk-500 text-xs line-clamp-2 mb-3 flex-1">{topic.description}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-chalk-100">
            <button
              onClick={onUploadInfographic}
              className="flex items-center gap-1.5 text-xs text-chalk-500 hover:text-amber-700 transition-colors font-medium"
            >
              <Upload size={12} />
              {topic.infographic_url ? 'Replace' : 'Upload'} image
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-chalk-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-chalk-400 hover:text-chalk-600 px-1.5 py-1 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? '...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && topic.infographic_url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="relative max-w-4xl w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={topic.infographic_url}
              alt={topic.title}
              width={1200}
              height={800}
              className="rounded-xl object-contain max-h-[85vh] w-full"
            />
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white font-semibold text-lg drop-shadow-lg">{topic.title}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
