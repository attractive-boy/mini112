// const DEFAULT_BASE = 'http://119.45.254.248:19000/task/'
const DEFAULT_BASE = 'http://localhost:5173/static/'

const join = (base, path) => {
  if (!base) return path
  const b = base.replace(/\/+$/, '')
  const p = String(path || '').replace(/^\/+/, '')
  return `${b}/${p}`
}

export const setStaticBase = (url) => {
  const val = String(url || '')
  uni.setStorageSync('STATIC_BASE_URL', val)
}

export const getStaticBase = () => {
  const v = uni.getStorageSync('STATIC_BASE_URL')
  return v || DEFAULT_BASE
}

export const staticUrl = (input) => {
  const src = String(input || '')
  if (!src) return src
  if (/^https?:\/\//i.test(src)) return src
  const base = getStaticBase()
  if (!base) return src
  if (src.startsWith('/static/')) {
    return join(base, src.replace(/^\/static\//, ''))
  }
  return join(base, src)
}

export const bgUrl = (input) => {
  return `url(${staticUrl(input)})`
}
