import { useCharacterStore, EMOTION_LABEL, ROLE_LABEL } from '../../store/useCharacterStore'
import { useStoryStore } from '../../store/useStoryStore'
import type { Character, Relation } from '../../types/models'

type Props = {
  character: Character | null
  allCharacters: Character[]
  onClose: () => void
}

export function CharacterDetailSheet({ character, allCharacters, onClose }: Props) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const nodes = useStoryStore((s) => s.nodes)

  if (!character) return null

  const byId = new Map(allCharacters.map((c) => [c.id, c]))

  const patch = (p: Partial<Character>) => updateCharacter(character.id, p)

  const addColor = () => patch({ colors: [...character.colors, '#2563EB'] })
  const removeColor = (i: number) =>
    patch({ colors: character.colors.filter((_, idx) => idx !== i) })

  const setColor = (i: number, hex: string) => {
    const next = [...character.colors]
    next[i] = hex
    patch({ colors: next })
  }

  const silhouetteTags = character.silhouetteTags ?? []

  const addTag = (field: 'tags' | 'silhouetteTags', text: string) => {
    const t = text.trim()
    if (!t) return
    if (field === 'tags') patch({ tags: [...character.tags, t] })
    else patch({ silhouetteTags: [...silhouetteTags, t] })
  }

  const removeTag = (field: 'tags' | 'silhouetteTags', i: number) => {
    if (field === 'tags')
      patch({ tags: character.tags.filter((_, idx) => idx !== i) })
    else patch({ silhouetteTags: silhouetteTags.filter((_, idx) => idx !== i) })
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-m-text/30"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-1/2 z-50 flex max-h-[85dvh] w-full max-w-[390px] -translate-x-1/2 flex-col rounded-t-3xl bg-m-card shadow-2xl"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-m-muted" />
        <div className="flex items-start justify-between gap-2 border-b border-m-muted px-4 pb-3 pt-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-m-text">{character.name}</h2>
            <p className="text-xs text-m-sub">{ROLE_LABEL[character.role]}</p>
          </div>
          <button type="button" onClick={onClose} className="text-m-sub">
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-m-sub">
            이름
          </label>
          <input
            className="mb-3 w-full rounded-xl border border-m-muted bg-m-bg px-3 py-2 text-sm"
            value={character.name}
            onChange={(e) => patch({ name: e.target.value })}
          />

          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-m-sub">
            역할
          </label>
          <select
            className="mb-3 w-full rounded-xl border border-m-muted bg-m-bg px-3 py-2 text-sm"
            value={character.role}
            onChange={(e) =>
              patch({ role: e.target.value as Character['role'] })
            }
          >
            {(Object.keys(ROLE_LABEL) as Character['role'][]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>

          {(['personality', 'ability', 'likes', 'dislikes'] as const).map((key) => (
            <div key={key} className="mb-3">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-m-sub">
                {key === 'personality'
                  ? '성격'
                  : key === 'ability'
                    ? '능력'
                    : key === 'likes'
                      ? '좋아하는 것'
                      : '싫어하는 것'}
              </label>
              <textarea
                className="min-h-[56px] w-full resize-none rounded-xl border border-m-muted bg-m-bg px-3 py-2 text-sm"
                value={character[key]}
                onChange={(e) => patch({ [key]: e.target.value } as Partial<Character>)}
              />
            </div>
          ))}

          <section className="mb-3">
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-m-sub">
              컨셉 아트
            </h3>
            <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-m-muted bg-m-muted/40 text-xs text-m-sub">
              {character.imageUri ? (
                <img src={character.imageUri} alt="" className="max-h-full rounded-lg" />
              ) : (
                <span>이미지 URI를 붙여넣거나 추후 갤러리 연동</span>
              )}
            </div>
            <input
              className="mt-2 w-full rounded-xl border border-m-muted bg-m-bg px-3 py-2 text-xs"
              placeholder="image URL (optional)"
              value={character.imageUri ?? ''}
              onChange={(e) =>
                patch({ imageUri: e.target.value || null })
              }
            />
          </section>

          <section className="mb-3">
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-m-sub">
              컬러 팔레트
            </h3>
            <div className="flex flex-wrap gap-2">
              {character.colors.map((col, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    type="color"
                    value={col.length === 7 ? col : '#2563EB'}
                    onChange={(e) => setColor(i, e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="text-xs text-m-sub"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addColor}
                className="rounded-lg border border-dashed border-m-sub px-2 py-1 text-xs text-m-sub"
              >
                + 스와치
              </button>
            </div>
          </section>

          <TagSection
            title="특징 태그"
            items={character.tags}
            onAdd={(t) => addTag('tags', t)}
            onRemove={(i) => removeTag('tags', i)}
          />
          <TagSection
            title="실루엣 태그"
            items={silhouetteTags}
            onAdd={(t) => addTag('silhouetteTags', t)}
            onRemove={(i) => removeTag('silhouetteTags', i)}
          />

          <section className="mb-3 mt-4">
            <h3 className="mb-2 text-xs font-semibold text-m-text">관계망</h3>
            <ul className="space-y-2">
              {character.relations.map((rel) => (
                <RelationRow
                  key={rel.targetCharacterId}
                  rel={rel}
                  targetName={byId.get(rel.targetCharacterId)?.name ?? '(알 수 없음)'}
                />
              ))}
              {character.relations.length === 0 && (
                <li className="text-xs text-m-sub">등록된 관계가 없습니다.</li>
              )}
            </ul>
          </section>

          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold text-m-text">관계 변화 타임라인 (서사 노드)</h3>
            <ul className="space-y-3">
              {character.relations.flatMap((rel) =>
                rel.timeline.map((t, idx) => {
                  const node = nodes.find((n) => n.id === t.storyNodeId)
                  return (
                    <li
                      key={`${rel.targetCharacterId}-${idx}`}
                      className="rounded-xl bg-m-muted/60 px-3 py-2 text-xs"
                    >
                      <div className="font-medium text-m-text">
                        {node?.title ?? t.storyNodeId}
                      </div>
                      <div className="text-m-sub">
                        {byId.get(rel.targetCharacterId)?.name}: {EMOTION_LABEL[rel.emotion]} —{' '}
                        {t.change}
                      </div>
                    </li>
                  )
                }),
              )}
              {character.relations.every((r) => r.timeline.length === 0) && (
                <li className="text-xs text-m-sub">타임라인 항목이 없습니다.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}

function TagSection({
  title,
  items,
  onAdd,
  onRemove,
}: {
  title: string
  items: string[]
  onAdd: (t: string) => void
  onRemove: (i: number) => void
}) {
  return (
    <section className="mb-3">
      <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-m-sub">{title}</h3>
      <form
        className="mb-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const t = String(fd.get('tag') ?? '')
          onAdd(t)
          e.currentTarget.reset()
        }}
      >
        <input
          name="tag"
          className="min-w-0 flex-1 rounded-xl border border-m-muted bg-m-bg px-3 py-2 text-sm"
          placeholder="태그 입력"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-m-text px-3 py-2 text-sm text-m-card"
        >
          추가
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {items.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-m-blue/10 px-2 py-1 text-xs text-m-blue"
          >
            {tag}
            <button type="button" onClick={() => onRemove(i)} className="text-m-sub">
              ×
            </button>
          </span>
        ))}
      </div>
    </section>
  )
}

function RelationRow({ rel, targetName }: { rel: Relation; targetName: string }) {
  return (
    <li className="rounded-xl border border-m-muted px-3 py-2">
      <div className="text-sm font-medium text-m-text">{targetName}</div>
      <div className="text-xs text-m-red">{EMOTION_LABEL[rel.emotion]}</div>
      {rel.note && <p className="mt-1 text-xs text-m-sub">{rel.note}</p>}
    </li>
  )
}
