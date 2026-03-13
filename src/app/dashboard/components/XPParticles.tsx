'use client'

import { C, M } from '@/lib/design-tokens'
import type { XPParticle } from '@/lib/types'

interface Props {
  particles: XPParticle[]
  isMobile: boolean
}

export function XPParticles({ particles, isMobile }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
      {particles.map(p => (
        <div key={p.id} className="p180-xp-rise" style={{
          position: 'absolute',
          right: isMobile ? '24px' : '48px',
          top:   isMobile ? '80px' : '160px',
          ...M, fontWeight: 700, fontSize: '16px',
          color: p.delta > 0 ? C.greenL : '#f97373',
          letterSpacing: '0.05em',
          textShadow: p.delta > 0 ? `0 0 12px ${C.greenL}60` : '0 0 12px #f9737360',
        }}>
          {p.delta > 0 ? `+${p.delta}` : p.delta} XP{p.multiplier > 1 ? ` ×${p.multiplier}` : ''}
        </div>
      ))}
    </div>
  )
}
