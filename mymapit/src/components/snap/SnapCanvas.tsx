import { useMemo } from 'react'
import type { Character, Keyword, StoryNode } from '../../types/models'

export type SnapSelection =
  | { kind: 'character'; id: string }
  | { kind: 'story'; id: string }
  | { kind: 'keyword'; id: string }
  | null

type Props = {
  characters: Character[]
  storyNodes: StoryNode[]
  keywords: Keyword[]
  selection: SnapSelection
  onSelect: (s: SnapSelection) => void
}

export function SnapCanvas({
  characters,
  storyNodes,
  keywords,
  selection,
  onSelect,
}: Props) {
  const related = useMemo(() => {
    if (!selection) {
      return {
        characterIds: null as Set<string> | null,
        storyIds: null as Set<string> | null,
        keywordIds: null as Set<string> | null,
      }
    }
    const charIds = new Set<string>()
    const storyIds = new Set<string>()
    const keywordIds = new Set<string>()

    if (selection.kind === 'character') {
      const c = characters.find((x) => x.id === selection.id)
      if (c) {
        charIds.add(c.id)
        c.storyNodeIds.forEach((id) => storyIds.add(id))
        c.keywordIds.forEach((id) => keywordIds.add(id))
        c.relations.forEach((r) => charIds.add(r.targetCharacterId))
      }
    } else if (selection.kind === 'story') {
      const n = storyNodes.find((x) => x.id === selection.id)
      if (n) {
        storyIds.add(n.id)
        n.characterIds.forEach((id) => charIds.add(id))
        n.characterIds.forEach((cid) => {
          const ch = characters.find((x) => x.id === cid)
          ch?.keywordIds.forEach((kid) => keywordIds.add(kid))
        })
      }
    } else {
      const k = keywords.find((x) => x.id === selection.id)
      if (k) {
        keywordIds.add(k.id)
        k.characterIds.forEach((id) => charIds.add(id))
      }
    }

    return { characterIds: charIds, storyIds, keywordIds }
  }, [selection, characters, storyNodes, keywords])

  const isSel = (kind: NonNullable<SnapSelection>['kind'], id: string) =>
    selection?.kind === kind && selection.id === id

  const cls = (active: boolean) =>
    `${active ? 'opacity-100' : 'opacity-30'} transition-opacity`

  return (
    <div className="rounded-2xl border border-m-muted bg-m-muted/30 p-3">
      <p className="mb-3 text-center text-[10px] text-m-sub">
        요소를 탭하면 연관된 항목이 하이라이트됩니다
      </p>

      <section className="mb-4">
        <h3 className="mb-2 text-xs font-semibold text-m-text">캐릭터</h3>
        <div className="flex flex-wrap gap-2">
          {characters.map((c) => {
            const on =
              related.characterIds === null || related.characterIds.has(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  onSelect(isSel('character', c.id) ? null : { kind: 'character', id: c.id })
                }
                className={`rounded-xl bg-m-card px-3 py-2 text-left text-xs font-medium ${cls(on)} ${
                  isSel('character', c.id) ? 'ring-2 ring-m-red' : ''
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mb-4">
        <h3 className="mb-2 text-xs font-semibold text-m-text">서사 노드</h3>
        <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
          {storyNodes.map((n) => {
            const on = related.storyIds === null || related.storyIds.has(n.id)
            return (
              <button
                key={n.id}
                type="button"
                onClick={() =>
                  onSelect(isSel('story', n.id) ? null : { kind: 'story', id: n.id })
                }
                className={`rounded-lg bg-m-card px-2 py-1.5 text-left text-[11px] ${cls(on)} ${
                  isSel('story', n.id) ? 'ring-2 ring-m-blue' : ''
                }`}
              >
                <span className="text-m-sub">{n.type}</span> · {n.title}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold text-m-text">키워드</h3>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => {
            const on = related.keywordIds === null || related.keywordIds.has(k.id)
            return (
              <button
                key={k.id}
                type="button"
                onClick={() =>
                  onSelect(isSel('keyword', k.id) ? null : { kind: 'keyword', id: k.id })
                }
                className={`rounded-full bg-m-card px-2.5 py-1 text-[11px] ${cls(on)} ${
                  isSel('keyword', k.id) ? 'ring-2 ring-m-purple' : ''
                }`}
              >
                {k.text}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
