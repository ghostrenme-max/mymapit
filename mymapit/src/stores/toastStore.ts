import { create } from 'zustand'

type State = {
  message: string | null
  show: (message: string) => void
  clear: () => void
}

let hideTimer: number | undefined

export const useToastStore = create<State>((set) => ({
  message: null,
  show: (message) => {
    if (hideTimer != null) window.clearTimeout(hideTimer)
    set({ message })
    hideTimer = window.setTimeout(() => {
      set({ message: null })
      hideTimer = undefined
    }, 4200)
  },
  clear: () => {
    if (hideTimer != null) window.clearTimeout(hideTimer)
    hideTimer = undefined
    set({ message: null })
  },
}))
