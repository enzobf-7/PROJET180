'use client'

import { memo } from 'react'
import { C, D, M } from '@/lib/design-tokens'
import type { LeaderboardEntry } from '@/lib/types'

interface Props {
  leaderboard: LeaderboardEntry[]
  maxXP: number
  isMobile: boolean
}

export const LeaderboardCard = memo(function LeaderboardCard({ leaderboard, maxXP, isMobile }: Props) {
  const top5 = leaderboard.slice(0, 5)
  const meInTop5 = top5.some(e => e.isMe)
  const myEntry = !meInTop5 ? leaderboard.find(e => e.isMe) : null
  const entries = myEntry ? [...top5, myEntry] : top5

  return (
    <div className="p180-fade p180-card" style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '18px 20px',
      marginBottom: isMobile ? 20 : 0,
      animationDelay: '0.2s',
    }}>
      <div style={{ ...D, fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.text, marginBottom: 14 }}>
        Classement
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {entries.map((entry, i) => {
          const isGap = myEntry && i === 5
          return (
            <div key={entry.clientId}>
              {isGap && (
                <div style={{ textAlign: 'center', padding: '6px 0', ...M, fontSize: '10px', color: C.muted }}>
                  ···
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 80px 60px',
                alignItems: 'center',
                gap: 10,
                padding: '8px 8px',
                borderRadius: 6,
                background: entry.isMe ? `${C.accent}10` : 'transparent',
                border: entry.isMe ? `1px solid ${C.accent}20` : '1px solid transparent',
              }}>
                <span style={{ ...M, fontWeight: 700, fontSize: '13px', color: entry.rank <= 3 ? C.accent : C.muted, textAlign: 'center' }}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>
                <span style={{
                  ...D, fontWeight: entry.isMe ? 700 : 600, fontSize: '13px',
                  color: entry.isMe ? C.accent : C.text,
                  letterSpacing: '0.04em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {entry.firstName}{entry.isMe ? ' (toi)' : ''}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 3, background: C.dimmed, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((entry.xp / maxXP) * 100)}%`, background: entry.isMe ? C.accent : C.muted, borderRadius: 2, transition: 'width 0.6s' }} />
                  </div>
                </div>
                <span style={{ ...M, fontWeight: 600, fontSize: '11px', color: entry.isMe ? C.accent : C.muted, textAlign: 'right' }}>
                  {entry.xp.toLocaleString('fr-FR')} xp
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
