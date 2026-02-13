'use client'

import { useState } from 'react'

type CaptionLike = {
  id: number
  created_datetime_utc: string
  profile_id: string
  caption_id: string
  captions?: {
    id: string
    text?: string
    content?: string
    image_id?: string
    images?: {
      id: string
      url?: string
      image_url?: string
      src?: string
      title?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  [key: string]: unknown
}

export default function ImageGrid({ items }: { items: CaptionLike[] }) {
  const [selected, setSelected] = useState<CaptionLike | null>(null)

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items.map((item, index) => {
          const caption = item.captions
          const image = caption?.images
          const imageUrl = image?.url || image?.image_url || image?.src

          return (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, animationFillMode: 'backwards' }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Caption image"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 bg-gradient-to-br from-stone-100 to-stone-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <span className="text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            {(() => {
              const caption = selected.captions
              const image = caption?.images
              const imageUrl = image?.url || image?.image_url || image?.src
              const captionText = caption?.text || caption?.content

              return (
                <>
                  {imageUrl && (
                    <div className="bg-gradient-to-br from-stone-100 to-stone-50">
                      <img
                        src={imageUrl}
                        alt="Caption image"
                        className="w-full max-h-[60vh] object-contain"
                      />
                    </div>
                  )}

                  {/* Caption */}
                  <div className="p-8 md:p-10">
                    {captionText && (
                      <p className="text-xl md:text-2xl text-stone-800 leading-relaxed font-medium">
                        &ldquo;{captionText}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <p className="text-sm text-stone-400">
                        Liked on {new Date(selected.created_datetime_utc).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
