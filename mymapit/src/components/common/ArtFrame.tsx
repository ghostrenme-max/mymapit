import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** 내부 패딩 (이미지 풀블리드는 `p-0`) */
  contentClassName?: string
}

/** 모서리 장식이 있는 컨셉 아트 프레임 */
export function ArtFrame({ children, className = '', contentClassName = 'p-4 pt-6' }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-ab-border bg-ab-muted/40 ${className}`}
    >
      <span
        className="pointer-events-none absolute left-1 top-1 h-5 w-5 border-l-2 border-t-2 border-ab-text"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-1 top-1 h-5 w-5 border-r-2 border-t-2 border-ab-text"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-1 left-1 h-5 w-5 border-b-2 border-l-2 border-ab-text"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-1 right-1 h-5 w-5 border-b-2 border-r-2 border-ab-text"
        aria-hidden
      />
      <div className={contentClassName}>{children}</div>
    </div>
  )
}
