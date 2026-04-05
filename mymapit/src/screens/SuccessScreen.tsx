import { useNavigate } from 'react-router-dom'
import { SectionCard } from '../components/common/SectionCard'

export function SuccessScreen() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center bg-ab-bg px-6">
      <div className="animate-ab-pop text-5xl" aria-hidden>
        ✦
      </div>
      <h1 className="mt-6 font-title-italic text-2xl font-semibold text-ab-text">프리미엄 활성화 완료</h1>
      <p className="mt-2 text-center text-sm text-ab-sub">아래 기능이 모두 사용 가능합니다.</p>

      <SectionCard className="mt-8 w-full" title="해금된 기능">
        <ul className="space-y-2 text-sm text-ab-text">
          <li>· 메모 그룹 무제한</li>
          <li>· @@ AI 분석 월 10회 (+ 크레딧)</li>
          <li>· Snap 연결맵 · 아트북 전체</li>
          <li>· 광고 제거</li>
        </ul>
      </SectionCard>

      <button
        type="button"
        onClick={() => navigate('/memo', { replace: true })}
        className="mt-10 w-full rounded-md bg-ab-text py-3 text-sm font-semibold text-ab-card"
      >
        세계관 만들러 가기 →
      </button>
    </div>
  )
}
