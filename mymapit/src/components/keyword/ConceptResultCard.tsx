import type { ConceptResult } from '../../types/models'

type Props = {
  result: ConceptResult
  onSaveToCharacter: () => void
}

export function ConceptResultCard({ result, onSaveToCharacter }: Props) {
  if (!result) return null

  return (
    <div className="rounded-2xl border border-m-purple/30 bg-m-purple/5 p-4">
      <h3 className="font-display text-lg font-semibold text-m-text">{result.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-m-sub">{result.description}</p>
      <div className="mt-3">
        <span className="text-[10px] font-semibold uppercase text-m-sub">추천 실루엣</span>
        <p className="text-sm text-m-text">{result.silhouette}</p>
      </div>
      <div className="mt-3">
        <span className="text-[10px] font-semibold uppercase text-m-sub">추천 컬러</span>
        <div className="mt-1 flex gap-2">
          {result.colors.map((c) => (
            <span
              key={c}
              className="h-8 w-8 rounded-full border border-m-muted shadow-sm"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onSaveToCharacter}
        className="mt-4 w-full rounded-xl bg-m-text py-2.5 text-sm font-medium text-m-card"
      >
        캐릭터 시트로 저장
      </button>
    </div>
  )
}
