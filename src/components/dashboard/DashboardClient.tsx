'use client'

import { useState } from 'react'
import type { Book, Topic } from '@/types/database'
import BookCard from '@/components/books/BookCard'
import UploadBookModal from '@/components/books/UploadBookModal'
import { BookOpen, Plus, TrendingUp, ImageIcon, Layers } from 'lucide-react'

interface DashboardClientProps {
  books: Book[]
  topics: Topic[]
  userId: string
}

export default function DashboardClient({ books: initialBooks, topics: initialTopics, userId }: DashboardClientProps) {
  const [books, setBooks] = useState(initialBooks)
  const [topics] = useState(initialTopics)
  const [showUpload, setShowUpload] = useState(false)

  const totalTopics = topics.length
  const topicsWithInfographics = topics.filter(t => t.infographic_url).length
  const readyBooks = books.filter(b => b.status === 'ready').length

  function handleBookUploaded(book: Book) {
    setBooks(prev => [book, ...prev])
    setShowUpload(false)
  }

  function handleBookDeleted(bookId: string) {
    setBooks(prev => prev.filter(b => b.id !== bookId))
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-board">
            My Library
          </h1>
          <p className="text-chalk-500 text-sm mt-1">Upload books, extract topics, present beautifully</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn-secondary flex items-center gap-2 shadow-glow-amber text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Upload Book</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Books', value: books.length, icon: BookOpen, color: 'text-slate-board bg-slate-board/10' },
          { label: 'Ready', value: readyBooks, icon: TrendingUp, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Topics', value: totalTopics, icon: Layers, color: 'text-amber-700 bg-amber-50' },
          { label: 'Infographics', value: topicsWithInfographics, icon: ImageIcon, color: 'text-purple-700 bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-card border border-chalk-100 card-hover">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={17} />
            </div>
            <p className="font-display text-2xl font-bold text-slate-board">{stat.value}</p>
            <p className="text-chalk-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Books grid */}
      {books.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-chalk-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={36} className="text-chalk-300" />
          </div>
          <h3 className="font-display text-xl text-chalk-600 mb-2">No books yet</h3>
          <p className="text-chalk-400 text-sm mb-6 max-w-sm mx-auto">
            Upload your first PDF book to automatically extract topics and start building your classroom presentations.
          </p>
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <Plus size={16} />
            Upload Your First Book
          </button>
        </div>
      ) : (
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-board mb-4">
            Books ({books.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book, i) => (
              <div key={book.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <BookCard
                  book={book}
                  topicCount={topics.filter(t => t.book_id === book.id).length}
                  infographicCount={topics.filter(t => t.book_id === book.id && t.infographic_url).length}
                  onDeleted={() => handleBookDeleted(book.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showUpload && (
        <UploadBookModal
          onClose={() => setShowUpload(false)}
          onUploaded={handleBookUploaded}
        />
      )}
    </div>
  )
}
