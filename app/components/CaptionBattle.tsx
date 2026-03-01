'use client'

import { useState, useTransition, useMemo, useRef } from 'react'
import { submitVote } from '@/app/actions/vote'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CaptionWithVotes = {
  id: string
  content: string
  upvotes: number
  downvotes: number
  userVote: 0 | 1 | -1
}

export type ImageGroup = {
  imageUrl: string
  captions: CaptionWithVotes[]
}

type Props = {
  imageGroups: ImageGroup[]
  userId: string | null
}

type VoteState  = Record<string, 0 | 1 | -1>
type CountState = Record<string, { up: number; down: number }>
type BattlePair = { imageUrl: string; caption: CaptionWithVotes }

// ─── Shared card shell ─────────────────────────────────────────────────────────

const cardCls =
  'rounded-3xl overflow-hidden border ' +
  'bg-white border-violet-200/50 shadow-[0_4px_32px_rgba(109,40,217,0.06)] ' +
  'dark:bg-white/[0.03] dark:border-violet-500/[0.16] ' +
  'dark:shadow-[0_0_0_1px_rgba(109,40,217,0.1),0_8px_48px_rgba(0,0,0,0.55)]'

// ─── ImageCard (feed view) ─────────────────────────────────────────────────────

function ImageCard({ group, userId, votes, counts, onVote }: {
  group: ImageGroup
  userId: string | null
  votes: VoteState
  counts: CountState
  onVote: (captionId: string, value: 1 | -1) => void
}) {
  return (
    <div className={cardCls}>
      {/* Image */}
      <div className="w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
        <img src={group.imageUrl} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Captions */}
      <div className="p-4 space-y-2.5">
        {!userId && (
          <p className="text-xs text-center py-1
            text-violet-600 dark:text-violet-400/70">
            <span className="font-semibold">Log in</span> to vote on captions
          </p>
        )}
        {group.captions.map(caption => {
          const userVote = votes[caption.id] ?? 0
          const c = counts[caption.id] ?? { up: caption.upvotes, down: caption.downvotes }
          const score = c.up - c.down
          return (
            <div key={caption.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3
                bg-slate-50 border border-slate-200/80
                dark:bg-white/[0.04] dark:border-violet-500/[0.1]">
              <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-violet-100/80">
                "{caption.content}"
              </p>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Upvote */}
                <button
                  disabled={!userId}
                  onClick={() => userId && onVote(caption.id, 1)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border ${
                    userVote === 1
                      ? 'bg-green-500 text-white border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                      : userId
                      ? 'bg-white dark:bg-white/[0.05] text-slate-400 dark:text-white/25 border-slate-200 dark:border-violet-500/[0.12] hover:text-green-600 hover:border-green-300 dark:hover:text-green-400 dark:hover:border-green-500/40 cursor-pointer'
                      : 'text-slate-200 dark:text-white/10 bg-white dark:bg-transparent border-slate-100 dark:border-white/[0.04]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="tabular-nums">{c.up}</span>
                </button>

                {/* Downvote */}
                <button
                  disabled={!userId}
                  onClick={() => userId && onVote(caption.id, -1)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border ${
                    userVote === -1
                      ? 'bg-red-500 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                      : userId
                      ? 'bg-white dark:bg-white/[0.05] text-slate-400 dark:text-white/25 border-slate-200 dark:border-violet-500/[0.12] hover:text-red-600 hover:border-red-300 dark:hover:text-red-400 dark:hover:border-red-500/40 cursor-pointer'
                      : 'text-slate-200 dark:text-white/10 bg-white dark:bg-transparent border-slate-100 dark:border-white/[0.04]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="tabular-nums">{c.down}</span>
                </button>

                {/* Score */}
                <span className={`text-xs font-bold tabular-nums w-6 text-right ${
                  score > 0 ? 'text-green-500 dark:text-green-400'
                  : score < 0 ? 'text-red-400 dark:text-red-500'
                  : 'text-slate-300 dark:text-white/20'
                }`}>
                  {score > 0 ? '+' : ''}{score}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── BattleCard (game mode — one caption at a time, must vote to advance) ──────

function BattleCard({ pair, index, total, userId, userVote, counts, onVote, onNext }: {
  pair: BattlePair
  index: number
  total: number
  userId: string | null
  userVote: 0 | 1 | -1
  counts: CountState
  onVote: (captionId: string, value: 1 | -1) => void
  onNext: () => void
}) {
  const [localVote, setLocalVote] = useState<0 | 1 | -1>(userVote)
  const [exitStyle, setExitStyle] = useState<React.CSSProperties>({})
  const advancedRef = useRef(false)

  function triggerExit(dir: 1 | -1) {
    if (advancedRef.current) return
    advancedRef.current = true
    setExitStyle({
      transform: `translateX(${dir > 0 ? '110%' : '-110%'}) rotate(${dir > 0 ? '10deg' : '-10deg'})`,
      opacity: '0',
      transition: 'transform 0.32s ease-in, opacity 0.32s ease-in',
    })
    setTimeout(onNext, 340)
  }

  function handleVote(value: 1 | -1) {
    if (!userId || advancedRef.current) return
    setLocalVote(value)
    onVote(pair.caption.id, value)
    setTimeout(() => triggerExit(value), 520)
  }

  const c = counts[pair.caption.id] ?? { up: pair.caption.upvotes, down: pair.caption.downvotes }
  const hasVoted = localVote !== 0

  return (
    <div style={exitStyle} className="animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="flex-1 h-0.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500
              shadow-[0_0_8px_rgba(139,92,246,0.6)]"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
        <span className="text-xs tabular-nums font-medium text-slate-400 dark:text-violet-400/40 shrink-0">
          {index + 1} / {total}
        </span>
      </div>

      {/* Card */}
      <div className={`${cardCls} transition-all duration-300 ${
        localVote === 1
          ? 'dark:border-green-500/40 dark:shadow-[0_0_0_1px_rgba(34,197,94,0.2),0_8px_48px_rgba(0,0,0,0.55),0_0_48px_rgba(34,197,94,0.08)]'
          : localVote === -1
          ? 'dark:border-red-500/40 dark:shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_8px_48px_rgba(0,0,0,0.55),0_0_48px_rgba(239,68,68,0.08)]'
          : ''
      }`}>

        {/* Image */}
        <div className="w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/[0.04] relative">
          <img src={pair.imageUrl} alt="" className="w-full h-full object-cover" />
          {localVote !== 0 && (
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              localVote === 1 ? 'bg-green-500/10' : 'bg-red-500/10'
            }`} />
          )}
        </div>

        <div className="p-6">
          {/* Caption */}
          <p className="text-base leading-relaxed mb-8 text-center min-h-[3.5rem]
            text-slate-800 dark:text-violet-50/90">
            "{pair.caption.content}"
          </p>

          {userId ? (
            <>
              <div className="flex gap-4">
                {/* Cross */}
                <button
                  onClick={() => handleVote(-1)}
                  disabled={advancedRef.current}
                  className={`flex-1 flex flex-col items-center justify-center gap-2.5 py-5 rounded-2xl font-semibold transition-all duration-200 border ${
                    localVote === -1
                      ? 'bg-red-500 text-white border-red-500 shadow-[0_0_32px_rgba(239,68,68,0.5)] scale-[0.97]'
                      : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-violet-500/[0.12] text-slate-400 dark:text-white/30 hover:bg-red-50 dark:hover:bg-red-500/[0.08] hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 hover:scale-[1.02] active:scale-[0.97] cursor-pointer'
                  }`}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm tabular-nums">{c.down}</span>
                </button>

                {/* Tick */}
                <button
                  onClick={() => handleVote(1)}
                  disabled={advancedRef.current}
                  className={`flex-1 flex flex-col items-center justify-center gap-2.5 py-5 rounded-2xl font-semibold transition-all duration-200 border ${
                    localVote === 1
                      ? 'bg-green-500 text-white border-green-500 shadow-[0_0_32px_rgba(34,197,94,0.5)] scale-[0.97]'
                      : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-violet-500/[0.12] text-slate-400 dark:text-white/30 hover:bg-green-50 dark:hover:bg-green-500/[0.08] hover:text-green-500 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-500/30 hover:scale-[1.02] active:scale-[0.97] cursor-pointer'
                  }`}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm tabular-nums">{c.up}</span>
                </button>
              </div>

              {!hasVoted && (
                <p className="text-xs text-center mt-4 text-slate-400 dark:text-violet-400/30">
                  Vote to continue
                </p>
              )}
            </>
          ) : (
            <div className="rounded-2xl px-4 py-5 text-center
              bg-violet-50 border border-violet-100
              dark:bg-violet-500/[0.07] dark:border-violet-500/[0.15]">
              <p className="text-sm text-violet-700 dark:text-violet-300">
                <span className="font-semibold">Log in</span> to vote
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab pill ──────────────────────────────────────────────────────────────────

const tabBarCls =
  'flex gap-1 p-1 rounded-2xl ' +
  'bg-slate-100/80 border border-slate-200/60 ' +
  'dark:bg-white/[0.03] dark:border-violet-500/[0.1]'

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
        active
          ? 'bg-white border border-slate-200/80 text-violet-700 shadow-sm ' +
            'dark:bg-violet-500/20 dark:border-violet-500/30 dark:text-violet-300 ' +
            'dark:shadow-[0_0_16px_rgba(139,92,246,0.2)]'
          : 'text-slate-500 dark:text-violet-400/40 hover:text-slate-700 dark:hover:text-violet-300 cursor-pointer'
      }`}
    >
      {children}
    </button>
  )
}

// ─── CaptionFeed ───────────────────────────────────────────────────────────────

export default function CaptionFeed({ imageGroups, userId }: Props) {
  const [votes, setVotes] = useState<VoteState>(() => {
    const init: VoteState = {}
    for (const g of imageGroups) for (const c of g.captions) init[c.id] = c.userVote
    return init
  })
  const [counts, setCounts] = useState<CountState>(() => {
    const init: CountState = {}
    for (const g of imageGroups) for (const c of g.captions) init[c.id] = { up: c.upvotes, down: c.downvotes }
    return init
  })

  const [, startTransition] = useTransition()
  const [tab,          setTab]          = useState<'feed' | 'game' | 'leaderboard'>('feed')
  const [sort,         setSort]         = useState<'new' | 'top' | 'unvoted'>('new')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [spotlightGroup, setSpotlightGroup] = useState<ImageGroup | null>(null)
  const [battleIndex,  setBattleIndex]  = useState(0)

  // Shuffled pairs for game mode — stable for the session
  const battlePairs = useMemo<BattlePair[]>(() => {
    const pairs = imageGroups.flatMap(g => g.captions.map(c => ({ imageUrl: g.imageUrl, caption: c })))
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]]
    }
    return pairs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleVote(captionId: string, value: 1 | -1) {
    if (!userId) return
    const prev = votes[captionId] ?? 0
    const prevCounts = counts[captionId] ?? { up: 0, down: 0 }
    let newVote: 0 | 1 | -1
    let newUp = prevCounts.up, newDown = prevCounts.down
    if (prev === value) {
      newVote = 0
      if (value === 1) newUp -= 1; else newDown -= 1
    } else {
      if (prev === 1) newUp -= 1
      if (prev === -1) newDown -= 1
      newVote = value
      if (value === 1) newUp += 1; else newDown += 1
    }
    setVotes(v => ({ ...v, [captionId]: newVote }))
    setCounts(c => ({ ...c, [captionId]: { up: newUp, down: newDown } }))
    startTransition(async () => {
      try { await submitVote(captionId, value) } catch {
        setVotes(v => ({ ...v, [captionId]: prev }))
        setCounts(c => ({ ...c, [captionId]: prevCounts }))
      }
    })
  }

  const feedGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let groups = query
      ? imageGroups
          .map(g => ({ ...g, captions: g.captions.filter(c => c.content.toLowerCase().includes(query)) }))
          .filter(g => g.captions.length > 0)
      : imageGroups
    if (sort === 'top') {
      return [...groups].sort((a, b) => {
        const top = (g: ImageGroup) => Math.max(...g.captions.map(c =>
          (counts[c.id]?.up ?? c.upvotes) - (counts[c.id]?.down ?? c.downvotes)
        ))
        return top(b) - top(a)
      })
    }
    if (sort === 'unvoted') return groups.filter(g => g.captions.some(c => (votes[c.id] ?? 0) === 0))
    return groups
  }, [imageGroups, sort, searchQuery, votes, counts])

  const leaderboard = useMemo(() =>
    imageGroups
      .flatMap(g => g.captions.map(c => ({
        ...c, imageUrl: g.imageUrl,
        score: (counts[c.id]?.up ?? c.upvotes) - (counts[c.id]?.down ?? c.downvotes),
      })))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
  , [imageGroups, counts])

  function handleRandom() {
    const pool = feedGroups.length > 0 ? feedGroups : imageGroups
    setSpotlightGroup(pool[Math.floor(Math.random() * pool.length)])
  }

  const cardProps = { userId, votes, counts, onVote: handleVote }
  const currentPair = battlePairs[battleIndex]
  const battleDone  = battleIndex >= battlePairs.length

  if (imageGroups.length === 0) {
    return (
      <div className="text-center py-24 animate-slide-up">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
          bg-violet-100 dark:bg-violet-500/10">
          <svg className="w-7 h-7 text-violet-300 dark:text-violet-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-semibold text-slate-500 dark:text-violet-300/60">No captions yet</p>
        <p className="text-sm mt-1 text-slate-400 dark:text-violet-400/30">Upload an image to get started</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">

      {/* ── Main tabs ── */}
      <div className={`${tabBarCls} mb-6`}>
        <TabBtn active={tab === 'feed'}        onClick={() => setTab('feed')}>Feed</TabBtn>
        <TabBtn active={tab === 'game'}        onClick={() => setTab('game')}>Game</TabBtn>
        <TabBtn active={tab === 'leaderboard'} onClick={() => setTab('leaderboard')}>Leaderboard</TabBtn>
      </div>

      {/* ════════════════ FEED TAB ════════════════ */}
      {tab === 'feed' && (
        <div className="space-y-5">

          {/* Sort + Random */}
          <div className="flex items-center gap-2">
            <div className={`${tabBarCls} flex-1`}>
              {(['new', 'top', 'unvoted'] as const).map(s => (
                <TabBtn key={s} active={sort === s} onClick={() => { setSort(s); setSpotlightGroup(null) }}>
                  {s}
                </TabBtn>
              ))}
            </div>
            <button
              onClick={handleRandom}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer
                bg-slate-100/80 border border-slate-200/60 text-slate-600
                hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600
                dark:bg-white/[0.03] dark:border-violet-500/[0.1] dark:text-violet-400/60
                dark:hover:bg-violet-500/[0.08] dark:hover:border-violet-500/25 dark:hover:text-violet-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Random
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400 dark:text-violet-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSpotlightGroup(null) }}
              placeholder="Search captions…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all
                bg-white border-slate-200/80 text-slate-700 placeholder-slate-400
                focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20
                dark:bg-white/[0.03] dark:border-violet-500/[0.12] dark:text-violet-100 dark:placeholder-violet-400/30
                dark:focus:border-violet-500/50 dark:focus:ring-violet-500/10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-violet-300 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Random spotlight */}
          {spotlightGroup && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400/60">
                  Random pick
                </p>
                <button onClick={() => setSpotlightGroup(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-violet-300 transition-colors cursor-pointer">
                  ← Back to feed
                </button>
              </div>
              <ImageCard group={spotlightGroup} {...cardProps} />
              <button onClick={handleRandom}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer
                  border border-violet-200 text-violet-600 hover:bg-violet-50
                  dark:border-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/[0.08]">
                Another random →
              </button>
            </div>
          )}

          {/* Feed list */}
          {!spotlightGroup && (
            <div className="space-y-8">
              {feedGroups.length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-sm text-slate-400 dark:text-violet-400/40">
                    {sort === 'unvoted' ? "You've voted on everything!" : `No captions match "${searchQuery}"`}
                  </p>
                </div>
              ) : (
                feedGroups.map((group, gi) => <ImageCard key={gi} group={group} {...cardProps} />)
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════ GAME TAB ════════════════ */}
      {tab === 'game' && (
        <>
          {battleDone ? (
            <div className="text-center py-24 animate-fade-in">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                bg-green-100 dark:bg-green-500/10">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-slate-700 dark:text-violet-200 mb-1">All done!</p>
              <p className="text-sm text-slate-400 dark:text-violet-400/40 mb-6">
                You've voted on all {battlePairs.length} captions
              </p>
              <button
                onClick={() => setBattleIndex(0)}
                className="px-6 py-2.5 rounded-2xl text-sm font-semibold cursor-pointer
                  bg-gradient-to-r from-violet-500 to-purple-600 text-white
                  shadow-[0_0_24px_rgba(139,92,246,0.4)] hover:shadow-[0_0_32px_rgba(139,92,246,0.55)]
                  transition-shadow duration-200"
              >
                Start over
              </button>
            </div>
          ) : (
            <BattleCard
              key={battleIndex}
              pair={currentPair}
              index={battleIndex}
              total={battlePairs.length}
              userId={userId}
              userVote={votes[currentPair.caption.id] ?? 0}
              counts={counts}
              onVote={handleVote}
              onNext={() => setBattleIndex(i => i + 1)}
            />
          )}
        </>
      )}

      {/* ════════════════ LEADERBOARD TAB ════════════════ */}
      {tab === 'leaderboard' && (
        <div className={`${cardCls}`}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200/60 dark:border-violet-500/[0.1]">
            <h2 className="text-sm font-bold text-slate-700 dark:text-violet-200">Top Captions</h2>
            <p className="text-xs mt-0.5 text-slate-400 dark:text-violet-400/40">
              Top 100 ranked by net score across all images
            </p>
          </div>

          <ol className="divide-y divide-slate-100 dark:divide-violet-500/[0.07]">
            {leaderboard.map((caption, i) => (
              <li key={caption.id} className="flex items-center gap-4 px-5 py-4 transition-colors
                hover:bg-slate-50 dark:hover:bg-violet-500/[0.04]">
                <span className={`text-xs font-bold w-7 shrink-0 tabular-nums text-right ${
                  i === 0 ? 'text-yellow-500 dark:text-yellow-400'
                  : i === 1 ? 'text-slate-400 dark:text-slate-500'
                  : i === 2 ? 'text-amber-600 dark:text-amber-500'
                  : 'text-slate-300 dark:text-white/15'
                }`}>
                  #{i + 1}
                </span>
                <img
                  src={caption.imageUrl} alt=""
                  className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-white/[0.05]"
                />
                <p className="flex-1 text-sm leading-relaxed line-clamp-2 text-slate-600 dark:text-violet-100/70">
                  {caption.content}
                </p>
                <span className={`text-sm font-bold tabular-nums shrink-0 ${
                  caption.score > 0 ? 'text-green-500 dark:text-green-400'
                  : caption.score < 0 ? 'text-red-400 dark:text-red-500'
                  : 'text-slate-300 dark:text-white/15'
                }`}>
                  {caption.score > 0 ? '+' : ''}{caption.score}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
