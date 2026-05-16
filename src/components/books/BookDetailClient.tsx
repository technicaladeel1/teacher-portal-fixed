'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Book, Topic } from '@/types/database'
import TopicCard from '@/components/topics/TopicCard'
import AddTopicModal from '@/components/topics/AddTopicModal'
import InfographicUploadModal from '@/components/infographics/InfographicUploadModal'
import {
  BookOpen, ArrowLeft, Plus, Monitor, CheckCircle, Loader2,
  AlertCircle, Layers, ImageIcon, FileText
} from 'lucide-react'

interface BookDetailClientProps {
  book: Book
  topics: Topic[]
  userId: string
}

export default function BookDetailClient({ book, topics: initialTopics, userId }: BookDetailClientProps) {
  const [topics, setTopics] = useState(initialTopics)
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [selectedTopicForInfographic, setSelectedTopicForInfographic] = useState<Topic | null>(null)

  function handleTopicAdded(topic: Topic) {
    setTopics(prev => [...prev, topic])
    setShowAddTopic(false)
  }

  function handleTopicDeleted(topicId: string) {
    setTopics(prev => prev.filter(t => t.id !== topicId))
  }

  function handleInfographicUploaded(updatedTopic: Topic) {
    setTopics(prev => prev.map(t => t.id === updatedTopic.id ? updatedTopic : t))
    setSelectedTopicForInfographic(null)
  }

  function handleInfographicRemoved(topicId: string) {
    setTopics(prev => prev.map(t =>
      t.id === topicId ? { ...t, infographic_url: null, infographic_path: null } : t
    ))
  }

  const statusConfig = {
    ready: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Ready' },
    processing: { icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Processing' },
    error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Error' },
  }
  const status = statusConfig[book.status]
  const StatusIcon = status.icon
  const withInfographics = topics.filter(t => t.infographic_url).length
  const fileSizeMB = book.file_size ? (book.file_size / 1024 / 1024).toFixed(1) : null

  return (
    <div className="animate-fade-in">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-chalk-500 hover:text-slate-board text-sm mb-6 transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
        Back to Library
      </Link>

      {/* Book header */}
      <div className="bg-white rounded-2xl border border-chalk-100 shadow-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-board flex items-center justify-center flex-shrink-0">
            <BookOpen size={24} className="text-amber-glow" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-board">{book.title}</h1>
                {book.description && (
                  <p className="text-chalk-500 text-sm mt-1">{book.description}</p>
                )}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0 ${status.bg}`}>
                <StatusIcon
                  size={13}
                  className={`${status.color} ${book.status === 'processing' ? 'animate-spin' : ''}`}
                />
                <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-chalk-500">
              {fileSizeMB && (
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {fileSizeMB} MB
                </span>
              )}
              {book.page_count && (
                <span>{book.page_count} pages</span>
              )}
              <span className="flex items-center gap-1">
                <Layers size={12} />
                {topics.length} topics
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon size={12} />
                {withInfographics} infographics
              </span>
              <span>
                Uploaded {new Date(book.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-chalk-100">
          <button
            onClick={() => setShowAddTopic(true)}
            className="btn-ghost text-sm border border-chalk-200"
          >
            <Plus size={15} />
            Add Topic
          </button>

          {topics.length > 0 && (
            <Link
              href={`/dashboard/books/${book.id}/presentation`}
              className="btn-secondary text-sm"
            >
              <Monitor size={15} />
              Start Presentation
            </Link>
          )}
        </div>
      </div>

      {/* Topics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-slate-board">
            Topics {topics.length > 0 && <span className="text-chalk-400 font-normal">({topics.length})</span>}
          </h2>
        </div>

        {book.status === 'processing' && topics.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-chalk-100">
            <Loader2 size={32} className="text-amber-glow animate-spin mx-auto mb-4" />
            <h3 className="font-display text-lg text-slate-board mb-2">Extracting Topics...</h3>
            <p className="text-chalk-500 text-sm max-w-sm mx-auto">
              We're analyzing your PDF and extracting topics automatically. This usually takes 10–30 seconds.
            </p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-chalk-100">
            <Layers size={32} className="text-chalk-300 mx-auto mb-4" />
            <h3 className="font-display text-lg text-chalk-600 mb-2">No topics yet</h3>
            <p className="text-chalk-400 text-sm mb-4">
              Topics are extracted automatically from your PDF, or you can add them manually.
            </p>
            <button onClick={() => setShowAddTopic(true)} className="btn-primary text-sm">
              <Plus size={15} />
              Add First Topic
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, i) => (
              <div key={topic.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <TopicCard
                  topic={topic}
                  onUploadInfographic={() => setSelectedTopicForInfographic(topic)}
                  onDeleted={() => handleTopicDeleted(topic.id)}
                  onInfographicRemoved={() => handleInfographicRemoved(topic.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddTopic && (
        <AddTopicModal
          bookId={book.id}
          onClose={() => setShowAddTopic(false)}
          onAdded={handleTopicAdded}
        />
      )}

      {selectedTopicForInfographic && (
        <InfographicUploadModal
          topic={selectedTopicForInfographic}
          onClose={() => setSelectedTopicForInfographic(null)}
          onUploaded={handleInfographicUploaded}
        />
      )}
    </div>
  )
}
