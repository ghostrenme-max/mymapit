import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import { MentionPopup, type MentionPick } from '../components/memo/MentionPopup'
import { TajiPanel } from '../components/memo/TajiPanel'
import { isMentionKind, legacyDatasetTypeToKind } from '../constants/mentionKinds'
import { getPlainTextBeforeCaret } from '../lib/editorPlainText'
import { extractTextFromFile, plainTextToEditorHtml } from '../lib/plainTextImport'
import { BulkMentionPanel } from '../components/memo/BulkMentionPanel'
import { MemoSnapshotSheet } from '../components/memo/MemoSnapshotSheet'
import { createDefaultWritingChecklist } from '../lib/defaultWritingChecklist'
import {
  EXPORT_PRESET_LABELS,
  exportMemoHtmlToText,
  type ExportPreset,
} from '../lib/exportMemoText'
import { useMemoStore } from '../stores/memoStore'
import { useProjectStore } from '../stores/projectStore'
import type { MemoContentSnapshot, Mention, MentionKind } from '../stores/types'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mentionRangeRef = useRef<Range | null>(null)
  const titleMentionRef = useRef<{ start: number; end: number } | null>(null)
  const activeMentionFieldRef = useRef<'title' | 'editor' | null>(null)
  const baselineRef = useRef<MemoBaseline>({ title: '', content: '', mentions: [] })

  const pid = useProjectStore((s) => s.currentProjectId)
  const memo = useMemoStore((s) => s.memos.find((m) => m.id === memoId))
  const updateMemo = useMemoStore((s) => s.updateMemo)
  const pushMemoContentSnapshot = useMemoStore((s) => s.pushMemoContentSnapshot)
  const deleteMemoContentSnapshot = useMemoStore((s) => s.deleteMemoContentSnapshot)
  const setSidebar = useUserStore((s) => s.setSidebarOpen)

  const [title, setTitle] = useState('')
  const [popupOpen, setPopupOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [panelMention, setPanelMention] = useState<Mention | null>(null)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [sameMemoSnap, setSameMemoSnap] = useState<Mention[]>([])
  const [bulkMentionOpen, setBulkMentionOpen] = useState(false)
  const [bulkInitialMatch, setBulkInitialMatch] = useState('')
  const [snapshotSheetOpen, setSnapshotSheetOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  const closeMentionPopup = useCallback(() => {
    setPopupOpen(false)
    mentionRangeRef.current = null
    titleMentionRef.current = null
    activeMentionFieldRef.current = null
  }, [])

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

  const pushPreEditSnapshot = useCallback(
    (label: string) => {
      if (!memoId || !editorRef.current) return
      const el = editorRef.current
      const m = useMemoStore.getState().memos.find((x) => x.id === memoId)
      pushMemoContentSnapshot(memoId, {
        label,
        title: titleRef.current,
        content: el.innerHTML,
        mentions: parseMentionsFromEditor(el),
        entitySideNotes: m?.entitySideNotes ? { ...m.entitySideNotes } : undefined,
        writingChecklist: m?.writingChecklist?.map((c) => ({ ...c })),
      })
    },
    [memoId, pushMemoContentSnapshot],
  )

  const applySnapshotRestore = useCallback(
    (snap: MemoContentSnapshot) => {
      if (!memoId || !editorRef.current) return
      if (!window.confirm('현재 편집 내용을 이 스냅샷 시점으로 바꿉니다. 계속할까요?')) return
      setTitle(snap.title)
      titleRef.current = snap.title
      editorRef.current.innerHTML = snap.content
      const patch: Parameters<typeof updateMemo>[1] = {
        title: snap.title,
        content: snap.content,
        mentions: [...snap.mentions],
      }
      if (snap.entitySideNotes !== undefined) {
        patch.entitySideNotes = { ...snap.entitySideNotes }
      }
      if (snap.writingChecklist !== undefined) {
        patch.writingChecklist = snap.writingChecklist.map((c) => ({ ...c }))
      }
      updateMemo(memoId, patch)
      baselineRef.current = {
        title: snap.title,
        content: snap.content,
        mentions: [...snap.mentions],
      }
      setSnapshotSheetOpen(false)
    },
    [memoId, updateMemo],
  )

  const copyExportedBody = useCallback(
    async (preset: ExportPreset) => {
      const html = editorRef.current?.innerHTML ?? ''
      const text = exportMemoHtmlToText(html, preset)
      try {
        await navigator.clipboard.writeText(text)
        window.alert(`본문을 복사했습니다.\n(${EXPORT_PRESET_LABELS[preset]})`)
      } catch {
        window.alert('클립보드 복사에 실패했습니다.')
      }
      setExportMenuOpen(false)
    },
    [],
  )

  useEffect(() => {
    const root = editorRef.current
    if (!root) return
    root.querySelectorAll('.ab-mention').forEach((el) => {
      el.classList.remove('ab-mention-snap-active', 'ab-mention-snap-linked')
    })
    if (!panelMention) return
    root.querySelectorAll<HTMLElement>('.ab-mention').forEach((el) => {
      const tid = el.dataset.targetId
      if (!tid) return
      if (tid === panelMention.targetId) el.classList.add('ab-mention-snap-active')
      else el.classList.add('ab-mention-snap-linked')
    })
    return () => {
      root.querySelectorAll('.ab-mention').forEach((el) => {
        el.classList.remove('ab-mention-snap-active', 'ab-mention-snap-linked')
      })
    }
  }, [panelMention])

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
    const before = getPlainTextBeforeCaret(root) ?? pre.toString()

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
  }

  const onEditorKeyUp = () => {
    openMentionFromEditor()
  }

  const onEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const root = editorRef.current
    const el = (e.target as HTMLElement).closest('.ab-mention') as HTMLElement | null
    if (!el || !root) return
    const rawKind = el.dataset.kind
    const kind: MentionKind | null = isMentionKind(rawKind)
      ? rawKind
      : legacyDatasetTypeToKind(el.dataset.type)
    const targetId = el.dataset.targetId
    const targetName = el.dataset.targetName
    const id = el.dataset.mentionId ?? 'men'
    if (kind && targetId && targetName) {
      const all = parseMentionsFromEditor(root)
      setSameMemoSnap(all.filter((m) => m.targetId !== targetId))
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

  const getEditorSelectionText = () => {
    const sel = window.getSelection()
    const root = editorRef.current
    if (!sel?.rangeCount || !root) return ''
    try {
      if (!root.contains(sel.anchorNode)) return ''
    } catch {
      return ''
    }
    return sel.toString().trim()
  }

  const openBulkMentionPanel = () => {
    setBulkInitialMatch(getEditorSelectionText())
    setBulkMentionOpen(true)
  }

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const res = await extractTextFromFile(file)
    if (!res.ok) {
      window.alert(res.error)
      return
    }
    const root = editorRef.current
    if (!root) return
    const hasContent = (root.innerText || '').trim().length > 0
    if (hasContent && !window.confirm('현재 본문을 가져온 파일 내용으로 바꿀까요?')) return
    if (hasContent) pushPreEditSnapshot('파일 가져오기 전')
    root.innerHTML = plainTextToEditorHtml(res.text)
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.text,.md,.docx,.csv,.log,.json"
        className="hidden"
        onChange={onImportFile}
      />

      <div className="flex flex-wrap gap-1 border-b border-ab-border bg-ab-muted/40 px-2 py-1.5">
        <button
          type="button"
          onClick={openMentionPalette}
          className="rounded-sm border border-ab-border bg-ab-card px-2 py-1 text-[11px] text-ab-text"
        >
          @
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-sm border border-ab-border bg-ab-card px-2 py-1 text-[11px] text-ab-text"
        >
          파일
        </button>
        <button
          type="button"
          onClick={openBulkMentionPanel}
          className="rounded-sm border border-ab-point/40 bg-ab-card px-2 py-1 text-[11px] font-medium text-ab-point"
        >
          단어→@
        </button>
        <button
          type="button"
          onClick={() => setSnapshotSheetOpen(true)}
          className="rounded-sm border border-ab-border bg-ab-card px-2 py-1 text-[11px] text-ab-text"
        >
          버전
        </button>
        <button
          type="button"
          onClick={() => {
            const label = window.prompt('스냅샷 이름 (예: 퇴고 전)', '수동 저장')
            if (label === null) return
            pushPreEditSnapshot(label.trim() || '수동 저장')
            window.alert('현재 본문이 스냅샷에 저장되었습니다.')
          }}
          className="rounded-sm border border-ab-border bg-ab-card px-2 py-1 text-[11px] text-ab-text"
        >
          스냅 저장
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setExportMenuOpen((v) => !v)}
            className="rounded-sm border border-ab-border bg-ab-card px-2 py-1 text-[11px] text-ab-text"
          >
            보내기
          </button>
          {exportMenuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-[54] cursor-default"
                aria-label="메뉴 닫기"
                onClick={() => setExportMenuOpen(false)}
              />
              <div className="absolute left-0 top-full z-[55] mt-0.5 min-w-[200px] rounded-sm border border-ab-border bg-ab-card py-1 shadow-md">
                {(['plain', 'footnote', 'wiki'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => void copyExportedBody(preset)}
                    className="block w-full px-3 py-2 text-left text-[11px] text-ab-text active:bg-ab-muted/60"
                  >
                    {EXPORT_PRESET_LABELS[preset]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
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

      <p className="border-b border-ab-border bg-ab-muted/20 px-3 py-1.5 text-[10px] leading-snug text-ab-sub">
        <span className="font-semibold text-ab-text">가져오기 정리</span> — 파일로 붙인 뒤 「단어→@」에서 같은 말을 아트북 항목에 한꺼번에 연결할 수 있어요.{' '}
        <span className="font-semibold text-ab-text">보내기</span>는 멘션 표기만 바꾼 텍스트를 복사합니다.
      </p>

      <div className="border-b border-ab-border bg-ab-card px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ab-sub">집필 체크리스트</p>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => {
                if (!memoId) return
                const cur = memo?.writingChecklist ?? []
                if (cur.length > 0 && !window.confirm('기본 항목을 목록 뒤에 붙일까요?')) return
                updateMemo(memoId, { writingChecklist: [...cur, ...createDefaultWritingChecklist()] })
              }}
              className="rounded-sm border border-ab-border bg-ab-muted/40 px-2 py-0.5 text-[10px] text-ab-text"
            >
              기본 항목 넣기
            </button>
            <button
              type="button"
              onClick={() => {
                if (!memoId) return
                const label = window.prompt('새 체크 항목')
                if (!label?.trim()) return
                const cur = memo?.writingChecklist ?? []
                updateMemo(memoId, {
                  writingChecklist: [...cur, { id: `chk-${crypto.randomUUID()}`, label: label.trim(), done: false }],
                })
              }}
              className="rounded-sm border border-ab-border bg-ab-muted/40 px-2 py-0.5 text-[10px] text-ab-text"
            >
              + 항목
            </button>
          </div>
        </div>
        {(memo.writingChecklist?.length ?? 0) === 0 ? (
          <p className="mt-1 text-[11px] text-ab-sub">목표를 체크해 두면 본문과 섞이지 않고 진행만 볼 수 있어요.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {memo.writingChecklist!.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-xs text-ab-text">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {
                    if (!memoId) return
                    const list = memo.writingChecklist ?? []
                    updateMemo(memoId, {
                      writingChecklist: list.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x)),
                    })
                  }}
                  className="mt-0.5"
                />
                <span className={item.done ? 'text-ab-sub line-through' : ''}>{item.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!memoId) return
                    const list = memo.writingChecklist ?? []
                    updateMemo(memoId, { writingChecklist: list.filter((x) => x.id !== item.id) })
                  }}
                  className="ml-auto shrink-0 text-[10px] text-ab-sub"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative min-h-[200px] flex-1">
        <div
          ref={editorRef}
          className="ab-editor h-full overflow-y-auto bg-ab-input px-3 py-3 text-sm leading-relaxed text-ab-text outline-none"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="메모 본문… (@ 멘션, 파일 가져오기)"
          onInput={onEditorInput}
          onKeyUp={onEditorKeyUp}
          onClick={onEditorClick}
          onBlur={flushContent}
        />
      </div>

      {popupOpen && (
        <MentionPopup
          projectId={pid}
          filterQuery={filterQuery}
          onPick={insertMention}
          onClose={closeMentionPopup}
        />
      )}

      {bulkMentionOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[57] bg-ab-text/25"
          aria-label="패널 닫기"
          onClick={() => setBulkMentionOpen(false)}
        />
      )}
      <BulkMentionPanel
        open={bulkMentionOpen}
        projectId={pid}
        editorRoot={editorRef.current}
        initialMatch={bulkInitialMatch}
        onClose={() => setBulkMentionOpen(false)}
        onBeforeApply={() => pushPreEditSnapshot('단어→@ 적용 전')}
        onApplied={(count) => {
          flushContent()
          if (count > 0) window.alert(`${count}곳에 적용했습니다.`)
        }}
      />

      <MemoSnapshotSheet
        open={snapshotSheetOpen}
        snapshots={memo.contentSnapshots ?? []}
        onClose={() => setSnapshotSheetOpen(false)}
        onRestore={applySnapshotRestore}
        onDelete={(snapshotId) => {
          if (!memoId) return
          deleteMemoContentSnapshot(memoId, snapshotId)
        }}
      />

      <TajiPanel
        open={!!panelMention}
        mention={panelMention}
        sameMemoMentions={sameMemoSnap}
        memoSideNote={
          memoId && panelMention
            ? {
                note:
                  memo.entitySideNotes?.[panelMention.targetId] ?? {
                    relationship: '',
                    secret: '',
                    status: '',
                  },
                onSave: (note) => {
                  const m = useMemoStore.getState().memos.find((x) => x.id === memoId)
                  updateMemo(memoId, {
                    entitySideNotes: { ...(m?.entitySideNotes ?? {}), [panelMention.targetId]: note },
                  })
                },
              }
            : undefined
        }
        onClose={() => {
          setPanelMention(null)
          setSameMemoSnap([])
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
            className="fixed left-1/2 top-1/2 z-[90] w-[min(320px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-4"
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
