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
        {items.map((item) => {
          const caption = item.captions
          const image = caption?.images
          const imageUrl = image?.url || image?.image_url || image?.src

          return (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-stone-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Caption image"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  View caption
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
            >
              <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    <div className="bg-stone-100">
                      <img
                        src={imageUrl}
                        alt="Caption image"
                        className="w-full max-h-[60vh] object-contain"
                      />
                    </div>
                  )}

                  {/* Caption */}
                  <div className="p-6 md:p-8">
                    {captionText && (
                      <p className="text-xl md:text-2xl text-stone-800 leading-relaxed">
                        {captionText}
                      </p>
                    )}
                    <p className="text-sm text-stone-400 mt-4">
                      Liked on {new Date(selected.created_datetime_utc).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
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
