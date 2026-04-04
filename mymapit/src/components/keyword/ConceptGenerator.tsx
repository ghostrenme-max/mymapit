import { useKeywordStore } from '../../store/useKeywordStore'

export function ConceptGenerator() {
  const generate = useKeywordStore((s) => s.generateConceptFromSlots)
  const count = useKeywordStore((s) => s.slotKeywordIds.length)

  return (
    <button
      type="button"
      disabled={count === 0}
      onClick={() => generate()}
      className="w-full rounded-xl bg-m-red py-3 text-sm font-semibold text-white disabled:opacity-40"
    >
      캐릭터 컨셉 생성 {count === 0 ? '(키워드를 선택하세요)' : ''}
    </button>
  )
}
