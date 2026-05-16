'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { LogOut, ChevronDown, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface HeaderProps {
  profile: Profile | null
}

export default function Header({ profile }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showMenu, setShowMenu] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() || 'T'

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-chalk-200/60 bg-cream/95 backdrop-blur-sm flex-shrink-0">
      <div className="pl-10 lg:pl-0">
        <h2 className="font-display text-slate-board text-sm font-semibold hidden sm:block">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Teacher'} 👋
        </h2>
      </div>

      {/* Profile menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-chalk-100 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-board flex items-center justify-center text-xs font-bold text-amber-glow flex-shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-800 leading-none">
              {profile?.full_name || 'Teacher'}
            </p>
            <p className="text-xs text-chalk-500 leading-tight mt-0.5">
              {profile?.email}
            </p>
          </div>
          <ChevronDown size={14} className="text-chalk-400" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-elevated border border-chalk-200 overflow-hidden z-20 animate-scale-in">
              <div className="p-3 border-b border-chalk-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-board flex items-center justify-center text-sm font-bold text-amber-glow">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {profile?.full_name || 'Teacher'}
                    </p>
                    <p className="text-xs text-chalk-500 truncate">{profile?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
