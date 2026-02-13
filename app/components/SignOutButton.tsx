'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-medium text-stone-400 hover:text-stone-600 bg-stone-100/80 hover:bg-stone-200/80 rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer active:scale-95"
    >
      Sign out
    </button>
  )
}
