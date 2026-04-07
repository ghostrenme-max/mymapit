import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { MemoCard } from '../components/memo/MemoCard'
import { TopBar } from '../components/common/TopBar'
import { isMentionResolvedInProject } from '../lib/memoMentionResolved'
import { useArtbookStore } from '../stores/artbookStore'
import { useMemoStore } from '../stores/memoStore'
import { useMentionStore } from '../stores/mentionStore'
import { useUserStore } from '../stores/userStore'
import { mentionKindMeta } from '../constants/mentionKinds'
import { stripMemoHtml } from '../utils/memoHtml'

type ListFilter =
  | 'all'
  | 'week'
  | 'hasMentions'
  | 'checkPending'
  | 'orphan'
  | 'pickMention'

export function MemoGroupScreen() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const setSidebar = useUserStore((s) => s.setSidebarOpen)
  const addMemo = useMemoStore((s) => s.addMemo)
  const group = useMemoStore((s) => s.memoGroups.find((g) => g.id === groupId))
  const list = useMemoStore(
    useShallow((s) => (groupId ? s.memos.filter((m) => m.groupId === groupId) : [])),
  )

  const projectId = group?.projectId ?? null
  const characters = useMentionStore(
    useShallow((s) => (projectId ? s.characters.filter((c) => c.projectId === projectId) : [])),
  )
  const worldObjects = useMentionStore(
    useShallow((s) => (projectId ? s.worldObjects.filter((o) => o.projectId === projectId) : [])),
  )
  const storyNodes = useArtbookStore(
    useShallow((s) => (projectId ? s.storyNodes.filter((n) => n.projectId === projectId) : [])),
  )
  const keywords = useArtbookStore(
    useShallow((s) => (projectId ? s.keywords.filter((k) => k.projectId === projectId) : [])),
  )

  const [listFilter, setListFilter] = useState<ListFilter>('all')
  const [search, setSearch] = useState('')
  const [pickMentionOpen, setPickMentionOpen] = useState(false)
  const [pickTargetId, setPickTargetId] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [list],
  )

  const uniqueMentionsInGroup = useMemo(() => {
    const map = new Map<string, (typeof sorted)[0]['mentions'][0]>()
    for (const m of sorted) {
      for (const men of m.mentions) {
        if (!map.has(men.targetId)) map.set(men.targetId, men)
      }
    }
    return [...map.values()].sort((a, b) => a.targetName.localeCompare(b.targetName, 'ko'))
  }, [sorted])

  const filtered = useMemo(() => {
    let out = sorted
    const q = search.trim().toLowerCase()
    if (q) {
      out = out.filter((m) => {
        const t = (m.title || '').toLowerCase()
        const body = stripMemoHtml(m.content).toLowerCase()
        return t.includes(q) || body.includes(q)
      })
    }
    if (listFilter === 'week') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
      out = out.filter((m) => new Date(m.updatedAt).getTime() >= cutoff)
    } else if (listFilter === 'hasMentions') {
      out = out.filter((m) => m.mentions.length > 0)
    } else if (listFilter === 'checkPending') {
      out = out.filter((m) => (m.writingChecklist?.some((x) => !x.done) ?? false))
    } else if (listFilter === 'orphan' && projectId) {
      out = out.filter((m) =>
        m.mentions.some(
          (men) =>
            !isMentionResolvedInProject(projectId, men, characters, worldObjects, keywords, storyNodes),
        ),
      )
    } else if (listFilter === 'pickMention' && pickTargetId) {
      out = out.filter((m) => m.mentions.some((men) => men.targetId === pickTargetId))
    }
    return out
  }, [
    sorted,
    search,
    listFilter,
    pickTargetId,
    projectId,
    characters,
    worldObjects,
    keywords,
    storyNodes,
  ])

  const filterChip = (id: ListFilter, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        setListFilter(id)
        if (id !== 'pickMention') setPickTargetId(null)
      }}
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
        listFilter === id
          ? 'border-ab-text bg-ab-text text-white'
          : 'border-ab-border bg-ab-card text-ab-text'
      }`}
    >
      {label}
    </button>
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
      <TopBar title={group.name} onMenu={() => setSidebar(true)} onBack={() => navigate('/memo')} />
      <div className="flex flex-col gap-2 border-b border-ab-border bg-ab-muted/30 px-3 py-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목·본문 검색…"
          className="w-full rounded-md border border-ab-border bg-ab-input px-3 py-2 text-sm text-ab-text outline-none placeholder:text-ab-sub"
        />
        <div className="flex flex-wrap gap-1.5">
          {filterChip('all', '전체')}
          {filterChip('week', '최근 7일')}
          {filterChip('hasMentions', '@ 1개 이상')}
          {filterChip('checkPending', '체크 미완료')}
          {filterChip('orphan', '고아 @')}
          {filterChip('pickMention', '특정 @')}
        </div>
        {listFilter === 'pickMention' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPickMentionOpen(true)}
              className="rounded-md border border-ab-border bg-ab-card px-2.5 py-1 text-[11px] text-ab-text"
            >
              {pickTargetId
                ? `선택: @${uniqueMentionsInGroup.find((x) => x.targetId === pickTargetId)?.targetName ?? '…'}`
                : '@ 항목 고르기'}
            </button>
            {pickTargetId && (
              <button
                type="button"
                onClick={() => setPickTargetId(null)}
                className="text-[11px] text-ab-sub underline"
              >
                선택 해제
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 px-3 pb-4 pt-3">
        {filtered.map((m) => (
          <MemoCard key={m.id} memo={m} onClick={() => navigate(`/memo/group/${groupId}/note/${m.id}`)} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-ab-sub">
            {sorted.length === 0 ? '메모가 없습니다.' : '이 조건에 맞는 메모가 없습니다.'}
          </p>
        )}
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

      {pickMentionOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-ab-text/35"
            aria-label="닫기"
            onClick={() => setPickMentionOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pick-mention-title"
            className="fixed left-1/2 top-1/2 z-[80] flex max-h-[min(70vh,420px)] w-[min(340px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-ab-border bg-ab-card shadow-lg"
          >
            <h2 id="pick-mention-title" className="border-b border-ab-border px-3 py-2.5 text-sm font-semibold text-ab-text">
              이 @가 들어간 메모만
            </h2>
            <ul className="min-h-0 flex-1 overflow-y-auto p-2">
              {uniqueMentionsInGroup.length === 0 ? (
                <li className="px-2 py-6 text-center text-sm text-ab-sub">이 그룹 메모에 @가 없습니다.</li>
              ) : (
                uniqueMentionsInGroup.map((men) => {
                  const mm = mentionKindMeta(men.kind)
                  return (
                    <li key={men.targetId} className="mb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPickTargetId(men.targetId)
                          setPickMentionOpen(false)
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm active:bg-ab-muted/50"
                      >
                        <span
                          className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ color: mm.color, backgroundColor: mm.bg }}
                        >
                          {mm.label}
                        </span>
                        <span className="min-w-0 truncate text-ab-text">@{men.targetName}</span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
            <button
              type="button"
              onClick={() => setPickMentionOpen(false)}
              className="border-t border-ab-border py-3 text-sm text-ab-sub"
            >
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  )
}
