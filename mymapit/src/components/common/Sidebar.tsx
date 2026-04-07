import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { useTranslation } from '../../hooks/useTranslation'
import { addEmptyProject } from '../../stores/actions'
import { useProjectStore } from '../../stores/projectStore'
import { useUserStore } from '../../stores/userStore'

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const open = useUserStore((s) => s.sidebarOpen)
  const setOpen = useUserStore((s) => s.setSidebarOpen)
  const currentId = useProjectStore((s) => s.currentProjectId)
  const setCurrent = useProjectStore((s) => s.setCurrentProjectId)

  const sorted = useProjectStore(
    useShallow((s) => [...s.projects].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  )

  if (!open) return null

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-ab-text/40"
        aria-label={t('sidebar.closeMenu')}
        onClick={close}
      />
      <aside className="fixed left-0 top-0 z-[70] flex h-full w-[min(280px,88vw)] flex-col bg-ab-card">
        <div className="border-b border-ab-border px-4 py-3">
          <p className="font-title-italic text-lg font-semibold text-ab-text">{t('sidebar.brand')}</p>
          <p className="mt-0.5 text-[11px] text-ab-sub">{t('sidebar.projects')}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
          {sorted.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setCurrent(p.id)
                navigate('/memo')
                close()
              }}
              className={`rounded-sm border px-3 py-2.5 text-left text-sm transition-colors ${
                p.id === currentId
                  ? 'border-ab-text bg-ab-text text-ab-card'
                  : 'border-ab-border bg-ab-card text-ab-text'
              }`}
            >
              <span className="line-clamp-2 font-medium">{p.name}</span>
              <span className="mt-0.5 block text-[10px] opacity-80">{p.genre || t('sidebar.genreUnset')}</span>
            </button>
          ))}
          {sorted.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-ab-sub">{t('sidebar.noProjects')}</p>
          )}

          <button
            type="button"
            onClick={() => {
              const name = window.prompt(t('sidebar.newProjectPrompt'), t('sidebar.newProjectDefault'))
              if (name === null) return
              addEmptyProject(name)
              navigate('/memo')
              close()
            }}
            className="mt-2 rounded-sm border border-dashed border-ab-border py-2.5 text-center text-xs text-ab-sub"
          >
            {t('sidebar.newProject')}
          </button>

          <hr className="my-2 border-0 border-t border-ab-muted" />

          <button
            type="button"
            onClick={() => {
              close()
              navigate('/questions')
            }}
            className="rounded-sm px-3 py-2.5 text-left text-sm text-ab-point hover:bg-ab-muted/80"
          >
            {t('sidebar.sampleWorld')}
          </button>
          <button
            type="button"
            onClick={() => {
              close()
              navigate('/artbook?tab=snap')
            }}
            className="rounded-sm px-3 py-2.5 text-left text-sm text-ab-text hover:bg-ab-muted/80"
          >
            {t('sidebar.snap')}
          </button>
          <button
            type="button"
            onClick={() => {
              close()
              navigate('/artbook')
            }}
            className="rounded-sm px-3 py-2.5 text-left text-sm text-ab-text hover:bg-ab-muted/80"
          >
            {t('sidebar.artbook')}
          </button>
          <button
            type="button"
            onClick={() => {
              close()
              navigate('/premium')
            }}
            className="rounded-sm px-3 py-2.5 text-left text-sm text-ab-text hover:bg-ab-muted/80"
          >
            {t('sidebar.premium')}
          </button>
          <button
            type="button"
            onClick={() => {
              close()
              navigate('/settings')
            }}
            className="rounded-sm px-3 py-2.5 text-left text-sm text-ab-text hover:bg-ab-muted/80"
          >
            {t('sidebar.settings')}
          </button>
        </nav>
      </aside>
    </>
  )
}
