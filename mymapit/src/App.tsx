import { RouterProvider } from 'react-router-dom'
import { router } from './router'

/** 앱 라우트 루트 — `router.tsx`의 `createHashRouter` 트리 */
export function App() {
  return <RouterProvider router={router} />
}
