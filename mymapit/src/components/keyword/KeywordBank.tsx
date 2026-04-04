import { useShallow } from 'zustand/shallow'
import { CATEGORY_LABEL, useKeywordStore } from '../../store/useKeywordStore'
import type { Keyword } from '../../types/models'

type Props = {
  projectId: string
}

export function KeywordBank({ projectId }: Props) {
  const keywords = useKeywordStore(
    useShallow((s) => s.keywords.filter((k) => k.projectId === projectId)),
  )
  const toggle = useKeywordStore((s) => s.toggleSlotKeyword)
  const slotIds = useKeywordStore((s) => s.slotKeywordIds)

  const byCat = keywords.reduce(
    (acc, k) => {
      acc[k.category].push(k)
      return acc
    },
    {
      personality: [] as Keyword[],
      ability: [] as Keyword[],
      background: [] as Keyword[],
      aesthetic: [] as Keyword[],
      origin: [] as Keyword[],
    },
  )

  return (
    <div className="space-y-3">
      {(Object.keys(byCat) as Keyword['category'][]).map((cat) => (
        <div key={cat}>
          <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-m-sub">
            {CATEGORY_LABEL[cat]}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {byCat[cat].map((k) => {
              const on = slotIds.includes(k.id)
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => toggle(k.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    on
                      ? 'bg-m-green text-white'
                      : 'bg-m-muted text-m-text'
                  }`}
                >
                  {k.text}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
