import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HashRouter>,
)
