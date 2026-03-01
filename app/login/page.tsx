'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glow behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[700px] h-[700px] rounded-full pointer-events-none
        bg-violet-400/[0.06] dark:bg-violet-500/[0.1] blur-[120px]" />

      {/* Subtle top line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent dark:via-violet-500/40" />

      <div className="w-full max-w-sm relative animate-scale-in">

        {/* Card */}
        <div className="rounded-3xl p-8
          bg-white/80 backdrop-blur-xl border border-violet-200/50 shadow-[0_8px_48px_rgba(109,40,217,0.08)]
          dark:bg-white/[0.04] dark:border-violet-500/[0.18] dark:shadow-[0_0_0_1px_rgba(109,40,217,0.12),0_32px_80px_rgba(0,0,0,0.7)]">

          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center
              bg-gradient-to-br from-violet-500 to-purple-700
              shadow-[0_0_32px_rgba(139,92,246,0.45)] dark:shadow-[0_0_48px_rgba(139,92,246,0.6)]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight
              text-slate-900
              dark:text-transparent dark:bg-gradient-to-br dark:from-white dark:to-violet-300 dark:bg-clip-text">
              Caption Votes
            </h1>
            <p className="text-sm mt-2 text-slate-500 dark:text-violet-300/50 leading-relaxed">
              Sign in and vote on the funniest captions
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-violet-500/[0.15]" />
            <span className="text-[11px] uppercase tracking-widest font-semibold
              text-slate-400 dark:text-violet-400/40">
              Continue with
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-violet-500/[0.15]" />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98]
              bg-white border border-slate-200 text-slate-700 shadow-sm
              hover:border-violet-300 hover:shadow-violet-100/50 hover:shadow-md
              dark:bg-white/[0.06] dark:border-violet-500/20 dark:text-violet-100
              dark:hover:bg-white/[0.1] dark:hover:border-violet-400/40
              dark:shadow-none dark:hover:shadow-[0_0_24px_rgba(139,92,246,0.15)]"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6 text-slate-400 dark:text-violet-400/30">
          Pick the funnier caption and let the crowd decide
        </p>
      </div>
    </main>
  )
}
