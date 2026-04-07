import { create } from 'zustand'

export const FREE_MEMO_GROUP_LIMIT = 3

type State = {
  onboardingCompleted: boolean
  sidebarOpen: boolean
  isPro: boolean
  setOnboardingCompleted: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  setPro: (v: boolean) => void
  canAddMemoGroup: (currentGroupCount: number) => boolean
}

export const useUserStore = create<State>((set, get) => ({
  onboardingCompleted: false,
  sidebarOpen: false,
  isPro: false,

  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setPro: (isPro) => set({ isPro }),

  canAddMemoGroup: (currentGroupCount) => {
    if (get().isPro) return true
    return currentGroupCount < FREE_MEMO_GROUP_LIMIT
  },
}))
