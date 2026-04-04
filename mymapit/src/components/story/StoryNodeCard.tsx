import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { StoryNode } from '../../types/models'

const TYPE_STYLE: Record<
  StoryNode['type'],
  { label: string; className: string }
> = {
  act: { label: 'ACT', className: 'bg-m-blue/15 text-m-blue' },
  scene: { label: 'SCN', className: 'bg-m-purple/15 text-m-purple' },
  event: { label: 'EVT', className: 'bg-m-red/15 text-m-red' },
  character: { label: 'CHR', className: 'bg-m-green/15 text-m-green' },
}

type Props = {
  node: StoryNode
  depth: number
}

export function StoryNodeCard({ node, depth }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: depth * 14,
  }
  const ts = TYPE_STYLE[node.type]

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`mb-2 rounded-xl border border-m-muted bg-m-card p-3 shadow-sm ${
        isDragging ? 'z-10 opacity-90 ring-2 ring-m-blue/30' : ''
      }`}
    >
      <div className="flex gap-2">
        <button
          type="button"
          className="mt-0.5 flex h-8 w-6 shrink-0 touch-none items-center justify-center rounded-md bg-m-muted text-m-sub"
          aria-label="드래그하여 순서 변경"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${ts.className}`}
            >
              {ts.label}
            </span>
            <span className="truncate text-sm font-semibold text-m-text">{node.title}</span>
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-m-sub">{node.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-medium text-m-sub">긴장도</span>
            <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-m-muted">
              <div
                className="bg-m-red"
                style={{ width: `${(node.tension / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-m-text">{node.tension}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
