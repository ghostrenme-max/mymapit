import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { SectionCard } from '../common/SectionCard'
import { TajiTag } from '../common/TajiTag'
import { TensionCurveSvg } from '../story/TensionCurveSvg'
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

  const pid = useProjectStore((s) => s.currentProjectId)
  const nodes = useArtbookStore(useShallow((s) => (pid ? s.storyNodes.filter((n) => n.projectId === pid) : [])))
  const aiCards = useArtbookStore(
    useShallow((s) => (pid ? s.aiInfoCards.filter((c) => c.projectId === pid) : [])),
  )

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
  const tensions = useMemo(() => flat.map(({ n }) => n.tension), [flat])
  const sortedAi = useMemo(
    () => [...aiCards].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [aiCards],
  )

  return (
    <div className="flex flex-col gap-3 px-3 pb-4 pt-2">
      <p className="text-[11px] text-ab-sub">CHAPTER 03 · 서사</p>
      <h2 className="font-title-italic text-2xl font-semibold">긴장–이완 곡선</h2>
      <SectionCard>
        <TensionCurveSvg values={tensions} width={340} height={128} />
      </SectionCard>

      <SectionCard title="서사 노드 트리">
        <ul className="space-y-2">
          {flat.map(({ n, depth }) => (
            <li
              key={n.id}
              id={`story-node-${n.id}`}
              className={`rounded-sm border bg-ab-card px-2 py-2 text-sm transition-[box-shadow] duration-300 ${
                highlightId === n.id
                  ? 'border-ab-text shadow-[0_0_0_2px_var(--color-ab-text)]'
                  : 'border-ab-border'
              }`}
              style={{ marginLeft: depth * 12 }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold text-ab-sub">{LABEL[n.type]}</span>
                <span className="tabular-nums text-xs text-ab-text">긴장 {n.tension}</span>
              </div>
              <p className="mt-1 font-medium text-ab-text">{n.title}</p>
              <p className="mt-0.5 text-xs text-ab-sub">{n.description}</p>
            </li>
          ))}
          {flat.length === 0 && <li className="text-xs text-ab-sub">노드가 없습니다.</li>}
        </ul>
      </SectionCard>

      <SectionCard title="@@ AI 인포 카드">
        <ul className="space-y-3">
          {sortedAi.map((c) => (
            <li key={c.id} className="rounded-sm border border-ab-border bg-ab-muted/30 px-3 py-2.5">
              <p className="text-[10px] text-ab-sub">{new Date(c.createdAt).toLocaleString('ko-KR')}</p>
              <p className="mt-1 text-sm font-medium text-ab-text">{c.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {c.characters.slice(0, 4).map((n) => (
                  <TajiTag key={n} variant="gray">
                    {n}
                  </TajiTag>
                ))}
              </div>
              {c.suggestedKeywords.length > 0 && (
                <div className="mt-2 border-t border-ab-border/60 pt-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-ab-sub">제안 키워드</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.suggestedKeywords.map((k, i) => (
                      <TajiTag key={`${k}-${i}`} variant="gray">
                        {k}
                      </TajiTag>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
          {sortedAi.length === 0 && <li className="text-xs text-ab-sub">저장된 @@ 분석이 없습니다.</li>}
        </ul>
      </SectionCard>
    </div>
  )
}
