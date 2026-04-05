import { Navigate, Route, Routes } from 'react-router-dom'
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

export default function App() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[390px] flex-1 flex-col bg-ab-bg">
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/questions" element={<QuestionFlowScreen />} />
        <Route path="/generating" element={<GeneratingScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route element={<TabLayout />}>
          <Route path="/memo" element={<HomeScreen />} />
          <Route path="/memo/group/:groupId" element={<MemoGroupScreen />} />
          <Route path="/memo/group/:groupId/note/:memoId" element={<MemoEditorScreen />} />
          <Route path="/artbook" element={<ArtBookScreen />} />
          <Route path="/premium" element={<PremiumScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </div>
  )
}
