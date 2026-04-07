import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { SectionCard } from '../common/SectionCard'
import { StoryNodeMetricsPanel } from '../story/StoryNodeMetricsPanel'
import { TensionCurveSvg } from '../story/TensionCurveSvg'
import { effectiveRelaxation, effectiveTension } from '../../lib/storyMetrics'
import { useArtbookStore } from '../../stores/artbookStore'
import { useProjectStore } from '../../stores/projectStore'
import type { StoryNode } from '../../stores/types'

function flattenTree(projectId: string, nodes: StoryNode[]) {
  const list = nodes.filter((n) => n.projectId === projectId)
  const byParent = new Map<string | null, StoryNode[]>()
  for (const n of list) {
    const k = n.parentId
    if (!byParent.has(k)) byParent.set(k, [])
    byParent.get(k)!.push(n)
  }
  for (const arr of byParent.values()) arr.sort((a, b) => a.order - b.order)
  const out: { n: StoryNode; depth: number }[] = []
  const walk = (parentId: string | null, depth: number) => {
    for (const n of byParent.get(parentId) ?? []) {
      out.push({ n, depth })
      walk(n.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}

const LABEL: Record<StoryNode['type'], string> = {
  act: 'ACT',
  scene: 'SCENE',
  event: 'EVENT',
}

export function StoryTab() {
  const [searchParams] = useSearchParams()
  const focusNodeId = searchParams.get('node')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [metricsOpenId, setMetricsOpenId] = useState<string | null>(null)

  const pid = useProjectStore((s) => s.currentProjectId)
  const nodes = useArtbookStore(useShallow((s) => (pid ? s.storyNodes.filter((n) => n.projectId === pid) : [])))

  const flat = useMemo(() => (pid ? flattenTree(pid, nodes) : []), [pid, nodes])

  useEffect(() => {
    if (!focusNodeId) {
      setHighlightId(null)
      return
    }
    const t1 = window.setTimeout(() => {
      const el = document.getElementById(`story-node-${focusNodeId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightId(focusNodeId)
    }, 80)
    const t2 = window.setTimeout(() => setHighlightId(null), 2800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [focusNodeId, flat.length])

  const tensionSeries = useMemo(() => flat.map(({ n }) => effectiveTension(n)), [flat])
  const relaxationSeries = useMemo(() => flat.map(({ n }) => effectiveRelaxation(n)), [flat])

  return (
    <div className="flex flex-col gap-3 px-3 pb-4 pt-2">
      <p className="text-[11px] text-ab-sub">CHAPTER 03 · 서사</p>
      <h2 className="font-title-italic text-2xl font-semibold">긴장–이완 곡선</h2>
      <SectionCard>
        <TensionCurveSvg tensionValues={tensionSeries} relaxationValues={relaxationSeries} width={340} height={128} />
      </SectionCard>

      <SectionCard title="서사 노드 트리">
        <ul className="space-y-2">
          {flat.map(({ n, depth }) => {
            const te = effectiveTension(n)
            const re = effectiveRelaxation(n)
            const extraN = n.emotionExtras?.length ?? 0
            return (
              <li
                key={n.id}
                id={`story-node-${n.id}`}
                className={`relative rounded-sm border bg-ab-card px-2 py-2 text-sm transition-[box-shadow] duration-300 ${
                  highlightId === n.id
                    ? 'border-ab-text shadow-[0_0_0_2px_var(--color-ab-text)]'
                    : 'border-ab-border'
                }`}
                style={{ marginLeft: depth * 12 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold text-ab-sub">{LABEL[n.type]}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="tabular-nums text-[11px] text-ab-text">
                      긴장 {te}
                      <span className="text-ab-sub"> · </span>
                      이완 {re}
                      {extraN > 0 ? (
                        <span className="text-ab-sub">
                          {' '}
                          · +{extraN}
                        </span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      data-story-metrics-trigger
                      onClick={() => setMetricsOpenId((id) => (id === n.id ? null : n.id))}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-ab-border bg-ab-muted/50 text-sm font-semibold leading-none text-ab-text hover:bg-ab-muted"
                      aria-expanded={metricsOpenId === n.id}
                      aria-label="긴장·이완·감정 조절"
                    >
                      −
                    </button>
                  </div>
                </div>
                <p className="mt-1 font-medium text-ab-text">{n.title}</p>
                <p className="mt-0.5 text-xs text-ab-sub">{n.description}</p>
                <StoryNodeMetricsPanel
                  node={n}
                  open={metricsOpenId === n.id}
                  onClose={() => setMetricsOpenId(null)}
                />
              </li>
            )
          })}
          {flat.length === 0 && <li className="text-xs text-ab-sub">노드가 없습니다.</li>}
        </ul>
      </SectionCard>
    </div>
  )
}
