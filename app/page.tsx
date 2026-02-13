import { createClient } from '@/lib/supabase/server'
import ImageGrid from './components/ImageGrid'
import SignOutButton from './components/SignOutButton'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: captionLikes, error } = await supabase
    .from('caption_likes')
    .select(`
      *,
      captions (
        *,
        images (*)
      )
    `)

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

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10 animate-fade-in">
      {/* Navigation bar */}
      <nav className="max-w-7xl mx-auto mb-10">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm shadow-stone-200/30 border border-white/80 px-6 py-4 flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-800 tracking-tight leading-none">Caption Likes</h1>
              <p className="text-stone-400 text-xs mt-0.5">{captionLikes?.length || 0} items</p>
            </div>
          </div>

          {/* Right: User info + Sign out */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-sm font-medium text-stone-600">
                  {firstName}
                </span>
              </div>
            )}
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {captionLikes && captionLikes.length > 0 ? (
          <ImageGrid items={captionLikes} />
        ) : (
          <div className="text-center py-24 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-stone-400 font-medium">No caption likes yet</p>
            <p className="text-stone-300 text-sm mt-1">Your liked captions will appear here</p>
          </div>
        )}
      </div>
    </main>
  )
}
