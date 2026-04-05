import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import { AiAnalyzingOverlay } from '../components/memo/AiAnalyzingOverlay'
import { AiInfoBottomSheet } from '../components/memo/AiInfoBottomSheet'
import { MentionPopup, type MentionPick } from '../components/memo/MentionPopup'
import { ProUpsellSheet } from '../components/memo/ProUpsellSheet'
import { TajiPanel } from '../components/memo/TajiPanel'
import { isMentionKind, legacyDatasetTypeToKind } from '../constants/mentionKinds'
import type { AiExtractDraft } from '../lib/mockAiExtract'
import { mockAiExtract } from '../lib/mockAiExtract'
import { useArtbookStore } from '../stores/artbookStore'
import { useMemoStore } from '../stores/memoStore'
import { useProjectStore } from '../stores/projectStore'
import type { Mention, MentionKind } from '../stores/types'
import { useUserStore } from '../stores/userStore'

function getCaretOffsetWithin(root: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel?.rangeCount) return -1
  try {
    if (!root.contains(sel.anchorNode)) return -1
  } catch {
    return -1
  }
  const range = sel.getRangeAt(0).cloneRange()
  const pre = document.createRange()
  pre.selectNodeContents(root)
  pre.setEnd(range.startContainer, range.startOffset)
  return pre.toString().length
}

function rangeForCharOffsets(root: HTMLElement, start: number, end: number): Range | null {
  if (start > end || end < 0) return null
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let pos = 0
  let startNode: Text | null = null
  let startO = 0
  let endNode: Text | null = null
  let endO = 0
  let n: Node | null
  while ((n = walker.nextNode())) {
    const t = n as Text
    const len = t.length
    const nextPos = pos + len
    if (startNode === null && start < nextPos) {
      startNode = t
      startO = start - pos
    }
    if (startNode !== null && end <= nextPos) {
      endNode = t
      endO = end - pos
      break
    }
    pos = nextPos
  }
  if (!startNode || !endNode) return null
  const r = document.createRange()
  r.setStart(startNode, Math.max(0, Math.min(startO, startNode.length)))
  r.setEnd(endNode, Math.max(0, Math.min(endO, endNode.length)))
  return r
}

function parseMentionsFromEditor(root: HTMLElement): Mention[] {
  const spans = root.querySelectorAll<HTMLElement>('.ab-mention')
  const out: Mention[] = []
  spans.forEach((span, i) => {
    const rawKind = span.dataset.kind
    const kind: MentionKind | null = isMentionKind(rawKind)
      ? rawKind
      : legacyDatasetTypeToKind(span.dataset.type)
    const targetId = span.dataset.targetId ?? ''
    const targetName = span.dataset.targetName ?? ''
    const id = span.dataset.mentionId ?? `men-${i}`
    if (kind && targetId && targetName) out.push({ id, kind, targetId, targetName })
  })
  return out
}

type MemoBaseline = { title: string; content: string; mentions: Mention[] }

export function MemoEditorScreen() {
  const { groupId, memoId } = useParams<{ groupId: string; memoId: string }>()
  const navigate = useNavigate()
  const titleRef = useRef('')
  const editorRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const mentionRangeRef = useRef<Range | null>(null)
  const titleMentionRef = useRef<{ start: number; end: number } | null>(null)
  const activeMentionFieldRef = useRef<'title' | 'editor' | null>(null)
  const aiRunLockRef = useRef(false)
  const aiTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const baselineRef = useRef<MemoBaseline>({ title: '', content: '', mentions: [] })

  const pid = useProjectStore((s) => s.currentProjectId)
  const memo = useMemoStore((s) => s.memos.find((m) => m.id === memoId))
  const updateMemo = useMemoStore((s) => s.updateMemo)
  const setSidebar = useUserStore((s) => s.setSidebarOpen)
  const tryConsumeAi = useUserStore((s) => s.tryConsumeAiAnalysis)
  const addAiInfoCard = useArtbookStore((s) => s.addAiInfoCard)

  const [title, setTitle] = useState('')
  const [popupOpen, setPopupOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [panelMention, setPanelMention] = useState<Mention | null>(null)
  const [analyzingAi, setAnalyzingAi] = useState(false)
  const [aiSheetOpen, setAiSheetOpen] = useState(false)
  const [aiDraft, setAiDraft] = useState<AiExtractDraft | null>(null)
  const [aiSourceText, setAiSourceText] = useState('')
  const [proUpsellOpen, setProUpsellOpen] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)

  const closeMentionPopup = useCallback(() => {
    setPopupOpen(false)
    mentionRangeRef.current = null
    titleMentionRef.current = null
    activeMentionFieldRef.current = null
  }, [])

  useEffect(
    () => () => {
      if (aiTimeoutRef.current != null) {
        window.clearTimeout(aiTimeoutRef.current)
        aiTimeoutRef.current = null
      }
      aiRunLockRef.current = false
    },
    [],
  )

  useEffect(() => {
    if (!memoId || !editorRef.current) return
    const m = useMemoStore.getState().memos.find((x) => x.id === memoId)
    if (!m) return
    setTitle(m.title)
    editorRef.current.innerHTML = m.content || ''
    baselineRef.current = {
      title: m.title,
      content: m.content || '',
      mentions: [...m.mentions],
    }
  }, [memoId])

  titleRef.current = title

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (currentLocation.pathname === nextLocation.pathname) return false
    const b = baselineRef.current
    const html = editorRef.current?.innerHTML ?? ''
    return titleRef.current !== b.title || html !== b.content
  })

  useEffect(() => {
    if (blocker.state === 'blocked') setLeaveModalOpen(true)
  }, [blocker.state])

  const revertToBaseline = useCallback(() => {
    if (!memoId) return
    const b = baselineRef.current
    setTitle(b.title)
    titleRef.current = b.title
    if (editorRef.current) editorRef.current.innerHTML = b.content
    updateMemo(memoId, { title: b.title, content: b.content, mentions: [...b.mentions] })
  }, [memoId, updateMemo])

  const flushContent = useCallback(() => {
    const el = editorRef.current
    if (!el || !memoId) return
    const m = useMemoStore.getState().memos.find((x) => x.id === memoId)
    if (!m) return
    const content = el.innerHTML
    const mentions = parseMentionsFromEditor(el)
    updateMemo(m.id, { content, mentions })
  }, [memoId, updateMemo])

  const saveAll = useCallback(() => {
    if (!memoId) return
    flushContent()
    updateMemo(memoId, { title })
    const el = editorRef.current
    if (el) {
      baselineRef.current = {
        title,
        content: el.innerHTML,
        mentions: parseMentionsFromEditor(el),
      }
    }
  }, [memoId, title, updateMemo, flushContent])

  const runAiAfterDoubleAt = useCallback(() => {
    const root = editorRef.current
    if (!root || analyzingAi || aiSheetOpen || aiRunLockRef.current) return
    const sel = window.getSelection()
    if (!sel?.rangeCount || !root.contains(sel.anchorNode)) return
    const end = getCaretOffsetWithin(root)
    if (end < 0) return
    const range = sel.getRangeAt(0).cloneRange()
    const pre = document.createRange()
    pre.selectNodeContents(root)
    pre.setEnd(range.startContainer, range.startOffset)
    const before = pre.toString()
    const aiMatch = before.match(/@@\s+$/)
    if (!aiMatch) return

    if (!tryConsumeAi()) {
      setProUpsellOpen(true)
      return
    }

    aiRunLockRef.current = true

    const start = end - aiMatch[0].length
    const delRange = rangeForCharOffsets(root, start, end)
    const plainBefore = root.innerText

    setAnalyzingAi(true)
    if (aiTimeoutRef.current != null) window.clearTimeout(aiTimeoutRef.current)
    aiTimeoutRef.current = window.setTimeout(() => {
      aiTimeoutRef.current = null
      if (delRange) {
        delRange.deleteContents()
        const nb = document.createTextNode('')
        delRange.insertNode(nb)
        delRange.setStartAfter(nb)
        delRange.collapse(true)
        sel.removeAllRanges()
        sel.addRange(delRange)
      }
      const draft = mockAiExtract(plainBefore, pid)
      setAiSourceText(plainBefore.slice(0, 500))
      setAiDraft(draft)
      setAnalyzingAi(false)
      setAiSheetOpen(true)
      root.focus()
      flushContent()
      aiRunLockRef.current = false
    }, 1200)
  }, [analyzingAi, aiSheetOpen, tryConsumeAi, pid, flushContent])

  const openMentionFromEditor = useCallback(() => {
    const root = editorRef.current
    if (!root) return
    const sel = window.getSelection()
    if (!sel?.rangeCount || !root.contains(sel.anchorNode)) {
      if (activeMentionFieldRef.current === 'editor') {
        setPopupOpen(false)
        mentionRangeRef.current = null
        activeMentionFieldRef.current = null
      }
      return
    }
    const end = getCaretOffsetWithin(root)
    if (end < 0) return
    const range = sel.getRangeAt(0).cloneRange()
    const pre = document.createRange()
    pre.selectNodeContents(root)
    pre.setEnd(range.startContainer, range.startOffset)
    const before = pre.toString()

    if (before.match(/@@\s+$/) || /@@$/.test(before)) {
      setPopupOpen(false)
      return
    }

    const match = before.match(/@([^\n@]*)$/)
    if (!match) {
      if (activeMentionFieldRef.current === 'editor') {
        setPopupOpen(false)
        mentionRangeRef.current = null
        activeMentionFieldRef.current = null
      }
      return
    }
    const idx = before.length - match[0].length
    if (idx > 0 && before[idx - 1] === '@') return

    const query = match[1] ?? ''
    const start = end - match[0].length
    const r = rangeForCharOffsets(root, start, end)
    if (!r) return
    mentionRangeRef.current = r.cloneRange()
    activeMentionFieldRef.current = 'editor'
    setFilterQuery(query)
    setPopupOpen(true)
  }, [])

  const syncTitleMentionPopup = useCallback((el: HTMLInputElement) => {
    const v = el.value
    const pos = el.selectionStart ?? v.length
    const before = v.slice(0, pos)
    const match = before.match(/@([^\n@]*)$/)
    if (match) {
      const idx = pos - match[0].length
      if (idx > 0 && v[idx - 1] === '@') return
      activeMentionFieldRef.current = 'title'
      titleMentionRef.current = { start: idx, end: pos }
      setFilterQuery(match[1] ?? '')
      setPopupOpen(true)
    } else if (activeMentionFieldRef.current === 'title') {
      setPopupOpen(false)
      titleMentionRef.current = null
      activeMentionFieldRef.current = null
    }
  }, [])

  const onEditorInput = () => {
    openMentionFromEditor()
    runAiAfterDoubleAt()
  }

  const onEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest('.ab-mention') as HTMLElement | null
    if (!el) return
    const rawKind = el.dataset.kind
    const kind: MentionKind | null = isMentionKind(rawKind)
      ? rawKind
      : legacyDatasetTypeToKind(el.dataset.type)
    const targetId = el.dataset.targetId
    const targetName = el.dataset.targetName
    const id = el.dataset.mentionId ?? 'men'
    if (kind && targetId && targetName) {
      setPanelMention({ id, kind, targetId, targetName })
    }
  }

  const insertMention = (pick: MentionPick) => {
    if (activeMentionFieldRef.current === 'title' && titleMentionRef.current) {
      const el = titleInputRef.current
      const raw = el?.value ?? title
      const { start, end } = titleMentionRef.current
      const insertText = `@${pick.name} `
      const newTitle = raw.slice(0, start) + insertText + raw.slice(end)
      setTitle(newTitle)
      if (memoId) updateMemo(memoId, { title: newTitle })
      setPopupOpen(false)
      titleMentionRef.current = null
      activeMentionFieldRef.current = null
      const newPos = start + insertText.length
      requestAnimationFrame(() => {
        el?.focus()
        el?.setSelectionRange(newPos, newPos)
      })
      return
    }

    const r = mentionRangeRef.current
    const editor = editorRef.current
    if (!r || !editor) return
    const mid = `men-${crypto.randomUUID()}`
    const span = document.createElement('span')
    span.className = 'ab-mention'
    span.contentEditable = 'false'
    span.dataset.mentionId = mid
    span.dataset.kind = pick.kind
    span.dataset.targetId = pick.targetId
    span.dataset.targetName = pick.name
    span.textContent = `@${pick.name}`

    r.deleteContents()
    r.insertNode(span)
    const nb = document.createTextNode('\u00a0')
    r.setStartAfter(span)
    r.collapse(true)
    r.insertNode(nb)
    r.setStartAfter(nb)
    r.collapse(true)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(r)

    setPopupOpen(false)
    mentionRangeRef.current = null
    activeMentionFieldRef.current = null
    editor.focus()
    flushContent()
  }

  const toolbar = (cmd: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value)
    flushContent()
  }

  const openMentionPalette = () => {
    const editor = editorRef.current
    editor?.focus()
    const sel = window.getSelection()
    if (sel?.rangeCount && editor?.contains(sel.anchorNode)) {
      mentionRangeRef.current = sel.getRangeAt(0).cloneRange()
    } else if (editor) {
      const r = document.createRange()
      r.selectNodeContents(editor)
      r.collapse(false)
      mentionRangeRef.current = r
    }
    activeMentionFieldRef.current = 'editor'
    setFilterQuery('')
    setPopupOpen(true)
  }

  const cancelLeave = useCallback(() => {
    setLeaveModalOpen(false)
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  const confirmSaveAndLeave = useCallback(() => {
    saveAll()
    setLeaveModalOpen(false)
    if (blocker.state === 'blocked') blocker.proceed()
  }, [saveAll, blocker])

  const confirmDiscardAndLeave = useCallback(() => {
    revertToBaseline()
    setLeaveModalOpen(false)
    if (blocker.state === 'blocked') blocker.proceed()
  }, [revertToBaseline, blocker])

  const handleSaveAiToArtbook = () => {
    if (!aiDraft || !pid) return
    addAiInfoCard({
      projectId: pid,
      sourceText: aiSourceText,
      summary: aiDraft.summary,
      tension: aiDraft.tension,
      characters: aiDraft.characters,
      worldElements: aiDraft.worldElements,
      places: aiDraft.places,
      objects: aiDraft.objects,
      suggestedKeywords: aiDraft.suggestedKeywords,
    })
    setAiSheetOpen(false)
    setAiDraft(null)
  }

  if (!memo || !groupId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-sm text-ab-sub">
        <p>메모를 찾을 수 없습니다.</p>
        {groupId ? (
          <button
            type="button"
            className="text-ab-text underline"
            onClick={() => navigate(`/memo/group/${groupId}`)}
          >
            그룹으로 돌아가기
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-1.5 border-b border-ab-border bg-ab-card px-2 py-2">
        <button
          type="button"
          onClick={() => setSidebar(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ab-border bg-ab-bg text-ab-text"
          aria-label="메뉴"
        >
          ☰
        </button>
        <button
          type="button"
          onClick={() => groupId && navigate(`/memo/group/${groupId}`)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ab-border text-ab-text"
          aria-label="뒤로"
        >
          ←
        </button>
        <input
          ref={titleInputRef}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            syncTitleMentionPopup(e.target)
          }}
          onSelect={(e) => syncTitleMentionPopup(e.target as HTMLInputElement)}
          onBlur={() => memoId && updateMemo(memoId, { title })}
          placeholder="제목"
          className="min-w-0 flex-1 border-0 bg-transparent font-title-italic text-base font-semibold text-ab-text outline-none placeholder:text-ab-sub"
        />
        <button
          type="button"
          onClick={() => {
            saveAll()
            navigate(`/memo/group/${groupId}`)
          }}
          className="shrink-0 whitespace-nowrap rounded-md bg-ab-text px-2.5 py-1.5 text-xs font-semibold text-white"
        >
          저장
        </button>
      </header>

      <div className="flex flex-wrap gap-1 border-b border-ab-border bg-ab-muted/40 px-2 py-1.5">
        <button
          type="button"
          onClick={openMentionPalette}
          className="rounded-sm border border-ab-border bg-ab-card px-2 py-1 text-[11px] text-ab-text"
        >
          @
        </button>
        <button type="button" onClick={() => toolbar('bold')} className="rounded-sm border border-ab-border px-2 py-1 text-[11px] font-bold">
          B
        </button>
        <button type="button" onClick={() => toolbar('italic')} className="rounded-sm border border-ab-border px-2 py-1 text-[11px] italic">
          I
        </button>
        <button type="button" onClick={() => toolbar('formatBlock', 'h3')} className="rounded-sm border border-ab-border px-2 py-1 text-[11px]">
          제목
        </button>
      </div>

      <div className="relative min-h-[200px] flex-1">
        <div
          ref={editorRef}
          className="ab-editor h-full overflow-y-auto px-3 py-3 text-sm leading-relaxed text-ab-text outline-none"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="@ 단일 · @@ AI(PRO) — 본문에서 @@ 후 스페이스로 분석"
          onInput={onEditorInput}
          onKeyUp={() => openMentionFromEditor()}
          onClick={onEditorClick}
          onBlur={flushContent}
        />
        {analyzingAi && <AiAnalyzingOverlay />}
      </div>

      {popupOpen && (
        <MentionPopup
          projectId={pid}
          filterQuery={filterQuery}
          onPick={insertMention}
          onClose={closeMentionPopup}
        />
      )}

      <TajiPanel open={!!panelMention} mention={panelMention} onClose={() => setPanelMention(null)} />

      <AiInfoBottomSheet
        open={aiSheetOpen}
        draft={aiDraft}
        sourceText={aiSourceText}
        onClose={() => {
          setAiSheetOpen(false)
          setAiDraft(null)
        }}
        onSaveToArtbook={handleSaveAiToArtbook}
      />

      <ProUpsellSheet
        open={proUpsellOpen}
        onClose={() => setProUpsellOpen(false)}
        onGoPremium={() => {
          setProUpsellOpen(false)
          navigate('/premium')
        }}
      />

      {leaveModalOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] bg-ab-text/40"
            aria-label="닫기"
            onClick={cancelLeave}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-save-title"
            className="fixed left-1/2 top-1/2 z-[90] w-[min(320px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-4 shadow-xl"
          >
            <h2 id="leave-save-title" className="font-title-italic text-lg font-semibold text-ab-text">
              저장하시겠습니까?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ab-sub">
              상단의 저장을 누르지 않은 변경이 있습니다. 나가기 전에 저장할지 선택해 주세요.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={confirmSaveAndLeave}
                className="w-full rounded-md bg-ab-text py-2.5 text-sm font-semibold text-white"
              >
                저장하고 나가기
              </button>
              <button
                type="button"
                onClick={confirmDiscardAndLeave}
                className="w-full rounded-md border border-ab-border py-2.5 text-sm font-medium text-ab-text"
              >
                저장하지 않고 나가기
              </button>
              <button type="button" onClick={cancelLeave} className="w-full py-2 text-sm text-ab-sub">
                취소
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
