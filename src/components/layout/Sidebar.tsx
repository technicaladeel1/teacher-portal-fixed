'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Book, Topic } from '@/types/database'
import {
  LayoutDashboard, BookOpen, ChevronDown, ChevronRight,
  GraduationCap, Menu, X, ImageIcon, Monitor
} from 'lucide-react'


interface SidebarProps {
  userId: string
}

export default function Sidebar({ userId }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [books, setBooks] = useState<Book[]>([])
  const [topics, setTopics] = useState<Record<string, Topic[]>>({})
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    loadBooks()
    
    // Subscribe to real-time changes
    const booksChannel = supabase
      .channel('books-sidebar')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'books',
        filter: `teacher_id=eq.${userId}`,
      }, () => loadBooks())
      .subscribe()

    const topicsChannel = supabase
      .channel('topics-sidebar')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'topics',
        filter: `teacher_id=eq.${userId}`,
      }, () => loadAllTopics())
      .subscribe()

    return () => {
      supabase.removeChannel(booksChannel)
      supabase.removeChannel(topicsChannel)
    }
  }, [userId])

  async function loadBooks() {
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('teacher_id', userId)
      .order('created_at', { ascending: false })
    
    if (data) {
      setBooks(data)
      loadAllTopics()
    }
  }

  async function loadAllTopics() {
    const { data } = await supabase
      .from('topics')
      .select('*')
      .eq('teacher_id', userId)
      .order('order_index', { ascending: true })

    if (data) {
      const grouped: Record<string, Topic[]> = {}
      data.forEach(topic => {
        if (!grouped[topic.book_id]) grouped[topic.book_id] = []
        grouped[topic.book_id].push(topic)
      })
      setTopics(grouped)
    }
  }

  function toggleBook(bookId: string) {
    setExpandedBooks(prev => {
      const next = new Set(prev)
      if (next.has(bookId)) next.delete(bookId)
      else next.add(bookId)
      return next
    })
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-glow/20 border border-amber-glow/30 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-amber-glow" />
          </div>
          <div>
            <p className="font-display font-bold text-cream text-sm leading-tight">Teacher Portal</p>
            <p className="text-chalk-500 text-xs">Classroom Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              pathname === item.href
                ? 'sidebar-item-active'
                : 'text-chalk-400 hover:text-chalk-200 hover:bg-white/6'
            }`}
          >
            <item.icon size={17} className="flex-shrink-0" />
            {item.label}
          </Link>
        ))}

        {/* Books section */}
        <div className="pt-3">
          <p className="text-chalk-600 text-xs font-medium uppercase tracking-wider px-3 mb-2">
            My Books
          </p>
          
          {books.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <BookOpen size={24} className="text-chalk-700 mx-auto mb-2" />
              <p className="text-chalk-600 text-xs">No books yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {books.map(book => {
                const bookTopics = topics[book.id] || []
                const isExpanded = expandedBooks.has(book.id)
                const isActive = pathname.includes(book.id)

                return (
                  <div key={book.id}>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg group ${
                      isActive ? 'bg-white/8' : 'hover:bg-white/5'
                    }`}>
                      <button
                        onClick={() => toggleBook(book.id)}
                        className="flex-shrink-0 text-chalk-500 hover:text-chalk-300 transition-colors"
                      >
                        {isExpanded
                          ? <ChevronDown size={14} />
                          : <ChevronRight size={14} />
                        }
                      </button>
                      <Link
                        href={`/dashboard/books/${book.id}`}
                        onClick={() => setMobileOpen(false)}
                        className={`flex-1 flex items-center gap-2 min-w-0 text-sm transition-colors ${
                          isActive ? 'text-chalk-200' : 'text-chalk-400 hover:text-chalk-200'
                        }`}
                      >
                        <BookOpen size={14} className="flex-shrink-0 text-amber-glow/60" />
                        <span className="truncate">{book.title}</span>
                      </Link>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        book.status === 'ready'
                          ? 'bg-green-900/40 text-green-400'
                          : book.status === 'processing'
                          ? 'bg-amber-900/40 text-amber-400'
                          : 'bg-red-900/40 text-red-400'
                      }`}>
                        {bookTopics.length}
                      </span>
                    </div>

                    {/* Topics */}
                    {isExpanded && bookTopics.length > 0 && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                        {bookTopics.map(topic => (
                          <div
                            key={topic.id}
                            className="flex items-center gap-2 py-1.5 px-2 rounded-md group hover:bg-white/5 transition-colors"
                          >
                            {topic.infographic_url
                              ? <ImageIcon size={11} className="text-amber-glow/60 flex-shrink-0" />
                              : <div className="w-2.5 h-2.5 rounded-full border border-chalk-700 flex-shrink-0" />
                            }
                            <span className="text-chalk-500 text-xs truncate group-hover:text-chalk-300 transition-colors">
                              {topic.title}
                            </span>
                          </div>
                        ))}
                        {/* Presentation link */}
                        <Link
                          href={`/dashboard/books/${book.id}/presentation`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-md text-amber-glow/60 hover:text-amber-glow text-xs font-medium transition-colors mt-1"
                        >
                          <Monitor size={11} />
                          Present
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10">
        <p className="text-center text-chalk-700 text-xs">
          {books.length} book{books.length !== 1 ? 's' : ''} · {Object.values(topics).flat().length} topics
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-slate-board text-cream shadow-chalk"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 chalkboard border-r border-white/10 flex-col">
        <SidebarContent />
      </aside>

      {/* Sidebar - mobile */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-72 chalkboard border-r border-white/10 flex flex-col z-40 transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>
    </>
  )
}
