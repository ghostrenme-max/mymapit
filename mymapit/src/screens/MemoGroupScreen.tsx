import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { MemoCard } from '../components/memo/MemoCard'
import { TopBar } from '../components/common/TopBar'
import { useMemoStore } from '../stores/memoStore'
import { useUserStore } from '../stores/userStore'

export function MemoGroupScreen() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const setSidebar = useUserStore((s) => s.setSidebarOpen)
  const addMemo = useMemoStore((s) => s.addMemo)
  const group = useMemoStore((s) => s.memoGroups.find((g) => g.id === groupId))
  const list = useMemoStore(
    useShallow((s) => (groupId ? s.memos.filter((m) => m.groupId === groupId) : [])),
  )

  const sorted = useMemo(
    () => [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [list],
  )

  if (!groupId || !group) {
    return (
      <div className="p-6 text-center text-sm text-ab-sub">
        그룹을 찾을 수 없습니다.
        <button type="button" className="mt-4 block w-full text-ab-text underline" onClick={() => navigate('/memo')}>
          홈으로
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title={group.name}
        onMenu={() => setSidebar(true)}
        onBack={() => navigate('/memo')}
      />
      <div className="flex flex-col gap-3 px-3 pb-4 pt-3">
        {sorted.map((m) => (
          <MemoCard key={m.id} memo={m} onClick={() => navigate(`/memo/group/${groupId}/note/${m.id}`)} />
        ))}
        {sorted.length === 0 && <p className="py-8 text-center text-sm text-ab-sub">메모가 없습니다.</p>}
        <button
          type="button"
          onClick={() => {
            const m = addMemo(groupId, '')
            navigate(`/memo/group/${groupId}/note/${m.id}`)
          }}
          className="w-full rounded-sm bg-ab-text py-3 text-sm font-semibold text-ab-card"
        >
          + 새 메모
        </button>
      </div>
    </div>
  )
}
