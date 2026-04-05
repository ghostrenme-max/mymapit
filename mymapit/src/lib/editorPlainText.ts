import { detectDoubleAtTrigger } from './doubleAtTrigger'

/**
 * contenteditable 안에서 커서 앞 구간의 플레인 텍스트 (줄바꿈은 innerText 규칙에 가깝게).
 * Range.toString()보다 Enter 후 블록 구조에서 \n이 잡히는 경우가 많습니다.
 */
export function getPlainTextBeforeCaret(root: HTMLElement): string | null {
  const sel = window.getSelection()
  if (!sel?.rangeCount || !root.contains(sel.anchorNode)) return null
  const endRange = sel.getRangeAt(0).cloneRange()
  const pre = document.createRange()
  pre.selectNodeContents(root)
  pre.setEnd(endRange.startContainer, endRange.startOffset)
  const holder = document.createElement('div')
  holder.appendChild(pre.cloneContents())
  return holder.innerText.replace(/\r\n/g, '\n')
}

/**
 * 커서 직전까지 `detectDoubleAtTrigger`가 참일 때, 문서 안에서 **가장 마지막** `@@`부터 커서까지 삭제.
 */
export function deleteTriggeredDoubleAtBlock(root: HTMLElement): boolean {
  const before = getPlainTextBeforeCaret(root)
  if (before == null || !detectDoubleAtTrigger(before)) return false

  const sel = window.getSelection()
  if (!sel?.rangeCount || !root.contains(sel.anchorNode)) return false
  const caretR = sel.getRangeAt(0).cloneRange()

  let latest: Range | null = null
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const t = node as Text
    for (let i = 0; i <= t.length - 2; i++) {
      if (t.data[i] !== '@' || t.data[i + 1] !== '@') continue
      if (i > 0 && t.data[i - 1] === '@') continue
      const r = document.createRange()
      r.setStart(t, i)
      r.setEnd(caretR.startContainer, caretR.startOffset)
      if (r.collapsed) continue
      if (r.compareBoundaryPoints(Range.START_TO_START, caretR) >= 0) continue
      if (latest === null || r.compareBoundaryPoints(Range.START_TO_START, latest) > 0) latest = r.cloneRange()
    }
  }

  if (!latest) return false
  try {
    latest.deleteContents()
    latest.collapse(true)
    sel.removeAllRanges()
    sel.addRange(latest)
  } catch {
    return false
  }
  return true
}
