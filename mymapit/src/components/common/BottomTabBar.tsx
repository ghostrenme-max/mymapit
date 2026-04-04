import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/story', label: '서사', icon: '📖' },
  { to: '/character', label: '캐릭터', icon: '🎭' },
  { to: '/keyword', label: '키워드', icon: '✨' },
  { to: '/snap', label: 'Snap', icon: '⚡' },
] as const

export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex h-[56px] w-full max-w-[390px] -translate-x-1/2 items-stretch border-t border-m-muted bg-m-card px-1 pt-1 shadow-[0_-4px_20px_rgba(23,20,15,0.06)]"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-m-red'
                : 'text-m-sub hover:text-m-text'
            }`
          }
        >
          <span className="text-lg leading-none" aria-hidden>
            {t.icon}
          </span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
