'use client'

import { memo } from 'react'
import { C, D, M } from '@/lib/design-tokens'
import type { Habit } from '@/lib/types'

interface Props {
  habits: Habit[]
  completed: Set<string>
  loadingId: string | null
  firstName: string
  isMobile: boolean
  celebrateRing: boolean
  onToggle: (habitId: string) => void
}

export const CheckInCard = memo(function CheckInCard({ habits, completed, loadingId, firstName, isMobile, celebrateRing, onToggle }: Props) {
  const habitsOnly = habits.filter(h => h.category === 'habit')
  const missions = habits.filter(h => h.category === 'mission')
  const totalHabits = habits.length
  const completedCount = completed.size
  const completedPct = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0
  const allDone = totalHabits > 0 && completedCount === totalHabits

  const renderRow = (h: Habit, accentColor: string) => {
    const done = completed.has(h.id)
    const loading = loadingId === h.id
    return (
      <button key={h.id} className="p180-habit-row" onClick={() => onToggle(h.id)} disabled={loading} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', background: 'none', border: 'none', cursor: loading ? 'wait' : 'pointer',
        padding: '11px 24px',
        borderBottom: `1px solid ${C.border}`,
        transition: 'background 0.15s',
        opacity: loading ? 0.6 : 1,
      }}>
        <div style={{
          width: 22, height: 22, flexShrink: 0,
          borderRadius: 6,
          border: `2px solid ${done ? accentColor : C.muted}`,
          background: done ? accentColor : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
          ...(done ? { animation: 'p180-habit-check 0.35s cubic-bezier(0.34,1.56,0.64,1)' } : {}),
        }}>
          {done && <span style={{ color: 'white', fontSize: '13px', lineHeight: 1 }}>✓</span>}
        </div>
        <span style={{
          ...D, fontWeight: 600, fontSize: '14px', letterSpacing: '0.02em',
          color: done ? C.muted : C.text,
          textDecoration: done ? 'line-through' : 'none',
          textAlign: 'left',
          transition: 'color 0.2s, text-decoration 0.2s',
        }}>
          {h.name}
        </span>
      </button>
    )
  }

  return (
    <div className="p180-fade p180-card" style={{
      background: C.surface,
      border: `1px solid ${allDone ? C.green : C.border}`,
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Header with ring */}
      <div style={{
        padding: isMobile ? '18px 16px 14px' : '20px 24px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className={celebrateRing ? 'p180-ring-done' : ''} style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
            <svg width={48} height={48} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={24} cy={24} r={20} fill="none" stroke={C.dimmed} strokeWidth={3} />
              <circle cx={24} cy={24} r={20} fill="none" stroke={allDone ? C.greenL : C.accent} strokeWidth={3}
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - completedPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...M, fontWeight: 700, fontSize: '13px', color: allDone ? C.greenL : C.text,
            }}>
              {allDone ? '✓' : `${completedPct}%`}
            </div>
          </div>
          <div>
            <div style={{ ...D, fontWeight: 800, fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.text }}>
              Check-in du jour
            </div>
            <div style={{ ...M, fontSize: '10px', color: C.muted, marginTop: 2 }}>
              {completedCount}/{totalHabits} — {allDone ? 'Tout validé !' : `${totalHabits - completedCount} restant${totalHabits - completedCount > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </div>

      {/* Habits */}
      {habitsOnly.length > 0 && (
        <div>
          <div style={{ padding: '12px 24px 6px', ...D, fontWeight: 700, fontSize: '10px', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase' as const }}>
            Habitudes
          </div>
          {habitsOnly.map(h => renderRow(h, C.greenL))}
        </div>
      )}

      {/* Missions */}
      {missions.length > 0 && (
        <div>
          <div style={{ padding: '14px 24px 6px', ...D, fontWeight: 700, fontSize: '10px', letterSpacing: '0.2em', color: C.accent, textTransform: 'uppercase' as const }}>
            Missions
          </div>
          {missions.map(h => renderRow(h, C.accent))}
        </div>
      )}

      {/* All done */}
      {allDone && totalHabits > 0 && (
        <div style={{ padding: '16px 24px', textAlign: 'center', background: `${C.green}10` }}>
          <span style={{ ...D, fontWeight: 700, fontSize: '13px', color: C.greenL, letterSpacing: '0.08em' }}>
            ✓ Journée complète — bien joué {firstName} !
          </span>
        </div>
      )}
    </div>
  )
})
