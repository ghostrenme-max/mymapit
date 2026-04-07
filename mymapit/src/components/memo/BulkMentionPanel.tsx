import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import type { MentionKind } from '../../constants/mentionKinds'
import { MENTION_TAB_ROWS, mentionKindMeta } from '../../constants/mentionKinds'
import { addCharacterStub, addKeywordStub, addWorldObjectStub } from '../../lib/addMentionEntityStubs'
import {
  countPlainTextMatches,
  replacePlainTextWithMentions,
  type MentionReplacementPick,
} from '../../lib/replaceTextWithMentions'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMentionStore } from '../../stores/mentionStore'

type Props = {
  open: boolean
  projectId: string | null
  editorRoot: HTMLDivElement | null
  initialMatch: string
  onClose: () => void
  onApplied: (count: number) => void
  /** 치환 직전 (스냅샷 등) */
  onBeforeApply?: () => void
}

const WO_TYPES: { label: string; type: string; kind: MentionKind }[] = [
  { label: '세계관', type: '세계', kind: 'world' },
  { label: '오브젝트', type: '오브젝트', kind: 'object' },
  { label: '장소', type: '장소', kind: 'place' },
  { label: '세력', type: '세력', kind: 'faction' },
]

export function BulkMentionPanel({
  open,
  projectId,
  editorRoot,
  initialMatch,
  onClose,
  onApplied,
  onBeforeApply,
}: Props) {
  const [tab, setTab] = useState<MentionKind>('character')
  const [matchTerm, setMatchTerm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [caseInsensitive, setCaseInsensitive] = useState(false)

  useEffect(() => {
    if (!open) return
    const t = initialMatch.trim()
    setMatchTerm(t)
    setDisplayName(t)
    setCaseInsensitive(false)
  }, [open, initialMatch])

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

  const list = useMemo(() => {
    const q = displayName.toLowerCase()
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
  }, [tab, characters, worldObjects, storyNodes, keywords, displayName])

  if (!open) return null

  const applyPick = (pick: MentionReplacementPick) => {
    if (!editorRoot || !matchTerm.trim()) return
    const would = countPlainTextMatches(editorRoot, matchTerm, { caseInsensitive })
    if (would > 0) onBeforeApply?.()
    const n = replacePlainTextWithMentions(editorRoot, matchTerm, pick, { caseInsensitive })
    onApplied(n)
    if (n > 0) onClose()
    else window.alert('일치하는 텍스트가 없습니다. (이미 @인 구간·철자를 확인해 주세요)')
  }

  const quickNewCharacter = () => {
    if (!projectId) return
    const name = (displayName.trim() || matchTerm.trim())
    if (!name) return
    const { id, name: nm } = addCharacterStub(projectId, name)
    applyPick({ kind: 'character', targetId: id, name: nm })
  }

  const quickNewWorldObject = (type: string, kind: MentionKind) => {
    if (!projectId) return
    const name = (displayName.trim() || matchTerm.trim())
    if (!name) return
    const { id, name: nm } = addWorldObjectStub(projectId, name, type)
    applyPick({ kind, targetId: id, name: nm })
  }

  const quickNewKeyword = () => {
    if (!projectId) return
    const name = (displayName.trim() || matchTerm.trim())
    if (!name) return
    const { id, name: nm } = addKeywordStub(projectId, name)
    applyPick({ kind: 'term', targetId: id, name: nm })
  }

  return (
    <div
      className="fixed bottom-0 left-1/2 z-[58] w-full max-w-[390px] -translate-x-1/2 border-t border-ab-border bg-ab-card shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
      role="dialog"
      aria-label="가져오기 정리 · 단어를 @로 묶기"
    >
      <div className="flex items-center justify-between border-b border-ab-border px-3 py-2">
        <p className="text-xs font-semibold text-ab-text">가져오기 정리 · 동일 단어 → @</p>
        <button type="button" onClick={onClose} className="text-xs text-ab-sub">
          닫기
        </button>
      </div>

      <div className="max-h-[min(52dvh,420px)] overflow-y-auto px-3 py-2">
        <label className="block text-[10px] font-medium text-ab-sub">본문에서 찾을 말 (또는 문구)</label>
        <input
          value={matchTerm}
          onChange={(e) => setMatchTerm(e.target.value)}
          className="mt-1 w-full rounded-sm border border-ab-border bg-ab-input px-2 py-2 text-sm text-ab-text outline-none"
          placeholder="예: 레이, 북부 설원"
        />
        <label className="mt-2 block text-[10px] font-medium text-ab-sub">@에 붙일 이름 (아트북 항목명)</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-sm border border-ab-border bg-ab-input px-2 py-2 text-sm text-ab-text outline-none"
          placeholder="비우면 찾을 말과 동일"
        />
        <label className="mt-2 flex items-center gap-2 text-[11px] text-ab-text">
          <input
            type="checkbox"
            checked={caseInsensitive}
            onChange={(e) => setCaseInsensitive(e.target.checked)}
            className="rounded border-ab-border accent-ab-text"
          />
          영문 대소문자 무시
        </label>

        <p className="mt-3 text-[10px] font-semibold text-ab-sub">기존 항목에 연결</p>
        <div className="mt-1 flex overflow-x-auto border-b border-ab-border">
          {MENTION_TAB_ROWS.map((row) => {
            const on = tab === row.kind
            return (
              <button
                key={row.kind}
                type="button"
                onClick={() => setTab(row.kind)}
                className="flex min-w-[52px] shrink-0 flex-col items-stretch"
              >
                <span
                  className="mx-1 mt-1 h-1 rounded-full"
                  style={{ backgroundColor: row.color, opacity: on ? 1 : 0.4 }}
                  aria-hidden
                />
                <span className={`px-1 py-1.5 text-center text-[8px] font-semibold ${on ? 'text-ab-text' : 'text-ab-sub'}`}>
                  {row.label}
                </span>
              </button>
            )
          })}
        </div>
        <ul className="max-h-[28dvh] overflow-y-auto py-1">
          {list.length === 0 && (
            <li className="py-3 text-center text-[11px] text-ab-sub">목록이 비었습니다. 아래에서 새로 만들 수 있어요.</li>
          )}
          {list.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-2 text-left text-sm hover:bg-ab-muted/60"
                onClick={() => applyPick({ kind: item.kind, targetId: item.id, name: item.name })}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: mentionKindMeta(item.kind).color }}
                  aria-hidden
                />
                <span>@{item.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-2 text-[10px] font-semibold text-ab-sub">빠른 새 항목 (이름은 위 @이름 사용)</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={quickNewCharacter}
            disabled={!projectId}
            className="rounded-sm border border-ab-border bg-ab-card px-2 py-1.5 text-[10px] font-medium text-ab-text disabled:opacity-40"
          >
            + 캐릭터
          </button>
          {WO_TYPES.map((w) => (
            <button
              key={w.type}
              type="button"
              onClick={() => quickNewWorldObject(w.type, w.kind)}
              disabled={!projectId}
              className="rounded-sm border border-ab-border bg-ab-card px-2 py-1.5 text-[10px] font-medium text-ab-text disabled:opacity-40"
            >
              + {w.label}
            </button>
          ))}
          <button
            type="button"
            onClick={quickNewKeyword}
            disabled={!projectId}
            className="rounded-sm border border-ab-border bg-ab-card px-2 py-1.5 text-[10px] font-medium text-ab-text disabled:opacity-40"
          >
            + 용어
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-ab-sub">
          「찾을 말」과 같은 글자가 본문에 있으면 모두 같은 @로 묶입니다. 이미 @로 된 구간은 건드리지 않습니다.
        </p>
      </div>
    </div>
  )
}
