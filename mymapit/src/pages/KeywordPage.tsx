import { useShallow } from 'zustand/shallow'
import { ConceptGenerator } from '../components/keyword/ConceptGenerator'
import { ConceptResultCard } from '../components/keyword/ConceptResultCard'
import { KeywordBank } from '../components/keyword/KeywordBank'
import { KeywordSimilarGroups } from '../components/keyword/KeywordSimilarGroups'
import { KeywordSlots } from '../components/keyword/KeywordSlots'
import { MobileShell } from '../components/common/MobileShell'
import { PageHeader } from '../components/common/PageHeader'
import { ProjectSidebar } from '../components/common/ProjectSidebar'
import { useCharacterStore } from '../store/useCharacterStore'
import { useKeywordStore } from '../store/useKeywordStore'
import { useProjectStore } from '../store/useProjectStore'

export function KeywordPage() {
  const projectId = useProjectStore((s) => s.currentProjectId)
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId))
  const sidebarOpen = useProjectStore((s) => s.sidebarOpen)
  const setSidebarOpen = useProjectStore((s) => s.setSidebarOpen)
  const toggleSidebar = useProjectStore((s) => s.toggleSidebar)

  const keywords = useKeywordStore(
    useShallow((s) =>
      projectId ? s.keywords.filter((k) => k.projectId === projectId) : [],
    ),
  )
  const conceptResult = useKeywordStore((s) => s.conceptResult)
  const slotIds = useKeywordStore((s) => s.slotKeywordIds)
  const updateKeyword = useKeywordStore((s) => s.updateKeyword)
  const addCharacter = useCharacterStore((s) => s.addCharacter)

  const saveConceptToCharacter = () => {
    if (!projectId || !conceptResult) return
    const c = addCharacter({
      projectId,
      name: conceptResult.name,
      role: 'hero',
      personality: conceptResult.description,
      ability: '',
      likes: '',
      dislikes: '',
      tags: ['키워드 생성'],
      silhouetteTags: [conceptResult.silhouette],
      colors: conceptResult.colors.length ? conceptResult.colors : ['#2563EB'],
      imageUri: null,
      relations: [],
      storyNodeIds: [],
      keywordIds: [...slotIds],
    })
    for (const kid of slotIds) {
      const kw = keywords.find((k) => k.id === kid)
      if (!kw) continue
      updateKeyword(kid, {
        characterIds: [...new Set([...kw.characterIds, c.id])],
      })
    }
  }

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
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-24 pt-3"
        style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom))' }}
      >
        <KeywordSlots />
        <KeywordBank projectId={projectId} />
        <KeywordSimilarGroups keywords={keywords} />
        <ConceptGenerator />
        {conceptResult && (
          <ConceptResultCard result={conceptResult} onSaveToCharacter={saveConceptToCharacter} />
        )}
      </div>
    </MobileShell>
  )
}
