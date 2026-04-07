export type AppLocale = 'ko' | 'en' | 'ja'

export const KO = {
  'settings.title': '설정',
  'settings.data.title': '데이터',
  'settings.data.desc':
    '프로젝트·메모·아트북 데이터를 지웁니다. 온보딩·프리미엄은 유지됩니다.',
  'settings.data.btn': '세계관·메모 초기화',
  'settings.data.confirm': '모든 프로젝트와 메모를 삭제할까요?',

  'settings.lang.title': '언어',
  'settings.lang.desc':
    '기기 언어에 맞춰 한국어·영어·일본어 중 하나로 표시됩니다.\n여기서 언제든 바꿀 수 있어요.',
  'settings.lang.ko': '한국어',
  'settings.lang.en': 'English',
  'settings.lang.ja': '日本語',

  'settings.reset.title': '앱 처음부터',
  'settings.reset.desc': '온보딩부터 다시 시작합니다.',
  'settings.reset.btn': '전체 초기화 후 스플래시',
  'settings.reset.confirm': '앱 상태를 완전히 초기화할까요?',

  'sidebar.brand': 'My Map It',
  'sidebar.projects': '프로젝트',
  'sidebar.noProjects': '프로젝트가 없습니다.',
  'sidebar.newProject': '+ 새 프로젝트',
  'sidebar.newProjectPrompt': '새 프로젝트 이름',
  'sidebar.newProjectDefault': '새 프로젝트',
  'sidebar.sampleWorld': '✦ 샘플 세계관 구축',
  'sidebar.snap': 'Snap 연결맵',
  'sidebar.artbook': '아트북',
  'sidebar.premium': '프리미엄',
  'sidebar.settings': '설정',
  'sidebar.closeMenu': '메뉴 닫기',
  'sidebar.genreUnset': '장르 미정',

  'nav.home': '홈',
  'nav.artbook': '아트북',
  'nav.premium': '프리미엄',
} as const

export type MsgKey = keyof typeof KO

export const EN: Record<MsgKey, string> = {
  'settings.title': 'Settings',
  'settings.data.title': 'Data',
  'settings.data.desc':
    'Clears project, memo, and artbook data. Onboarding and premium status are kept.',
  'settings.data.btn': 'Reset world & memos',
  'settings.data.confirm': 'Delete all projects and memos?',

  'settings.lang.title': 'Language',
  'settings.lang.desc':
    'The app follows your device language among Korean, English, and Japanese.\nYou can change it here anytime.',
  'settings.lang.ko': 'Korean',
  'settings.lang.en': 'English',
  'settings.lang.ja': 'Japanese',

  'settings.reset.title': 'Start over',
  'settings.reset.desc': 'Restart from onboarding.',
  'settings.reset.btn': 'Full reset & splash',
  'settings.reset.confirm': 'Fully reset the app?',

  'sidebar.brand': 'My Map It',
  'sidebar.projects': 'Projects',
  'sidebar.noProjects': 'No projects yet.',
  'sidebar.newProject': '+ New project',
  'sidebar.newProjectPrompt': 'New project name',
  'sidebar.newProjectDefault': 'New project',
  'sidebar.sampleWorld': '✦ Build sample world',
  'sidebar.snap': 'Snap map',
  'sidebar.artbook': 'Artbook',
  'sidebar.premium': 'Premium',
  'sidebar.settings': 'Settings',
  'sidebar.closeMenu': 'Close menu',
  'sidebar.genreUnset': 'Genre TBD',

  'nav.home': 'Home',
  'nav.artbook': 'Artbook',
  'nav.premium': 'Premium',
}

export const JA: Record<MsgKey, string> = {
  'settings.title': '設定',
  'settings.data.title': 'データ',
  'settings.data.desc':
    'プロジェクト・メモ・アートブックのデータを消去します。オンボーディングとプレミアム状態は残ります。',
  'settings.data.btn': '世界観・メモを初期化',
  'settings.data.confirm': 'すべてのプロジェクトとメモを削除しますか？',

  'settings.lang.title': '言語',
  'settings.lang.desc':
    '端末の言語に合わせて韓国語・英語・日本語のいずれかで表示されます。\nここでいつでも変更できます。',
  'settings.lang.ko': '韓国語',
  'settings.lang.en': '英語',
  'settings.lang.ja': '日本語',

  'settings.reset.title': 'アプリを最初から',
  'settings.reset.desc': 'オンボーディングからやり直します。',
  'settings.reset.btn': 'すべて初期化してスプラッシュへ',
  'settings.reset.confirm': 'アプリの状態を完全に初期化しますか？',

  'sidebar.brand': 'My Map It',
  'sidebar.projects': 'プロジェクト',
  'sidebar.noProjects': 'プロジェクトがありません。',
  'sidebar.newProject': '+ 新規プロジェクト',
  'sidebar.newProjectPrompt': '新しいプロジェクト名',
  'sidebar.newProjectDefault': '新規プロジェクト',
  'sidebar.sampleWorld': '✦ サンプル世界を構築',
  'sidebar.snap': 'Snap つながりマップ',
  'sidebar.artbook': 'アートブック',
  'sidebar.premium': 'プレミアム',
  'sidebar.settings': '設定',
  'sidebar.closeMenu': 'メニューを閉じる',
  'sidebar.genreUnset': 'ジャンル未設定',

  'nav.home': 'ホーム',
  'nav.artbook': 'アートブック',
  'nav.premium': 'プレミアム',
}

export const STRINGS: Record<AppLocale, Record<MsgKey, string>> = {
  ko: KO,
  en: EN,
  ja: JA,
}
