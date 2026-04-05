import type { AiExtractDraft } from '../../lib/mockAiExtract'

type Props = {
  open: boolean
  draft: AiExtractDraft | null
  sourceText: string
  onClose: () => void
  onSaveToArtbook: () => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ab-point">{label}</p>
      <div className="mt-1 text-sm text-ab-text">{children}</div>
    </div>
  )
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-ab-sub">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((t, i) => (
        <span key={`${t}-${i}`} className="rounded-[2px] bg-ab-muted px-2 py-0.5 text-[11px]">
          {t}
        </span>
      ))}
    </div>
  )
}

export function AiInfoBottomSheet({ open, draft, sourceText, onClose, onSaveToArtbook }: Props) {
  if (!open || !draft) return null

  return (
    <>
      <button type="button" className="fixed inset-0 z-[58] bg-ab-text/35" aria-label="닫기" onClick={onClose} />
      <div
        className="fixed bottom-0 left-1/2 z-[59] flex max-h-[85dvh] w-full max-w-[390px] -translate-x-1/2 flex-col rounded-t-xl border border-ab-border border-b-0 bg-ab-card"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ab-border" aria-hidden />
        <div className="flex shrink-0 items-center justify-between border-b border-ab-border px-4 py-3">
          <h2 className="font-title-italic text-lg font-semibold text-ab-text">AI 인포 페이지</h2>
          <button type="button" onClick={onClose} className="text-sm text-ab-sub">
            닫기
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <p className="text-[10px] text-ab-sub">분석 구간</p>
          <p className="mt-1 line-clamp-3 text-xs italic text-ab-text">{sourceText || '(빈 본문)'}</p>

          <div className="mt-4 space-y-2">
            <Row label="등장인물">
              <Chips items={draft.characters} />
            </Row>
            <Row label="세계관 요소">
              <Chips items={draft.worldElements} />
            </Row>
            <Row label="장소">
              <Chips items={draft.places} />
            </Row>
            <Row label="오브젝트">
              <Chips items={draft.objects} />
            </Row>
            <Row label="AI 요약">
              <p className="leading-relaxed">{draft.summary}</p>
            </Row>
            <Row label="긴장도">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ab-muted">
                  <div
                    className="h-full rounded-full bg-ab-text transition-all"
                    style={{ width: `${draft.tension * 10}%` }}
                  />
                </div>
                <span className="tabular-nums text-xs text-ab-sub">{draft.tension}/10</span>
              </div>
            </Row>
            <Row label="제안 키워드">
              <p className="mb-2 text-[11px] leading-snug text-ab-sub">
                시트에 모인 단어·설정을 바탕으로 세계관·캐릭터에 맞는 태그 후보입니다.
              </p>
              <Chips items={draft.suggestedKeywords} />
            </Row>
          </div>
        </div>
        <div className="shrink-0 border-t border-ab-border px-4 pt-3">
          <button
            type="button"
            onClick={onSaveToArtbook}
            className="w-full rounded-sm bg-ab-text py-3 text-sm font-semibold text-ab-card"
          >
            아트북에 저장
          </button>
        </div>
      </div>
    </>
  )
}
