import { useEffect, useRef } from 'react'
import { clampStoryMetric, effectiveRelaxation, effectiveTension, STORY_METRIC_MAX, STORY_METRIC_MIN } from '../../lib/storyMetrics'
import { useArtbookStore } from '../../stores/artbookStore'
import type { StoryEmotionExtra, StoryNode } from '../../stores/types'

function newExtraId() {
  return `em-${crypto.randomUUID().slice(0, 10)}`
}

/** 가로: − 값 + */
function HorizontalMetricStepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium text-ab-sub">{label}</span>
      <div className="flex items-center gap-0.5 rounded border border-ab-border bg-ab-muted/50 px-1 py-0.5">
        <button
          type="button"
          className="flex h-7 w-8 items-center justify-center text-sm leading-none text-ab-text hover:bg-ab-muted"
          aria-label={`${label} 한 단계 내리기`}
          onClick={() => onChange(clampStoryMetric(value - 1))}
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-xs font-semibold tabular-nums text-ab-text">{value}</span>
        <button
          type="button"
          className="flex h-7 w-8 items-center justify-center text-sm leading-none text-ab-text hover:bg-ab-muted"
          aria-label={`${label} 한 단계 올리기`}
          onClick={() => onChange(clampStoryMetric(value + 1))}
        >
          +
        </button>
      </div>
    </div>
  )
}

type Props = {
  node: StoryNode
  open: boolean
  onClose: () => void
}

export function StoryNodeMetricsPanel({ node, open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const patchStoryNode = useArtbookStore((s) => s.patchStoryNode)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('[data-story-metrics-trigger]')) return
      const el = panelRef.current
      if (el && !el.contains(e.target as Node)) onClose()
    }
    const t = window.setTimeout(() => document.addEventListener('mousedown', onDoc), 0)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('mousedown', onDoc)
    }
  }, [open, onClose])

  if (!open) return null

  const t = effectiveTension(node)
  const r = effectiveRelaxation(node)
  const extras = node.emotionExtras ?? []

  const setTension = (v: number) => patchStoryNode(node.id, { tension: clampStoryMetric(v) })
  const setRelaxation = (v: number) => patchStoryNode(node.id, { relaxation: clampStoryMetric(v) })

  const setExtra = (id: string, next: Partial<StoryEmotionExtra>) => {
    const list = extras.map((x) => (x.id === id ? { ...x, ...next, value: next.value != null ? clampStoryMetric(next.value) : x.value } : x))
    patchStoryNode(node.id, { emotionExtras: list })
  }

  const removeExtra = (id: string) => {
    patchStoryNode(node.id, { emotionExtras: extras.filter((x) => x.id !== id) })
  }

  const addExtra = () => {
    patchStoryNode(node.id, {
      emotionExtras: [...extras, { id: newExtraId(), label: '새 감정', value: 10 }],
    })
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-20 mt-1 w-[min(100%,280px)] rounded-sm border border-ab-border border-l-2 border-l-ab-point bg-ab-card p-3 shadow-lg"
      role="dialog"
      aria-label="긴장·이완·감정 조절"
    >
      <p className="mb-2 text-[10px] font-semibold text-ab-sub">
        {STORY_METRIC_MIN}~{STORY_METRIC_MAX} · 노드별 지표
      </p>
      <div className="flex flex-row flex-wrap items-start justify-around gap-4">
        <HorizontalMetricStepper label="긴장" value={t} onChange={setTension} />
        <HorizontalMetricStepper label="이완" value={r} onChange={setRelaxation} />
      </div>

      {extras.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-ab-border pt-3">
          <p className="text-[10px] font-semibold text-ab-sub">추가 감정</p>
          {extras.map((ex) => (
            <div key={ex.id} className="flex flex-col gap-1 rounded-sm bg-ab-muted/40 px-2 py-2">
              <div className="flex items-center gap-1">
                <input
                  value={ex.label}
                  onChange={(e) => setExtra(ex.id, { label: e.target.value })}
                  className="min-w-0 flex-1 rounded border border-ab-border bg-ab-card px-2 py-1 text-[11px] text-ab-text outline-none"
                  placeholder="이름"
                />
                <button
                  type="button"
                  className="shrink-0 rounded border border-ab-border px-2 py-1 text-[10px] text-ab-sub hover:bg-ab-muted"
                  onClick={() => removeExtra(ex.id)}
                >
                  삭제
                </button>
              </div>
              <HorizontalMetricStepper
                label="값"
                value={clampStoryMetric(ex.value)}
                onChange={(v) => setExtra(ex.id, { value: v })}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addExtra}
        className="mt-3 w-full rounded-sm border border-dashed border-ab-border py-2 text-[11px] font-medium text-ab-text hover:bg-ab-muted/50"
      >
        + 감정 축 추가
      </button>
    </div>
  )
}
