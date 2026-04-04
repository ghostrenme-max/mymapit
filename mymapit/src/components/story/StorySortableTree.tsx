import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import type { StoryNode } from '../../types/models'
import { StoryNodeCard } from './StoryNodeCard'

function subtreeMatches(
  nodes: StoryNode[],
  nodeId: string,
  filter: 'all' | StoryNode['type'],
): boolean {
  if (filter === 'all') return true
  const self = nodes.find((n) => n.id === nodeId)
  if (self?.type === filter) return true
  return nodes
    .filter((n) => n.parentId === nodeId)
    .some((ch) => subtreeMatches(nodes, ch.id, filter))
}

type Props = {
  projectId: string
  parentId: string | null
  nodes: StoryNode[]
  depth: number
  typeFilter: 'all' | StoryNode['type']
}

export function StorySortableTree({
  projectId,
  parentId,
  nodes,
  depth,
  typeFilter,
}: Props) {
  const children = useMemo(() => {
    return nodes
      .filter((n) => n.projectId === projectId && n.parentId === parentId)
      .filter((n) => subtreeMatches(nodes, n.id, typeFilter))
      .sort((a, b) => a.order - b.order)
  }, [nodes, projectId, parentId, typeFilter])

  const childIds = children.map((c) => c.id)

  if (children.length === 0 && depth > 0) return null

  return (
    <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
      <div className={depth > 0 ? 'mt-1 border-l border-m-muted/80 pl-2' : ''}>
        {children.map((node) => (
          <div key={node.id}>
            <StoryNodeCard node={node} depth={depth} />
            <StorySortableTree
              projectId={projectId}
              parentId={node.id}
              nodes={nodes}
              depth={depth + 1}
              typeFilter={typeFilter}
            />
          </div>
        ))}
      </div>
    </SortableContext>
  )
}
