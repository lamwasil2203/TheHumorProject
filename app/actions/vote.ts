'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitVote(captionId: string, voteValue: number) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('You must be logged in to vote')
  }

  // Check for existing vote by this user on this caption
  const { data: existing } = await supabase
    .from('caption_votes')
    .select('id, vote_value')
    .eq('profile_id', user.id)
    .eq('caption_id', captionId)
    .maybeSingle()

  if (existing) {
    if (existing.vote_value === voteValue) {
      // Same vote again — toggle off (delete)
      await supabase.from('caption_votes').delete().eq('id', existing.id)
      revalidatePath('/')
      return { voteState: 0 }
    } else {
      // Different vote — update
      await supabase
        .from('caption_votes')
        .update({
          vote_value: voteValue,
          modified_datetime_utc: new Date().toISOString(),
        })
        .eq('id', existing.id)
      revalidatePath('/')
      return { voteState: voteValue }
    }
  }

  // No existing vote — insert new row
  const { error: insertError } = await supabase.from('caption_votes').insert({
    caption_id: captionId,
    profile_id: user.id,
    vote_value: voteValue,
    created_datetime_utc: new Date().toISOString(),
  })

  if (insertError) {
    throw new Error('Failed to save vote: ' + insertError.message)
  }

  revalidatePath('/')
  return { voteState: voteValue }
}
