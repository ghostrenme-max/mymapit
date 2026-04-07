import { useCallback, useRef, useState } from 'react'
import type { MentionKind } from '../../constants/mentionKinds'
import { MENTION_TAB_ROWS, mentionKindMeta } from '../../constants/mentionKinds'

const DEMO: Record<MentionKind, { targetId: string; name: string }> = {
  character: { targetId: 'onb-ch', name: '레이나' },
  world: { targetId: 'onb-w', name: '에테르 균열' },
  object: { targetId: 'onb-o', name: '봉인석' },
  place: { targetId: 'onb-p', name: '북부 설원' },
  event: { targetId: 'onb-e', name: '각성' },
  faction: { targetId: 'onb-f', name: '기록관' },
  term: { targetId: 'onb-t', name: '잔향' },
}

export function Step02Mention() {
  const ref = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<MentionKind>('character')
  const [popup, setPopup] = useState(false)

  const syncPopup = useCallback(() => {
    const el = ref.current
    if (!el) return
    const sel = window.getSelection()
    if (!sel?.rangeCount || !el.contains(sel.anchorNode)) {
      setPopup(false)
      return
    }
    const r = sel.getRangeAt(0).cloneRange()
    const pre = document.createRange()
    pre.selectNodeContents(el)
    pre.setEnd(r.startContainer, r.startOffset)
    const before = pre.toString()
    const m = before.match(/@([^\n@]*)$/)
    if (!m) {
      setPopup(false)
      return
    }
    const idx = before.length - m[0].length
    if (idx > 0 && before[idx - 1] === '@') {
      setPopup(false)
      return
    }
    setPopup(true)
  }, [])

  const insertPick = () => {
    const el = ref.current
    if (!el) return
    const sel = window.getSelection()
    if (!sel?.rangeCount || !el.contains(sel.anchorNode)) return
    const end = sel.getRangeAt(0)
    const pre = document.createRange()
    pre.selectNodeContents(el)
    pre.setEnd(end.startContainer, end.startOffset)
    const before = pre.toString()
    const match = before.match(/@([^\n@]*)$/)
    if (!match) return
    const pick = DEMO[tab]

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let pos = 0
    const startOff = before.length - match[0].length
    const endOff = before.length
    let startNode: Text | null = null
    let startO = 0
    let endNode: Text | null = null
    let endO = 0
    let n: Node | null
    while ((n = walker.nextNode())) {
      const t = n as Text
      const len = t.length
      const next = pos + len
      if (startNode === null && startOff < next) {
        startNode = t
        startO = startOff - pos
      }
      if (startNode && endOff <= next) {
        endNode = t
        endO = endOff - pos
        break
      }
      pos = next
    }
    if (!startNode || !endNode) return
    const range = document.createRange()
    range.setStart(startNode, Math.max(0, Math.min(startO, startNode.length)))
    range.setEnd(endNode, Math.max(0, Math.min(endO, endNode.length)))
    range.deleteContents()

    const span = document.createElement('span')
    span.className = 'ab-mention'
    span.contentEditable = 'false'
    span.dataset.mentionId = `onb-${crypto.randomUUID()}`
    span.dataset.kind = tab
    span.dataset.targetId = pick.targetId
    span.dataset.targetName = pick.name
    span.textContent = `@${pick.name}`
    range.insertNode(span)
    const nb = document.createTextNode('\u00a0')
    range.setStartAfter(span)
    range.collapse(true)
    range.insertNode(nb)
    range.setStartAfter(nb)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    setPopup(false)
    el.focus()
  }

  return (
    <div className="flex flex-col items-center pb-2">
      <h2 className="mt-2 max-w-[min(100%,20rem)] text-center font-title-italic text-2xl font-semibold leading-snug text-white">
        @로 캐릭터와 세계관을
        <br />
        연결해
      </h2>
      <p className="mt-3 max-w-[min(100%,20rem)] text-center text-sm leading-relaxed text-white/55">
        에디터에 @를 입력하면 카테고리가 뜹니다. 탭을 고른 뒤 항목을 눌러 색 띠지를 넣어 보세요.
      </p>

      <div className="relative mt-5 w-full max-w-[320px]">
        <div
          ref={ref}
          className="ab-editor min-h-[120px] rounded-md border border-white/15 bg-black/25 px-3 py-3 text-sm leading-relaxed text-white outline-none"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="여기에 @ 입력…"
          onInput={syncPopup}
          onKeyUp={syncPopup}
        />
        {popup && (
          <div
            className="absolute bottom-0 left-0 right-0 z-10 max-h-[min(38dvh,220px)] translate-y-full rounded-t-lg border border-white/15 bg-[#1a1918] shadow-xl"
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex overflow-x-auto border-b border-white/10 px-1 pt-1">
              {MENTION_TAB_ROWS.map((row) => {
                const on = tab === row.kind
                return (
                  <button
                    key={row.kind}
                    type="button"
                    onClick={() => setTab(row.kind)}
                    className="shrink-0 px-2 py-2 text-[9px] font-semibold"
                    style={{ color: on ? row.color : 'rgba(255,255,255,0.45)' }}
                  >
                    {row.label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={insertPick}
              className="flex w-full items-center gap-2 border-b border-white/5 px-3 py-3 text-left text-sm hover:bg-white/5"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: mentionKindMeta(tab).color }}
                aria-hidden
              />
              <span className="text-white">@{DEMO[tab].name}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
