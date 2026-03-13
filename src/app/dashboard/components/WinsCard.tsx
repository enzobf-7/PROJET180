'use client'

import { memo } from 'react'
import { C, D, M } from '@/lib/design-tokens'
import type { Win } from '@/lib/types'

interface Props {
  wins: Win[]
  weekNumber: number
  winInput: string
  winSubmitting: boolean
  onWinInputChange: (value: string) => void
  onAddWin: () => void
}

export const WinsCard = memo(function WinsCard({ wins, weekNumber, winInput, winSubmitting, onWinInputChange, onAddWin }: Props) {
  return (
    <div className="p180-fade p180-card" style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '18px 20px',
      animationDelay: '0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ ...D, fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.text }}>
          Wins de la semaine
        </div>
        <span style={{ ...M, fontSize: '10px', color: C.muted }}>S{weekNumber}</span>
      </div>
      {wins.length === 0 && (
        <div style={{ ...M, fontSize: '11px', color: C.muted, padding: '8px 0' }}>Pas encore de win cette semaine</div>
      )}
      {wins.map((w, i) => (
        <div key={w.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '6px 0',
          borderBottom: i < wins.length - 1 ? `1px solid ${C.border}` : 'none',
        }}>
          <span style={{ color: C.greenL, fontSize: '12px', lineHeight: '18px', flexShrink: 0 }}>✦</span>
          <span style={{ ...D, fontWeight: 500, fontSize: '13px', color: C.text, lineHeight: '18px' }}>
            {w.content}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          value={winInput}
          onChange={e => onWinInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAddWin()}
          placeholder="Ajouter une victoire..."
          className="p180-input-focus"
          style={{
            flex: 1, background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 6, padding: '8px 12px',
            ...D, fontWeight: 500, fontSize: '13px', color: C.text,
          }}
        />
        <button
          onClick={onAddWin}
          disabled={!winInput.trim() || winSubmitting}
          className="p180-btn-press"
          style={{
            background: C.accent, border: 'none', borderRadius: 6,
            padding: '8px 14px', cursor: 'pointer',
            ...D, fontWeight: 700, fontSize: '12px', color: 'white',
            opacity: !winInput.trim() || winSubmitting ? 0.4 : 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  )
})
