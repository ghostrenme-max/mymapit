import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import type { MsgKey } from '../../locales/strings'

type TabDef = {
  to: string
  labelKey: MsgKey
  icon: string
  match: (p: string) => boolean
  accent: string
  accentBg: string
}

const TAB_DEFS: TabDef[] = [
  {
    to: '/memo',
    labelKey: 'nav.home',
    icon: '⌂',
    match: (p) => p === '/memo' || p.startsWith('/memo/'),
    accent: '#4A6B7A',
    accentBg: 'rgba(74,107,122,0.16)',
  },
  {
    to: '/artbook',
    labelKey: 'nav.artbook',
    icon: '◆',
    match: (p) => p.startsWith('/artbook'),
    accent: '#2C4A6E',
    accentBg: 'rgba(44,74,110,0.14)',
  },
  {
    to: '/premium',
    labelKey: 'nav.premium',
    icon: '★',
    match: (p) => p.startsWith('/premium'),
    accent: '#B45309',
    accentBg: 'rgba(180,83,9,0.14)',
  },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  const tabs = useMemo(
    () =>
      TAB_DEFS.map((d) => ({
        ...d,
        label: t(d.labelKey),
      })),
    [t],
  )

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex h-[52px] w-full max-w-[390px] -translate-x-1/2 items-stretch border-t border-ab-border bg-ab-card px-1 shadow-[0_-6px_24px_rgba(17,17,16,0.06)]"
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname)
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={`mx-0.5 my-1 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium tracking-tight transition-colors ${
              active ? 'font-semibold' : 'text-ab-sub'
            }`}
            style={active ? { backgroundColor: tab.accentBg, color: tab.accent } : undefined}
          >
            <span className="text-sm leading-none" aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
