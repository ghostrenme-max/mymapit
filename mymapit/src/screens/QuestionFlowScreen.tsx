import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GENRE_CUSTOM_LABEL, QUESTION_STEPS } from '../data/questionFlow'
import type { QuestionAnswers } from '../stores/types'
import { useProjectStore } from '../stores/projectStore'

const emptyAnswers = (): QuestionAnswers => ({
  genre: '',
  mood: '',
  protagonist: '',
  theme: '',
  scale: '',
})

export function QuestionFlowScreen() {
  const navigate = useNavigate()
  const setPending = useProjectStore((s) => s.setPendingAnswers)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionAnswers>(emptyAnswers)
  const [genreChoice, setGenreChoice] = useState('')
  const [genreCustomText, setGenreCustomText] = useState('')

  const q = QUESTION_STEPS[step]!
  const progress = ((step + 1) / QUESTION_STEPS.length) * 100
  const isGenreStep = q.key === 'genre'

  const selected = isGenreStep ? genreChoice : answers[q.key]

  const pick = (opt: string) => {
    if (isGenreStep) {
      setGenreChoice(opt)
      if (opt !== GENRE_CUSTOM_LABEL) setGenreCustomText('')
    } else {
      setAnswers((a) => ({ ...a, [q.key]: opt }))
    }
  }

  const canProceed = (): boolean => {
    if (isGenreStep) {
      if (!genreChoice) return false
      if (genreChoice === GENRE_CUSTOM_LABEL) return genreCustomText.trim().length > 0
      return true
    }
    return !!answers[q.key]
  }

  const next = () => {
    if (!canProceed()) return

    let nextAnswers = answers
    if (isGenreStep) {
      const g =
        genreChoice === GENRE_CUSTOM_LABEL ? genreCustomText.trim() : genreChoice
      nextAnswers = { ...answers, genre: g }
      setAnswers(nextAnswers)
    }

    if (step < QUESTION_STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }
    setPending(isGenreStep ? nextAnswers : answers)
    navigate('/generating', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ab-bg">
      <div className="h-1 w-full bg-ab-muted">
        <div className="h-full bg-ab-text transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-28 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ab-sub">
            {step + 1} / {QUESTION_STEPS.length}
          </span>
          <button type="button" onClick={() => navigate('/memo', { replace: true })} className="text-xs text-ab-sub underline">
            건너뛰기
          </button>
        </div>
        <h2 className="mt-4 font-title-italic text-2xl font-semibold text-ab-text">{q.title}</h2>
        <ul className="mt-6 flex flex-col gap-2">
          {q.options.map((opt) => {
            const on = selected === opt
            return (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => pick(opt)}
                  className={`flex w-full items-center gap-3 rounded-sm border px-3 py-3 text-left text-sm transition-colors ${
                    on
                      ? 'border-ab-text bg-ab-text text-ab-card'
                      : 'border-ab-border bg-ab-card text-ab-text'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                      on ? 'border-ab-card bg-ab-card' : 'border-ab-border bg-ab-card'
                    }`}
                    aria-hidden
                  >
                    {on && (
                      <svg
                        className="h-2.5 w-2.5 text-ab-text"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {opt}
                </button>
              </li>
            )
          })}
        </ul>

        {isGenreStep && genreChoice === GENRE_CUSTOM_LABEL && (
          <div className="mt-4">
            <label htmlFor="genre-custom" className="mb-1.5 block text-xs font-medium text-ab-sub">
              장르 직접 입력
            </label>
            <input
              id="genre-custom"
              type="text"
              value={genreCustomText}
              onChange={(e) => setGenreCustomText(e.target.value)}
              placeholder="예: 느와르, 학원물, 크툴루…"
              maxLength={48}
              className="w-full rounded-sm border border-ab-border bg-ab-card px-3 py-2.5 text-sm text-ab-text outline-none ring-ab-text focus:ring-2"
            />
          </div>
        )}
      </div>
      <div
        className="fixed bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2 border-t border-ab-border bg-ab-card px-4 py-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          disabled={!canProceed()}
          onClick={next}
          className="w-full rounded-md bg-ab-text py-3 text-sm font-semibold text-ab-card disabled:opacity-40"
        >
          {step < QUESTION_STEPS.length - 1 ? '다음' : '✨ 세계관 생성하기'}
        </button>
      </div>
    </div>
  )
}
