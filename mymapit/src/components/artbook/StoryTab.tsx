import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { STORY_EMOTION_TAG_META, STORY_EMOTION_TAG_ORDER, type StoryEmotionTag } from '../../constants/storyNarrative'
import { effectiveRelaxation, effectiveTension } from '../../lib/storyMetrics'
import { nodeIsOnInactiveBranch } from '../../lib/storyBranchDim'
import { flattenActSubtree, listActs } from '../../lib/storyTree'
import { SectionCard } from '../common/SectionCard'
import { StoryNarrativeChart } from '../story/StoryNarrativeChart'
import { StoryNodeDetailPanel } from '../story/StoryNodeDetailPanel'
import { StoryNodeMemoDrawer } from '../story/StoryNodeMemoDrawer'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMemoStore } from '../../stores/memoStore'
import { useMentionStore } from '../../stores/mentionStore'
import { useProjectStore } from '../../stores/projectStore'
import type { StoryNode } from '../../stores/types'

type FilterState =
  | { mode: 'all' }
  | { mode: 'emotion'; tag: StoryEmotionTag }
  | { mode: 'character'; charId: string }

function visibleNodeIds(nodes: StoryNode[], filter: FilterState): Set<string> {
  if (filter.mode === 'all') return new Set(nodes.map((n) => n.id))
  const byId = new Map(nodes.map((n) => [n.id, n]))
  let seeds: string[] = []
  if (filter.mode === 'emotion') {
    seeds = nodes.filter((n) => n.emotionTag === filter.tag).map((n) => n.id)
  } else {
    seeds = nodes.filter((n) => n.characterIds.includes(filter.charId)).map((n) => n.id)
  }
  const keep = new Set<string>()
  for (const id of seeds) {
    let cur: StoryNode | undefined = byId.get(id)
    while (cur) {
      keep.add(cur.id)
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    }
  }
  return keep
}

const LABEL: Record<StoryNode['type'], string> = {
  act: 'ACT',
  scene: 'SCENE',
  event: 'EVENT',
}

export function StoryTab() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const focusNodeId = searchParams.get('node')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [panelOpenId, setPanelOpenId] = useState<string | null>(null)
  const [drawerNode, setDrawerNode] = useState<StoryNode | null>(null)
  const [filter, setFilter] = useState<FilterState>({ mode: 'all' })
  const [selectedActId, setSelectedActId] = useState<string | null>(null)
  const actScrollRef = useRef<HTMLDivElement>(null)

  const pid = useProjectStore((s) => s.currentProjectId)
  const memoGroups = useMemoStore(useShallow((s) => (pid ? s.memoGroups.filter((g) => g.projectId === pid) : [])))
  const addMemo = useMemoStore((s) => s.addMemo)
  const nodes = useArtbookStore(useShallow((s) => (pid ? s.storyNodes.filter((n) => n.projectId === pid) : [])))
  const relationTriggers = useArtbookStore(useShallow((s) => s.relationTriggers))
  const chars = useMentionStore(useShallow((s) => (pid ? s.characters.filter((c) => c.projectId === pid) : [])))

  const acts = useMemo(() => (pid ? listActs(pid, nodes) : []), [pid, nodes])

  useEffect(() => {
    if (acts.length === 0) {
      setSelectedActId(null)
      return
    }
    setSelectedActId((prev) => (prev && acts.some((a) => a.id === prev) ? prev : acts[0]!.id))
  }, [acts])

  /** 서사 딥링크 시 해당 노드가 속한 막으로 전환 */
  useEffect(() => {
    if (!focusNodeId || !pid) return
    const target = nodes.find((n) => n.id === focusNodeId)
    if (!target) return
    const map = new Map(nodes.map((n) => [n.id, n]))
    let node: StoryNode | undefined = target
    while (node) {
      if (node.type === 'act' && node.parentId === null) {
        const actId = node.id
        if (acts.some((a) => a.id === actId)) setSelectedActId(actId)
        break
      }
      const pid: string | null = node.parentId
      node = pid === null ? undefined : map.get(pid)
    }
  }, [focusNodeId, pid, nodes, acts])

  const flatForAct = useMemo(
    () => (pid && selectedActId ? flattenActSubtree(selectedActId, pid, nodes) : []),
    [pid, selectedActId, nodes],
  )

  const visible = useMemo(() => visibleNodeIds(nodes, filter), [nodes, filter])

  const triggersByEvent = useMemo(() => {
    const m = new Map<string, typeof relationTriggers>()
    for (const t of relationTriggers) {
      if (!m.has(t.eventNodeId)) m.set(t.eventNodeId, [])
      m.get(t.eventNodeId)!.push(t)
    }
    return m
  }, [relationTriggers])

  /** 곡선: 선택 막 전체 노드 (필터 무관) */
  const chartFlat = flatForAct

  /** 트리: 선택 막 + 필터 */
  const filteredFlat = useMemo(
    () => flatForAct.filter(({ n }) => visible.has(n.id)),
    [flatForAct, visible],
  )

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
  }, [focusNodeId, filteredFlat.length])

  const tensionSeries = useMemo(() => chartFlat.map(({ n }) => effectiveTension(n)), [chartFlat])
  const relaxationSeries = useMemo(() => chartFlat.map(({ n }) => effectiveRelaxation(n)), [chartFlat])
  const emotionTags = useMemo(() => chartFlat.map(({ n }) => n.emotionTag), [chartFlat])

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const scrollActs = (dir: -1 | 1) => {
    actScrollRef.current?.scrollBy({ left: dir * 140, behavior: 'smooth' })
  }

  const selectedActIndex = acts.findIndex((a) => a.id === selectedActId)

  const defaultMemoGroup = memoGroups[0] ?? null

  const openMemoEditor = (groupId: string, memoId: string) => {
    navigate(`/memo/group/${groupId}/note/${memoId}`)
  }

  const newMemoWithStoryNode = (n: StoryNode) => {
    if (!defaultMemoGroup) {
      window.alert('이 프로젝트에 메모 그룹이 없습니다. 메모 탭에서 그룹을 먼저 만드세요.')
      return
    }
    const m = addMemo(defaultMemoGroup.id)
    navigate(`/memo/group/${defaultMemoGroup.id}/note/${m.id}`, {
      state: { insertStoryNode: { id: n.id, name: n.title, nodeType: n.type } },
    })
  }

  return (
    <div className="flex flex-col gap-3 px-3 pb-4 pt-2">
      <p className="text-[11px] text-ab-sub">CHAPTER 03 · 서사</p>
      <h2 className="font-title-italic text-2xl font-semibold">전체 서사 보기</h2>

      <div className="sticky top-0 z-20 -mx-3 space-y-2 bg-ab-bg/95 px-3 pb-2 pt-1 backdrop-blur-sm">
        <SectionCard title="긴장 · 이완 곡선">
          <p className="mb-2 text-[10px] text-ab-sub">
            {selectedActId && selectedActIndex >= 0
              ? `${selectedActIndex + 1}막에 속한 노드만 반영합니다.`
              : '막이 없습니다.'}
          </p>
          {selectedActId ? (
            <StoryNarrativeChart
              tensionValues={tensionSeries}
              relaxationValues={relaxationSeries}
              emotionTags={emotionTags}
              width={340}
              height={140}
            />
          ) : (
            <div className="flex h-[100px] items-center justify-center text-xs text-ab-sub">Act 노드를 추가해 주세요.</div>
          )}
        </SectionCard>

        {acts.length > 0 && (
          <div className="flex items-stretch gap-1 rounded-lg border border-ab-border bg-ab-card px-1 py-1.5 shadow-sm">
            <button
              type="button"
              aria-label="이전 막 탭으로 스크롤"
              onClick={() => scrollActs(-1)}
              className="flex w-9 shrink-0 items-center justify-center rounded-md border border-ab-border bg-ab-muted/40 text-sm font-semibold text-ab-text active:bg-ab-muted"
            >
              &lt;
            </button>
            <div
              ref={actScrollRef}
              className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {acts.map((a, i) => {
                const on = a.id === selectedActId
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedActId(a.id)}
                    title={a.title}
                    className={`shrink-0 rounded-md border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                      on
                        ? 'border-ab-text bg-ab-text text-ab-card'
                        : 'border-ab-border bg-ab-muted/30 text-ab-text active:bg-ab-muted/60'
                    }`}
                  >
                    <span className="block text-[10px] font-normal opacity-80">Act {i + 1}</span>
                    <span className="mt-0.5 line-clamp-2 max-w-[140px]">{a.title}</span>
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              aria-label="다음 막 탭으로 스크롤"
              onClick={() => scrollActs(1)}
              className="flex w-9 shrink-0 items-center justify-center rounded-md border border-ab-border bg-ab-muted/40 text-sm font-semibold text-ab-text active:bg-ab-muted"
            >
              &gt;
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-full text-[10px] font-semibold text-ab-sub">필터</span>
          <button
            type="button"
            onClick={() => setFilter({ mode: 'all' })}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
              filter.mode === 'all' ? 'bg-ab-text text-ab-card' : 'border border-ab-border bg-ab-muted/40'
            }`}
          >
            전체
          </button>
          {STORY_EMOTION_TAG_ORDER.map((tag) => {
            const m = STORY_EMOTION_TAG_META[tag]
            const on = filter.mode === 'emotion' && filter.tag === tag
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter({ mode: 'emotion', tag })}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  on ? 'text-white' : 'border bg-ab-muted/30'
                }`}
                style={on ? { backgroundColor: m.color } : { color: m.color, borderColor: `${m.color}44` }}
              >
                {m.label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-ab-sub">캐릭터</span>
          {chars.map((c) => {
            const on = filter.mode === 'character' && filter.charId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter({ mode: 'character', charId: c.id })}
                className={`max-w-[120px] truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  on ? 'bg-ab-text text-ab-card' : 'border border-ab-border bg-ab-muted/30 text-ab-text'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      <SectionCard title="서사 노드 트리">
        <ul className="space-y-2">
          {filteredFlat.map(({ n, depth }) => {
            const te = effectiveTension(n)
            const re = effectiveRelaxation(n)
            const extraN = n.emotionExtras?.length ?? 0
            const parent = n.parentId ? byId.get(n.parentId) : undefined
            const dim = nodeIsOnInactiveBranch(n, nodes)
            const trigs = triggersByEvent.get(n.id) ?? []
            const hasTrigger = trigs.length > 0
            const pendingTrigger = trigs.some((t) => !t.activated)

            return (
              <li
                key={n.id}
                id={`story-node-${n.id}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  const t = e.target as HTMLElement
                  if (t.closest('[data-story-node-panel-trigger]')) return
                  if (t.closest('[data-story-inline-editor]')) return
                  setDrawerNode(n)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setDrawerNode(n)
                  }
                }}
                className={`relative cursor-pointer rounded-sm border bg-ab-card px-2 py-2 text-sm transition-[box-shadow,opacity] duration-300 ${
                  highlightId === n.id
                    ? 'border-ab-text shadow-[0_0_0_2px_var(--color-ab-text)]'
                    : 'border-ab-border'
                } ${dim ? 'opacity-45' : ''}`}
                style={{ marginLeft: depth * 12 }}
              >
                {parent?.isBranch && parent.activeBranchId && n.parentId === parent.id && (
                  <div
                    className="absolute -left-1 top-0 bottom-0 w-0.5 rounded-full bg-ab-sub/40"
                    aria-hidden
                    style={{
                      opacity: n.id === parent.activeBranchId ? 1 : 0.35,
                    }}
                  />
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                    <span className="text-[10px] font-semibold text-ab-sub">{LABEL[n.type]}</span>
                    {n.emotionTag && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
                        style={{ backgroundColor: STORY_EMOTION_TAG_META[n.emotionTag].color }}
                      >
                        {STORY_EMOTION_TAG_META[n.emotionTag].label}
                      </span>
                    )}
                    {n.isBranch && <span title="분기">🔀</span>}
                    {hasTrigger && (
                      <span className={pendingTrigger ? '' : 'opacity-50'} title="관계 트리거">
                        ⚡
                      </span>
                    )}
                    {n.linkedMemoIds.length > 0 && (
                      <span className="rounded-full bg-ab-muted/80 px-2 py-0.5 text-[9px] font-semibold text-ab-text ring-1 ring-ab-border">
                        메모 {n.linkedMemoIds.length}개
                      </span>
                    )}
                  </div>
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
                      data-story-node-panel-trigger
                      onClick={(e) => {
                        e.stopPropagation()
                        setPanelOpenId((id) => (id === n.id ? null : n.id))
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-ab-border bg-ab-muted/50 text-sm font-semibold leading-none text-ab-text hover:bg-ab-muted"
                      aria-expanded={panelOpenId === n.id}
                      aria-label="노드 편집"
                    >
                      ✎
                    </button>
                  </div>
                </div>
                <p className="mt-1 font-medium text-ab-text">{n.title}</p>
                {n.branchLabel && n.type === 'event' && (
                  <p className="mt-0.5 text-[10px] font-medium text-ab-sub">분기: {n.branchLabel}</p>
                )}
                <p className="mt-0.5 text-xs text-ab-sub">{n.description}</p>
                {n.characterIds.length > 0 && (
                  <div className="mt-2 flex -space-x-1.5">
                    {n.characterIds.slice(0, 6).map((cid) => {
                      const c = chars.find((x) => x.id === cid)
                      const initial = c?.name?.charAt(0) ?? '?'
                      return (
                        <div
                          key={cid}
                          title={c?.name ?? cid}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ab-card bg-ab-muted text-[10px] font-bold text-ab-text"
                          style={{
                            backgroundImage: c?.imageUri ? `url(${c.imageUri})` : undefined,
                            backgroundSize: 'cover',
                          }}
                        >
                          {!c?.imageUri ? initial : null}
                        </div>
                      )
                    })}
                  </div>
                )}
                <StoryNodeDetailPanel node={n} open={panelOpenId === n.id} onClose={() => setPanelOpenId(null)} />
              </li>
            )
          })}
          {filteredFlat.length === 0 && (
            <li className="text-xs text-ab-sub">
              {selectedActId ? '표시할 노드가 없습니다.' : '막을 선택하거나 노드를 추가해 주세요.'}
            </li>
          )}
        </ul>
      </SectionCard>

      <StoryNodeMemoDrawer
        open={drawerNode != null}
        node={drawerNode}
        projectId={pid}
        onClose={() => setDrawerNode(null)}
        onOpenMemo={openMemoEditor}
        onNewMemoWithNode={newMemoWithStoryNode}
      />
    </div>
  )
}
