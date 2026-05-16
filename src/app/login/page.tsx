'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { BookOpen, Mail, Lock, Eye, EyeOff, Sparkles, GraduationCap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back, Teacher!')
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        })
        if (error) throw error
        toast.success('Account created! Please check your email to verify.')
        setMode('login')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen chalkboard flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-10 animate-float">
          <BookOpen size={80} className="text-amber-glow" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          <GraduationCap size={100} className="text-amber-glow" />
        </div>
        <div className="absolute top-1/2 left-4 opacity-5 animate-float" style={{ animationDelay: '1s' }}>
          <Sparkles size={60} className="text-cream" />
        </div>
        {/* Grid lines like a chalkboard */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(250,248,243,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(250,248,243,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-glow/20 border border-amber-glow/30 mb-4 shadow-glow-amber">
            <GraduationCap size={32} className="text-amber-glow" />
          </div>
          <h1 className="font-display text-3xl font-bold chalk-text">Teacher Portal</h1>
          <p className="text-chalk-400 text-sm mt-2">Your classroom command center</p>
        </div>

        {/* Card */}
        <div className="glass-dark rounded-2xl p-8 shadow-chalk animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-amber-glow text-slate-dark'
                  : 'text-chalk-400 hover:text-chalk-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-amber-glow text-slate-dark'
                  : 'text-chalk-400 hover:text-chalk-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-chalk-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/10 
                             text-chalk-100 placeholder-chalk-500 font-body text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-glow/30 focus:border-amber-glow/50
                             transition-all duration-200"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-chalk-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/8 border border-white/10 
                             text-chalk-100 placeholder-chalk-500 font-body text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-glow/30 focus:border-amber-glow/50
                             transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-chalk-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/8 border border-white/10 
                             text-chalk-100 placeholder-chalk-500 font-body text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-glow/30 focus:border-amber-glow/50
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-chalk-500 hover:text-chalk-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-glow hover:bg-amber-soft text-slate-dark font-semibold 
                         rounded-xl transition-all duration-200 shadow-glow-amber hover:shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-dark/30 border-t-slate-dark rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Enter Classroom' : 'Create Account'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-chalk-500 mt-4">
              Demo: create an account to get started
            </p>
          )}
        </div>

        <p className="text-center text-xs text-chalk-600 mt-6">
          Powered by AI • Built for Educators
        </p>
      </div>
    </div>
  )
}
