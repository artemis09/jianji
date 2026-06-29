export function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw
  const num = parseInt(full, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r},${g},${b},${alpha})`
}

export function buildSvgDataUrl(
  inner: string,
  color: string,
  options?: { strokeWidth?: number; viewBox?: string },
): string {
  const strokeWidth = options?.strokeWidth ?? 2.2
  const viewBox = options?.viewBox ?? '0 0 48 48'
  const body = inner.trim().replace(/CURRENT/g, color)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
