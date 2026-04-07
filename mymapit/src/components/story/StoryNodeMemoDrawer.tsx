import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { STORY_EMOTION_TAG_META, TRIGGER_EMOTION_LABEL } from '../../constants/storyNarrative'
import { effectiveTension } from '../../lib/storyMetrics'
import { stripMemoHtml } from '../../utils/memoHtml'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMemoStore } from '../../stores/memoStore'
import { useMentionStore } from '../../stores/mentionStore'
import type { StoryNode } from '../../stores/types'

const TYPE_BADGE: Record<StoryNode['type'], string> = {
  act: 'ACT',
  scene: 'SCENE',
  event: 'EVENT',
}

type Props = {
  open: boolean
  node: StoryNode | null
  projectId: string | null
  onClose: () => void
  onOpenMemo: (groupId: string, memoId: string) => void
  onNewMemoWithNode: (node: StoryNode) => void
}

export function StoryNodeMemoDrawer({
  open,
  node,
  projectId,
  onClose,
  onOpenMemo,
  onNewMemoWithNode,
}: Props) {
  const memos = useMemoStore(useShallow((s) => s.memos))
  const groups = useMemoStore(useShallow((s) => s.memoGroups))
  const chars = useMentionStore(useShallow((s) => (projectId ? s.characters.filter((c) => c.projectId === projectId) : [])))
  const triggers = useArtbookStore(
    useShallow((s) => (node ? s.relationTriggers.filter((t) => t.eventNodeId === node.id) : [])),
  )

  const linked = useMemo(() => {
    if (!node) return []
    const gById = new Map(groups.map((g) => [g.id, g]))
    const rows: { memoId: string; groupId: string; groupName: string; title: string; preview: string; updatedAt: string }[] = []
    for (const mid of node.linkedMemoIds) {
      const m = memos.find((x) => x.id === mid)
      if (!m) continue
      const g = gById.get(m.groupId)
      const plain = stripMemoHtml(m.content).trim().replace(/\s+/g, ' ')
      rows.push({
        memoId: m.id,
        groupId: m.groupId,
        groupName: g?.name ?? '그룹',
        title: m.title.trim() || '(제목 없음)',
        preview: plain.slice(0, 72) + (plain.length > 72 ? '…' : ''),
        updatedAt: m.updatedAt,
      })
    }
    rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    return rows
  }, [node, memos, groups])

  if (!open || !node) return null

  const te = effectiveTension(node)
  const tag = node.emotionTag ? STORY_EMOTION_TAG_META[node.emotionTag] : null

  return (
    <>
      <button type="button" className="fixed inset-0 z-[86] bg-ab-text/35" aria-label="닫기" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-[87] max-h-[min(82vh,560px)] rounded-t-xl border border-ab-border border-b-0 bg-ab-card shadow-[0_-12px_40px_rgba(0,0,0,0.14)]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mt-1 h-1 w-9 rounded-full bg-ab-border" aria-hidden />
        <div className="max-h-[min(70vh,480px)] overflow-y-auto px-4 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded px-2 py-0.5 text-[10px] font-bold text-ab-sub ring-1 ring-ab-border">
              {TYPE_BADGE[node.type]}
            </span>
            {tag && (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.label}
              </span>
            )}
          </div>
          <h2 className="mt-2 font-title-italic text-xl font-semibold text-ab-text">{node.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-ab-sub">{node.description}</p>
          <p className="mt-2 text-[11px] font-medium text-ab-text">
            긴장 <span className="tabular-nums">{te}</span>
            {node.relaxation != null ? (
              <>
                <span className="text-ab-sub"> · </span>이완{' '}
                <span className="tabular-nums">{node.relaxation}</span>
              </>
            ) : null}
          </p>

          {node.characterIds.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold text-ab-sub">등장 캐릭터</p>
              <div className="mt-2 flex -space-x-1.5">
                {node.characterIds.slice(0, 8).map((cid) => {
                  const c = chars.find((x) => x.id === cid)
                  const initial = c?.name?.charAt(0) ?? '?'
                  return (
                    <div
                      key={cid}
                      title={c?.name ?? cid}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ab-card bg-ab-muted text-[11px] font-bold text-ab-text"
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
            </div>
          )}

          <div className="mt-4 border-t border-ab-border pt-3">
            <p className="text-[10px] font-semibold text-ab-sub">연결된 메모</p>
            {linked.length === 0 ? (
              <p className="mt-2 text-xs text-ab-sub">연결된 메모가 없습니다.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {linked.map((row) => (
                  <li key={row.memoId}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onOpenMemo(row.groupId, row.memoId)
                      }}
                      className="w-full rounded-lg border border-ab-border bg-ab-muted/25 px-3 py-2.5 text-left active:bg-ab-muted/50"
                    >
                      <p className="text-[10px] text-ab-sub">{row.groupName}</p>
                      <p className="mt-0.5 text-sm font-medium text-ab-text">{row.title}</p>
                      {row.preview ? <p className="mt-1 line-clamp-2 text-[11px] text-ab-sub">{row.preview}</p> : null}
                      <p className="mt-1 text-[9px] text-ab-sub">
                        {new Date(row.updatedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {node.type === 'event' && triggers.length > 0 && (
            <div className="mt-4 border-t border-ab-border pt-3">
              <p className="text-[10px] font-semibold text-ab-sub">관계 트리거 ⚡</p>
              <ul className="mt-2 space-y-1.5 text-[11px] text-ab-text">
                {triggers.map((t) => {
                  const an = chars.find((c) => c.id === t.characterAId)?.name ?? t.characterAId
                  const bn = chars.find((c) => c.id === t.characterBId)?.name ?? t.characterBId
                  return (
                    <li key={t.id} className="rounded border border-ab-border/70 bg-ab-muted/20 px-2 py-1.5">
                      {an} → {bn}: {TRIGGER_EMOTION_LABEL[t.fromEmotion]} → {TRIGGER_EMOTION_LABEL[t.toEmotion]}
                      {t.activated ? <span className="ml-1 text-ab-sub">(적용됨)</span> : null}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onClose()
              onNewMemoWithNode(node)
            }}
            className="mt-5 w-full rounded-lg border-2 border-dashed border-ab-border py-3 text-sm font-semibold text-ab-text active:bg-ab-muted/40"
          >
            + 이 노드로 새 메모 작성
          </button>
        </div>
      </div>
    </>
  )
}
