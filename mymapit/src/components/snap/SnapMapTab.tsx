import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { mentionKindMeta, type MentionKind } from '../../constants/mentionKinds'
import { buildMentionCooccurrenceGraph, buildNeighborMap } from '../../lib/mentionGraph'
import { snapChipTheme } from '../../lib/snapChipTheme'
import { useMemoStore } from '../../stores/memoStore'
import { useProjectStore } from '../../stores/projectStore'
import { useSnapMapStore } from '../../stores/snapMapStore'
import type { SnapNeighborDTO } from '../../stores/snapMapStore'

const chMeta = mentionKindMeta('character')
const placeMeta = mentionKindMeta('place')

function kindLabel(kind: MentionKind) {
  return mentionKindMeta(kind).label
}

export function SnapMapTab() {
  const pid = useProjectStore((s) => s.currentProjectId)
  const memoGroups = useMemoStore(useShallow((s) => s.memoGroups))
  const memos = useMemoStore(useShallow((s) => s.memos))

  const syncSnapLinks = useSnapMapStore((s) => s.syncSnapLinks)
  const storedBundle = useSnapMapStore((s) => (pid ? s.linkBundles[pid] : undefined))

  const graph = useMemo(() => {
    if (!pid) return { nodes: [] as const, edges: [] as const, signature: '' }
    return buildMentionCooccurrenceGraph(pid, memoGroups, memos)
  }, [pid, memoGroups, memos])

  const neighborMap = useMemo(
    () => buildNeighborMap([...graph.nodes], [...graph.edges]),
    [graph.nodes, graph.edges],
  )

  const neighborsRecord = useMemo(() => {
    const o: Record<string, SnapNeighborDTO[]> = {}
    for (const [id, list] of neighborMap) {
      o[id] = list.map(({ node, weight }) => ({
        id: node.id,
        weight,
        kind: node.kind,
        label: node.label,
      }))
    }
    return o
  }, [neighborMap])

  useEffect(() => {
    if (!pid || graph.signature === '') return
    syncSnapLinks(pid, graph.signature, neighborsRecord)
  }, [pid, graph.signature, neighborsRecord, syncSnapLinks])

  const effectiveNeighbors =
    storedBundle?.signature === graph.signature ? storedBundle.neighbors : neighborsRecord

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedId) ?? null,
    [graph.nodes, selectedId],
  )

  const linkedIds = useMemo(() => {
    if (!selectedId) return new Set<string>()
    const set = new Set<string>()
    for (const e of graph.edges) {
      if (e.source === selectedId) set.add(e.target)
      else if (e.target === selectedId) set.add(e.source)
    }
    return set
  }, [graph.edges, selectedId])

  const snapResults = selectedId ? (effectiveNeighbors[selectedId] ?? []) : []

  const toggleNode = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  if (!pid) {
    return (
      <div className="min-h-full bg-ab-bg px-4 py-10 text-center text-sm text-ab-sub">
        프로젝트를 선택한 뒤 연결맵을 열어 주세요.
      </div>
    )
  }

  if (graph.nodes.length === 0) {
    return (
      <div className="flex min-h-full flex-col gap-3 bg-ab-bg px-4 py-8">
        <p className="text-center font-title-italic text-lg text-ab-text">아직 연결할 @멘션이 없어요</p>
        <p className="text-center text-sm leading-relaxed text-ab-sub">
          메모 본문에{' '}
          <span className="font-semibold" style={{ color: chMeta.color }}>
            @캐릭터
          </span>
          ·
          <span className="font-semibold" style={{ color: placeMeta.color }}>
            @장소
          </span>
          등을 넣고 저장하면, 같은 메모에 함께 등장한 항목끼리 Snap 연결로 묶입니다.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-ab-bg px-3 pb-8 pt-4">
      <p className="mx-auto mb-4 max-w-[320px] text-center text-[11px] leading-[1.6] text-ab-sub">
        노드를 탭하면 Snap처럼 연결된 항목이 밝아지고, 아래에 순서대로 모여요.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {graph.nodes.map((n) => {
          const th = snapChipTheme(n.kind)
          const active = selectedId === n.id
          const linked = selectedId != null && linkedIds.has(n.id) && !active
          const dim = selectedId != null && !active && !linked

          let opacity = 0.45
          let scale = 1
          let borderW = 1.5
          if (active) {
            opacity = 1
            scale = 1.06
            borderW = 2
          } else if (linked) opacity = 0.8
          else if (dim) opacity = 0.18

          return (
            <button
              key={n.id}
              type="button"
              onClick={() => toggleNode(n.id)}
              className="cursor-pointer font-semibold transition-all duration-200"
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                fontSize: 11,
                color: th.color,
                backgroundColor: th.bg,
                border: `${borderW}px solid ${th.border}`,
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              @{n.label}
            </button>
          )
        })}
      </div>

      {selectedNode && (
        <div className="mb-3 rounded-lg border border-ab-border bg-ab-card px-3 py-2.5">
          <p className="text-[13px] font-semibold text-ab-text">{selectedNode.label}</p>
          <p className="mt-0.5 text-[10px] text-ab-sub">
            {kindLabel(selectedNode.kind)} · 연결된 항목 {snapResults.length}개
          </p>
        </div>
      )}

      <div className="mb-3.5 h-px bg-ab-border" />

      <p className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-ab-point">SNAP 결과</p>

      {selectedId == null ? (
        <p className="text-center text-[11px] text-ab-sub">노드를 선택하면 연결된 항목이 여기 모여요</p>
      ) : (
        <div className="flex flex-wrap gap-[7px]" key={selectedId}>
          {snapResults.length === 0 ? (
            <p className="text-center text-[11px] text-ab-sub">이 노드와 같은 메모에 함께 등장한 항목이 없어요</p>
          ) : (
            snapResults.map((item, index) => {
              const th = snapChipTheme(item.kind)
              return (
                <span
                  key={item.id}
                  className="ab-snap-result-chip font-semibold"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    color: th.color,
                    backgroundColor: th.bgResult,
                    border: `1px solid ${th.borderResult}`,
                    animationDelay: `${index * 0.07}s`,
                  }}
                >
                  @{item.label}
                </span>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
