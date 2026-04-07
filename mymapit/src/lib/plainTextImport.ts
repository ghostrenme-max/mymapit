/** 본문을 에디터용 HTML로 (줄바꿈·이스케이프) */
export function plainTextToEditorHtml(plain: string): string {
  const normalized = plain.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '')
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const blocks = normalized.split(/\n\n+/).map((b) => b.trim()).filter(Boolean)
  if (blocks.length === 0) {
    const single = normalized.trim()
    if (!single) return '<p><br></p>'
    return `<p>${esc(single).replace(/\n/g, '<br/>')}</p>`
  }
  return blocks.map((b) => `<p>${esc(b).replace(/\n/g, '<br/>')}</p>`).join('')
}

export type ImportTextResult = { ok: true; text: string } | { ok: false; error: string }

export async function extractTextFromFile(file: File): Promise<ImportTextResult> {
  const ext = file.name.includes('.') ? (file.name.split('.').pop() ?? '').toLowerCase() : ''

  try {
    if (['txt', 'md', 'text', 'log', 'csv', 'json'].includes(ext)) {
      const text = await file.text()
      return { ok: true, text }
    }

    if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer()
      const mammoth = await import('mammoth/mammoth.browser')
      const { value } = await mammoth.extractRawText({ arrayBuffer })
      return { ok: true, text: value }
    }

    return {
      ok: false,
      error: '지원 형식: .txt, .md, .docx (.doc는 워드에서 docx로 저장해 주세요)',
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : '파일을 읽지 못했습니다.',
    }
  }
}
