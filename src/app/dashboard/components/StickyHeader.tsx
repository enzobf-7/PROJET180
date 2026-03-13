'use client'

import { memo } from 'react'
import { C, D, M } from '@/lib/design-tokens'
import type { CountdownTime } from '@/lib/hooks'
import { p2 } from '@/lib/hooks'

interface Props {
  jourX: number
  daysLeft: number
  daysPct: number
  isMobile: boolean
  countdown: CountdownTime
  onboardingDate: string | null
}

export const StickyHeader = memo(function StickyHeader({ jourX, daysLeft, daysPct, isMobile, countdown, onboardingDate }: Props) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(8,8,8,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ height: 2, background: C.dimmed }}>
        <div style={{ height: '100%', width: `${daysPct}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.accentL})`, transition: 'width 1.2s ease' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '10px 16px' : '10px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ ...D, fontWeight: 900, fontSize: '22px', letterSpacing: '0.06em', color: C.text, lineHeight: 1 }}>
            JOUR {jourX}
          </span>
          <span style={{ ...M, fontSize: '11px', color: C.muted }}>/ 180 — {daysLeft}j restants</span>
        </div>
        {!isMobile && onboardingDate && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {[
              { v: countdown.d, u: 'j' },
              { v: countdown.h, u: 'h' },
              { v: countdown.m, u: 'm' },
              { v: countdown.s, u: 's' },
            ].map(({ v, u }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ ...M, fontWeight: 700, fontSize: '16px', color: C.text }}>{v}</span>
                <span style={{ ...M, fontSize: '10px', color: C.muted }}>{u}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  )
})
