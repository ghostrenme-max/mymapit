import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { mentionKindMeta, type MentionKind } from '../../constants/mentionKinds'
import {
  buildMentionCooccurrenceGraph,
  buildNeighborMap,
  limitSnapGraphLite,
  type GraphEdge,
  type GraphNode,
  type NeighborWithWeight,
} from '../../lib/mentionGraph'
import { snapChipTheme } from '../../lib/snapChipTheme'
import { useMemoStore } from '../../stores/memoStore'
import { useProjectStore } from '../../stores/projectStore'
import { useSnapMapStore } from '../../stores/snapMapStore'
import type { SnapNeighborDTO } from '../../stores/snapMapStore'
import { useUserStore } from '../../stores/userStore'
import { SnapEntityInsightSheet } from './SnapEntityInsightSheet'

const chMeta = mentionKindMeta('character')
const placeMeta = mentionKindMeta('place')

/** FREE: 노드 수 상한 (메모에 자주 나오는 항목 우선) */
const SNAP_LITE_MAX_NODES = 24
/** FREE: 선택 노드당 연결 결과(이웃) 상한 */
const SNAP_LITE_MAX_NEIGHBORS = 6

function kindLabel(kind: MentionKind) {
  return mentionKindMeta(kind).label
}

function neighborDtoTargetId(dto: SnapNeighborDTO): string {
  if (dto.targetId) return dto.targetId
  const i = dto.id.indexOf(':')
  return i >= 0 ? dto.id.slice(i + 1) : dto.id
}

export function SnapMapTab() {
  const pid = useProjectStore((s) => s.currentProjectId)
  const isPro = useUserStore((s) => s.isPro)
  const memoGroups = useMemoStore(useShallow((s) => s.memoGroups))
  const memos = useMemoStore(useShallow((s) => s.memos))

  const syncSnapLinks = useSnapMapStore((s) => s.syncSnapLinks)
  const storedBundle = useSnapMapStore((s) => (pid ? s.linkBundles[pid] : undefined))

  const graphFull = useMemo(() => {
    if (!pid) return { nodes: [] as GraphNode[], edges: [] as GraphEdge[], signature: '' }
    return buildMentionCooccurrenceGraph(pid, memoGroups, memos)
  }, [pid, memoGroups, memos])

  const graph = useMemo(
    () => (isPro ? graphFull : limitSnapGraphLite(graphFull, SNAP_LITE_MAX_NODES)),
    [graphFull, isPro],
  )

  const neighborMap = useMemo(() => {
    const m = buildNeighborMap([...graph.nodes], [...graph.edges])
    if (isPro) return m
    const next = new Map<string, NeighborWithWeight[]>()
    for (const [id, list] of m) {
      next.set(id, list.slice(0, SNAP_LITE_MAX_NEIGHBORS))
    }
    return next
  }, [graph.nodes, graph.edges, isPro])

  const neighborsRecord = useMemo(() => {
    const o: Record<string, SnapNeighborDTO[]> = {}
    for (const [id, list] of neighborMap) {
      o[id] = list.map(({ node, weight }) => ({
        id: node.id,
        targetId: node.targetId,
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
  const [insight, setInsight] = useState<{ kind: MentionKind; targetId: string; label: string } | null>(null)

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

  const openInsight = (kind: MentionKind, targetId: string, label: string) => {
    setInsight({ kind, targetId, label })
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
    <div className="min-h-full bg-ab-bg px-3 pb-28 pt-4">
      {!isPro && (
        <div className="mx-auto mb-3 max-w-[340px] rounded-md border border-ab-border border-dashed bg-ab-muted/40 px-3 py-2 text-center text-[10px] leading-snug text-ab-sub">
          <span className="font-semibold text-ab-text">FREE · Snap 라이트</span> — 노드 최대 {SNAP_LITE_MAX_NODES}개 ·
          연결 결과 항목당 최대 {SNAP_LITE_MAX_NEIGHBORS}개만 표시됩니다.{' '}
          <span className="text-ab-point">PRO</span>에서 전체 그래프를 볼 수 있어요.
        </div>
      )}

      <p className="mx-auto mb-4 max-w-[320px] text-center text-[11px] leading-[1.6] text-ab-sub">
        노드를 탭하면 연결된 항목이 밝아지고, 아래 SNAP 결과에서 항목을 누르면{' '}
        <span className="font-medium text-ab-text">아트북·메모 기반 요약</span>이 하단에 열려요.
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
        <button
          type="button"
          onClick={() => openInsight(selectedNode.kind, selectedNode.targetId, selectedNode.label)}
          className="mb-3 w-full rounded-lg border border-ab-border bg-ab-card px-3 py-2.5 text-left active:bg-ab-muted/50"
        >
          <p className="text-[13px] font-semibold text-ab-text">{selectedNode.label}</p>
          <p className="mt-0.5 text-[10px] text-ab-sub">
            {kindLabel(selectedNode.kind)} · 연결된 항목 {snapResults.length}개
            {isPro ? '' : ` (라이트 상한 ${SNAP_LITE_MAX_NEIGHBORS}개)`}
          </p>
          <p className="mt-1 text-[10px] text-ab-point">탭하여 요약 패널 열기</p>
        </button>
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
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openInsight(item.kind, neighborDtoTargetId(item), item.label)}
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
                  {isPro ? (
                    <span className="ml-1 tabular-nums text-[9px] opacity-70">×{item.weight}</span>
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      )}

      {pid && insight && (
        <SnapEntityInsightSheet
          open
          projectId={pid}
          kind={insight.kind}
          targetId={insight.targetId}
          label={insight.label}
          onClose={() => setInsight(null)}
        />
      )}
    </div>
  )
}
