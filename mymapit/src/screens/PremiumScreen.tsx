import { useNavigate } from 'react-router-dom'
import { SectionCard } from '../components/common/SectionCard'
import { TopBar } from '../components/common/TopBar'
import { useUserStore } from '../stores/userStore'

export function PremiumScreen() {
  const navigate = useNavigate()
  const setPro = useUserStore((s) => s.setPro)
  const setSidebar = useUserStore((s) => s.setSidebarOpen)

  const unlock = () => {
    setPro(true)
    navigate('/success', { replace: true })
  }

  return (
    <div className="flex flex-col gap-3 px-3 pb-4 pt-0">
      <TopBar title="프리미엄" onMenu={() => setSidebar(true)} />
      <h1 className="font-title-italic text-2xl font-semibold">FREE vs PRO</h1>
      <p className="text-sm text-ab-sub">인디 창작에 맞는 일시불 플랜입니다.</p>

      <div className="grid grid-cols-2 gap-2">
        <SectionCard title="FREE" className="shadow-none">
          <ul className="space-y-1.5 text-[11px] text-ab-sub">
            <li>메모 그룹 3개</li>
            <li>@ 멘션 무제한</li>
            <li>Snap 연결맵 (라이트)</li>
            <li>결과 탭 → 단어 요약 패널</li>
            <li>광고 있음</li>
          </ul>
        </SectionCard>
        <SectionCard
          title="PRO ₩4,900"
          className="border-ab-border border-l-2 border-l-ab-text bg-ab-text text-ab-card shadow-none [&_h3]:text-ab-card [&_ul]:text-ab-card/90"
        >
          <ul className="space-y-1.5 text-[11px]">
            <li>메모 그룹 무제한</li>
            <li>광고 제거</li>
            <li>아트북 전체</li>
            <li>Snap 연결맵 전체 (노드·연결 무제한)</li>
            <li>공출현 횟수 표시</li>
          </ul>
        </SectionCard>
      </div>

      <button
        type="button"
        onClick={unlock}
        className="w-full rounded-md bg-ab-point py-3 text-sm font-semibold text-ab-card"
      >
        PRO 구매하기 (데모: 즉시 활성화)
      </button>
      <p className="text-center text-[11px] text-ab-sub">결제 후 7일 이내 환불 보장 (안내용)</p>

      <h2 className="mt-2 font-title-italic text-lg">PRO 해금</h2>
      <div className="grid grid-cols-2 gap-2">
        {['메모 그룹 무제한', '아트북 전체', 'Snap 전체·가중치', '광고 제거'].map((t) => (
          <div key={t} className="rounded-sm border border-ab-border bg-ab-card p-2 text-center text-[11px]">
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}
