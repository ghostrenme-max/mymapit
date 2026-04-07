import type { AppLocale } from './strings'

const STORAGE_KEY = 'mymapit-locale'

/** 저장된 선택이 있으면 사용, 없으면 기기 언어(ko/en/ja). 그 외는 한국어 기본 */
export function detectDeviceLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'ko'
  const raw = navigator.language || navigator.languages?.[0] || 'ko'
  const primary = raw.toLowerCase().split('-')[0] || 'ko'
  if (primary === 'ja') return 'ja'
  if (primary === 'en') return 'en'
  return 'ko'
}

export function readStoredLocale(): AppLocale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'ko' || v === 'en' || v === 'ja') return v
  } catch {
    /* ignore */
  }
  return null
}

export function writeStoredLocale(locale: AppLocale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}

export function getInitialLocale(): AppLocale {
  return readStoredLocale() ?? detectDeviceLocale()
}
