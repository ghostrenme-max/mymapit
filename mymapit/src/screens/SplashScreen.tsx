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
        <h1 className="text-center font-title-italic text-4xl font-semibold leading-snug tracking-tight text-white md:text-5xl">
          mymapit
        </h1>
        <p className="mx-auto mt-4 max-w-[min(100%,20rem)] text-center font-title-italic text-lg font-medium leading-snug text-white/65 md:text-xl">
          창작자의 세계관 도구
        </p>
      </div>
    </div>
  )
}
