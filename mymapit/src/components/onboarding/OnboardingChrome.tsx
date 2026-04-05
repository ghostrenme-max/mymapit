import type { ReactNode } from 'react'

const T = '#C4614A'

type Props = {
  stepIndex: number
  total: number
  children: ReactNode
  onPrev: () => void
  onNext: () => void
  onSkip: () => void
  nextLabel: string
  disablePrev?: boolean
}

export function OnboardingChrome({
  stepIndex,
  total,
  children,
  onPrev,
  onNext,
  onSkip,
  nextLabel,
  disablePrev,
}: Props) {
  const n = stepIndex + 1
  const label = `Step ${String(n).padStart(2, '0')}`

  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <p className="shrink-0 text-center text-xs font-semibold" style={{ color: T }}>
        {label}
      </p>

      <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-1">{children}</div>

      <div className="mt-auto flex w-full shrink-0 flex-col gap-3 pb-1 pt-4">
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={disablePrev}
            className="min-w-[4.25rem] rounded-md border py-2.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-30"
            style={{ borderColor: `${T}66`, color: T }}
          >
            &lt; 이전
          </button>
          <div className="flex shrink-0 justify-center gap-2">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: i === stepIndex ? T : 'rgba(255,255,255,0.22)',
                }}
                aria-hidden
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onNext}
            className="min-w-[4.25rem] rounded-md py-2.5 text-xs font-semibold text-white"
            style={{ backgroundColor: T }}
          >
            {nextLabel}
          </button>
        </div>
        <button type="button" onClick={onSkip} className="py-1 text-center text-xs font-medium" style={{ color: T }}>
          건너뛰기
        </button>
      </div>
    </div>
  )
}
