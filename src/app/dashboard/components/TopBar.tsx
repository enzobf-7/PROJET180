'use client'

import { memo } from 'react'
import { C, D, M } from '@/lib/design-tokens'

interface NavItem {
  label: string
  href: string
  active: boolean
}

interface Props {
  jourX: number
  daysLeft: number
  daysPct: number
  firstName: string
  navItems: NavItem[]
  onSignOut: () => void
}

export const TopBar = memo(function TopBar({ jourX, daysLeft, daysPct, firstName, navItems, onSignOut }: Props) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8,8,8,0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      {/* Main row: logo + nav + user */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        height: 56,
      }}>
        {/* Logo */}
        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34,
            background: C.accent,
            clipPath: 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0% 88%, 0% 12%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ ...D, fontWeight: 900, fontSize: '14px', color: 'white', letterSpacing: '0.05em' }}>
              P180
            </span>
          </div>
        </a>

        {/* Nav items */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {navItems.map(item => (
            <a key={item.href} href={item.href} style={{
              padding: '8px 16px',
              ...D,
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              textDecoration: 'none',
              color: item.active ? C.text : C.muted,
              background: item.active ? C.dimmed : 'transparent',
              borderRadius: 8,
              transition: 'all 0.15s',
            }}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* User avatar + sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30,
            background: C.accent,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ ...D, fontWeight: 900, fontSize: '13px', color: 'white' }}>
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <button onClick={onSignOut} title="Déconnexion" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.muted, fontSize: '16px', lineHeight: 1, padding: 4,
          }}>
            ⏻
          </button>
        </div>
      </div>

      {/* Jour X / 180 — centered, prominent */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8,
        padding: '6px 20px 10px',
      }}>
        <span style={{ ...D, fontWeight: 900, fontSize: '24px', letterSpacing: '0.06em', color: C.text, lineHeight: 1 }}>
          JOUR {jourX}
        </span>
        <span style={{ ...M, fontSize: '13px', color: C.muted, lineHeight: 1 }}>
          / 180
        </span>
        <span style={{ ...M, fontSize: '11px', color: C.muted, marginLeft: 6, lineHeight: 1 }}>
          — {daysLeft}j restants
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: C.dimmed }}>
        <div style={{
          height: '100%',
          width: `${daysPct}%`,
          background: `linear-gradient(90deg, ${C.accent}, ${C.accentL})`,
          transition: 'width 1.2s ease',
        }} />
      </div>
    </header>
  )
})
