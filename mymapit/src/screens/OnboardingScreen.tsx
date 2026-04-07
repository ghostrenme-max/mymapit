import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingChrome } from '../components/onboarding/OnboardingChrome'
import { Step01MemoGroups } from '../components/onboarding/Step01MemoGroups'
import { Step02Mention } from '../components/onboarding/Step02Mention'
import { Step04Snap } from '../components/onboarding/Step04Snap'
import { Step05Start } from '../components/onboarding/Step05Start'
import { loadDemoWorld } from '../stores/actions'
import { useUserStore } from '../stores/userStore'

const TOTAL = 4

export function OnboardingScreen() {
  const navigate = useNavigate()
  const setDone = useUserStore((s) => s.setOnboardingCompleted)
  const [step, setStep] = useState(0)

  const finish = () => {
    setDone(true)
    loadDemoWorld()
    navigate('/memo', { replace: true })
  }

  const isFirst = step === 0
  const isLast = step === TOTAL - 1

  const goPrev = () => {
    if (!isFirst) setStep((x) => x - 1)
  }

  const goNext = () => {
    if (isLast) finish()
    else setStep((x) => x + 1)
  }

  const body =
    step === 0 ? (
      <Step01MemoGroups />
    ) : step === 1 ? (
      <Step02Mention />
    ) : step === 2 ? (
      <Step04Snap />
    ) : (
      <Step05Start onStart={finish} />
    )

  return (
    <div className="ab-onboarding-viewport flex flex-col overscroll-none text-white">
      <OnboardingChrome
        stepIndex={step}
        total={TOTAL}
        onPrev={goPrev}
        onNext={goNext}
        onSkip={finish}
        nextLabel={isLast ? '시작' : '다음 >'}
        disablePrev={isFirst}
      >
        {body}
      </OnboardingChrome>
    </div>
  )
}
