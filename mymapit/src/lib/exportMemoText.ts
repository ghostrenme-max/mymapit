/** 에디터 HTML → 외부 공유용 텍스트 (멘션 표기만 바꿈) */
export type ExportPreset = 'plain' | 'footnote' | 'wiki'

const BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'H1',
  'H2',
  'H3',
  'H4',
  'LI',
  'TR',
  'BLOCKQUOTE',
])

type FootCtx = { n: number; lines: string[] }

function serializeMention(el: HTMLElement, preset: ExportPreset, foot: FootCtx): string {
  const name = (el.dataset.targetName ?? '').trim() || (el.textContent ?? '').replace(/^@\s*/, '').trim()
  const kind = el.dataset.kind ?? 'term'
  if (preset === 'plain') return name
  if (preset === 'wiki') return `[[${kind}:${name}]]`
  foot.n += 1
  const i = foot.n
  foot.lines.push(`[${i}] ${kind} — ${name}`)
  return `${name}[${i}]`
}

function walk(node: Node, preset: ExportPreset, foot: FootCtx, out: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    out.push(node.textContent ?? '')
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  const el = node as HTMLElement
  if (el.classList.contains('ab-mention')) {
    out.push(serializeMention(el, preset, foot))
    return
  }
  const tag = el.tagName
  const isBlock = BLOCK_TAGS.has(tag)
  if (isBlock) out.push('\n')
  el.childNodes.forEach((ch) => walk(ch, preset, foot, out))
  if (tag === 'BR') out.push('\n')
  if (isBlock) out.push('\n')
}

/** `document`가 있는 환경에서만 사용 (브라우저) */
export function exportMemoHtmlToText(html: string, preset: ExportPreset): string {
  const d = document.createElement('div')
  d.innerHTML = html
  const foot: FootCtx = { n: 0, lines: [] }
  const parts: string[] = []
  d.childNodes.forEach((ch) => walk(ch, preset, foot, parts))
  let body = parts.join('').replace(/\n{3,}/g, '\n\n').trim()
  if (preset === 'footnote' && foot.lines.length > 0) {
    body += `\n\n---\n${foot.lines.join('\n')}`
  }
  return body
}

export const EXPORT_PRESET_LABELS: Record<ExportPreset, string> = {
  plain: '순수 텍스트 (@이름만)',
  footnote: '각주 번호 [n]',
  wiki: '위키 [[종류:이름]]',
}
