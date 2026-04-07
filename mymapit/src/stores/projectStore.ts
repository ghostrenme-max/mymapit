import { create } from 'zustand'
import type { Project, QuestionAnswers } from './types'

type State = {
  projects: Project[]
  currentProjectId: string | null
  pendingAnswers: QuestionAnswers | null
  setCurrentProjectId: (id: string | null) => void
  setPendingAnswers: (a: QuestionAnswers | null) => void
  getProject: (id: string | null) => Project | undefined
  addProject: (p: Project) => void
  patchProject: (id: string, patch: Partial<Omit<Project, 'id' | 'createdAt'>>) => void
  resetProjects: () => void
}

export const useProjectStore = create<State>((set, get) => ({
  projects: [],
  currentProjectId: null,
  pendingAnswers: null,

  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
  setPendingAnswers: (pendingAnswers) => set({ pendingAnswers }),

  getProject: (id) => {
    if (!id) return undefined
    return get().projects.find((p) => p.id === id)
  },

  addProject: (p) => set((s) => ({ projects: [...s.projects, p], currentProjectId: p.id })),

  patchProject: (id, patch) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  resetProjects: () =>
    set({
      projects: [],
      currentProjectId: null,
      pendingAnswers: null,
    }),
}))
