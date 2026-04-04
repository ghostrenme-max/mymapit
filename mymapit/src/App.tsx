import { Navigate, Route, Routes } from 'react-router-dom'
import { BottomTabBar } from './components/common/BottomTabBar'
import { CharacterPage } from './pages/CharacterPage'
import { KeywordPage } from './pages/KeywordPage'
import { SnapPage } from './pages/SnapPage'
import { StoryPage } from './pages/StoryPage'

export default function App() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-m-bg">
      <Routes>
        <Route path="/" element={<Navigate to="/story" replace />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/character" element={<CharacterPage />} />
        <Route path="/keyword" element={<KeywordPage />} />
        <Route path="/snap" element={<SnapPage />} />
        <Route path="*" element={<Navigate to="/story" replace />} />
      </Routes>
      <BottomTabBar />
    </div>
  )
}
