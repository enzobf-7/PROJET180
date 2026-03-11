'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Message } from './page'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#060606',
  surface: '#0F0F0F',
  sidebar: '#080808',
  border:  '#1E1E1E',
  muted:   '#484848',
  dimmed:  '#161616',
  text:    '#F0F0F0',
  accent:  '#3A86FF',
  accentL: '#2B75EE',
  gold:    '#C9A84C',
}
const D = { fontFamily: '"Barlow Condensed", sans-serif' } as const
const M = { fontFamily: '"JetBrains Mono", monospace' }    as const

// ─── Types ────────────────────────────────────────────────────────────────────
interface Gamification {
  xp_total:       number
  current_streak: number
  longest_streak: number
  level:          number
}

interface Props {
  jourX:           number
  firstName:       string
  userId:          string
  gamification:    Gamification
  initialMessages: Message[]
  onboardingDate:  string | null
}

import { getCurrentLevel } from '@/lib/levels'

function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  if (isToday)     return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (isYesterday) return `Hier · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function fmtDay(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  if (isToday)     return "Aujourd'hui"
  if (isYesterday) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function MessagerieClient({
  jourX, firstName, userId, gamification, initialMessages, onboardingDate,
}: Props) {
  const router        = useRouter()
  const [messages, setMessages]   = useState<Message[]>(initialMessages)
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const bottomRef     = useRef<HTMLDivElement>(null)
  const textareaRef   = useRef<HTMLTextAreaElement>(null)

  const daysPct   = Math.round((jourX / 180) * 100)
  const level     = getCurrentLevel(gamification.xp_total)

  const navItems = [
    { label: 'Dashboard',  href: '/dashboard',  active: false },
    { label: 'Programme',  href: '/programme',  active: false },
    { label: 'Messagerie', href: '/messagerie', active: true  },
    { label: 'Profil',     href: '/profil',     active: false },
  ]

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    const channel  = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || sending) return

    setSending(true)
    setInput('')

    const supabase  = createClient()
    // Fetch Robin's admin ID to send message to him
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single()

    if (!adminProfile) {
      setSending(false)
      return
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id:    userId,
        recipient_id: adminProfile.id,
        content:      trimmed,
        read:         false,
      })
      .select()
      .single()

    if (!error && data) {
      setMessages(prev => [...prev, data as Message])
    }
    setSending(false)
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      await sendMessage()
    }
  }

  async function handleSignOut() {
    setSignOutLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // ── Group messages by day ──────────────────────────────────────────────────
  type DayGroup = { day: string; msgs: Message[] }
  const groups: DayGroup[] = []
  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString()
    const last = groups[groups.length - 1]
    if (!last || last.day !== day) {
      groups.push({ day, msgs: [msg] })
    } else {
      last.msgs.push(msg)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0,
        background: C.sidebar, borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, background: C.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ ...D, fontWeight: 900, fontSize: '14px', color: 'white', letterSpacing: '0.05em' }}>P180</span>
            </div>
            <div>
              <div style={{ ...D, fontWeight: 900, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: C.text, lineHeight: 1.1 }}>
                Projet
              </div>
              <div style={{ ...D, fontWeight: 900, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: C.accent, lineHeight: 1.1 }}>
                180
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' as const }}>
          {navItems.map(item => (
            <a key={item.href} href={item.href} style={{
              display: 'block',
              padding: '9px 12px',
              marginBottom: 2,
              ...D,
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              textDecoration: 'none',
              color:      item.active ? C.text : C.muted,
              background: item.active ? C.border : 'transparent',
              borderLeft: item.active ? `2px solid ${C.accent}` : '2px solid transparent',
            }}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Programme bar */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ ...D, fontWeight: 700, fontSize: '9px', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase' as const, marginBottom: 8 }}>
            Jour {jourX} / 180
          </div>
          <div style={{ height: 2, background: C.border }}>
            <div style={{ height: '100%', width: `${daysPct}%`, background: C.accent }} />
          </div>
        </div>

        {/* User footer */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, flexShrink: 0, background: C.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ ...D, fontWeight: 900, fontSize: '13px', color: 'white' }}>
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...D, fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {firstName}
            </div>
            <div style={{ ...D, fontWeight: 700, fontSize: '9px', letterSpacing: '0.15em', color: C.accent, textTransform: 'uppercase' as const }}>
              {level.name}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signOutLoading}
            title="Déconnexion"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '18px', lineHeight: 1, padding: 4 }}
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main style={{
        flex: 1, marginLeft: 220,
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
      }}>

        {/* Header */}
        <header style={{
          flexShrink: 0,
          background: 'rgba(8,8,15,0.95)', backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ height: 2, background: C.dimmed }}>
            <div style={{ height: '100%', width: `${daysPct}%`, background: C.accent }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 32px' }}>
            {/* Robin avatar */}
            <div style={{
              width: 36, height: 36, flexShrink: 0, background: C.dimmed,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ ...D, fontWeight: 900, fontSize: '14px', color: C.text }}>R</span>
            </div>
            <div>
              <div style={{ ...D, fontWeight: 900, fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.text, lineHeight: 1 }}>
                Robin Duplouis
              </div>
              <div style={{ ...D, fontWeight: 700, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: C.accent, marginTop: 2 }}>
                Votre coach — Projet180
              </div>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: 'auto' as const,
          padding: '24px 32px',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          {messages.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <div style={{
                width: 60, height: 60, background: C.dimmed,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ ...D, fontWeight: 900, fontSize: '24px', color: C.muted }}>R</span>
              </div>
              <div style={{ ...D, fontWeight: 900, fontSize: '16px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: C.text }}>
                Messagerie directe
              </div>
              <div style={{ ...D, fontWeight: 500, fontSize: '13px', color: C.muted, textAlign: 'center' as const, maxWidth: 340 }}>
                Envoyez un message à Robin pour toute question sur votre programme, vos habitudes ou votre progression.
              </div>
            </div>
          ) : (
            <>
              {groups.map((group) => (
                <div key={group.day}>
                  {/* Day separator */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    margin: '24px 0 16px',
                  }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{ ...D, fontWeight: 700, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: C.muted }}>
                      {fmtDay(group.msgs[0].created_at)}
                    </span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                  </div>

                  {/* Messages */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {group.msgs.map((msg, i) => {
                      const isMe   = msg.sender_id === userId
                      const prev   = group.msgs[i - 1]
                      const isSameAuthorAsPrev = prev && prev.sender_id === msg.sender_id

                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: isMe ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            gap: 10,
                            marginTop: isSameAuthorAsPrev ? 2 : 12,
                          }}
                        >
                          {/* Avatar */}
                          {!isMe && !isSameAuthorAsPrev && (
                            <div style={{
                              width: 28, height: 28, flexShrink: 0, background: C.dimmed,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <span style={{ ...D, fontWeight: 900, fontSize: '11px', color: C.text }}>R</span>
                            </div>
                          )}
                          {!isMe && isSameAuthorAsPrev && (
                            <div style={{ width: 28, flexShrink: 0 }} />
                          )}

                          {/* Bubble */}
                          <div style={{
                            maxWidth: '65%',
                            background: isMe ? C.accent : C.surface,
                            border: `1px solid ${isMe ? 'transparent' : C.border}`,
                            padding: '10px 14px',
                          }}>
                            <div style={{
                              ...M, fontSize: '13px',
                              color: C.text, lineHeight: 1.55,
                              whiteSpace: 'pre-wrap' as const,
                              wordBreak: 'break-word' as const,
                            }}>
                              {msg.content}
                            </div>
                            <div style={{
                              ...M, fontSize: '9px', color: isMe ? 'rgba(255,255,255,0.5)' : C.muted,
                              marginTop: 5, textAlign: isMe ? 'right' as const : 'left' as const,
                            }}>
                              {fmtTime(msg.created_at)}
                              {isMe && (
                                <span style={{ marginLeft: 6 }}>
                                  {msg.read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{
          flexShrink: 0,
          borderTop: `1px solid ${C.border}`,
          background: C.sidebar,
          padding: '16px 32px',
        }}>
          <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-end',
            background: C.surface, border: `1px solid ${C.border}`,
            padding: '10px 14px',
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez un message à Robin... (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)"
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                resize: 'none', overflow: 'hidden',
                ...M, fontSize: '13px', color: C.text, lineHeight: 1.55,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              style={{
                flexShrink: 0,
                background: input.trim() && !sending ? C.accent : C.dimmed,
                border: 'none', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
                color: 'white', padding: '8px 16px',
                ...D, fontWeight: 700, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                transition: 'background 0.15s',
                alignSelf: 'flex-end',
              }}
            >
              {sending ? '...' : 'Envoyer'}
            </button>
          </div>
          <div style={{ ...D, fontWeight: 700, fontSize: '9px', letterSpacing: '0.1em', color: C.muted, marginTop: 8 }}>
            Entrée pour envoyer · Maj+Entrée pour aller à la ligne
          </div>
        </div>
      </main>
    </div>
  )
}
