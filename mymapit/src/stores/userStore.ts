import { create } from 'zustand'

export const FREE_MEMO_GROUP_LIMIT = 3
export const FREE_AI_MONTHLY = 3
export const PRO_AI_MONTHLY = 10

function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

type State = {
  onboardingCompleted: boolean
  sidebarOpen: boolean
  isPro: boolean
  credits: number
  monthlyAiUsed: number
  billingMonth: string
  setOnboardingCompleted: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  setPro: (v: boolean) => void
  addCredits: (n: number) => void
  /** 월이 바뀌면 사용량 리셋 */
  ensureBillingMonth: () => void
  /** @@ 분석 1회 소비. 실패 시 false (한도 초과) */
  tryConsumeAiAnalysis: () => boolean
  canAddMemoGroup: (currentGroupCount: number) => boolean
}

export const useUserStore = create<State>((set, get) => ({
  onboardingCompleted: false,
  sidebarOpen: false,
  isPro: false,
  credits: 0,
  monthlyAiUsed: 0,
  billingMonth: currentMonthKey(),

  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setPro: (isPro) => set({ isPro }),
  addCredits: (n) => set((s) => ({ credits: Math.max(0, s.credits + n) })),

  ensureBillingMonth: () => {
    const key = currentMonthKey()
    if (get().billingMonth !== key) {
      set({ billingMonth: key, monthlyAiUsed: 0 })
    }
  },

  tryConsumeAiAnalysis: () => {
    get().ensureBillingMonth()
    const { isPro, monthlyAiUsed, credits } = get()
    const limit = isPro ? PRO_AI_MONTHLY : FREE_AI_MONTHLY
    if (monthlyAiUsed < limit) {
      set((s) => ({ monthlyAiUsed: s.monthlyAiUsed + 1 }))
      return true
    }
    if (credits > 0) {
      set((s) => ({ credits: s.credits - 1 }))
      return true
    }
    return false
  },

  canAddMemoGroup: (currentGroupCount) => {
    if (get().isPro) return true
    return currentGroupCount < FREE_MEMO_GROUP_LIMIT
  },
}))
