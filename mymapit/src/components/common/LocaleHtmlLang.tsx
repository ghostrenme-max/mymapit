import { useLayoutEffect } from 'react'
import { useUserStore } from '../../stores/userStore'

const HTML_LANG: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en',
  ja: 'ja-JP',
}

/** document.documentElement.lang — 접근성·브라우저 번역 힌트 */
export function LocaleHtmlLang() {
  const locale = useUserStore((s) => s.locale)

  useLayoutEffect(() => {
    const el = document.documentElement
    el.lang = HTML_LANG[locale] ?? 'ko-KR'
    el.dataset.locale = locale
  }, [locale])

  return null
}
