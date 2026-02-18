'use client'

import { useState, useTransition, useEffect } from 'react'
import { submitVote } from '@/app/actions/vote'

type Caption = {
  id: string
  content?: string
  images?: {
    id: string
    url?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type Battle = {
  imageUrl: string
  captionA: Caption
  captionB: Caption
}

type Props = {
  battles: Battle[]
  userId: string | null
}

export default function CaptionBattle({ battles, userId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [picked, setPicked] = useState<'A' | 'B' | null>(null)
  const [battlesJudged, setBattlesJudged] = useState(0)
  const [slideKey, setSlideKey] = useState(0)
  const [, startTransition] = useTransition()

  const total = battles.length
  const battle = battles[currentIndex] as Battle | undefined

  // Preload the next battle's image so it's ready before the user gets there
  useEffect(() => {
    const next = battles[currentIndex + 1]
    if (!next) return
    const img = new Image()
    img.src = next.imageUrl
  }, [currentIndex, battles])

  function handlePick(winner: 'A' | 'B') {
    if (!userId || picked) return

    setPicked(winner)
    setBattlesJudged((n) => n + 1)

    const winnerId = winner === 'A' ? battle!.captionA.id : battle!.captionB.id
    const loserId = winner === 'A' ? battle!.captionB.id : battle!.captionA.id

    startTransition(async () => {
      try {
        await Promise.all([
          submitVote(winnerId, 1),
          submitVote(loserId, -1),
        ])
      } catch {
        // Votes are optimistic — silent fail
      }
    })

    setTimeout(() => {
      setPicked(null)
      setCurrentIndex((i) => i + 1)
      setSlideKey((k) => k + 1)
    }, 1200)
  }

  // End screen
  if (!battle || currentIndex >= total) {
    return (
      <div className="flex flex-col items-center justify-center py-28 animate-scale-in">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-fuchsia-500/30">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/40">
            <span className="text-white text-xs">&#9733;</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3 text-slate-800 dark:text-white">All done!</h2>
        <p className="text-lg text-slate-600 dark:text-violet-200">
          You judged <span className="font-bold text-fuchsia-600 dark:text-cyan-400">{battlesJudged}</span> battle{battlesJudged !== 1 ? 's' : ''}
        </p>
        <p className="text-sm mt-2 text-slate-400 dark:text-violet-300/60">Thanks for voting!</p>
      </div>
    )
  }

  const progress = total > 0 ? (currentIndex / total) * 100 : 0

  return (
    <div key={slideKey} className="max-w-2xl mx-auto animate-battle-slide-in">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-violet-200">
            Battle {currentIndex + 1} <span className="font-normal text-slate-400 dark:text-violet-400/60">of</span> {total}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border
            text-violet-600 bg-violet-100 border-violet-200/60
            dark:text-violet-300 dark:bg-violet-500/20 dark:border-violet-500/20">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden
          bg-violet-100 dark:bg-white/5 dark:border dark:border-white/5">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 progress-shimmer rounded-full" />
          </div>
        </div>
      </div>

      {/* Image card */}
      <div className="relative rounded-3xl overflow-hidden mb-6
        shadow-xl shadow-violet-200/40 ring-1 ring-violet-100/60
        dark:shadow-2xl dark:shadow-black/40 dark:ring-white/10">
        <div className="w-full aspect-[4/3] overflow-hidden bg-violet-50 dark:bg-violet-950">
          <img
            src={battle.imageUrl}
            alt="Battle image"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none
          bg-gradient-to-t from-white/40 to-transparent
          dark:from-[#0f0b1a]/80 dark:to-transparent" />
      </div>

      {/* Prompt */}
      <p className="text-center text-xs font-semibold mb-5 tracking-[0.2em] uppercase
        text-violet-400 dark:text-violet-400/80">
        Pick the funnier caption
      </p>

      {/* Caption cards with VS badge */}
      {userId ? (
        <div className="relative flex gap-5 items-stretch">
          {/* Caption A */}
          <button
            onClick={() => handlePick('A')}
            disabled={!!picked}
            className={`group flex-1 relative rounded-2xl p-6 pt-8 border-2 transition-all duration-200 text-left cursor-pointer disabled:cursor-default shadow-sm ${
              picked === 'A'
                ? 'animate-winner-glow bg-violet-50 dark:bg-violet-500/15 border-violet-400'
                : picked === 'B'
                ? 'animate-loser-fade bg-white dark:bg-white/5 border-transparent'
                : 'bg-white dark:bg-white/[0.06] border-violet-200/40 dark:border-white/10 hover:bg-violet-50/50 dark:hover:bg-white/[0.1] hover:border-violet-400/50 hover:shadow-lg hover:shadow-violet-200/30 dark:hover:shadow-violet-500/10 hover:-translate-y-0.5'
            }`}
          >
            <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-widest text-violet-300/60 dark:text-violet-500/40 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
              A
            </span>
            <span className="block text-4xl font-serif leading-none mb-1 text-violet-300/30 dark:text-fuchsia-400/25">&ldquo;</span>
            <p className="font-medium leading-relaxed text-[15px] -mt-4 text-slate-700 dark:text-violet-100">
              {battle.captionA.content}
            </p>
            <span className="block text-4xl font-serif leading-none text-right -mb-2 text-violet-300/30 dark:text-fuchsia-400/25">&rdquo;</span>
          </button>

          {/* VS badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-xl animate-vs-pulse
              ring-4 ring-white dark:ring-[#0f0b1a]">
              <span className="text-white text-xs font-black tracking-tight">VS</span>
            </div>
          </div>

          {/* Caption B */}
          <button
            onClick={() => handlePick('B')}
            disabled={!!picked}
            className={`group flex-1 relative rounded-2xl p-6 pt-8 border-2 transition-all duration-200 text-left cursor-pointer disabled:cursor-default shadow-sm ${
              picked === 'B'
                ? 'animate-winner-glow bg-violet-50 dark:bg-violet-500/15 border-violet-400'
                : picked === 'A'
                ? 'animate-loser-fade bg-white dark:bg-white/5 border-transparent'
                : 'bg-white dark:bg-white/[0.06] border-violet-200/40 dark:border-white/10 hover:bg-violet-50/50 dark:hover:bg-white/[0.1] hover:border-violet-400/50 hover:shadow-lg hover:shadow-violet-200/30 dark:hover:shadow-violet-500/10 hover:-translate-y-0.5'
            }`}
          >
            <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-widest text-violet-300/60 dark:text-violet-500/40 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
              B
            </span>
            <span className="block text-4xl font-serif leading-none mb-1 text-violet-300/30 dark:text-fuchsia-400/25">&ldquo;</span>
            <p className="font-medium leading-relaxed text-[15px] -mt-4 text-slate-700 dark:text-violet-100">
              {battle.captionB.content}
            </p>
            <span className="block text-4xl font-serif leading-none text-right -mb-2 text-violet-300/30 dark:text-fuchsia-400/25">&rdquo;</span>
          </button>
        </div>
      ) : (
        <div className="backdrop-blur-sm rounded-2xl p-10 border text-center
          bg-white/70 border-violet-100/50
          dark:bg-white/[0.06] dark:border-white/10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-violet-100 dark:bg-violet-500/20">
            <svg className="w-6 h-6 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="font-semibold mb-1 text-slate-700 dark:text-violet-200">Log in to vote</p>
          <p className="text-sm text-slate-400 dark:text-violet-400/60">Sign in to pick the funnier caption</p>
        </div>
      )}
    </div>
  )
}
