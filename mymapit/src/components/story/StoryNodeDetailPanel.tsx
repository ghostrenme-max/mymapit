import { useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/shallow'
import {
  STORY_EMOTION_TAG_META,
  STORY_EMOTION_TAG_ORDER,
  TRIGGER_EMOTION_LABEL,
  TRIGGER_EMOTION_ORDER,
  type StoryEmotionTag,
  type TriggerEmotion,
} from '../../constants/storyNarrative'
import { clampStoryMetric, effectiveRelaxation, effectiveTension, STORY_METRIC_MAX, STORY_METRIC_MIN } from '../../lib/storyMetrics'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMentionStore } from '../../stores/mentionStore'
import { useProjectStore } from '../../stores/projectStore'
import type { StoryNode } from '../../stores/types'

function newTriggerId() {
  return `rt-${crypto.randomUUID().slice(0, 10)}`
}

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
          onClick={() => onChange(clampStoryMetric(value - 1))}
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-xs font-semibold tabular-nums text-ab-text">{value}</span>
        <button
          type="button"
          className="flex h-7 w-8 items-center justify-center text-sm leading-none text-ab-text hover:bg-ab-muted"
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

export function StoryNodeDetailPanel({ node, open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const pid = useProjectStore((s) => s.currentProjectId)
  const patchStoryNode = useArtbookStore((s) => s.patchStoryNode)
  const setStoryNodeCharacterIds = useArtbookStore((s) => s.setStoryNodeCharacterIds)
  const relationTriggers = useArtbookStore(useShallow((s) => s.relationTriggers.filter((t) => t.eventNodeId === node.id)))
  const addRelationTrigger = useArtbookStore((s) => s.addRelationTrigger)
  const patchRelationTrigger = useArtbookStore((s) => s.patchRelationTrigger)
  const removeRelationTrigger = useArtbookStore((s) => s.removeRelationTrigger)
  const activateEventTriggers = useArtbookStore((s) => s.activateEventTriggers)
  const nodes = useArtbookStore(useShallow((s) => (pid ? s.storyNodes.filter((n) => n.projectId === pid) : [])))
  const chars = useMentionStore(useShallow((s) => (pid ? s.characters.filter((c) => c.projectId === pid) : [])))

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('[data-story-node-panel-trigger]')) return
      const el = panelRef.current
      if (el && !el.contains(e.target as Node)) onClose()
    }
    const timer = window.setTimeout(() => document.addEventListener('mousedown', onDoc), 0)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mousedown', onDoc)
    }
  }, [open, onClose])

  const parent = useMemo(() => nodes.find((n) => n.id === node.parentId), [nodes, node.parentId])
  const childEvents = useMemo(
    () => nodes.filter((n) => n.parentId === node.id && n.type === 'event').sort((a, b) => a.order - b.order),
    [nodes, node.id],
  )
  const showBranchLabel = node.type === 'event' && parent?.type === 'event' && parent.isBranch
  const branchTooMany = node.type === 'event' && node.isBranch && childEvents.length > 2

  if (!open) return null

  const t = effectiveTension(node)
  const r = effectiveRelaxation(node)

  const toggleChar = (cid: string) => {
    const on = node.characterIds.includes(cid)
    const next = on ? node.characterIds.filter((x) => x !== cid) : [...node.characterIds, cid]
    setStoryNodeCharacterIds(node.id, next)
  }

  const setTag = (tag: StoryEmotionTag | null) => patchStoryNode(node.id, { emotionTag: tag })

  const addTrigger = () => {
    if (chars.length < 2) return
    addRelationTrigger({
      id: newTriggerId(),
      eventNodeId: node.id,
      characterAId: chars[0]!.id,
      characterBId: chars[1]!.id,
      fromEmotion: 'neutral',
      toEmotion: 'hate',
      activated: false,
    })
  }

  return (
    <div
      ref={panelRef}
      data-story-inline-editor
      className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[min(70vh,480px)] overflow-y-auto rounded-sm border border-ab-border border-l-2 border-l-ab-point bg-ab-card p-3 shadow-lg"
      role="dialog"
      aria-label="서사 노드 편집"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="mb-2 text-[10px] font-semibold text-ab-sub">노드 편집 · {node.type.toUpperCase()}</p>

      <label className="block text-[10px] text-ab-sub">제목</label>
      <input
        value={node.title}
        onChange={(e) => patchStoryNode(node.id, { title: e.target.value })}
        className="mb-2 mt-0.5 w-full rounded border border-ab-border bg-ab-input px-2 py-1.5 text-sm text-ab-text"
      />
      <label className="block text-[10px] text-ab-sub">설명</label>
      <textarea
        value={node.description}
        onChange={(e) => patchStoryNode(node.id, { description: e.target.value })}
        rows={3}
        className="mb-3 mt-0.5 w-full resize-none rounded border border-ab-border bg-ab-input px-2 py-1.5 text-xs text-ab-text"
      />

      <p className="mb-1.5 text-[10px] font-semibold text-ab-sub">감정 온도 태그 (단일)</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTag(null)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
            node.emotionTag == null ? 'bg-ab-text text-ab-card' : 'border border-ab-border bg-ab-muted/40 text-ab-text'
          }`}
        >
          없음
        </button>
        {STORY_EMOTION_TAG_ORDER.map((tag) => {
          const m = STORY_EMOTION_TAG_META[tag]
          const on = node.emotionTag === tag
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setTag(tag)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                on ? 'text-white' : 'border border-ab-border bg-ab-muted/30'
              }`}
              style={on ? { backgroundColor: m.color } : { color: m.color, borderColor: `${m.color}55` }}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      <p className="mb-1.5 text-[10px] font-semibold text-ab-sub">등장 캐릭터</p>
      <ul className="mb-3 max-h-28 space-y-1 overflow-y-auto rounded border border-ab-border/80 bg-ab-muted/20 p-2">
        {chars.map((c) => {
          const on = node.characterIds.includes(c.id)
          return (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ab-text">
                <input type="checkbox" checked={on} onChange={() => toggleChar(c.id)} className="accent-ab-text" />
                {c.name}
              </label>
            </li>
          )
        })}
        {chars.length === 0 && <li className="text-xs text-ab-sub">캐릭터 없음</li>}
      </ul>

      <p className="mb-2 text-[10px] font-semibold text-ab-sub">
        긴장·이완 ({STORY_METRIC_MIN}~{STORY_METRIC_MAX})
      </p>
      <div className="mb-3 flex flex-row flex-wrap justify-around gap-4">
        <HorizontalMetricStepper label="긴장" value={t} onChange={(v) => patchStoryNode(node.id, { tension: v })} />
        <HorizontalMetricStepper
          label="이완"
          value={r}
          onChange={(v) => patchStoryNode(node.id, { relaxation: v })}
        />
      </div>

      {showBranchLabel && (
        <>
          <p className="mb-1 text-[10px] font-semibold text-ab-sub">이 분기 루트 선택 시 (설명)</p>
          <input
            value={node.branchLabel ?? ''}
            onChange={(e) => patchStoryNode(node.id, { branchLabel: e.target.value || null })}
            placeholder="예: 구출한다 / 도망친다"
            className="mb-3 w-full rounded border border-ab-border bg-ab-input px-2 py-1.5 text-xs text-ab-text"
          />
        </>
      )}

      {node.type === 'event' && (
        <>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ab-text">
            <input
              type="checkbox"
              checked={node.isBranch}
              onChange={(e) => {
                const isBranch = e.target.checked
                const kids = nodes.filter((n) => n.parentId === node.id && n.type === 'event')
                patchStoryNode(node.id, {
                  isBranch,
                  activeBranchId: isBranch ? node.activeBranchId ?? kids[0]?.id ?? null : null,
                })
              }}
              className="accent-ab-text"
            />
            분기 이벤트 (자식 이벤트 최대 2개)
          </label>
          {branchTooMany && (
            <p className="mt-1 text-[10px] text-amber-700">자식 이벤트가 2개를 넘습니다. 트리에서 정리해 주세요.</p>
          )}
          {node.isBranch && (
            <div className="mt-2">
              <label className="text-[10px] text-ab-sub">활성 루트 (메인 스토리)</label>
              <select
                value={node.activeBranchId ?? ''}
                onChange={(e) => patchStoryNode(node.id, { activeBranchId: e.target.value || null })}
                className="mt-0.5 w-full rounded border border-ab-border bg-ab-input px-2 py-1.5 text-xs text-ab-text"
              >
                <option value="">선택…</option>
                {childEvents.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.branchLabel?.trim() || ch.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4 border-t border-ab-border pt-3">
            <p className="text-[10px] font-semibold text-ab-sub">관계 변화 트리거 ⚡</p>
            <ul className="mt-2 space-y-3">
              {relationTriggers.map((tr) => (
                <li key={tr.id} className="rounded border border-ab-border/80 bg-ab-muted/25 p-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-ab-sub">A</span>
                      <select
                        value={tr.characterAId}
                        onChange={(e) => patchRelationTrigger(tr.id, { characterAId: e.target.value })}
                        className="mt-0.5 w-full rounded border border-ab-border bg-ab-card px-1 py-1 text-[10px]"
                      >
                        {chars.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[9px] text-ab-sub">B</span>
                      <select
                        value={tr.characterBId}
                        onChange={(e) => patchRelationTrigger(tr.id, { characterBId: e.target.value })}
                        className="mt-0.5 w-full rounded border border-ab-border bg-ab-card px-1 py-1 text-[10px]"
                      >
                        {chars.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={tr.fromEmotion}
                      onChange={(e) =>
                        patchRelationTrigger(tr.id, { fromEmotion: e.target.value as TriggerEmotion })
                      }
                      className="rounded border border-ab-border bg-ab-card px-1 py-1 text-[10px]"
                    >
                      {TRIGGER_EMOTION_ORDER.map((k) => (
                        <option key={k} value={k}>
                          {TRIGGER_EMOTION_LABEL[k]}
                        </option>
                      ))}
                    </select>
                    <span className="text-ab-sub">→</span>
                    <select
                      value={tr.toEmotion}
                      onChange={(e) =>
                        patchRelationTrigger(tr.id, { toEmotion: e.target.value as TriggerEmotion })
                      }
                      className="rounded border border-ab-border bg-ab-card px-1 py-1 text-[10px]"
                    >
                      {TRIGGER_EMOTION_ORDER.map((k) => (
                        <option key={k} value={k}>
                          {TRIGGER_EMOTION_LABEL[k]}
                        </option>
                      ))}
                    </select>
                    {tr.activated && <span className="text-[10px] text-ab-sub">적용됨</span>}
                    <button
                      type="button"
                      onClick={() => removeRelationTrigger(tr.id)}
                      className="ml-auto text-[10px] text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addTrigger}
              className="mt-2 w-full rounded border border-dashed border-ab-border py-2 text-[11px] font-medium text-ab-text"
            >
              + 트리거 추가
            </button>
            <button
              type="button"
              onClick={() => activateEventTriggers(node.id)}
              className="mt-2 w-full rounded bg-ab-text py-2.5 text-sm font-semibold text-ab-card"
            >
              이벤트 활성화 (트리거 실행)
            </button>
            <p className="mt-1 text-[9px] leading-snug text-ab-sub">
              A의 B에 대한 관계에서 narrative 감정이 &quot;이전&quot;과 일치할 때 &quot;이후&quot;로 바뀝니다. (카드
              관계에 감정 축이 없으면 바로 적용)
            </p>
          </div>
        </>
      )}
    </div>
  )
}
