import { supabase } from '@/lib/supabase'
import ImageGrid from './components/ImageGrid'

export default async function Home() {
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
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <h1 className="text-lg font-medium text-red-800 mb-1">Error loading data</h1>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Caption Likes</h1>
        <p className="text-stone-500 text-sm mt-1">
          {captionLikes?.length || 0} items · Click any image to view its caption
        </p>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {captionLikes && captionLikes.length > 0 ? (
          <ImageGrid items={captionLikes} />
        ) : (
          <div className="text-center py-20">
            <p className="text-stone-500">No caption likes found.</p>
          </div>
        )}
      </div>
    </main>
  )
}
