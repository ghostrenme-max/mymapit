import type { Memo } from '../../stores/types'
import { stripMemoHtml } from '../../utils/memoHtml'

type Props = {
  memo: Memo
  onClick: () => void
}

export function MemoCard({ memo, onClick }: Props) {
  const preview = stripMemoHtml(memo.content)

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-3 text-left active:bg-ab-muted/40"
    >
      <p className="text-sm font-semibold text-ab-text">{memo.title || '제목 없음'}</p>
      <p className="mt-1 line-clamp-2 text-xs text-ab-sub">{preview || '내용을 입력하세요.'}</p>
      <div className="mt-2 flex items-center justify-between text-[10px] text-ab-sub">
        <span>@ {memo.mentions.length}</span>
        <span>{new Date(memo.updatedAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}</span>
      </div>
    </button>
  )
}
