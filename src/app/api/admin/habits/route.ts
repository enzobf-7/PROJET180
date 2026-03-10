import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function checkAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return { user, admin }
}

// GET /api/admin/habits?clientId=<id>
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { admin } = auth
  const clientId = request.nextUrl.searchParams.get('clientId')

  const query = admin
    .from('habits')
    .select('id, client_id, name, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true })

  if (clientId) {
    query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ habits: data ?? [] })
}

// POST /api/admin/habits  — body: { client_id, name }
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { admin } = auth
  const body = await request.json()
  const { client_id, name } = body

  if (!client_id || !name?.trim()) {
    return NextResponse.json({ error: 'client_id et nom requis.' }, { status: 400 })
  }

  // Get next sort_order
  const { data: existing } = await admin
    .from('habits')
    .select('sort_order')
    .eq('client_id', client_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await admin
    .from('habits')
    .insert({
      client_id,
      name: name.trim(),
      created_by: 'admin',
      is_active: true,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ habit: data })
}

// PATCH /api/admin/habits?id=<id>  — body: { is_active } or { name }
export async function PATCH(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { admin } = auth
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis.' }, { status: 400 })

  const body = await request.json()
  const updates: Record<string, unknown> = {}
  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active
  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim()

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour.' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ habit: data })
}

// DELETE /api/admin/habits?id=<id>
export async function DELETE(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { admin } = auth
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis.' }, { status: 400 })

  const { error } = await admin.from('habits').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
