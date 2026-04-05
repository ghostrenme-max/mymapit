import { createHashRouter, Navigate, Outlet } from 'react-router-dom'
import { TabLayout } from './components/common/TabLayout'
import { ArtBookScreen } from './screens/ArtBookScreen'
import { GeneratingScreen } from './screens/GeneratingScreen'
import { HomeScreen } from './screens/HomeScreen'
import { MemoEditorScreen } from './screens/MemoEditorScreen'
import { MemoGroupScreen } from './screens/MemoGroupScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { PremiumScreen } from './screens/PremiumScreen'
import { QuestionFlowScreen } from './screens/QuestionFlowScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SplashScreen } from './screens/SplashScreen'
import { SuccessScreen } from './screens/SuccessScreen'

function AppShell() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[390px] flex-1 flex-col bg-ab-bg">
      <Outlet />
    </div>
  )
}

/** HashRouter 대신 Data Router — MemoEditor의 useBlocker 등이 동작합니다. */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/splash" replace /> },
      { path: 'splash', element: <SplashScreen /> },
      { path: 'onboarding', element: <OnboardingScreen /> },
      { path: 'questions', element: <QuestionFlowScreen /> },
      { path: 'generating', element: <GeneratingScreen /> },
      { path: 'success', element: <SuccessScreen /> },
      {
        element: <TabLayout />,
        children: [
          { path: 'memo', element: <HomeScreen /> },
          { path: 'memo/group/:groupId', element: <MemoGroupScreen /> },
          { path: 'memo/group/:groupId/note/:memoId', element: <MemoEditorScreen /> },
          { path: 'artbook', element: <ArtBookScreen /> },
          { path: 'premium', element: <PremiumScreen /> },
          { path: 'settings', element: <SettingsScreen /> },
        ],
      },
      { path: '*', element: <Navigate to="/splash" replace /> },
    ],
  },
])
