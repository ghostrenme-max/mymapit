/**
 * contenteditable 안에서 커서 앞 구간의 플레인 텍스트 (줄바꿈은 innerText 규칙에 가깝게).
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
