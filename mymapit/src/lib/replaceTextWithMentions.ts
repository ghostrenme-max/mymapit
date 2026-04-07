import type { MentionKind } from '../constants/mentionKinds'

export type MentionReplacementPick = {
  kind: MentionKind
  targetId: string
  name: string
}

function makeMentionSpan(pick: MentionReplacementPick): HTMLSpanElement {
  const span = document.createElement('span')
  span.className = 'ab-mention'
  span.contentEditable = 'false'
  span.dataset.mentionId = `men-${crypto.randomUUID()}`
  span.dataset.kind = pick.kind
  span.dataset.targetId = pick.targetId
  span.dataset.targetName = pick.name
  span.textContent = `@${pick.name}`
  return span
}

function replaceInTextNode(textNode: Text, search: string, pick: MentionReplacementPick, caseInsensitive: boolean): number {
  if (!search || !textNode.parentNode) return 0
  const full = textNode.data
  const parent = textNode.parentNode
  const frag = document.createDocumentFragment()
  let start = 0
  let count = 0

  while (start <= full.length) {
    let i: number
    let matchLen: number
    if (caseInsensitive) {
      const slice = full.slice(start)
      const lowerSlice = slice.toLowerCase()
      const lowerSearch = search.toLowerCase()
      i = lowerSlice.indexOf(lowerSearch)
      if (i === -1) {
        if (start < full.length) frag.appendChild(document.createTextNode(full.slice(start)))
        break
      }
      i += start
      matchLen = search.length
    } else {
      i = full.indexOf(search, start)
      if (i === -1) {
        if (start < full.length) frag.appendChild(document.createTextNode(full.slice(start)))
        break
      }
      matchLen = search.length
    }

    if (i > start) frag.appendChild(document.createTextNode(full.slice(start, i)))
    frag.appendChild(makeMentionSpan(pick))
    frag.appendChild(document.createTextNode('\u00a0'))
    count++
    start = i + matchLen
  }

  parent.replaceChild(frag, textNode)
  return count
}

function countInTextNode(textNode: Text, search: string, caseInsensitive: boolean): number {
  if (!search) return 0
  const full = textNode.data
  let start = 0
  let count = 0
  while (start <= full.length) {
    let i: number
    let matchLen: number
    if (caseInsensitive) {
      const slice = full.slice(start)
      const lowerSlice = slice.toLowerCase()
      const lowerSearch = search.toLowerCase()
      i = lowerSlice.indexOf(lowerSearch)
      if (i === -1) break
      i += start
      matchLen = search.length
    } else {
      i = full.indexOf(search, start)
      if (i === -1) break
      matchLen = search.length
    }
    count++
    start = i + matchLen
  }
  return count
}

/** 치환 전 일치 개수만 셉니다 (스냅샷 조건용). */
export function countPlainTextMatches(
  root: HTMLElement,
  searchRaw: string,
  options?: { caseInsensitive?: boolean },
): number {
  const search = searchRaw.trim()
  if (!search) return 0
  const caseInsensitive = options?.caseInsensitive ?? false
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let total = 0
  let n: Node | null
  while ((n = walker.nextNode())) {
    const t = n as Text
    if (t.parentElement?.closest('.ab-mention')) continue
    total += countInTextNode(t, search, caseInsensitive)
  }
  return total
}

/**
 * 에디터 루트 안에서 `search`와 일치하는 일반 텍스트를 모두 @멘션으로 바꿉니다.
 * 이미 `.ab-mention` 안의 텍스트는 건드리지 않습니다.
 */
export function replacePlainTextWithMentions(
  root: HTMLElement,
  searchRaw: string,
  pick: MentionReplacementPick,
  options?: { caseInsensitive?: boolean },
): number {
  const search = searchRaw.trim()
  if (!search) return 0
  const caseInsensitive = options?.caseInsensitive ?? false

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) {
    const t = n as Text
    if (t.parentElement?.closest('.ab-mention')) continue
    nodes.push(t)
  }

  let total = 0
  for (let i = nodes.length - 1; i >= 0; i--) {
    const tn = nodes[i]!
    if (!tn.parentNode) continue
    total += replaceInTextNode(tn, search, pick, caseInsensitive)
  }
  return total
}
