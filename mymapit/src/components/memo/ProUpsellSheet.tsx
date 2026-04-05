type Props = {
  open: boolean
  onClose: () => void
  onGoPremium: () => void
}

export function ProUpsellSheet({ open, onClose, onGoPremium }: Props) {
  if (!open) return null
  return (
    <>
      <button type="button" className="fixed inset-0 z-[60] bg-ab-text/40" aria-label="닫기" onClick={onClose} />
      <div
        className="fixed bottom-0 left-1/2 z-[61] w-full max-w-[390px] -translate-x-1/2 rounded-t-lg border border-ab-border border-b-0 bg-ab-card px-4 pt-4"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <p className="font-title-italic text-lg font-semibold text-ab-text">PRO 기능</p>
        <p className="mt-2 text-sm leading-relaxed text-ab-sub">
          @@ AI 분석은 월 사용 횟수가 있습니다. 무료 3회를 모두 썼거나, PRO 혜택이 필요하면 업그레이드하세요.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-sm border border-ab-border py-2.5 text-sm text-ab-text"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onGoPremium}
            className="flex-1 rounded-sm bg-ab-point py-2.5 text-sm font-semibold text-ab-card"
          >
            프리미엄 보기
          </button>
        </div>
      </div>
    </>
  )
}
