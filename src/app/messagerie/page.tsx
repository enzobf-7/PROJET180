import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import MessagerieClient from './MessagerieClient'

export default async function MessageriePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const admin = createAdminClient()

  const [
    { data: onboarding },
    { data: questionnaire },
    { data: gamification },
    { data: messages },
  ] = await Promise.all([
    admin.from('onboarding_progress').select('completed_at').eq('user_id', user.id).single(),
    admin.from('questionnaire_responses').select('responses').eq('client_id', user.id).single(),
    admin.from('gamification').select('xp_total, current_streak, longest_streak, level').eq('client_id', user.id).single(),
    admin
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: true })
      .limit(200),
  ])

  // Jour X / 180
  let jourX = 1
  if (onboarding?.completed_at) {
    const diff = Math.floor((Date.now() - new Date(onboarding.completed_at).getTime()) / 86400000) + 1
    jourX = Math.min(Math.max(diff, 1), 180)
  }

  const responses = (questionnaire?.responses as Record<string, unknown>) ?? {}
  const rawName   = (responses.full_name as string) ?? ''
  const firstName = rawName.split(' ')[0] || 'Client'

  return (
    <MessagerieClient
      jourX={jourX}
      firstName={firstName}
      userId={user.id}
      gamification={
        (gamification as { xp_total: number; current_streak: number; longest_streak: number; level: number })
        ?? { xp_total: 0, current_streak: 0, longest_streak: 0, level: 1 }
      }
      initialMessages={(messages ?? []) as Message[]}
      onboardingDate={onboarding?.completed_at ?? null}
    />
  )
}

export type Message = {
  id:           string
  sender_id:    string
  recipient_id: string
  content:      string
  read:         boolean
  created_at:   string
}
