import type { ReactNode } from 'react'

type Props = {
  title: string
  onMenu?: () => void
  onBack?: () => void
  right?: ReactNode
  showSearch?: boolean
  onSearchClick?: () => void
}

export function TopBar({ title, onMenu, onBack, right, showSearch, onSearchClick }: Props) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-ab-border bg-ab-card px-3 py-2.5">
      <div className="flex shrink-0 items-center gap-1">
        {onMenu ? (
          <button
            type="button"
            onClick={onMenu}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-ab-border bg-ab-bg text-ab-text"
            aria-label="메뉴"
          >
            ☰
          </button>
        ) : null}
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-ab-border text-ab-text"
            aria-label="뒤로"
          >
            ←
          </button>
        ) : null}
        {!onMenu && !onBack ? <span className="w-2 shrink-0" /> : null}
      </div>
      <h1 className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-ab-text">{title}</h1>
      <div
        className={
          showSearch
            ? 'flex h-9 w-9 shrink-0 items-center justify-end'
            : 'flex min-w-0 shrink-0 items-center justify-end'
        }
      >
        {showSearch ? (
          <button
            type="button"
            onClick={onSearchClick}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-ab-border text-ab-sub"
            aria-label="검색"
          >
            ⌕
          </button>
        ) : (
          right ?? <span className="w-9 shrink-0" aria-hidden />
        )}
      </div>
    </header>
  )
}
