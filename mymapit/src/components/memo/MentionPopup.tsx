import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import type { MentionKind } from '../../constants/mentionKinds'
import { MENTION_TAB_ROWS, mentionKindMeta } from '../../constants/mentionKinds'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMentionStore } from '../../stores/mentionStore'

export type MentionPick = {
  kind: MentionKind
  targetId: string
  name: string
}

type Props = {
  projectId: string | null
  filterQuery: string
  onPick: (p: MentionPick) => void
  onClose: () => void
}

export function MentionPopup({ projectId, filterQuery, onPick, onClose }: Props) {
  const [tab, setTab] = useState<MentionKind>('character')

  const characters = useMentionStore(
    useShallow((s) => (projectId ? s.characters.filter((c) => c.projectId === projectId) : [])),
  )
  const worldObjects = useMentionStore(
    useShallow((s) => (projectId ? s.worldObjects.filter((o) => o.projectId === projectId) : [])),
  )
  const storyNodes = useArtbookStore(
    useShallow((s) => (projectId ? s.storyNodes.filter((n) => n.projectId === projectId) : [])),
  )
  const keywords = useArtbookStore(
    useShallow((s) => (projectId ? s.keywords.filter((k) => k.projectId === projectId) : [])),
  )

  useEffect(() => {
    const t = window.setTimeout(() => onClose(), 3000)
    return () => window.clearTimeout(t)
  }, [filterQuery, tab, onClose])

  const list = useMemo(() => {
    const q = filterQuery.toLowerCase()
    const match = (name: string) => !q || name.toLowerCase().includes(q)

    switch (tab) {
      case 'character':
        return characters
          .filter((c) => match(c.name))
          .map((c) => ({ kind: 'character' as const, id: c.id, name: c.name }))
      case 'world':
        return worldObjects
          .filter((o) => o.type === '세계' && match(o.name))
          .map((o) => ({ kind: 'world' as const, id: o.id, name: o.name }))
      case 'object':
        return worldObjects
          .filter((o) => o.type === '오브젝트' && match(o.name))
          .map((o) => ({ kind: 'object' as const, id: o.id, name: o.name }))
      case 'place':
        return worldObjects
          .filter((o) => o.type === '장소' && match(o.name))
          .map((o) => ({ kind: 'place' as const, id: o.id, name: o.name }))
      case 'event':
        return storyNodes
          .filter((n) => n.type === 'event' && match(n.title))
          .map((n) => ({ kind: 'event' as const, id: n.id, name: n.title }))
      case 'faction':
        return worldObjects
          .filter((o) => o.type === '세력' && match(o.name))
          .map((o) => ({ kind: 'faction' as const, id: o.id, name: o.name }))
      case 'term':
        return keywords
          .filter((k) => match(k.text))
          .map((k) => ({ kind: 'term' as const, id: k.id, name: k.text }))
      default:
        return []
    }
  }, [tab, characters, worldObjects, storyNodes, keywords, filterQuery])

  return (
    <div
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 border-t border-ab-border bg-ab-card pb-2 shadow-[0_-8px_24px_rgba(17,17,16,0.08)]"
      onMouseDown={(e) => e.preventDefault()}
      role="presentation"
    >
      <div className="flex overflow-x-auto border-b border-ab-border">
        {MENTION_TAB_ROWS.map((row) => {
          const on = tab === row.kind
          return (
            <button
              key={row.kind}
              type="button"
              onClick={() => setTab(row.kind)}
              className={`flex min-w-[56px] shrink-0 flex-col items-stretch border-b-2 transition-colors ${
                on ? 'border-transparent' : 'border-transparent opacity-75'
              }`}
            >
              <span
                className="mx-1 mt-1 h-1 rounded-full"
                style={{ backgroundColor: row.color, opacity: on ? 1 : 0.45 }}
                aria-hidden
              />
              <span
                className={`px-1.5 py-2 text-center text-[9px] font-semibold leading-tight ${
                  on ? 'text-ab-text' : 'text-ab-sub'
                }`}
              >
                {row.label}
              </span>
              {on ? (
                <span className="mx-2 mb-0 h-0.5 rounded-full" style={{ backgroundColor: row.color }} />
              ) : (
                <span className="mx-2 mb-0 h-0.5 rounded-full bg-transparent" />
              )}
            </button>
          )
        })}
      </div>
      <ul className="max-h-[40dvh] overflow-y-auto py-1">
        {list.length === 0 && (
          <li className="px-3 py-4 text-center text-xs text-ab-sub">연결할 항목이 없습니다.</li>
        )}
        {list.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-ab-muted/60"
              onClick={() => onPick({ kind: item.kind, targetId: item.id, name: item.name })}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: mentionKindMeta(item.kind).color }}
                aria-hidden
              />
              <span className="text-ab-text">@{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
