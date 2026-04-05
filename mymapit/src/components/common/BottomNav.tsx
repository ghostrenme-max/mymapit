import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/memo', label: '홈', icon: '⌂', match: (p: string) => p === '/memo' || p.startsWith('/memo/') },
  { to: '/artbook', label: '아트북', icon: '◆', match: (p: string) => p.startsWith('/artbook') },
  { to: '/premium', label: '프리미엄', icon: '★', match: (p: string) => p.startsWith('/premium') },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex h-[52px] w-full max-w-[390px] -translate-x-1/2 items-stretch border-t border-white/10 bg-ab-nav px-1"
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((t) => {
        const active = t.match(pathname)
        return (
          <NavLink
            key={t.to}
            to={t.to}
            end
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-tight transition-colors ${
              active ? 'text-ab-nav-on' : 'text-ab-nav-off'
            }`}
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
