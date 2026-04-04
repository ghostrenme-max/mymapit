import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { AddCharacterButton } from '../components/character/AddCharacterButton'
import { CharacterDetailSheet } from '../components/character/CharacterDetailSheet'
import { CharacterList } from '../components/character/CharacterList'
import { MobileShell } from '../components/common/MobileShell'
import { PageHeader } from '../components/common/PageHeader'
import { ProjectSidebar } from '../components/common/ProjectSidebar'
import { useCharacterStore } from '../store/useCharacterStore'
import { useProjectStore } from '../store/useProjectStore'

export function CharacterPage() {
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
  const allCharacters = useCharacterStore((s) => s.characters)

  const [sheetId, setSheetId] = useState<string | null>(null)
  const sheetCharacter = sheetId ? allCharacters.find((c) => c.id === sheetId) ?? null : null

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
        title={project.name}
        onMenuClick={() => toggleSidebar()}
        right={
          <AddCharacterButton
            projectId={projectId}
            onCreated={(id) => setSheetId(id)}
          />
        }
      />
      <ProjectSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-24 pt-3"
        style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom))' }}
      >
        <CharacterList
          characters={characters}
          selectedId={sheetId}
          onSelect={(id) => setSheetId(id)}
        />
        <p className="text-center text-xs text-m-sub">캐릭터를 탭하면 상세 시트가 열립니다</p>
      </div>

      {sheetCharacter && (
        <CharacterDetailSheet
          character={sheetCharacter}
          allCharacters={allCharacters}
          onClose={() => setSheetId(null)}
        />
      )}
    </MobileShell>
  )
}
