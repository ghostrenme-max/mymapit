import type { MemoContentSnapshot } from '../../stores/types'

type Props = {
  open: boolean
  snapshots: MemoContentSnapshot[]
  onClose: () => void
  onRestore: (snap: MemoContentSnapshot) => void
  onDelete: (snapshotId: string) => void
}

export function MemoSnapshotSheet({ open, snapshots, onClose, onRestore, onDelete }: Props) {
  if (!open) return null

  return (
    <>
      <button type="button" className="fixed inset-0 z-[59] bg-ab-text/30" aria-label="닫기" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="snap-sheet-title"
        className="fixed inset-x-0 bottom-0 z-[60] max-h-[min(72vh,520px)] rounded-t-lg border border-ab-border border-b-0 bg-ab-card shadow-lg"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between border-b border-ab-border px-3 py-2.5">
          <h2 id="snap-sheet-title" className="text-sm font-semibold text-ab-text">
            본문 스냅샷
          </h2>
          <button type="button" onClick={onClose} className="text-xs font-medium text-ab-sub">
            닫기
          </button>
        </div>
        <p className="border-b border-ab-border bg-ab-muted/30 px-3 py-2 text-[11px] leading-snug text-ab-sub">
          파일 가져오기·단어→@ 직전에 자동 저장됩니다. 항목을 누르면 그 시점의 제목·본문·@ 목록·사이드 노트·체크리스트로 되돌립니다.
        </p>
        <ul className="max-h-[min(52vh,400px)] overflow-y-auto">
          {snapshots.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-ab-sub">저장된 스냅샷이 없습니다.</li>
          ) : (
            snapshots.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-2 border-b border-ab-border px-3 py-2.5 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ab-text">{s.label}</p>
                  <p className="mt-0.5 text-[10px] text-ab-sub">
                    {new Date(s.createdAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                    <span className="mx-1">·</span>
                    {s.title || '제목 없음'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => onRestore(s)}
                    className="rounded-md bg-ab-text px-2.5 py-1 text-[11px] font-semibold text-white"
                  >
                    복원
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    className="rounded-md border border-ab-border px-2 py-1 text-[10px] text-ab-sub"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  )
}
