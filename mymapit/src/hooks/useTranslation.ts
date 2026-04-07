import { useCallback, useMemo } from 'react'
import type { MsgKey } from '../locales/strings'
import { STRINGS } from '../locales/strings'
import { useUserStore } from '../stores/userStore'

export function useTranslation() {
  const locale = useUserStore((s) => s.locale)
  const setLocale = useUserStore((s) => s.setLocale)

  const t = useCallback(
    (key: MsgKey) => {
      const row = STRINGS[locale]
      const v = row[key]
      if (v != null && v !== '') return v
      return STRINGS.ko[key] ?? key
    },
    [locale],
  )

  return useMemo(() => ({ t, locale, setLocale }), [t, locale, setLocale])
}
