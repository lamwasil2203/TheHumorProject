'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-200/30 dark:bg-violet-500/10 blur-3xl animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-fuchsia-200/30 dark:bg-fuchsia-500/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-md animate-scale-in relative">
        {/* Card */}
        <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl rounded-3xl shadow-lg shadow-violet-200/40 dark:shadow-black/30 border border-violet-100/60 dark:border-white/10 p-10">
          {/* Logo / Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Caption Battle</h1>
            <p className="text-slate-500 dark:text-violet-300/70 text-sm mt-2 leading-relaxed">
              Sign in to vote on the funniest captions
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-violet-100 dark:bg-white/10" />
            <span className="text-xs text-violet-400/70 dark:text-violet-400/60 font-medium uppercase tracking-wider">Continue with</span>
            <div className="flex-1 h-px bg-violet-100 dark:bg-white/10" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/[0.08] rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-violet-100 hover:bg-violet-50 dark:hover:bg-white/[0.14] transition-all duration-200 shadow-sm hover:shadow-md border border-violet-200/60 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/40 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-violet-400/70 dark:text-violet-400/50 mt-6">
          Pick the funnier caption and let the crowd decide
        </p>
      </div>
    </main>
  )
}
