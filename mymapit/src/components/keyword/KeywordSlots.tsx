import { useKeywordStore } from '../../store/useKeywordStore'

export function KeywordSlots() {
  const slotIds = useKeywordStore((s) => s.slotKeywordIds)
  const keywords = useKeywordStore((s) => s.keywords)
  const toggle = useKeywordStore((s) => s.toggleSlotKeyword)

  const slots = Array.from({ length: 5 }, (_, i) => slotIds[i] ?? null)

  return (
    <div className="rounded-xl border border-m-muted bg-m-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-m-text">선택 키워드 (최대 5)</h3>
        <span className="text-[10px] text-m-sub">{slotIds.length}/5</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map((id, i) => {
          const kw = id ? keywords.find((k) => k.id === id) : null
          return (
            <div
              key={i}
              className={`flex min-h-[36px] min-w-[72px] flex-1 items-center justify-center rounded-xl border px-2 text-center text-xs ${
                kw
                  ? 'border-m-purple/40 bg-m-purple/10 text-m-purple'
                  : 'border-dashed border-m-muted text-m-sub'
              }`}
            >
              {kw ? (
                <button
                  type="button"
                  onClick={() => toggle(kw.id)}
                  className="line-clamp-2 w-full"
                >
                  {kw.text}
                  <span className="block text-[10px] text-m-sub">탭하여 제거</span>
                </button>
              ) : (
                <span>빈 슬롯</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
