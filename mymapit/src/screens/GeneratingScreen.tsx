import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProjectFromAnswers } from '../stores/actions'
import { useProjectStore } from '../stores/projectStore'

export function GeneratingScreen() {
  const navigate = useNavigate()
  const clearPending = useProjectStore((s) => s.setPendingAnswers)
  /** pending이 null로 바뀐 뒤 effect가 다시 돌며 /questions으로 보내는 버그 방지 */
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    const pending = useProjectStore.getState().pendingAnswers
    if (!pending) {
      navigate('/questions', { replace: true })
      return
    }
    startedRef.current = true
    const t = window.setTimeout(() => {
      addProjectFromAnswers(pending)
      clearPending(null)
      navigate('/artbook', { replace: true })
    }, 2500)
    return () => window.clearTimeout(t)
  }, [clearPending, navigate])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ab-bg px-6">
      <div
        className="h-12 w-12 animate-ab-spin rounded-full border-2 border-ab-muted border-t-ab-text"
        aria-hidden
      />
      <p className="mt-6 text-center font-medium text-ab-text">세계관을 구성하고 있어요</p>
      <p className="mt-2 text-center text-xs text-ab-sub">잠시만 기다려 주세요…</p>
    </div>
  )
}
