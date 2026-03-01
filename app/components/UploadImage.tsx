'use client'

import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'

const API_BASE = 'https://api.almostcrackd.ai'
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic']

type Caption = {
  id: string
  content: string
  [key: string]: unknown
}

type Status = 'idle' | 'uploading' | 'done' | 'error'

async function getToken(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return session.access_token
}

export default function UploadImage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [step, setStep] = useState('')
  const [captions, setCaptions] = useState<Caption[]>([])
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}`)
      setStatus('error')
      return
    }

    setStatus('uploading')
    setError('')
    setCaptions([])

    try {
      const token = await getToken()
      const authHeader = { Authorization: `Bearer ${token}` }

      // Step 1: Generate presigned URL
      setStep('Generating upload URL…')
      const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type }),
      })
      if (!presignRes.ok) throw new Error(`Presign failed: ${presignRes.status}`)
      const { presignedUrl, cdnUrl } = await presignRes.json()

      // Step 2: Upload image bytes to presigned URL
      setStep('Uploading image…')
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!putRes.ok) throw new Error(`Upload failed: ${putRes.status}`)

      // Step 3: Register image URL in pipeline
      setStep('Registering image…')
      const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      })
      if (!registerRes.ok) throw new Error(`Register failed: ${registerRes.status}`)
      const { imageId } = await registerRes.json()

      // Step 4: Generate captions
      setStep('Generating captions…')
      const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      })
      if (!captionRes.ok) throw new Error(`Caption generation failed: ${captionRes.status}`)
      const result = await captionRes.json()

      setCaptions(Array.isArray(result) ? result : [])
      setStatus('done')
      setStep('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
      setStep('')
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function reset() {
    setStatus('idle')
    setError('')
    setCaptions([])
    setStep('')
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { reset(); setOpen(true) }}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200
          bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-sm shadow-violet-400/30
          hover:shadow-md hover:shadow-violet-400/40 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Upload
      </button>

      {/* Modal — rendered via portal so backdrop-blur on nav doesn't trap it */}
      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) { reset(); setOpen(false) } }}
        >
          <div className="w-full max-w-md rounded-3xl shadow-2xl border animate-scale-in
            bg-white dark:bg-[#110d1f] border-violet-100 dark:border-white/10 p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Upload Image</h2>
              <button
                onClick={() => { reset(); setOpen(false) }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Idle: drop zone */}
            {status === 'idle' && (
              <>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-500/30
                    py-12 flex flex-col items-center gap-3 cursor-pointer
                    hover:border-violet-400 dark:hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-500/10 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-violet-200">Click to select an image</p>
                    <p className="text-xs text-slate-400 dark:text-violet-400/60 mt-1">JPEG, PNG, WebP, GIF, HEIC</p>
                  </div>
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  className="hidden"
                  onChange={handleInputChange}
                />
              </>
            )}

            {/* Uploading: spinner + step */}
            {status === 'uploading' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-12 h-12 rounded-full border-4 border-violet-200 dark:border-violet-500/30 border-t-violet-500 dark:border-t-violet-400 animate-spin" />
                <p className="text-sm font-medium text-slate-600 dark:text-violet-300">{step}</p>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-5 mb-4">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Upload failed</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/70">{error}</p>
              </div>
            )}
            {status === 'error' && (
              <button
                onClick={reset}
                className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold border border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors cursor-pointer"
              >
                Try again
              </button>
            )}

            {/* Done: show captions */}
            {status === 'done' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-violet-200">
                    {captions.length} caption{captions.length !== 1 ? 's' : ''} generated
                  </p>
                </div>
                <ul className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                  {captions.map((c, i) => (
                    <li
                      key={c.id ?? i}
                      className="rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-violet-100
                        bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 leading-relaxed"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70 dark:text-violet-500/50 block mb-1">
                        Caption {i + 1}
                      </span>
                      {c.content}
                    </li>
                  ))}
                  {captions.length === 0 && (
                    <li className="text-sm text-slate-400 dark:text-violet-400/60 text-center py-4">
                      No captions returned.
                    </li>
                  )}
                </ul>
                <button
                  onClick={reset}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors cursor-pointer"
                >
                  Upload another
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
