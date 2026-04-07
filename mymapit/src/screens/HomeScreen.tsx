import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { MemoGroupCard } from '../components/memo/MemoGroupCard'
import { TopBar } from '../components/common/TopBar'
import { loadDemoWorld, tryAddMemoGroup } from '../stores/actions'
import { useMemoStore } from '../stores/memoStore'
import { useProjectStore } from '../stores/projectStore'
import { useUserStore } from '../stores/userStore'

export function HomeScreen() {
  const navigate = useNavigate()
  const setSidebar = useUserStore((s) => s.setSidebarOpen)
  const isPro = useUserStore((s) => s.isPro)
  const pid = useProjectStore((s) => s.currentProjectId)
  const setCurrent = useProjectStore((s) => s.setCurrentProjectId)
  const projects = useProjectStore((s) => s.projects)

  const groups = useMemoStore(
    useShallow((s) => (pid ? s.memoGroups.filter((g) => g.projectId === pid) : [])),
  )
  const memos = useMemoStore(
    useShallow((s) => {
      if (!pid) return []
      const gids = new Set(s.memoGroups.filter((g) => g.projectId === pid).map((g) => g.id))
      return s.memos.filter((m) => gids.has(m.groupId))
    }),
  )

  const [q, setQ] = useState('')
  const [groupLimitMsg, setGroupLimitMsg] = useState<string | null>(null)
  const limitTimerRef = useRef<number | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!pid && projects[0]) setCurrent(projects[0].id)
  }, [pid, projects, setCurrent])

  useEffect(
    () => () => {
      if (limitTimerRef.current != null) window.clearTimeout(limitTimerRef.current)
    },
    [],
  )

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return groups
    return groups.filter((g) => g.name.toLowerCase().includes(s))
  }, [groups, q])

  const project = projects.find((p) => p.id === pid)

  if (projects.length === 0) {
    return (
      <div className="flex flex-col">
        <TopBar title="mymapit" onMenu={() => setSidebar(true)} />
        <div className="flex flex-col gap-4 px-4 py-8 text-center">
          <p className="font-title-italic text-xl text-ab-text">프로젝트가 없습니다</p>
          <p className="text-sm text-ab-sub">데모 데이터로 UI를 둘러보거나, 샘플 질문으로 세계관을 만들 수 있어요.</p>
          <button
            type="button"
            onClick={() => loadDemoWorld()}
            className="rounded-sm bg-ab-text py-3 text-sm font-semibold text-ab-card"
          >
            데모 불러오기
          </button>
          <button
            type="button"
            onClick={() => navigate('/questions')}
            className="rounded-sm border border-ab-border py-3 text-sm text-ab-text"
          >
            ✦ 샘플 세계관 구축
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title="mymapit"
        onMenu={() => setSidebar(true)}
        right={
          <button
            type="button"
            onClick={() => navigate('/artbook')}
            className="rounded-sm bg-ab-point px-2 py-1.5 text-[10px] font-semibold leading-none text-ab-card active:opacity-90"
          >
            아트북 바로가기
          </button>
        }
      />
      <div className="border-b border-ab-border bg-ab-card px-3 py-2">
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="그룹 검색…"
          className="w-full rounded-sm border border-ab-border bg-ab-input px-3 py-2 text-sm outline-none placeholder:text-ab-hint"
        />
      </div>

      <div className="flex flex-col gap-3 px-3 pb-4 pt-3">
        {groupLimitMsg && (
          <p className="rounded-sm border border-ab-border bg-ab-muted/60 px-3 py-2 text-center text-xs text-ab-text">
            {groupLimitMsg}
          </p>
        )}
        {project && (
          <p className="text-[11px] text-ab-sub">
            {project.name} · {project.genre || '장르 미정'}
          </p>
        )}

        {filtered.map((g) => (
          <MemoGroupCard
            key={g.id}
            group={g}
            memos={memos}
            onClick={() => navigate(`/memo/group/${g.id}`)}
          />
        ))}

        {!isPro && groups.length >= 3 && (
          <button
            type="button"
            onClick={() => navigate('/premium')}
            className="flex w-full flex-col gap-2 rounded-sm border-2 border-dashed border-ab-border bg-ab-muted/40 px-4 py-5 text-left"
          >
            <p className="font-title-italic text-base font-semibold text-ab-text">다음 그룹은 PRO</p>
            <p className="text-xs leading-relaxed text-ab-sub">
              무료는 메모 그룹 3개까지예요. PRO(₩4,900)로 무제한 그룹·아트북·Snap·광고 제거를 쓸 수 있어요.
            </p>
            <span className="text-xs font-semibold text-ab-text underline">프리미엄 보기 →</span>
          </button>
        )}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-ab-sub">검색 결과가 없습니다.</p>
        )}

        <button
          type="button"
          onClick={() => {
            if (!pid) return
            const name = window.prompt('새 그룹 이름', '새 그룹')
            if (name === null || !name.trim()) return
            const g = tryAddMemoGroup(pid, name.trim())
            if (!g) {
              setGroupLimitMsg('무료 플랜은 메모 그룹 최대 3개입니다. PRO로 업그레이드하면 무제한으로 만들 수 있어요.')
              if (limitTimerRef.current != null) window.clearTimeout(limitTimerRef.current)
              limitTimerRef.current = window.setTimeout(() => setGroupLimitMsg(null), 4000)
              return
            }
            setGroupLimitMsg(null)
          }}
          className="mt-1 w-full rounded-sm border-2 border-dashed border-ab-border py-3 text-sm font-medium text-ab-sub"
        >
          + 새 그룹 만들기
        </button>
      </div>
    </div>
  )
}
