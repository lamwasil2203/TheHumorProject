import { createClient } from '@/lib/supabase/server'
import CaptionBattle from './components/CaptionBattle'
import type { Battle } from './components/CaptionBattle'
import SignOutButton from './components/SignOutButton'
import ThemeToggle from './components/ThemeToggle'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch captions with common-use images only
  const { data: captions, error } = await supabase
    .from('captions')
    .select(`
      *,
      images!inner (*)
    `)
    .eq('images.is_common_use', true)

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

  // Group captions by image_id — only keep images with 2+ captions
  const byImage = new Map<string, { url: string; captions: typeof captions }>()
  for (const c of captions ?? []) {
    const imageId = c.images?.id as string | undefined
    const imageUrl = c.images?.url as string | undefined
    if (!imageId || !imageUrl) continue

    if (!byImage.has(imageId)) {
      byImage.set(imageId, { url: imageUrl, captions: [] })
    }
    byImage.get(imageId)!.captions.push(c)
  }

  // Create battle pairs from each image group
  const battles: Battle[] = []
  for (const [, group] of byImage) {
    const caps = group.captions
    if (caps.length < 2) continue

    // Generate all unique pairs
    for (let i = 0; i < caps.length; i++) {
      for (let j = i + 1; j < caps.length; j++) {
        battles.push({
          imageUrl: group.url,
          captionA: caps[i],
          captionB: caps[j],
        })
      }
    }
  }

  // Shuffle battles randomly, then cap at 300
  for (let i = battles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [battles[i], battles[j]] = [battles[j], battles[i]]
  }
  battles.splice(300)

  // Fetch user's existing votes (if logged in)
  let userVotes: Record<string, number> = {}
  if (user) {
    const { data: votes } = await supabase
      .from('caption_votes')
      .select('caption_id, vote_value')
      .eq('profile_id', user.id)
    if (votes) {
      for (const v of votes) {
        userVotes[v.caption_id] = v.vote_value
      }
    }
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10 animate-fade-in">
      {/* Navigation bar */}
      <nav className="max-w-7xl mx-auto mb-10">
        <div className="backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center justify-between
          bg-white/70 shadow-sm shadow-violet-200/30 border border-violet-100/50
          dark:bg-white/[0.06] dark:shadow-lg dark:shadow-black/20 dark:border-white/10">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none text-slate-800 dark:text-white">Caption Battle</h1>
              <p className="text-xs mt-0.5 text-violet-400/70 dark:text-violet-400/60">{battles.length} battles</p>
            </div>
          </div>

          {/* Right: User info + Theme toggle + Sign out */}
          <div className="flex items-center gap-2.5">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5 mr-1">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full ring-2 ring-violet-200 dark:ring-violet-500/30 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-600 dark:text-violet-200">
                  {firstName}
                </span>
              </div>
            )}
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {battles.length > 0 ? (
          <CaptionBattle battles={battles} userId={user?.id ?? null} userVotes={userVotes} />
        ) : (
          <div className="text-center py-24 animate-slide-up">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-violet-100 dark:bg-violet-500/15">
              <svg className="w-7 h-7 text-violet-300 dark:text-violet-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium text-slate-500 dark:text-violet-300">No battles available</p>
            <p className="text-sm mt-1 text-slate-400 dark:text-violet-400/50">Need at least 2 captions per image</p>
          </div>
        )}
      </div>
    </main>
  )
}
