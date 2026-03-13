'use client'

import { C, D } from '@/lib/design-tokens'

interface NavItem {
  label: string
  href: string
  active: boolean
}

interface Props {
  navItems: NavItem[]
}

export function MobileBottomNav({ navItems }: Props) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', background: C.surface, borderTop: `1px solid ${C.border}`,
      height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {navItems.map(item => (
        <a key={item.href} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 4,
          color: item.active ? C.accent : C.muted, textDecoration: 'none' }}>
          {item.href === '/dashboard'  && <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
          {item.href === '/programme'  && <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>}
          {item.href === '/profil'     && <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          <span style={{ ...D, fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>{item.label}</span>
        </a>
      ))}
    </div>
  )
}
