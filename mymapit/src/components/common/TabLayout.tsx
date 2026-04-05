import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function TabLayout() {
  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-[390px] flex-1 flex-col bg-ab-bg">
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-16"
        style={{ paddingBottom: 'max(72px, env(safe-area-inset-bottom))' }}
      >
        <Outlet />
      </div>
      <BottomNav />
      <Sidebar />
    </div>
  )
}
