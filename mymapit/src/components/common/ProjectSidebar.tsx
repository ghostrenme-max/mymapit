import { useEffect, useRef } from 'react'
import { useProjectStore } from '../../store/useProjectStore'

type Props = {
  open: boolean
  onClose: () => void
}

export function ProjectSidebar({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number } | null>(null)
  const projects = useProjectStore((s) => s.projects)
  const currentId = useProjectStore((s) => s.currentProjectId)
  const setCurrent = useProjectStore((s) => s.setCurrentProjectId)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-m-text/20 transition-opacity duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        ref={panelRef}
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(280px,85vw)] max-w-[390px] flex-col bg-m-card shadow-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        onTouchStart={(e) => {
          touchStart.current = { x: e.touches[0]!.clientX }
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current
          touchStart.current = null
          if (!start) return
          const end = e.changedTouches[0]!.clientX
          if (end - start.x < -48) onClose()
        }}
      >
        <div className="flex items-center justify-between border-b border-m-muted px-4 py-3">
          <h2 className="font-display text-base font-semibold text-m-text">프로젝트</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-m-sub"
          >
            닫기
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setCurrent(p.id)
                  onClose()
                }}
                className={`mb-1 w-full rounded-xl px-3 py-3 text-left text-sm ${
                  p.id === currentId
                    ? 'bg-m-red/10 font-medium text-m-red'
                    : 'bg-m-muted/60 text-m-text'
                }`}
              >
                {p.name}
                <div className="mt-0.5 text-xs text-m-sub">
                  {new Date(p.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-m-muted px-4 py-2 text-center text-xs text-m-sub">
          왼쪽에서 스와이프해 닫을 수 있어요
        </p>
      </aside>
    </>
  )
}
