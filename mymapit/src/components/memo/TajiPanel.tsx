import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { MENTION_TAB_ROWS, mentionKindMeta } from '../../constants/mentionKinds'
import { effectiveRelaxation, effectiveTension } from '../../lib/storyMetrics'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMentionStore } from '../../stores/mentionStore'
import type { MemoEntitySideNote, Mention } from '../../stores/types'
import { TajiTag } from '../common/TajiTag'

type Props = {
  open: boolean
  mention: Mention | null
  /** 현재 메모 본문에서 함께 등장한 다른 @ (Snap 연결) */
  sameMemoMentions?: Mention[]
  onClose: () => void
  /** 이 메모 안에서만 쓰는 관계·비밀·상태 (아트북 본문과 별도) */
  memoSideNote?: {
    note: MemoEntitySideNote
    onSave: (note: MemoEntitySideNote) => void
  }
}

function legendChipStyle(row: { color: string; bg: string }) {
  return {
    color: row.color,
    backgroundColor: row.bg,
    borderRadius: 3,
    padding: '2px 8px',
  } as const
}

type StoryLink = { id: string; title: string }

export function TajiPanel({
  open,
  mention,
  sameMemoMentions = [],
  onClose,
  memoSideNote,
}: Props) {
  const navigate = useNavigate()
  const [showColorLegend, setShowColorLegend] = useState(false)
  const [rel, setRel] = useState('')
  const [sec, setSec] = useState('')
  const [st, setSt] = useState('')

  const flushSideNote = () => {
    if (!memoSideNote) return
    memoSideNote.onSave({ relationship: rel, secret: sec, status: st })
  }

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
          storyLinks: [] as StoryLink[],
          quote: undefined as string | undefined,
        }
      const storyLinks: StoryLink[] = c.storyNodeIds
        .map((id) => {
          const n = storyNodes.find((x) => x.id === id)
          return n ? { id: n.id, title: n.title } : null
        })
        .filter((x): x is StoryLink => x != null)
      return {
        title: c.name,
        role: c.role,
        body: c.personality || c.ability || '—',
        tags: c.tags,
        quote: c.quote,
        storyLinks,
      }
    }

    if (kind === 'event') {
      const n = storyNodes.find((x) => x.id === targetId)
      const storyLinks: StoryLink[] =
        n ? [{ id: n.id, title: n.title }] : []
      return {
        title: n?.title ?? targetName,
        role: n ? n.type.toUpperCase() : 'EVENT',
        body: n?.description ?? '서사 노드 정보 없음',
        tags: [] as string[],
        storyLinks,
        quote: undefined as string | undefined,
        tension: n ? effectiveTension(n) : undefined,
        relaxation: n ? effectiveRelaxation(n) : undefined,
      }
    }

    if (kind === 'term') {
      const k = keywords.find((x) => x.id === targetId)
      return {
        title: k?.text ?? targetName,
        role: '용어',
        body: `카테고리: ${k?.category ?? '—'}`,
        tags: [] as string[],
        storyLinks: [] as StoryLink[],
        quote: undefined as string | undefined,
      }
    }

    const o = worldObjects.find((x) => x.id === targetId)
    return {
      title: o?.name ?? targetName,
      role: o?.type ?? kind,
      body: o?.description ?? '항목 정보 없음',
      tags: o?.tags ?? [],
      storyLinks: [] as StoryLink[],
      quote: undefined as string | undefined,
    }
  }, [mention, characters, worldObjects, storyNodes, keywords])

  const goToStoryNode = (nodeId: string) => {
    onClose()
    navigate(`/artbook?tab=story&node=${encodeURIComponent(nodeId)}`)
  }

  useEffect(() => {
    setShowColorLegend(false)
  }, [open, mention?.id, mention?.targetId])

  useEffect(() => {
    if (!memoSideNote) {
      setRel('')
      setSec('')
      setSt('')
      return
    }
    setRel(memoSideNote.note.relationship)
    setSec(memoSideNote.note.secret)
    setSt(memoSideNote.note.status)
  }, [
    open,
    mention?.targetId,
    memoSideNote?.note.relationship,
    memoSideNote?.note.secret,
    memoSideNote?.note.status,
  ])

  if (!open || !mention || !detail || !meta) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-ab-text/30"
        aria-label="패널 닫기"
        onClick={onClose}
      />
      <aside className="animate-ab-slide-in-right fixed right-0 top-0 z-[56] flex h-full w-[min(320px,88vw)] flex-col border-y border-r border-ab-border border-l-2 border-l-ab-text bg-ab-card">
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
              <span>{meta.meaning}</span>
            </div>

            <h2 className="font-title-italic text-xl font-semibold text-ab-text">{detail.title}</h2>
            <p className="mt-1 text-xs text-ab-sub">{detail.role}</p>
            {'tension' in detail && detail.tension != null && (
              <p className="mt-1 text-xs tabular-nums text-ab-sub">
                긴장 {detail.tension}
                {'relaxation' in detail && detail.relaxation != null
                  ? ` · 이완 ${detail.relaxation}`
                  : ''}
              </p>
            )}
            {detail.quote && (
              <p className="mt-3 border-l-2 pl-3 text-sm italic text-ab-text" style={{ borderColor: meta.color }}>
                {detail.quote}
              </p>
            )}
            {memoSideNote && (
              <div className="mt-5 rounded-sm border border-ab-border bg-ab-muted/25 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ab-sub">이 메모에서만</p>
                <p className="mt-1 text-[11px] leading-snug text-ab-sub">
                  아트북 카드와 별도로, 이 글 맥락만의 관계·비밀·상태를 적어 둘 수 있어요.
                </p>
                <label className="mt-3 block text-[11px] font-medium text-ab-text">관계 (한 줄)</label>
                <textarea
                  value={rel}
                  onChange={(e) => setRel(e.target.value)}
                  onBlur={flushSideNote}
                  rows={2}
                  className="mt-1 w-full resize-y rounded-sm border border-ab-border bg-ab-input px-2 py-1.5 text-xs text-ab-text outline-none"
                  placeholder="예: 이번 장에서는 적대"
                />
                <label className="mt-2 block text-[11px] font-medium text-ab-text">비밀 / 미공개 설정</label>
                <textarea
                  value={sec}
                  onChange={(e) => setSec(e.target.value)}
                  onBlur={flushSideNote}
                  rows={2}
                  className="mt-1 w-full resize-y rounded-sm border border-ab-border bg-ab-input px-2 py-1.5 text-xs text-ab-text outline-none"
                  placeholder="독자에게 숨긴 정보"
                />
                <label className="mt-2 block text-[11px] font-medium text-ab-text">현재 상태</label>
                <textarea
                  value={st}
                  onChange={(e) => setSt(e.target.value)}
                  onBlur={flushSideNote}
                  rows={2}
                  className="mt-1 w-full resize-y rounded-sm border border-ab-border bg-ab-input px-2 py-1.5 text-xs text-ab-text outline-none"
                  placeholder="이 메모 시점에서의 상태"
                />
              </div>
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
            {sameMemoMentions.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ab-sub">같은 메모 Snap</p>
                <p className="mt-1 text-[11px] leading-snug text-ab-sub">
                  이 메모 안에서 함께 쓰인 @ — 에디터에서도 연관 멘션이 강조됩니다.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sameMemoMentions.map((m) => {
                    const mm = mentionKindMeta(m.kind)
                    return (
                      <span
                        key={m.id}
                        className="text-[11px] font-semibold"
                        style={{
                          color: mm.color,
                          backgroundColor: mm.bg,
                          padding: '2px 8px',
                          borderRadius: 3,
                        }}
                      >
                        @{m.targetName}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
            {detail.storyLinks.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ab-sub">등장 서사</p>
                <ul className="mt-2 space-y-1 text-sm text-ab-text">
                  {detail.storyLinks.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => goToStoryNode(s.id)}
                        className="w-full rounded-sm bg-ab-muted/50 px-2 py-1.5 text-left text-ab-text active:bg-ab-muted"
                      >
                        {s.title}
                      </button>
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
                      <span>{row.meaning}</span>
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
