import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadDemoWorld } from '../stores/actions'
import { useUserStore } from '../stores/userStore'

type Slide = {
  title: string
  paragraphs: string[]
  emoji?: string
  snapPreview?: boolean
}

const SLIDES: Slide[] = [
  {
    title: '메모처럼 자유롭게 써',
    paragraphs: [
      '메모 그룹에 아이디어를 쌓고, 인디 게임 설정을 한곳에서 다듬어 보세요.',
      '챕터별·테마별로 나누어 두었다가 나중에 @로 한 번에 연결할 수 있습니다.',
    ],
    emoji: '📝',
  },
  {
    title: '@로 세계관을 연결해',
    paragraphs: [
      '본문에서 @를 입력해 캐릭터·오브젝트·세계관·장소 등을 주석처럼 묶을 수 있어요.',
      '색이 다른 띠지로 구분되니, 긴 메모 안에서도 설정을 빠르게 짚을 수 있습니다.',
    ],
    emoji: '@',
  },
  {
    title: 'Snap 연결맵으로 한눈에',
    paragraphs: [
      '아트북의 연결맵에서는 같은 메모에 함께 등장한 @들이 선으로 이어집니다.',
      '노드를 옮기면 격자에 맞춰 정리되는 Snap으로, 관계도를 깔끔하게 배치해 보세요.',
    ],
    snapPreview: true,
  },
  {
    title: '@@로 AI가 정리해줘',
    paragraphs: [
      'PRO 전용 @@로 본문을 분석하면 인포 페이지가 자동으로 만들어집니다.',
      '등장 요소·요약·긴장도를 바텀시트로 확인하고, 서사 탭에 차곡차곡 쌓을 수 있어요.',
    ],
    emoji: '✦',
  },
]

function SnapConnectionMini() {
  const rid = useId().replace(/:/g, '')
  const gridId = `onb-grid-${rid}`
  return (
    <div className="mt-4 flex justify-center sm:mt-6" aria-hidden>
      <svg
        viewBox="0 0 132 88"
        className="h-[5.5rem] w-[8.25rem] text-white"
        role="img"
        aria-label=""
      >
        <defs>
          <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={0.6} />
          </pattern>
        </defs>
        <rect width="132" height="88" rx="6" fill={`url(#${gridId})`} className="text-white" />
        <rect x="1" y="1" width="130" height="86" rx="5" fill="none" stroke="currentColor" strokeOpacity={0.2} />
        <line x1="44" y1="32" x2="88" y2="44" stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} />
        <line x1="44" y1="32" x2="56" y2="64" stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} />
        <line x1="88" y1="44" x2="56" y2="64" stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.35} />
        <circle cx="44" cy="32" r="10" fill="#111110" stroke="#C4614A" strokeWidth={2} />
        <circle cx="88" cy="44" r="10" fill="#111110" stroke="#4A6B7A" strokeWidth={2} />
        <circle cx="56" cy="64" r="10" fill="#111110" stroke="#6B7A3A" strokeWidth={2} />
      </svg>
    </div>
  )
}

export function OnboardingScreen() {
  const navigate = useNavigate()
  const setDone = useUserStore((s) => s.setOnboardingCompleted)
  const [step, setStep] = useState(0)

  const finish = () => {
    setDone(true)
    loadDemoWorld()
    navigate('/memo', { replace: true })
  }

  const s = SLIDES[step]!
  const isFirst = step === 0
  const isLast = step === SLIDES.length - 1

  const goPrev = () => {
    if (!isFirst) setStep((x) => x - 1)
  }

  const goNext = () => {
    if (isLast) finish()
    else setStep((x) => x + 1)
  }

  return (
    <div className="ab-splash-viewport flex flex-col overscroll-none text-white">
      <p className="shrink-0 pt-1 text-center text-xs text-ab-sub">
        {step + 1} / {SLIDES.length}
      </p>

      {/* 상단: 아이콘·제목·문단 (이전과 동일하게 위쪽 정렬) */}
      <div className="flex shrink-0 flex-col items-center px-1 pt-8 text-center sm:pt-10">
        {s.emoji != null && s.emoji !== '' && (
          <span className="text-5xl leading-none sm:text-6xl" aria-hidden>
            {s.emoji}
          </span>
        )}
        {s.snapPreview && <SnapConnectionMini />}
        <h2 className="mt-6 max-w-[min(100%,20rem)] text-pretty break-keep font-title-italic text-2xl font-semibold leading-snug text-white sm:mt-8">
          {s.title}
        </h2>
        <div className="mt-4 w-full max-w-[min(100%,20rem)] space-y-3 text-center sm:mt-5">
          {s.paragraphs.map((p, i) => (
            <p key={i} className="text-pretty break-keep text-sm leading-relaxed text-ab-sub">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* 하단: 이전 | 점 | 다음 + 건너뛰기 — mt-auto로 화면 아래에 고정 */}
      <div className="mt-auto flex w-full flex-col gap-4 pb-1">
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="min-w-[4.25rem] rounded-md border border-white/25 py-2.5 text-xs font-medium text-white/90 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25"
          >
            &lt; 이전
          </button>
          <div className="flex shrink-0 justify-center gap-2">
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${i === step ? 'bg-white' : 'bg-white/30'}`}
                aria-hidden
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="min-w-[4.25rem] rounded-md border border-white/25 bg-white/10 py-2.5 text-xs font-semibold text-white"
          >
            {isLast ? '시작하기' : '다음 >'}
          </button>
        </div>
        <button type="button" onClick={finish} className="py-2 text-center text-xs text-ab-sub">
          건너뛰기
        </button>
      </div>
    </div>
  )
}
