import type { Memo, MemoGroup } from '../../stores/types'
import { stripMemoHtml } from '../../utils/memoHtml'

type Props = {
  group: MemoGroup
  memos: Memo[]
  onClick: () => void
}

export function MemoGroupCard({ group, memos, onClick }: Props) {
  const list = memos.filter((m) => m.groupId === group.id)
  const mentionCount = list.reduce((n, m) => n + m.mentions.length, 0)
  const last = list
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const dateLabel = last
    ? new Date(last.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    : '—'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full overflow-hidden rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card text-left shadow-sm transition-opacity active:opacity-90"
    >
      <div className="h-1" style={{ backgroundColor: group.color }} />
      <div className="p-3">
        <h3 className="font-title-italic text-lg font-semibold leading-tight text-ab-text">{group.name}</h3>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ab-sub">
          <span>메모 {list.length}</span>
          <span>최근 {dateLabel}</span>
          <span>@ {mentionCount}</span>
        </div>
        {last && (
          <p className="mt-2 line-clamp-2 text-xs text-ab-sub">
            {last.title ? `${last.title} · ` : ''}
            {stripMemoHtml(last.content) || '(내용 없음)'}
          </p>
        )}
      </div>
    </button>
  )
}
