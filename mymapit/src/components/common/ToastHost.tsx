import { useToastStore } from '../../stores/toastStore'

export function ToastHost() {
  const message = useToastStore((s) => s.message)
  if (!message) return null
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-[200] w-[min(calc(100vw-24px),360px)] -translate-x-1/2 rounded-lg border border-ab-border bg-ab-card px-4 py-3 text-center text-sm leading-snug text-ab-text shadow-lg"
    >
      {message}
    </div>
  )
}
