import type { ReactNode } from 'react'

type Props = {
  title: string
  right?: ReactNode
  onMenuClick?: () => void
}

export function PageHeader({ title, right, onMenuClick }: Props) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-m-muted bg-m-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-m-muted text-m-text"
            aria-label="프로젝트 메뉴"
          >
            ☰
          </button>
        )}
        <h1 className="font-display truncate text-lg font-semibold tracking-tight text-m-text">
          {title}
        </h1>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  )
}
