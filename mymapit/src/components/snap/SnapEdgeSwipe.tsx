import { useRef, type ReactNode } from 'react'

type Props = {
  onOpenSidebar: () => void
  children: ReactNode
}

/** 왼쪽 가장자리에서 오른쪽으로 스와이프 시 사이드바 열기 */
export function SnapEdgeSwipe({ onOpenSidebar, children }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null)

  return (
    <div
      className="relative flex-1"
      onTouchStart={(e) => {
        const t = e.touches[0]!
        if (t.clientX <= 28) start.current = { x: t.clientX, y: t.clientY }
        else start.current = null
      }}
      onTouchEnd={(e) => {
        const s = start.current
        start.current = null
        if (!s) return
        const t = e.changedTouches[0]!
        const dx = t.clientX - s.x
        const dy = Math.abs(t.clientY - s.y)
        if (dx > 56 && dy < 40) onOpenSidebar()
      }}
    >
      {children}
    </div>
  )
}
