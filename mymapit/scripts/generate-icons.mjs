/**
 * logo/snapmemo_logo.svg → 웹 favicon + Android mipmap (밀도별 자동 크기)
 * 실행: npm run icons
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MYMAPIT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(MYMAPIT, '..')
const SVG = path.join(REPO_ROOT, 'logo', 'snapmemo_logo.svg')
const ANDROID_RES = path.join(MYMAPIT, 'android', 'app', 'src', 'main', 'res')

/** Adaptive foreground layer (dp → px per bucket) */
const FOREGROUND = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
}

/** Legacy / full launcher icon */
const LAUNCHER = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
}

const BG = '#ffffff'

async function renderOnSquare(svgBuf, size, { background, scale = 0.62 }) {
  const inner = Math.max(1, Math.round(size * scale))
  const logo = await sharp(svgBuf).resize(inner, inner, { fit: 'inside' }).png().toBuffer()
  const bg =
    background === 'transparent'
      ? { r: 0, g: 0, b: 0, alpha: 0 }
      : { r: 255, g: 255, b: 255, alpha: 1 }
  return sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
}

async function main() {
  if (!fs.existsSync(SVG)) {
    console.error('SVG not found:', SVG)
    process.exit(1)
  }
  const svgBuf = fs.readFileSync(SVG)

  fs.mkdirSync(path.join(MYMAPIT, 'public'), { recursive: true })
  fs.copyFileSync(SVG, path.join(MYMAPIT, 'public', 'favicon.svg'))
  console.log('→ public/favicon.svg')

  await sharp(svgBuf)
    .resize(180, 180, { fit: 'inside', background: BG })
    .flatten({ background: BG })
    .png()
    .toFile(path.join(MYMAPIT, 'public', 'apple-touch-icon.png'))
  console.log('→ public/apple-touch-icon.png (180)')

  for (const [bucket, px] of Object.entries(FOREGROUND)) {
    const dir = path.join(ANDROID_RES, `mipmap-${bucket}`)
    fs.mkdirSync(dir, { recursive: true })
    const out = path.join(dir, 'ic_launcher_foreground.png')
    const pipeline = await renderOnSquare(svgBuf, px, { background: 'transparent', scale: 0.68 })
    await pipeline.toFile(out)
    console.log('→', path.relative(MYMAPIT, out))
  }

  for (const [bucket, px] of Object.entries(LAUNCHER)) {
    const dir = path.join(ANDROID_RES, `mipmap-${bucket}`)
    fs.mkdirSync(dir, { recursive: true })
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
      const out = path.join(dir, name)
      const pipeline = await renderOnSquare(svgBuf, px, { background: BG, scale: 0.58 })
      await pipeline.toFile(out)
    }
    console.log(`→ mipmap-${bucket}/ic_launcher*.png`)
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
