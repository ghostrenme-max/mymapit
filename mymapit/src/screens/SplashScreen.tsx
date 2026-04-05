import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'

export function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = window.setTimeout(() => {
      const { onboardingCompleted } = useUserStore.getState()
      if (!onboardingCompleted) navigate('/onboarding', { replace: true })
      else navigate('/memo', { replace: true })
    }, 1800)
    return () => window.clearTimeout(t)
  }, [navigate])

  return (
    <div className="ab-splash-viewport flex flex-col items-center justify-center overscroll-none">
      <div className="animate-ab-fade-in w-full max-w-[min(100%,24rem)] text-center">
        <h1 className="font-title-italic text-4xl font-semibold tracking-tight text-white md:text-5xl">
          mymapit
        </h1>
        <p className="mt-4 max-w-[280px] text-pretty break-keep text-sm font-medium leading-relaxed tracking-wide text-white/70">
          창작자의 세계관 도구
        </p>
      </div>
    </div>
  )
}
