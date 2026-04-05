import { useShallow } from 'zustand/shallow'
import { ArtFrame } from '../common/ArtFrame'
import { SectionCard } from '../common/SectionCard'
import { TajiTag } from '../common/TajiTag'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMentionStore } from '../../stores/mentionStore'
import { useProjectStore } from '../../stores/projectStore'

export function WorldTab() {
  const pid = useProjectStore((s) => s.currentProjectId)
  const project = useProjectStore((s) => s.getProject(pid))
  const keywords = useArtbookStore(
    useShallow((s) => (pid ? s.keywords.filter((k) => k.projectId === pid) : [])),
  )
  const objects = useMentionStore(
    useShallow((s) => (pid ? s.worldObjects.filter((o) => o.projectId === pid && o.type !== '세계') : [])),
  )

  if (!project) {
    return (
      <div className="px-4 py-10 text-center text-sm text-ab-sub">프로젝트를 선택하거나 세계관을 만들어 주세요.</div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-3 pb-4 pt-2">
      <p className="text-[11px] text-ab-sub">CHAPTER 01</p>
      <h2 className="font-title-italic text-2xl font-semibold leading-tight">{project.name}</h2>
      <div className="border-l-2 border-ab-text pl-3 text-sm italic text-ab-sub">
        {project.theme || '테마'}을(를) 중심으로 펼쳐지는 {project.genre || '세계'}.
      </div>
      <div className="flex flex-wrap gap-2">
        {project.mood && <TajiTag variant="black">{project.mood}</TajiTag>}
        {project.protagonist && <TajiTag variant="gray">{project.protagonist}</TajiTag>}
        {project.scale && <TajiTag variant="mid">{project.scale}</TajiTag>}
      </div>

      <ArtFrame>
        <p className="text-center text-xs text-ab-sub">컨셉 아트를 여기에 붙여 넣거나 갤러리와 연동하세요.</p>
      </ArtFrame>

      <SectionCard title="생태계 · 오브젝트">
        <ul className="space-y-2">
          {objects.map((o) => (
            <li key={o.id} className="rounded-sm border border-ab-border bg-ab-muted/30 px-2 py-2">
              <p className="text-sm font-medium text-ab-text">{o.name}</p>
              <p className="mt-0.5 text-xs text-ab-sub">{o.description || o.type}</p>
            </li>
          ))}
          {objects.length === 0 && <p className="text-sm text-ab-sub">등록된 오브젝트가 없습니다.</p>}
        </ul>
      </SectionCard>

      <SectionCard title="키워드 뱅크">
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => (
            <span key={k.id} className="rounded-[2px] bg-ab-muted px-2 py-1 text-[11px]">
              {k.text}
            </span>
          ))}
          {keywords.length === 0 && <span className="text-xs text-ab-sub">키워드가 없습니다.</span>}
        </div>
      </SectionCard>
    </div>
  )
}
