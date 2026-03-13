'use client'

import { memo } from 'react'
import { C, D, M } from '@/lib/design-tokens'

const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90]

interface Badge {
  key: string
  label: string
  icon: string
  earned: boolean
  desc: string
}

interface Props {
  streak: number
  hotStreak: boolean
  legendStreak: boolean
  badges: Badge[]
  earnedCount: number
  objectifText: string | null
  visionText: string | null
  whatsappLink: string | null
}

export const ProgressionPanel = memo(function ProgressionPanel({
  streak, hotStreak, legendStreak,
  badges, earnedCount,
  objectifText, visionText, whatsappLink,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Streak card */}
      <div className="p180-fade p180-card" style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        animationDelay: '0.05s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ ...D, fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.text }}>
            Série en cours
          </div>
          <div style={{ ...M, fontWeight: 700, fontSize: '20px', color: legendStreak ? '#F59E0B' : hotStreak ? '#F59E0B' : C.text }}>
            {streak}j {legendStreak ? '👑' : hotStreak ? '🔥' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STREAK_MILESTONES.map(m => (
            <div key={m} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: streak >= m ? (m >= 30 ? '#F59E0B' : C.accent) : C.dimmed,
              transition: 'background 0.4s',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {STREAK_MILESTONES.map(m => (
            <span key={m} style={{ ...M, fontSize: '8px', color: streak >= m ? C.text : C.muted, flex: 1, textAlign: 'center' }}>
              {m}j
            </span>
          ))}
        </div>
      </div>

      {/* Badges card */}
      <div className="p180-fade p180-card" style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        animationDelay: '0.1s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ ...D, fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.text }}>
            Badges
          </div>
          <span style={{ ...M, fontSize: '10px', color: C.muted }}>{earnedCount}/{badges.length}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {badges.map(b => (
            <div key={b.key} title={`${b.label}: ${b.desc}`} style={{
              textAlign: 'center',
              padding: '10px 4px 8px',
              background: b.earned ? `${C.accent}10` : C.bg,
              border: `1px solid ${b.earned ? `${C.accent}30` : C.border}`,
              borderRadius: 8,
              opacity: b.earned ? 1 : 0.4,
              transition: 'opacity 0.3s, background 0.3s',
            }}>
              <div style={{ fontSize: '20px', lineHeight: 1, marginBottom: 4 }}>{b.icon}</div>
              <div style={{ ...D, fontWeight: 700, fontSize: '9px', letterSpacing: '0.05em', color: b.earned ? C.text : C.muted, lineHeight: 1.2 }}>
                {b.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Objectif + Vision */}
      {(objectifText || visionText) && (
        <div className="p180-fade p180-card" style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '18px 20px',
          animationDelay: '0.15s',
        }}>
          {objectifText && (
            <div style={{ marginBottom: visionText ? 14 : 0 }}>
              <div style={{ ...D, fontWeight: 800, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: C.accent, marginBottom: 6 }}>
                Objectif principal
              </div>
              <div style={{ ...D, fontWeight: 600, fontSize: '14px', color: C.text, lineHeight: 1.5 }}>
                {objectifText}
              </div>
            </div>
          )}
          {objectifText && visionText && <div style={{ height: 1, background: C.border, margin: '0 0 14px' }} />}
          {visionText && (
            <div>
              <div style={{ ...D, fontWeight: 800, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: C.muted, marginBottom: 6 }}>
                Vision
              </div>
              <div style={{ ...D, fontWeight: 500, fontSize: '13px', color: C.muted, lineHeight: 1.5, fontStyle: 'italic' }}>
                &ldquo;{visionText}&rdquo;
              </div>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp CTA */}
      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="p180-fade" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: `${C.green}18`,
          border: `1px solid ${C.green}40`,
          borderRadius: 14,
          padding: '14px 20px',
          textDecoration: 'none',
          transition: 'background 0.2s',
          animationDelay: '0.2s',
        }}>
          <span style={{ fontSize: '20px' }}>💬</span>
          <div>
            <div style={{ ...D, fontWeight: 700, fontSize: '13px', color: C.greenL, letterSpacing: '0.06em' }}>
              Groupe WhatsApp
            </div>
            <div style={{ ...M, fontSize: '10px', color: `${C.greenL}90`, marginTop: 1 }}>
              Rejoindre le groupe de coaching
            </div>
          </div>
        </a>
      )}
    </div>
  )
})
