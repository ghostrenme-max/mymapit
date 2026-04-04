import { create } from 'zustand'
import type { Project } from '../types/models'

const DEMO_PROJECT_ID = 'proj-demo'

const seedProjects: Project[] = [
  {
    id: DEMO_PROJECT_ID,
    name: '별빛 관문',
    createdAt: new Date('2025-01-15').toISOString(),
  },
]

type ProjectState = {
  projects: Project[]
  currentProjectId: string | null
  sidebarOpen: boolean
  setCurrentProjectId: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  addProject: (name: string) => Project
  updateProjectName: (id: string, name: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: seedProjects,
  currentProjectId: DEMO_PROJECT_ID,
  sidebarOpen: false,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  addProject: (name) => {
    const p: Project = {
      id: `proj-${crypto.randomUUID()}`,
      name,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ projects: [...s.projects, p], currentProjectId: p.id }))
    return p
  },
  updateProjectName: (id, name) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)),
    })),
}))

export { DEMO_PROJECT_ID }
