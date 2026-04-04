import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { AddStoryNodeButton } from '../components/story/AddStoryNodeButton'
import { StorySortableTree } from '../components/story/StorySortableTree'
import { StoryTypeChips } from '../components/story/StoryTypeChips'
import { TensionLineChart } from '../components/story/TensionLineChart'
import { MobileShell } from '../components/common/MobileShell'
import { PageHeader } from '../components/common/PageHeader'
import { ProjectSidebar } from '../components/common/ProjectSidebar'
import { useProjectStore } from '../store/useProjectStore'
import { useStoryStore } from '../store/useStoryStore'

export function StoryPage() {
  const projectId = useProjectStore((s) => s.currentProjectId)
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId))
  const sidebarOpen = useProjectStore((s) => s.sidebarOpen)
  const setSidebarOpen = useProjectStore((s) => s.setSidebarOpen)
  const toggleSidebar = useProjectStore((s) => s.toggleSidebar)

  const nodes = useStoryStore((s) => s.nodes)
  const typeFilter = useStoryStore((s) => s.typeFilter)
  const setTypeFilter = useStoryStore((s) => s.setTypeFilter)
  const reorderAmongSiblings = useStoryStore((s) => s.reorderAmongSiblings)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || !projectId || active.id === over.id) return
    reorderAmongSiblings(projectId, String(active.id), String(over.id))
  }

  const projectNodes = nodes.filter((n) => n.projectId === projectId)
  const scenes = projectNodes.filter((n) => n.type === 'scene')
  const defaultParentForNew =
    [...scenes].sort((a, b) => b.order - a.order)[0]?.id ??
    [...projectNodes.filter((n) => n.type === 'act')].sort((a, b) => b.order - a.order)[0]?.id ??
    null

  if (!projectId || !project) {
    return (
      <MobileShell>
        <p className="p-4 text-sm text-m-sub">프로젝트를 선택하세요.</p>
      </MobileShell>
    )
  }

  return (
    <MobileShell>
      <PageHeader title={project.name} onMenuClick={() => toggleSidebar()} />
      <ProjectSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-24 pt-3"
        style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom))' }}
      >
        <StoryTypeChips value={typeFilter} onChange={setTypeFilter} />

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <StorySortableTree
            projectId={projectId}
            parentId={null}
            nodes={nodes}
            depth={0}
            typeFilter={typeFilter}
          />
        </DndContext>

        <AddStoryNodeButton
          projectId={projectId}
          defaultParentId={defaultParentForNew}
          defaultType="event"
        />

        <TensionLineChart projectId={projectId} nodes={nodes} />
      </div>
    </MobileShell>
  )
}
