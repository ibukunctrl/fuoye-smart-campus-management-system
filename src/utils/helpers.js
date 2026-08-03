export function timeAgo(isoStr) {
  if (!isoStr) return ''
  try {
    const ms = Date.now() - new Date(isoStr).getTime()
    if (isNaN(ms)) return ''

    const mins = Math.floor(ms / 60000)
    const hours = Math.floor(ms / 3600000)
    const days = Math.floor(ms / 86400000)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`

    return new Date(isoStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return ''
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const raw = String(dateStr)
    const d = new Date(raw.includes('T') ? raw : raw + 'T00:00:00')
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}
