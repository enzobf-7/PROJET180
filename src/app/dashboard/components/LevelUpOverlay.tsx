'use client'

import { C, D, M } from '@/lib/design-tokens'

interface Props {
  levelName: string
}

export function LevelUpOverlay({ levelName }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(6,6,6,0.92)',
      animation: 'p180-levelup-bg 2.8s ease both',
      pointerEvents: 'none',
    }}>
      <div style={{ textAlign: 'center', animation: 'p180-levelup-card 2.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ ...M, fontSize: '11px', letterSpacing: '0.2em', color: C.accent, marginBottom: 12, textTransform: 'uppercase' as const }}>
          Niveau supérieur
        </div>
        <div style={{ ...D, fontSize: '52px', fontWeight: 800, color: C.text, letterSpacing: '0.02em', lineHeight: 1 }}>
          {levelName}
        </div>
        <div style={{ height: 2, background: C.accent, margin: '20px auto 0', borderRadius: 1, animation: 'p180-levelup-line 2.8s ease both' }} />
      </div>
    </div>
  )
}
