import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { MENTION_TAB_ROWS, mentionKindMeta } from '../../constants/mentionKinds'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMentionStore } from '../../stores/mentionStore'
import type { Mention } from '../../stores/types'
import { TajiTag } from '../common/TajiTag'

type Props = {
  open: boolean
  mention: Mention | null
  onClose: () => void
}

function legendChipStyle(row: { color: string; bg: string }) {
  return {
    color: row.color,
    backgroundColor: row.bg,
    borderRadius: 3,
    padding: '2px 8px',
  } as const
}

export function TajiPanel({ open, mention, onClose }: Props) {
  const [showColorLegend, setShowColorLegend] = useState(false)

  const characters = useMentionStore((s) => s.characters)
  const worldObjects = useMentionStore((s) => s.worldObjects)
  const storyNodes = useArtbookStore(useShallow((s) => s.storyNodes))
  const keywords = useArtbookStore((s) => s.keywords)

  const meta = mention ? mentionKindMeta(mention.kind) : null

  const detail = useMemo(() => {
    if (!mention) return null
    const { kind, targetId, targetName } = mention

    if (kind === 'character') {
      const c = characters.find((x) => x.id === targetId)
      if (!c)
        return {
          title: targetName,
          role: '—',
          body: '캐릭터 정보 없음',
          tags: [] as string[],
          story: [] as string[],
          quote: undefined as string | undefined,
        }
      const stories = c.storyNodeIds
        .map((id) => storyNodes.find((n) => n.id === id)?.title)
        .filter(Boolean) as string[]
      return {
        title: c.name,
        role: c.role,
        body: c.personality || c.ability || '—',
        tags: c.tags,
        quote: c.quote,
        story: stories,
      }
    }

    if (kind === 'event') {
      const n = storyNodes.find((x) => x.id === targetId)
      return {
        title: n?.title ?? targetName,
        role: n ? n.type.toUpperCase() : 'EVENT',
        body: n?.description ?? '서사 노드 정보 없음',
        tags: [] as string[],
        story: [] as string[],
        quote: undefined as string | undefined,
        tension: n?.tension,
      }
    }

    if (kind === 'term') {
      const k = keywords.find((x) => x.id === targetId)
      return {
        title: k?.text ?? targetName,
        role: '용어',
        body: `카테고리: ${k?.category ?? '—'}`,
        tags: [] as string[],
        story: [] as string[],
        quote: undefined as string | undefined,
      }
    }

    const o = worldObjects.find((x) => x.id === targetId)
    return {
      title: o?.name ?? targetName,
      role: o?.type ?? kind,
      body: o?.description ?? '항목 정보 없음',
      tags: o?.tags ?? [],
      story: [] as string[],
      quote: undefined as string | undefined,
    }
  }, [mention, characters, worldObjects, storyNodes, keywords])

  useEffect(() => {
    setShowColorLegend(false)
  }, [open, mention?.id, mention?.targetId])

  if (!open || !mention || !detail || !meta) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-ab-text/30"
        aria-label="패널 닫기"
        onClick={onClose}
      />
      <aside className="animate-ab-slide-in-right fixed right-0 top-0 z-[56] flex h-full w-[min(320px,88vw)] flex-col border-l border-ab-border bg-ab-card shadow-xl">
        <div
          className="flex shrink-0 items-center justify-between border-b border-ab-border px-3 py-2.5"
          style={{ backgroundColor: meta.bg, borderBottomColor: meta.color, borderBottomWidth: 2 }}
        >
          <span
            className="text-[11px] font-semibold leading-none"
            style={legendChipStyle(meta)}
          >
            {meta.label}
          </span>
          <button type="button" onClick={onClose} className="text-sm font-medium" style={{ color: meta.color }}>
            닫기
          </button>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-4 text-[11px] leading-relaxed" style={legendChipStyle(meta)}>
              <span className="font-semibold">{meta.label}</span>
              <span className="mx-1 opacity-80">·</span>
              <span className="opacity-90">{meta.hueName}</span>
              <span className="mx-1 opacity-60">·</span>
              <span>{meta.meaning}</span>
              <span className="mt-1 block text-[10px] font-mono opacity-80">{meta.color}</span>
            </div>

            <h2 className="font-title-italic text-xl font-semibold text-ab-text">{detail.title}</h2>
            <p className="mt-1 text-xs text-ab-sub">{detail.role}</p>
            {'tension' in detail && detail.tension != null && (
              <p className="mt-1 text-xs tabular-nums text-ab-sub">긴장도 {detail.tension}</p>
            )}
            {detail.quote && (
              <p className="mt-3 border-l-2 pl-3 text-sm italic text-ab-text" style={{ borderColor: meta.color }}>
                {detail.quote}
              </p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-ab-text">{detail.body}</p>
            {detail.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {detail.tags.map((t) => (
                  <TajiTag key={t} variant="gray">
                    {t}
                  </TajiTag>
                ))}
              </div>
            )}
            {detail.story.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ab-sub">등장 서사</p>
                <ul className="mt-2 space-y-1 text-sm text-ab-text">
                  {detail.story.map((t) => (
                    <li key={t} className="rounded-sm bg-ab-muted/50 px-2 py-1.5">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="shrink-0 border-t border-ab-border bg-ab-card"
            style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
          >
            {showColorLegend && (
              <div className="max-h-[min(42vh,280px)] overflow-y-auto border-b border-ab-border px-3 py-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ab-sub">@ 태그 색 의미</p>
                <ul className="flex flex-col gap-1.5">
                  {MENTION_TAB_ROWS.map((row) => (
                    <li
                      key={row.kind}
                      className="text-[11px] leading-snug"
                      style={legendChipStyle(row)}
                    >
                      <span className="font-semibold">{row.label}</span>
                      <span className="mx-1 opacity-70">·</span>
                      <span className="opacity-90">{row.hueName}</span>
                      <span className="mx-1 opacity-60">·</span>
                      <span>{row.meaning}</span>
                      <span className="mt-0.5 block font-mono text-[9px] opacity-75">{row.color}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowColorLegend((v) => !v)}
              className="flex w-full items-center justify-center gap-1.5 py-3.5 text-xs font-semibold text-ab-text active:bg-ab-muted/60"
              aria-expanded={showColorLegend}
            >
              <span>@ 태그 색 의미</span>
              <span className="text-ab-sub" aria-hidden>
                {showColorLegend ? '▲' : '▼'}
              </span>
              <span className="text-[10px] font-normal text-ab-sub">
                {showColorLegend ? '접기' : '설명 보기'}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
