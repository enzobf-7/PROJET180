import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TEST_EMAIL =
  process.env.SEED_TEST_USER_EMAIL || 'demo+p180-client@example.com'

export async function POST() {
  if (process.env.NEXT_PUBLIC_SEED_TEST_USER !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createAdminClient()

  // Get user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  const user = users.find(u => u.email === TEST_EMAIL)
  if (!user) {
    return NextResponse.json({ error: 'Test user not found' }, { status: 404 })
  }

  // Try update first (row may already exist from Stripe webhook / admin creation)
  const { data: existing } = await supabase
    .from('onboarding_progress')
    .select('client_id')
    .eq('client_id', user.id)
    .single()

  let error
  if (existing) {
    ;({ error } = await supabase
      .from('onboarding_progress')
      .update({ completed_at: new Date().toISOString() })
      .eq('client_id', user.id))
  } else {
    ;({ error } = await supabase
      .from('onboarding_progress')
      .insert({ client_id: user.id, completed_at: new Date().toISOString() }))
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok', client_id: user.id })
}
