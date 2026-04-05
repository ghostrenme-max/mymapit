import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/common/TopBar'
import { clearWorldData, resetToEmptyFlow } from '../stores/actions'
import { useUserStore } from '../stores/userStore'

export function SettingsScreen() {
  const navigate = useNavigate()
  const setSidebar = useUserStore((s) => s.setSidebarOpen)

  return (
    <div className="flex flex-col gap-4 px-3 pb-6 pt-0">
      <TopBar title="설정" onMenu={() => setSidebar(true)} onBack={() => navigate(-1)} />
      <section className="rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-3">
        <h2 className="text-sm font-semibold text-ab-text">데이터</h2>
        <p className="mt-1 text-xs text-ab-sub">프로젝트·메모·아트북 데이터를 지웁니다. 온보딩·프리미엄은 유지됩니다.</p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm('모든 프로젝트와 메모를 삭제할까요?')) return
            clearWorldData()
            navigate('/memo', { replace: true })
          }}
          className="mt-3 w-full rounded-sm border border-ab-border py-2.5 text-xs text-ab-text"
        >
          세계관·메모 초기화
        </button>
      </section>
      <section className="rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-3">
        <h2 className="text-sm font-semibold text-ab-text">앱 처음부터</h2>
        <p className="mt-1 text-xs text-ab-sub">온보딩부터 다시 시작합니다.</p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm('앱 상태를 완전히 초기화할까요?')) return
            resetToEmptyFlow()
            navigate('/splash', { replace: true })
          }}
          className="mt-3 w-full rounded-sm bg-ab-text py-2.5 text-xs text-ab-card"
        >
          전체 초기화 후 스플래시
        </button>
      </section>
    </div>
  )
}
