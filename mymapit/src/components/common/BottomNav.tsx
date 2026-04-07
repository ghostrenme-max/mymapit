import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  {
    to: '/memo',
    label: '홈',
    icon: '⌂',
    match: (p: string) => p === '/memo' || p.startsWith('/memo/'),
    accent: '#4A6B7A',
    accentBg: 'rgba(74,107,122,0.16)',
  },
  {
    to: '/artbook',
    label: '아트북',
    icon: '◆',
    match: (p: string) => p.startsWith('/artbook'),
    accent: '#2C4A6E',
    accentBg: 'rgba(44,74,110,0.14)',
  },
  {
    to: '/premium',
    label: '프리미엄',
    icon: '★',
    match: (p: string) => p.startsWith('/premium'),
    accent: '#B45309',
    accentBg: 'rgba(180,83,9,0.14)',
  },
] as const

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex h-[52px] w-full max-w-[390px] -translate-x-1/2 items-stretch border-t border-ab-border bg-ab-card px-1 shadow-[0_-6px_24px_rgba(17,17,16,0.06)]"
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((t) => {
        const active = t.match(pathname)
        return (
          <NavLink
            key={t.to}
            to={t.to}
            end
            className={`mx-0.5 my-1 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium tracking-tight transition-colors ${
              active ? 'font-semibold' : 'text-ab-sub'
            }`}
            style={
              active
                ? { backgroundColor: t.accentBg, color: t.accent }
                : undefined
            }
          >
            <span className="text-sm leading-none" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
