import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { MobileShell } from '../components/common/MobileShell'
import { PageHeader } from '../components/common/PageHeader'
import { ProjectSidebar } from '../components/common/ProjectSidebar'
import { SnapCanvas, type SnapSelection } from '../components/snap/SnapCanvas'
import { SnapDetailPanel } from '../components/snap/SnapDetailPanel'
import { SnapEdgeSwipe } from '../components/snap/SnapEdgeSwipe'
import { useCharacterStore } from '../store/useCharacterStore'
import { useKeywordStore } from '../store/useKeywordStore'
import { useProjectStore } from '../store/useProjectStore'
import { useStoryStore } from '../store/useStoryStore'

export function SnapPage() {
  const projectId = useProjectStore((s) => s.currentProjectId)
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId))
  const sidebarOpen = useProjectStore((s) => s.sidebarOpen)
  const setSidebarOpen = useProjectStore((s) => s.setSidebarOpen)
  const toggleSidebar = useProjectStore((s) => s.toggleSidebar)
  const characters = useCharacterStore(
    useShallow((s) =>
      projectId ? s.characters.filter((c) => c.projectId === projectId) : [],
    ),
  )
  const storyNodes = useStoryStore(
    useShallow((s) =>
      projectId ? s.nodes.filter((n) => n.projectId === projectId) : [],
    ),
  )
  const keywords = useKeywordStore(
    useShallow((s) =>
      projectId ? s.keywords.filter((k) => k.projectId === projectId) : [],
    ),
  )

  const [selection, setSelection] = useState<SnapSelection>(null)

  if (!projectId || !project) {
    return (
      <MobileShell>
        <p className="p-4 text-sm text-m-sub">프로젝트를 선택하세요.</p>
      </MobileShell>
    )
  }

  return (
    <MobileShell>
      <PageHeader
        title={`${project.name} · Snap`}
        onMenuClick={() => toggleSidebar()}
      />
      <ProjectSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <SnapEdgeSwipe onOpenSidebar={() => setSidebarOpen(true)}>
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-24 pt-2"
          style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom))' }}
        >
          <p className="text-center text-[10px] text-m-sub">
            화면 왼쪽 가장자리에서 스와이프하면 프로젝트 사이드바가 열립니다
          </p>
          <SnapCanvas
            characters={characters}
            storyNodes={storyNodes}
            keywords={keywords}
            selection={selection}
            onSelect={setSelection}
          />
          <SnapDetailPanel
            selection={selection}
            characters={characters}
            storyNodes={storyNodes}
            keywords={keywords}
          />
        </div>
      </SnapEdgeSwipe>
    </MobileShell>
  )
}
