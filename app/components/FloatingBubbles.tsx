// Static server component — no 'use client' needed

type Bubble = {
  id: number
  left: string
  size: number
  dur: number
  delay: string
  opacity: number
  variant: 'left' | 'right' | 'round'
  lines: 0 | 1 | 2
}

const BUBBLES: Bubble[] = [
  { id:  1, left:  '3%', size: 38, dur: 20, delay:  '-7s', opacity: 0.5,  variant: 'left',  lines: 1 },
  { id:  2, left: '11%', size: 64, dur: 26, delay: '-18s', opacity: 0.35, variant: 'right', lines: 2 },
  { id:  3, left: '20%', size: 28, dur: 17, delay:  '-3s', opacity: 0.55, variant: 'round', lines: 0 },
  { id:  4, left: '30%', size: 80, dur: 29, delay: '-22s', opacity: 0.28, variant: 'left',  lines: 2 },
  { id:  5, left: '41%', size: 46, dur: 23, delay: '-11s', opacity: 0.45, variant: 'right', lines: 1 },
  { id:  6, left: '52%', size: 32, dur: 18, delay:  '-5s', opacity: 0.52, variant: 'round', lines: 0 },
  { id:  7, left: '61%', size: 70, dur: 25, delay: '-15s', opacity: 0.32, variant: 'left',  lines: 2 },
  { id:  8, left: '71%', size: 42, dur: 21, delay:  '-9s', opacity: 0.48, variant: 'right', lines: 1 },
  { id:  9, left: '80%', size: 55, dur: 27, delay: '-20s', opacity: 0.38, variant: 'left',  lines: 2 },
  { id: 10, left: '89%', size: 30, dur: 16, delay:  '-2s', opacity: 0.55, variant: 'round', lines: 0 },
  { id: 11, left: '36%', size: 50, dur: 22, delay: '-13s', opacity: 0.42, variant: 'right', lines: 1 },
  { id: 12, left: '74%', size: 36, dur: 19, delay:  '-8s', opacity: 0.50, variant: 'left',  lines: 1 },
  { id: 13, left: '57%', size: 68, dur: 28, delay: '-24s', opacity: 0.30, variant: 'right', lines: 2 },
  { id: 14, left: '25%', size: 34, dur: 15, delay: '-10s', opacity: 0.52, variant: 'round', lines: 0 },
]

// viewBox: 60×52 for bubbles with tail, 60×42 for round
function BubbleSVG({ size, opacity, variant, lines }: Pick<Bubble, 'size' | 'opacity' | 'variant' | 'lines'>) {
  const isRound = variant === 'round'
  const vbH     = isRound ? 42 : 52
  const bodyH   = isRound ? 42 : 40
  const rendH   = Math.round(size * (vbH / 60))

  const pathLeft  = 'M8 0 H52 Q60 0 60 8 V32 Q60 40 52 40 H22 L10 52 L13 40 H8 Q0 40 0 32 V8 Q0 0 8 0 Z'
  const pathRight = 'M8 0 H52 Q60 0 60 8 V32 Q60 40 52 40 H47 L50 52 L38 40 H8 Q0 40 0 32 V8 Q0 0 8 0 Z'
  const pathRound = 'M8 0 H52 Q60 0 60 8 V34 Q60 42 52 42 H8 Q0 42 0 34 V8 Q0 0 8 0 Z'
  const d = variant === 'right' ? pathRight : isRound ? pathRound : pathLeft

  const lineY1 = Math.round(bodyH * 0.38)
  const lineY2 = Math.round(bodyH * 0.62)

  return (
    <svg
      width={size}
      height={rendH}
      viewBox={`0 0 60 ${vbH}`}
      fill="none"
      style={{ opacity }}
      aria-hidden="true"
    >
      <path d={d} strokeWidth="1.8" strokeLinejoin="round" className="bubble-path" />
      {lines >= 1 && (
        <line x1="10" y1={lineY1} x2="50" y2={lineY1} strokeWidth="2" strokeLinecap="round" className="bubble-line" />
      )}
      {lines >= 2 && (
        <line x1="10" y1={lineY2} x2="38" y2={lineY2} strokeWidth="2" strokeLinecap="round" className="bubble-line" />
      )}
    </svg>
  )
}

export default function FloatingBubbles() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {BUBBLES.map(b => (
        <div
          key={b.id}
          className="absolute bottom-[-120px]"
          style={{
            left: b.left,
            animationName: 'bubble-float',
            animationDuration: `${b.dur}s`,
            animationDelay: b.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
          }}
        >
          <BubbleSVG size={b.size} opacity={b.opacity} variant={b.variant} lines={b.lines} />
        </div>
      ))}
    </div>
  )
}
