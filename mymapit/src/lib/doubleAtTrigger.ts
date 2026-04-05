/**
 * @@ AI 분석 트리거 (온보딩·메모 에디터 공통)
 * - @@ 뒤에 문장을 쓰고 엔터(줄바꿈) 또는
 * - 같은 줄에서 @@ 직후부터 20자 이상
 */
export function detectDoubleAtTrigger(beforeCaretPlain: string): { start: number; end: number } | null {
  const plain = beforeCaretPlain.replace(/\r\n/g, '\n')
  const last = plain.lastIndexOf('@@')
  if (last < 0) return null
  if (last > 0 && plain[last - 1] === '@') return null

  const tail = plain.slice(last)
  const end = plain.length

  if (/^@@\s*[^\n]+\n/.test(tail)) {
    return { start: last, end }
  }

  if (/^@@\s*([^\n]{20,})$/.test(tail)) {
    return { start: last, end }
  }

  return null
}

/** @ 팝업을 닫아야 할 때: @@ 입력 블록 안 */
export function isInsideDoubleAtDraft(beforeCaretPlain: string): boolean {
  const normalized = beforeCaretPlain.replace(/\r\n/g, '\n')
  if (detectDoubleAtTrigger(normalized)) return false
  const last = normalized.lastIndexOf('@@')
  if (last < 0) return false
  if (last > 0 && normalized[last - 1] === '@') return false
  const tail = normalized.slice(last)
  return /^@@/.test(tail)
}
