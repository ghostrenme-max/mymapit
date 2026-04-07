/** 컨셉 아트(data URL 등)에서 픽셀을 줄여 상위 N개 색을 hex로 추출 */
export async function extractDominantHexColors(src: string, count = 2): Promise<string[]> {
  if (typeof document === 'undefined' || !src) return []

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src

  try {
    await img.decode()
  } catch {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('load'))
    }).catch(() => null)
  }

  if (!img.complete || img.naturalWidth === 0) return []

  const canvas = document.createElement('canvas')
  const side = 56
  canvas.width = side
  canvas.height = side
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []

  ctx.drawImage(img, 0, 0, side, side)
  let imageData: ImageData
  try {
    imageData = ctx.getImageData(0, 0, side, side)
  } catch {
    return []
  }

  const data = imageData.data
  const buckets = new Map<string, number>()
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const a = data[i + 3]!
    if (a < 24) continue
    const qr = Math.round(r / 24) * 24
    const qg = Math.round(g / 24) * 24
    const qb = Math.round(b / 24) * 24
    const key = `${qr},${qg},${qb}`
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1])
  const toHex = (key: string) => {
    const [r, g, b] = key.split(',').map((x) => Number(x))
    const hex = (n: number) =>
      Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, '0')
    return `#${hex(r)}${hex(g)}${hex(b)}`
  }

  const out: string[] = []
  for (const [key] of sorted) {
    const hex = toHex(key)
    if (!out.includes(hex)) out.push(hex)
    if (out.length >= count) break
  }

  while (out.length < count && out.length > 0) {
    out.push(out[out.length - 1]!)
  }

  return out.slice(0, count)
}
