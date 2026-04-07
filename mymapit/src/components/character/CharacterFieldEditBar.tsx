import { useEffect, useState } from 'react'
import type { CharacterPatch } from '../../stores/mentionStore'
import type { Character, CharacterValueEntry } from '../../stores/types'

export type CharacterEditMode =
  | { type: 'quote' }
  | { type: 'basic'; field: 'personality' | 'ability' | 'likes' | 'dislikes'; label: string }
  | { type: 'voice' }
  | { type: 'value-new' }
  | { type: 'value-edit'; entry: CharacterValueEntry }

type Props = {
  open: CharacterEditMode | null
  character: Character
  onClose: () => void
  onApply: (patch: CharacterPatch) => void
  onDeleteValue?: (id: string) => void
}

function newValueId() {
  return `val-${crypto.randomUUID().slice(0, 12)}`
}

export function CharacterFieldEditBar({ open, character: c, onClose, onApply, onDeleteValue }: Props) {
  const [quote, setQuote] = useState('')
  const [basic, setBasic] = useState('')
  const [pitch, setPitch] = useState(50)
  const [emotion, setEmotion] = useState(50)
  const [speed, setSpeed] = useState(50)
  const [vTheme, setVTheme] = useState('')
  const [vAnswer, setVAnswer] = useState('')

  useEffect(() => {
    if (!open) return
    if (open.type === 'quote') setQuote(c.quote)
    else if (open.type === 'basic') setBasic(c[open.field])
    else if (open.type === 'voice') {
      setPitch(c.voiceTone.pitch)
      setEmotion(c.voiceTone.emotion)
      setSpeed(c.voiceTone.speed)
    } else if (open.type === 'value-new') {
      setVTheme('')
      setVAnswer('')
    } else if (open.type === 'value-edit') {
      setVTheme(open.entry.theme)
      setVAnswer(open.entry.answer)
    }
  }, [open, c])

  if (!open) return null

  const save = () => {
    if (open.type === 'quote') onApply({ quote: quote.trim() })
    else if (open.type === 'basic') onApply({ [open.field]: basic.trim() } as CharacterPatch)
    else if (open.type === 'voice') {
      onApply({
        voiceTone: {
          pitch: Math.max(0, Math.min(100, Math.round(pitch))),
          emotion: Math.max(0, Math.min(100, Math.round(emotion))),
          speed: Math.max(0, Math.min(100, Math.round(speed))),
        },
      })
    } else if (open.type === 'value-new') {
      const theme = vTheme.trim()
      if (!theme) {
        window.alert('질문(제목)을 입력해 주세요.')
        return
      }
      onApply({
        values: [...c.values, { id: newValueId(), theme, answer: vAnswer.trim() }],
      })
    } else if (open.type === 'value-edit' && !open.entry.isSample) {
      onApply({
        values: c.values.map((x) =>
          x.id === open.entry.id ? { ...x, theme: vTheme.trim(), answer: vAnswer.trim() } : x,
        ),
      })
    }
    onClose()
  }

  const title =
    open.type === 'quote'
      ? '대사 (한 줄)'
      : open.type === 'basic'
        ? open.label
        : open.type === 'voice'
          ? '목소리 · 억양'
          : open.type === 'value-new'
            ? '가치관 질문 추가'
            : '가치관 편집'

  return (
    <>
      <button type="button" className="fixed inset-0 z-[85] bg-ab-text/35" aria-label="닫기" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="char-edit-bar-title"
        className="fixed inset-x-0 bottom-0 z-[90] max-h-[min(72vh,420px)] rounded-t-lg border border-ab-border border-b-0 bg-ab-card shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-ab-border pt-1" aria-hidden />
        <div className="border-b border-ab-border px-4 py-2.5">
          <h2 id="char-edit-bar-title" className="text-sm font-semibold text-ab-text">
            {title}
          </h2>
          <p className="mt-0.5 text-[10px] text-ab-sub">저장하면 아트북에 반영됩니다.</p>
        </div>
        <div className="max-h-[min(48vh,320px)] overflow-y-auto px-4 py-3">
          {open.type === 'quote' && (
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-ab-border bg-ab-input px-3 py-2 text-sm text-ab-text outline-none"
              placeholder="한 줄 대사"
            />
          )}
          {open.type === 'basic' && (
            <textarea
              value={basic}
              onChange={(e) => setBasic(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-ab-border bg-ab-input px-3 py-2 text-sm text-ab-text outline-none"
            />
          )}
          {open.type === 'voice' && (
            <div className="space-y-4">
              {(
                [
                  ['음역대', pitch, setPitch],
                  ['감정 표현', emotion, setEmotion],
                  ['말 속도', speed, setSpeed],
                ] as const
              ).map(([label, val, setVal]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[11px] text-ab-sub">
                    <span>{label}</span>
                    <span className="tabular-nums text-ab-text">{val}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={val}
                    onChange={(e) => setVal(Number(e.target.value))}
                    className="w-full accent-ab-text"
                  />
                </div>
              ))}
            </div>
          )}
          {(open.type === 'value-new' || open.type === 'value-edit') && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-ab-sub">질문</label>
                <input
                  value={vTheme}
                  onChange={(e) => setVTheme(e.target.value)}
                  disabled={open.type === 'value-edit' && open.entry.isSample}
                  className="mt-1 w-full rounded-md border border-ab-border bg-ab-input px-3 py-2 text-sm text-ab-text outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-ab-sub">답</label>
                <textarea
                  value={vAnswer}
                  onChange={(e) => setVAnswer(e.target.value)}
                  disabled={open.type === 'value-edit' && open.entry.isSample}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-ab-border bg-ab-input px-3 py-2 text-sm text-ab-text outline-none disabled:opacity-60"
                />
              </div>
              {open.type === 'value-edit' && !open.entry.isSample && onDeleteValue && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('이 가치관 항목을 삭제할까요?')) {
                      onDeleteValue(open.entry.id)
                      onClose()
                    }
                  }}
                  className="w-full rounded-md border border-ab-border py-2 text-xs text-ab-sub"
                >
                  삭제
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t border-ab-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-ab-border py-2.5 text-sm text-ab-text"
          >
            취소
          </button>
          <button
            type="button"
            onClick={save}
            disabled={open.type === 'value-edit' && open.entry.isSample}
            className="flex-1 rounded-md bg-ab-text py-2.5 text-sm font-semibold text-ab-card disabled:opacity-40"
          >
            저장
          </button>
        </div>
      </div>
    </>
  )
}
