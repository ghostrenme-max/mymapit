import { EMOTION_LABEL } from '../../store/useCharacterStore'
import type { SnapSelection } from './SnapCanvas'
import type { Character, Keyword, StoryNode } from '../../types/models'

type Props = {
  selection: SnapSelection
  characters: Character[]
  storyNodes: StoryNode[]
  keywords: Keyword[]
}

export function SnapDetailPanel({
  selection,
  characters,
  storyNodes,
  keywords,
}: Props) {
  if (!selection) {
    return (
      <div className="rounded-xl border border-dashed border-m-muted bg-m-card/80 px-3 py-4 text-center text-xs text-m-sub">
        Snap 레이어에서 요소를 선택하면 요약이 표시됩니다.
      </div>
    )
  }

  if (selection.kind === 'character') {
    const c = characters.find((x) => x.id === selection.id)
    if (!c) return null
    const stories = storyNodes.filter((n) => c.storyNodeIds.includes(n.id))
    const kws = keywords.filter((k) => c.keywordIds.includes(k.id))
    return (
      <div className="space-y-3 rounded-xl border border-m-muted bg-m-card p-3">
        <h3 className="font-display text-base font-semibold text-m-text">{c.name}</h3>
        <div>
          <h4 className="text-[10px] font-semibold uppercase text-m-sub">등장 서사</h4>
          <ul className="mt-1 space-y-1 text-xs text-m-text">
            {stories.map((n) => (
              <li key={n.id}>
                · {n.title}{' '}
                <span className="text-m-sub">(긴장 {n.tension})</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase text-m-sub">관계망</h4>
          <ul className="mt-1 space-y-1 text-xs">
            {c.relations.map((r) => {
              const name = characters.find((x) => x.id === r.targetCharacterId)?.name
              return (
                <li key={r.targetCharacterId}>
                  → {name}: {EMOTION_LABEL[r.emotion]}
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase text-m-sub">키워드</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {kws.map((k) => (
              <span key={k.id} className="rounded-full bg-m-purple/10 px-2 py-0.5 text-[11px]">
                {k.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (selection.kind === 'story') {
    const n = storyNodes.find((x) => x.id === selection.id)
    if (!n) return null
    const chars = characters.filter((c) => n.characterIds.includes(c.id))
    const kwSet = new Set<string>()
    chars.forEach((c) => c.keywordIds.forEach((id) => kwSet.add(id)))
    const kws = keywords.filter((k) => kwSet.has(k.id))
    const siblings = storyNodes
      .filter((x) => x.parentId === n.parentId && x.projectId === n.projectId)
      .sort((a, b) => a.order - b.order)
    const idx = siblings.findIndex((x) => x.id === n.id)
    const prev = idx > 0 ? siblings[idx - 1] : null
    const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null

    return (
      <div className="space-y-3 rounded-xl border border-m-muted bg-m-card p-3">
        <h3 className="font-display text-base font-semibold text-m-text">{n.title}</h3>
        <p className="text-xs text-m-sub">{n.description}</p>
        <div>
          <h4 className="text-[10px] font-semibold uppercase text-m-sub">긴장도 구간</h4>
          <p className="text-sm text-m-text">
            이 노드: <strong>{n.tension}</strong>
            {prev && (
              <span className="text-m-sub">
                {' '}
                ← 이전 {prev.tension}
              </span>
            )}
            {next && (
              <span className="text-m-sub">
                {' '}
                → 다음 {next.tension}
              </span>
            )}
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase text-m-sub">등장 캐릭터</h4>
          <ul className="mt-1 text-xs text-m-text">
            {chars.map((c) => (
              <li key={c.id}>· {c.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase text-m-sub">연관 키워드</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {kws.map((k) => (
              <span key={k.id} className="rounded-full bg-m-green/15 px-2 py-0.5 text-[11px]">
                {k.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const k = keywords.find((x) => x.id === selection.id)
  if (!k) return null
  const chars = characters.filter((c) => k.characterIds.includes(c.id))
  return (
    <div className="rounded-xl border border-m-muted bg-m-card p-3">
      <h3 className="font-display text-base font-semibold text-m-text">{k.text}</h3>
      <p className="mt-2 text-xs text-m-sub">연결된 캐릭터</p>
      <ul className="mt-1 text-xs text-m-text">
        {chars.map((c) => (
          <li key={c.id}>· {c.name}</li>
        ))}
      </ul>
    </div>
  )
}
