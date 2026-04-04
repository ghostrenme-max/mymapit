import { groupSimilarKeywords } from '../../store/useKeywordStore'
import type { Keyword } from '../../types/models'

type Props = {
  keywords: Keyword[]
}

export function KeywordSimilarGroups({ keywords }: Props) {
  const groups = groupSimilarKeywords(keywords)

  if (groups.length === 0) {
    return (
      <p className="rounded-xl bg-m-muted/50 px-3 py-2 text-xs text-m-sub">
        유사 키워드 그룹이 없습니다. 비슷한 텍스트의 키워드를 추가해 보세요.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-m-text">유사 키워드 그룹</h3>
      {groups.map((g) => (
        <div
          key={g.key}
          className="rounded-xl border border-m-muted bg-m-card px-3 py-2"
        >
          <div className="mb-1 text-[10px] text-m-sub">{g.key}</div>
          <div className="flex flex-wrap gap-1">
            {g.keywords.map((k) => (
              <span
                key={k.id}
                className="rounded-md bg-m-blue/10 px-2 py-0.5 text-xs text-m-blue"
              >
                {k.text}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
