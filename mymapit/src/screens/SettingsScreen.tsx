import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/common/TopBar'
import { useTranslation } from '../hooks/useTranslation'
import { clearWorldData, resetToEmptyFlow } from '../stores/actions'
import type { AppLocale } from '../locales/strings'
import { useUserStore } from '../stores/userStore'

const LANGS: { id: AppLocale; labelKey: 'settings.lang.ko' | 'settings.lang.en' | 'settings.lang.ja' }[] = [
  { id: 'ko', labelKey: 'settings.lang.ko' },
  { id: 'en', labelKey: 'settings.lang.en' },
  { id: 'ja', labelKey: 'settings.lang.ja' },
]

export function SettingsScreen() {
  const navigate = useNavigate()
  const setSidebar = useUserStore((s) => s.setSidebarOpen)
  const { t, locale, setLocale } = useTranslation()

  return (
    <div className="flex flex-col gap-4 px-3 pb-6 pt-0">
      <TopBar title={t('settings.title')} onMenu={() => setSidebar(true)} onBack={() => navigate(-1)} />
      <section className="rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-3">
        <h2 className="text-sm font-semibold text-ab-text">{t('settings.data.title')}</h2>
        <p className="mt-1 text-xs text-ab-sub">{t('settings.data.desc')}</p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm(t('settings.data.confirm'))) return
            clearWorldData()
            navigate('/memo', { replace: true })
          }}
          className="mt-3 w-full rounded-sm border border-ab-border py-2.5 text-xs text-ab-text"
        >
          {t('settings.data.btn')}
        </button>
      </section>

      <section className="rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-3">
        <h2 className="text-sm font-semibold text-ab-text">{t('settings.lang.title')}</h2>
        <p className="mt-1 whitespace-pre-line text-xs text-ab-sub">{t('settings.lang.desc')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGS.map(({ id, labelKey }) => {
            const on = locale === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setLocale(id)}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                  on
                    ? 'border-ab-text bg-ab-text text-ab-card'
                    : 'border-ab-border bg-ab-muted/30 text-ab-text active:bg-ab-muted/50'
                }`}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-sm border border-ab-border border-l-2 border-l-ab-text bg-ab-card p-3">
        <h2 className="text-sm font-semibold text-ab-text">{t('settings.reset.title')}</h2>
        <p className="mt-1 text-xs text-ab-sub">{t('settings.reset.desc')}</p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm(t('settings.reset.confirm'))) return
            resetToEmptyFlow()
            navigate('/splash', { replace: true })
          }}
          className="mt-3 w-full rounded-sm bg-ab-text py-2.5 text-xs text-ab-card"
        >
          {t('settings.reset.btn')}
        </button>
      </section>
    </div>
  )
}
