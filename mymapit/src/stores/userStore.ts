import { create } from 'zustand'
import { getInitialLocale, writeStoredLocale } from '../locales/detectLocale'
import type { AppLocale } from '../locales/strings'

export const FREE_MEMO_GROUP_LIMIT = 3

type State = {
  onboardingCompleted: boolean
  sidebarOpen: boolean
  isPro: boolean
  locale: AppLocale
  setOnboardingCompleted: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  setPro: (v: boolean) => void
  setLocale: (locale: AppLocale) => void
  canAddMemoGroup: (currentGroupCount: number) => boolean
}

export const useUserStore = create<State>((set, get) => ({
  onboardingCompleted: false,
  sidebarOpen: false,
  isPro: false,
  locale: getInitialLocale(),

  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setPro: (isPro) => set({ isPro }),
  setLocale: (locale) => {
    writeStoredLocale(locale)
    set({ locale })
  },

  canAddMemoGroup: (currentGroupCount) => {
    if (get().isPro) return true
    return currentGroupCount < FREE_MEMO_GROUP_LIMIT
  },
}))
