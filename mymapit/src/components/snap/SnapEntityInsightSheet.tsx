import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { mentionKindMeta, type MentionKind } from '../../constants/mentionKinds'
import { effectiveRelaxation, effectiveTension } from '../../lib/storyMetrics'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMemoStore } from '../../stores/memoStore'
import { useMentionStore } from '../../stores/mentionStore'
import { effectiveMemoMentions } from '../../utils/parseMemoMentions'
import { INFO_PLACEHOLDER } from '../../lib/syncArtbookFromMemos'

type Props = {
  open: boolean
  projectId: string
  kind: MentionKind
  targetId: string
  label: string
  onClose: () => void
}

export function SnapEntityInsightSheet({ open, projectId, kind, targetId, label, onClose }: Props) {
  const navigate = useNavigate()
  const characters = useMentionStore(useShallow((s) => s.characters.filter((c) => c.projectId === projectId)))
  const worldObjects = useMentionStore(useShallow((s) => s.worldObjects.filter((o) => o.projectId === projectId)))
  const storyNodes = useArtbookStore(useShallow((s) => s.storyNodes.filter((n) => n.projectId === projectId)))
  const keywords = useArtbookStore(useShallow((s) => s.keywords.filter((k) => k.projectId === projectId)))
  const memoGroups = useMemoStore(useShallow((s) => s.memoGroups.filter((g) => g.projectId === projectId)))
  const memos = useMemoStore(useShallow((s) => s.memos))

  const meta = mentionKindMeta(kind)

  const detail = useMemo(() => {
    if (kind === 'character') {
      const c = characters.find((x) => x.id === targetId)
      if (!c)
        return {
          title: label,
          subtitle: '캐릭터',
          lines: [{ k: '상태', v: '아트북에 카드가 없습니다.' }],
          storyNodeId: undefined as string | undefined,
        }
      return {
        title: c.name,
        subtitle: `캐릭터 · ${c.role}`,
        lines: [
          { k: '대사', v: c.quote || INFO_PLACEHOLDER },
          { k: '성격', v: c.personality || INFO_PLACEHOLDER },
          { k: '능력', v: c.ability || INFO_PLACEHOLDER },
          { k: '좋아함', v: c.likes || INFO_PLACEHOLDER },
          { k: '싫어함', v: c.dislikes || INFO_PLACEHOLDER },
        ],
        storyNodeId: undefined as string | undefined,
      }
    }
    if (kind === 'event') {
      const n = storyNodes.find((x) => x.id === targetId)
      const te = n ? effectiveTension(n) : null
      const re = n ? effectiveRelaxation(n) : null
      return {
        title: n?.title ?? label,
        subtitle: n ? `서사 · ${n.type}` : '이벤트',
        lines: [
          { k: '설명', v: n?.description ?? INFO_PLACEHOLDER },
          ...(te != null
            ? [{ k: '긴장·이완', v: `긴장 ${te}${re != null ? ` · 이완 ${re}` : ''}` }]
            : []),
        ],
        storyNodeId: n?.id,
      }
    }
    if (kind === 'term') {
      const k = keywords.find((x) => x.id === targetId)
      return {
        title: k?.text ?? label,
        subtitle: '용어',
        lines: [{ k: '카테고리', v: k?.category ?? INFO_PLACEHOLDER }],
        storyNodeId: undefined as string | undefined,
      }
    }
    const o = worldObjects.find((x) => x.id === targetId)
    return {
      title: o?.name ?? label,
      subtitle: o?.type ?? mentionKindMeta(kind).label,
      lines: [
        { k: '설명', v: o?.description ?? INFO_PLACEHOLDER },
        ...(o?.tags?.length ? [{ k: '태그', v: o.tags.join(', ') }] : []),
      ],
      storyNodeId: undefined as string | undefined,
    }
  }, [kind, targetId, label, characters, worldObjects, storyNodes, keywords])

  const memoTitles = useMemo(() => {
    const gids = new Set(memoGroups.map((g) => g.id))
    const titles: string[] = []
    for (const m of memos) {
      if (!gids.has(m.groupId)) continue
      const list = effectiveMemoMentions(m.content, m.mentions)
      if (list.some((x) => x.targetId === targetId && x.kind === kind)) {
        titles.push(m.title.trim() || '(제목 없음)')
      }
    }
    return titles.slice(0, 14)
  }, [memos, memoGroups, targetId, kind])

  const goStory = () => {
    if (!detail.storyNodeId) return
    onClose()
    navigate(`/artbook?tab=story&node=${encodeURIComponent(detail.storyNodeId)}`)
  }

  if (!open) return null

  return (
    <>
      <button type="button" className="fixed inset-0 z-[88] bg-ab-text/35" aria-label="닫기" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="snap-insight-title"
        className="fixed inset-x-0 bottom-0 z-[89] max-h-[min(78vh,520px)] rounded-t-xl border border-ab-border border-b-0 bg-ab-card shadow-[0_-12px_40px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mt-1 h-1 w-9 rounded-full bg-ab-border" aria-hidden />
        <div
          className="border-b border-ab-border px-4 py-3"
          style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ab-sub">{meta.label} · Snap 정보</p>
          <h2 id="snap-insight-title" className="mt-1 font-title-italic text-xl font-semibold text-ab-text">
            @{detail.title}
          </h2>
          <p className="mt-0.5 text-xs text-ab-sub">{detail.subtitle}</p>
        </div>
        <div className="max-h-[min(52vh,360px)] overflow-y-auto px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold text-ab-sub">
            아트북·메모에서 모은 요약 (기존 @@ 자리 — AI 없이 구조화)
          </p>
          <ul className="space-y-2.5">
            {detail.lines.map((row) => (
              <li key={row.k} className="rounded-md border border-ab-border/80 bg-ab-muted/30 px-3 py-2">
                <p className="text-[10px] font-medium text-ab-sub">{row.k}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ab-text">{row.v}</p>
              </li>
            ))}
          </ul>
          {memoTitles.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ab-sub">등장 메모</p>
              <ul className="mt-1.5 space-y-1 text-xs text-ab-text">
                {memoTitles.map((t, i) => (
                  <li key={`${t}-${i}`} className="rounded-sm bg-ab-muted/40 px-2 py-1">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {kind === 'event' && detail.storyNodeId && (
            <button
              type="button"
              onClick={goStory}
              className="mt-4 w-full rounded-md border border-ab-border bg-ab-muted/50 py-2.5 text-sm font-medium text-ab-text active:bg-ab-muted"
            >
              서사 탭에서 노드 열기
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full border-t border-ab-border py-3 text-sm text-ab-sub"
        >
          닫기
        </button>
      </div>
    </>
  )
}
