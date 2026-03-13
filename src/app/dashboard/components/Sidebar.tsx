'use client'

import { C, D, M } from '@/lib/design-tokens'
import type { Level } from '@/lib/levels'

interface NavItem {
  label: string
  href: string
  active: boolean
}

interface Props {
  firstName: string
  level: Level
  navItems: NavItem[]
  whatsappLink: string | null
  jourX: number
  daysPct: number
  onSignOut: () => void
}

export function Sidebar({ firstName, level, navItems, whatsappLink, jourX, daysPct, onSignOut }: Props) {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: C.sidebar,
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '32px 24px 28px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          width: 44, height: 44,
          background: C.accent,
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0% 88%, 0% 12%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <span style={{ ...D, fontWeight: 900, fontSize: '18px', color: 'white', letterSpacing: '0.05em' }}>
            P180
          </span>
        </div>
        <div style={{ ...D, fontWeight: 700, fontSize: '10px', letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase' as const }}>
          Projet180
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '20px 16px', flex: 1 }}>
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
            background: item.active ? C.dimmed : 'transparent',
            borderLeft: item.active ? `2px solid ${C.accent}` : '2px solid transparent',
          }}>
            {item.label}
          </a>
        ))}

        {whatsappLink && (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px',
            marginTop: 8,
            ...D,
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            textDecoration: 'none',
            color: C.greenL,
            borderLeft: `2px solid ${C.green}`,
          }}>
            <span>WhatsApp</span>
            <span className="p180-ping" style={{
              width: 7, height: 7, flexShrink: 0,
              borderRadius: '50%',
              background: C.greenL,
              display: 'inline-block',
            }} />
          </a>
        )}
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
          width: 32, height: 32, flexShrink: 0,
          background: C.accent,
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
        <button onClick={onSignOut} title="Déconnexion" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.muted, fontSize: '18px', lineHeight: 1, padding: 4,
        }}>
          ⏻
        </button>
      </div>
    </aside>
  )
}
