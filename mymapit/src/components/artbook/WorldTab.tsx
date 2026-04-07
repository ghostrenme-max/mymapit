import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { ConceptArtSlot } from '../common/ConceptArtSlot'
import { SectionCard } from '../common/SectionCard'
import { TajiTag } from '../common/TajiTag'
import { useArtbookStore } from '../../stores/artbookStore'
import { useMentionStore } from '../../stores/mentionStore'
import { INFO_PLACEHOLDER } from '../../lib/syncArtbookFromMemos'
import { useProjectStore } from '../../stores/projectStore'
import type { WorldObject } from '../../stores/types'

function newWoId() {
  return `wo-${crypto.randomUUID().slice(0, 12)}`
}

export function WorldTab() {
  const [searchParams] = useSearchParams()
  const focusWo = searchParams.get('wo')
  const focusKw = searchParams.get('kw')

  const pid = useProjectStore((s) => s.currentProjectId)
  const project = useProjectStore((s) => s.getProject(pid))
  const patchProject = useProjectStore((s) => s.patchProject)
  const addWorldObject = useMentionStore((s) => s.addWorldObject)
  const removeWorldObject = useMentionStore((s) => s.removeWorldObject)

  const keywords = useArtbookStore(
    useShallow((s) => (pid ? s.keywords.filter((k) => k.projectId === pid) : [])),
  )
  const objects = useMentionStore(
    useShallow((s) => (pid ? s.worldObjects.filter((o) => o.projectId === pid && o.type !== '세계') : [])),
  )
  const worldCore = useMentionStore(
    useShallow((s) => (pid ? s.worldObjects.filter((o) => o.projectId === pid && o.type === '세계') : [])),
  )

  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  if (!project) {
    return (
      <div className="px-4 py-10 text-center text-sm text-ab-sub">프로젝트를 선택하거나 세계관을 만들어 주세요.</div>
    )
  }

  const projectId = project.id

  const submitAdd = () => {
    const name = newName.trim()
    if (!name) {
      window.alert('이름을 입력해 주세요.')
      return
    }
    const o: WorldObject = {
      id: newWoId(),
      projectId,
      name,
      type: '오브젝트',
      description: newDesc.trim(),
      tags: [],
    }
    addWorldObject(o)
    setNewName('')
    setNewDesc('')
    setAddOpen(false)
  }

  const confirmRemove = (o: WorldObject) => {
    if (!window.confirm(`「${o.name}」을(를) 목록에서 제거할까요?`)) return
    removeWorldObject(o.id)
  }

  useEffect(() => {
    const elId = focusWo ? `world-wo-${focusWo}` : focusKw ? `world-kw-${focusKw}` : null
    if (!elId) return
    const t = window.setTimeout(() => {
      document.getElementById(elId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
    return () => window.clearTimeout(t)
  }, [focusWo, focusKw, objects.length, keywords.length, worldCore.length])

  return (
    <div className="flex flex-col gap-3 px-3 pb-4 pt-2">
      <p className="text-[11px] text-ab-sub">CHAPTER 01</p>
      <h2 className="font-title-italic text-2xl font-semibold leading-tight">{project.name}</h2>
      <div className="border-l-2 border-ab-text pl-3 text-sm italic text-ab-sub">
        {(project.theme || INFO_PLACEHOLDER) + '을(를) 중심으로 펼쳐지는 ' + (project.genre || INFO_PLACEHOLDER) + '.'}
      </div>
      <div className="flex flex-wrap gap-2">
        {project.mood || project.protagonist || project.scale ? (
          <>
            {project.mood ? <TajiTag variant="black">{project.mood}</TajiTag> : null}
            {project.protagonist ? <TajiTag variant="gray">{project.protagonist}</TajiTag> : null}
            {project.scale ? <TajiTag variant="mid">{project.scale}</TajiTag> : null}
          </>
        ) : (
          <TajiTag variant="gray">{INFO_PLACEHOLDER}</TajiTag>
        )}
      </div>

      <ConceptArtSlot
        imageUri={project.conceptImageUri}
        onImageChange={(uri) => patchProject(project.id, { conceptImageUri: uri })}
        emptyHint="세계관 컨셉 아트·무드보드를 넣을 수 있어요. (기기에서 이미지 선택)"
        pickLabel="컨셉 아트 넣기"
      />

      {worldCore.length > 0 && (
        <SectionCard title="세계관 핵">
          <ul className="space-y-2">
            {worldCore.map((o) => (
              <li
                key={o.id}
                id={`world-wo-${o.id}`}
                className="rounded-sm border border-ab-border bg-ab-muted/30 px-2 py-2 scroll-mt-24"
              >
                <p className="text-sm font-medium text-ab-text">{o.name}</p>
                <p className="mt-0.5 text-xs text-ab-sub">{o.description || INFO_PLACEHOLDER}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="생태계 · 오브젝트">
        <ul className="space-y-2">
          {objects.map((o) => (
            <li
              key={o.id}
              id={`world-wo-${o.id}`}
              className="relative scroll-mt-24 rounded-sm border border-ab-border bg-ab-muted/30 py-2 pl-2 pr-10"
            >
              <button
                type="button"
                onClick={() => confirmRemove(o)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded border border-ab-border bg-ab-card text-sm font-semibold leading-none text-ab-sub hover:bg-ab-muted active:bg-ab-muted/80"
                aria-label={`${o.name} 제거`}
              >
                −
              </button>
              <p className="pr-1 text-sm font-medium text-ab-text">{o.name}</p>
              <p className="mt-0.5 pr-1 text-xs text-ab-sub">{o.description || INFO_PLACEHOLDER}</p>
            </li>
          ))}
          {objects.length === 0 && <p className="text-sm text-ab-sub">등록된 오브젝트가 없습니다.</p>}
        </ul>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="mt-3 w-full rounded-md border border-dashed border-ab-border py-2.5 text-xs font-medium text-ab-text hover:bg-ab-muted/40"
        >
          + 오브젝트 추가
        </button>
      </SectionCard>

      <SectionCard title="키워드 뱅크">
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => (
            <span
              key={k.id}
              id={`world-kw-${k.id}`}
              className="scroll-mt-24 rounded-[2px] bg-ab-muted px-2 py-1 text-[11px]"
            >
              {k.text}
            </span>
          ))}
          {keywords.length === 0 && <span className="text-xs text-ab-sub">키워드가 없습니다.</span>}
        </div>
      </SectionCard>

      {addOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] bg-ab-text/40"
            aria-label="닫기"
            onClick={() => setAddOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-wo-title"
            className="fixed left-1/2 top-1/2 z-[90] w-[min(340px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-ab-border bg-ab-card p-4 shadow-lg"
          >
            <h2 id="add-wo-title" className="font-title-italic text-lg font-semibold text-ab-text">
              오브젝트 추가
            </h2>
            <p className="mt-1 text-[11px] text-ab-sub">생태계·오브젝트 목록에 붙습니다. (유형: 오브젝트)</p>
            <label className="mt-3 block text-[10px] font-medium text-ab-sub">이름</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 w-full rounded-md border border-ab-border bg-ab-input px-3 py-2 text-sm text-ab-text outline-none"
              placeholder="예: 잔향 증폭기"
            />
            <label className="mt-2 block text-[10px] font-medium text-ab-sub">설명</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-ab-border bg-ab-input px-3 py-2 text-sm text-ab-text outline-none"
              placeholder="선택"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="flex-1 rounded-md border border-ab-border py-2.5 text-sm text-ab-text"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitAdd}
                className="flex-1 rounded-md bg-ab-text py-2.5 text-sm font-semibold text-ab-card"
              >
                추가
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
