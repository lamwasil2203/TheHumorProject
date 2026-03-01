import { createClient } from '@/lib/supabase/server'
import CaptionFeed from './components/CaptionBattle'
import type { ImageGroup } from './components/CaptionBattle'
import SignOutButton from './components/SignOutButton'
import ThemeToggle from './components/ThemeToggle'
import UploadImage from './components/UploadImage'

export const dynamic = 'force-dynamic' // required: page reads user cookies for auth

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all images with their captions (if any) and each caption's votes
  const { data: images, error } = await supabase
    .from('images')
    .select(`
      id,
      url,
      captions (
        id,
        content,
        caption_votes (vote_value, profile_id)
      )
    `)
    .not('url', 'is', null)
    .gte('created_datetime_utc', '2026-01-01')
    .order('created_datetime_utc', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-8 border border-red-200/50 shadow-lg animate-scale-in">
          <h1 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h1>
          <p className="text-red-600/80 text-sm">{error.message}</p>
        </div>
      </main>
    )
  }

  const imageGroups: ImageGroup[] = (images ?? [])
    .map(img => ({
      imageUrl: img.url as string,
      captions: (img.captions ?? []).filter(c => c.content).map(c => {
        const allVotes = Array.isArray(c.caption_votes) ? c.caption_votes : []
        const upvotes = allVotes.filter(v => v.vote_value === 1).length
        const downvotes = allVotes.filter(v => v.vote_value === -1).length
        const userVoteRow = user ? allVotes.find(v => v.profile_id === user.id) : null
        const userVote = (userVoteRow?.vote_value ?? 0) as 0 | 1 | -1
        return { id: c.id, content: c.content ?? '', upvotes, downvotes, userVote }
      }),
    }))
    .filter(g => g.captions.length > 0)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10 animate-fade-in">
      {/* Navigation bar */}
      <nav className="max-w-2xl mx-auto mb-10">
        <div className="backdrop-blur-xl rounded-2xl px-5 py-3.5 flex items-center justify-between
          bg-white/75 border border-violet-200/40 shadow-[0_4px_24px_rgba(109,40,217,0.06)]
          dark:bg-white/[0.04] dark:border-violet-500/[0.14]
          dark:shadow-[0_0_0_1px_rgba(109,40,217,0.1),0_8px_32px_rgba(0,0,0,0.5)]">

          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-violet-500 to-purple-700
              shadow-[0_0_16px_rgba(139,92,246,0.4)] dark:shadow-[0_0_24px_rgba(139,92,246,0.5)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none
                text-slate-800 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-violet-300 dark:bg-clip-text">
                Caption Votes
              </h1>
              <p className="text-[11px] mt-0.5 text-violet-400/60 dark:text-violet-400/40 tabular-nums">
                {imageGroups.length} images · {imageGroups.reduce((sum, g) => sum + g.captions.length, 0)} captions
              </p>
            </div>
          </div>

          {/* Right: User + Upload + Theme + Sign out */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 mr-1">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-7 h-7 rounded-full ring-2 ring-violet-300/60 dark:ring-violet-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                    {firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-600 dark:text-violet-300/70">
                  {firstName}
                </span>
              </div>
            )}
            {user && <UploadImage />}
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <CaptionFeed imageGroups={imageGroups} userId={user?.id ?? null} />
    </main>
  )
}
