export const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

export const compact = (value) => {
  const n = Number(value) || 0
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return currency(n)
}

export const formatDate = (iso, opts = {}) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: opts.year === false ? undefined : 'numeric',
  })
}

export const formatDateTime = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const groupAccountNumber = (number = '') => {
  const clean = String(number).replace(/\s/g, '')
  if (clean.length !== 10) return String(number)
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`
}

export const maskAccountNumber = (number = '') => {
  const clean = String(number).replace(/\s/g, '')
  return clean.length >= 4 ? `•••• ${clean.slice(-4)}` : '••••'
}

export const initials = (name = '', fallback = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return fallback.slice(0, 2).toUpperCase() || 'WS'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const displayName = (user) => {
  if (!user) return ''
  const { firstName, lastName } = user.personalInfo || {}
  const full = [firstName, lastName].filter(Boolean).join(' ')
  return full || user.name || user.email?.split('@')[0] || 'Member'
}

export const monthKey = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const monthLabel = (key) => {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
