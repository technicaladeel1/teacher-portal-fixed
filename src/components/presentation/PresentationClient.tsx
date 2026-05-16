'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Book, Topic } from '@/types/database'
import {
  ChevronLeft, ChevronRight, X, Monitor, BookOpen,
  ImageIcon, Grid3X3, Maximize2, ArrowLeft, Layers
} from 'lucide-react'

interface PresentationClientProps {
  book: Book
  topics: Topic[]
}

export default function PresentationClient({ book, topics }: PresentationClientProps) {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentIndex, setCurrentIndex] = useState(0)

  const topicsWithImages = topics.filter(t => t.infographic_url)
  const totalWithImages = topicsWithImages.length

  // Keyboard navigation in fullscreen
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeTopic) return
    if (e.key === 'Escape') setActiveTopic(null)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const idx = topics.findIndex(t => t.id === activeTopic.id)
      // Find next topic with infographic
      for (let i = idx + 1; i < topics.length; i++) {
        if (topics[i].infographic_url) {
          setActiveTopic(topics[i])
          setCurrentIndex(i)
          break
        }
      }
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const idx = topics.findIndex(t => t.id === activeTopic.id)
      for (let i = idx - 1; i >= 0; i--) {
        if (topics[i].infographic_url) {
          setActiveTopic(topics[i])
          setCurrentIndex(i)
          break
        }
      }
    }
  }, [activeTopic, topics])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (activeTopic) {
      document.body.classList.add('presentation-mode')
    } else {
      document.body.classList.remove('presentation-mode')
    }
    return () => document.body.classList.remove('presentation-mode')
  }, [activeTopic])

  function openTopic(topic: Topic) {
    if (!topic.infographic_url) return
    setActiveTopic(topic)
    setCurrentIndex(topics.findIndex(t => t.id === topic.id))
  }

  function navigateTopic(direction: 'prev' | 'next') {
    if (!activeTopic) return
    const idx = topicsWithImages.findIndex(t => t.id === activeTopic.id)
    const nextIdx = direction === 'next'
      ? (idx + 1) % topicsWithImages.length
      : (idx - 1 + topicsWithImages.length) % topicsWithImages.length
    setActiveTopic(topicsWithImages[nextIdx])
  }

  const currentInFullscreen = activeTopic
    ? topicsWithImages.findIndex(t => t.id === activeTopic.id) + 1
    : 0

  return (
    <>
      {/* Main presentation view */}
      <div className="min-h-screen chalkboard">
        {/* Decorative chalk lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/books/${book.id}`}
              className="p-2 rounded-lg bg-white/8 hover:bg-white/15 text-chalk-400 hover:text-chalk-200 transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-amber-glow" />
                <span className="text-amber-glow text-xs font-medium uppercase tracking-wider">
                  Presentation Mode
                </span>
              </div>
              <h1 className="font-display text-chalk-100 font-bold text-lg leading-tight">{book.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-chalk-500">
              <Layers size={13} />
              <span>{topics.length} topics</span>
              <span className="text-chalk-700">·</span>
              <ImageIcon size={13} />
              <span>{totalWithImages} images</span>
            </div>

            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-white/15">
              <button
                onClick={() => setView('grid')}
                className={`p-2 transition-colors ${view === 'grid' ? 'bg-amber-glow text-slate-dark' : 'text-chalk-400 hover:text-chalk-200 hover:bg-white/8'}`}
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 transition-colors ${view === 'list' ? 'bg-amber-glow text-slate-dark' : 'text-chalk-400 hover:text-chalk-200 hover:bg-white/8'}`}
              >
                <Layers size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {topics.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen size={40} className="text-chalk-700 mx-auto mb-4" />
              <h2 className="font-display text-chalk-400 text-2xl mb-2">No topics yet</h2>
              <p className="text-chalk-600 text-sm">
                Go back and add topics with infographics to start presenting.
              </p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {topics.map((topic, i) => (
                <button
                  key={topic.id}
                  onClick={() => openTopic(topic)}
                  disabled={!topic.infographic_url}
                  className={`group relative aspect-[4/3] rounded-xl overflow-hidden text-left transition-all duration-300 animate-slide-up ${
                    topic.infographic_url
                      ? 'cursor-pointer hover:ring-2 hover:ring-amber-glow hover:shadow-glow-amber hover:scale-105'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {topic.infographic_url ? (
                    <>
                      <Image
                        src={topic.infographic_url}
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-amber-glow/20 border border-amber-glow/50 flex items-center justify-center">
                          <Maximize2 size={18} className="text-amber-glow" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center">
                      <ImageIcon size={24} className="text-chalk-700 mb-2" />
                      <span className="text-chalk-700 text-xs">No image</span>
                    </div>
                  )}

                  {/* Topic number badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-md bg-amber-glow flex items-center justify-center">
                    <span className="text-slate-dark text-[10px] font-bold">{i + 1}</span>
                  </div>

                  {/* Topic title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{topic.title}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // List view
            <div className="max-w-3xl mx-auto space-y-3">
              {topics.map((topic, i) => (
                <button
                  key={topic.id}
                  onClick={() => openTopic(topic)}
                  disabled={!topic.infographic_url}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 animate-slide-up text-left ${
                    topic.infographic_url
                      ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-glow/40 cursor-pointer'
                      : 'border-white/5 bg-white/3 opacity-50 cursor-not-allowed'
                  }`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                    {topic.infographic_url ? (
                      <Image
                        src={topic.infographic_url}
                        alt={topic.title}
                        width={80}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={18} className="text-chalk-700" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-md bg-amber-glow/20 flex items-center justify-center text-amber-glow text-[10px] font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="font-semibold text-chalk-200 text-sm truncate">{topic.title}</p>
                    </div>
                    {topic.description && (
                      <p className="text-chalk-500 text-xs line-clamp-1">{topic.description}</p>
                    )}
                  </div>

                  {topic.infographic_url && (
                    <Maximize2 size={16} className="text-chalk-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen presentation overlay */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 presentation-bg flex flex-col animate-fade-in">
          {/* Fullscreen header */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-glow/20 border border-amber-glow/30 flex items-center justify-center">
                <span className="text-amber-glow text-sm font-bold">
                  {topics.findIndex(t => t.id === activeTopic.id) + 1}
                </span>
              </div>
              <div>
                <h2 className="font-display text-cream font-bold text-xl">{activeTopic.title}</h2>
                {activeTopic.description && (
                  <p className="text-chalk-500 text-sm line-clamp-1">{activeTopic.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-chalk-500 text-sm hidden sm:block">
                {currentInFullscreen} / {totalWithImages}
              </span>
              <button
                onClick={() => setActiveTopic(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-chalk-300 hover:text-cream transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center px-4 pb-4 relative min-h-0">
            {/* Prev button */}
            {totalWithImages > 1 && (
              <button
                onClick={() => navigateTopic('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-chalk-300 hover:text-cream transition-all hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="relative w-full h-full max-w-6xl mx-auto">
              {activeTopic.infographic_url && (
                <Image
                  src={activeTopic.infographic_url}
                  alt={activeTopic.title}
                  fill
                  className="object-contain animate-scale-in"
                  priority
                  sizes="100vw"
                />
              )}
            </div>

            {/* Next button */}
            {totalWithImages > 1 && (
              <button
                onClick={() => navigateTopic('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-chalk-300 hover:text-cream transition-all hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Topic strip at bottom */}
          {totalWithImages > 1 && (
            <div className="flex-shrink-0 px-6 pb-4">
              <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                {topicsWithImages.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTopic(t)}
                    className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      t.id === activeTopic.id
                        ? 'border-amber-glow scale-110 shadow-glow-amber'
                        : 'border-white/20 hover:border-white/40 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <Image
                      src={t.infographic_url!}
                      alt={t.title}
                      width={56}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard hint */}
          <div className="absolute bottom-4 right-6 text-chalk-700 text-xs hidden sm:block">
            ← → to navigate · Esc to close
          </div>
        </div>
      )}
    </>
  )
}
