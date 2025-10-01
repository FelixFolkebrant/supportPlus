import React from 'react'

interface SenderAvatarProps {
  name?: string
  email?: string
  size?: number // pixel size of the avatar circle
  className?: string
}

// Generate a soft HSL color based on a string (email or name)
function colorFromString(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0 // Convert to 32bit integer
  }
  const hue = Math.abs(hash) % 360
  const saturation = 65
  const lightness = 55
  return `hsl(${hue} ${saturation}% ${lightness}%)`
}

function getInitials(name?: string, email?: string): string {
  const source = (name && name.trim()) || email || ''
  if (!source) return '•'
  const parts = source
    .replace(/"/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Cache resolved avatar URLs per email to avoid repeated fallbacks
const avatarCache = new Map<string, string | null>()

function buildCandidateUrls(email?: string): string[] {
  if (!email) return []
  const cleaned = email.trim().toLowerCase()
  const domain = cleaned.split('@')[1]
  const urls: string[] = []
  // Unavatar aggregator (tries multiple providers, including Gravatar). Force 404 on unknown.
  urls.push(`https://unavatar.io/${encodeURIComponent(cleaned)}?fallback=false`)
  // Domain logos as brand fallback
  if (domain) {
    urls.push(`https://logo.clearbit.com/${encodeURIComponent(domain)}`)
  }
  return urls
}

const SenderAvatar: React.FC<SenderAvatarProps> = ({ name, email, size = 40, className = '' }) => {
  const initials = getInitials(name, email)
  const bg = colorFromString((email || name || 'default').toLowerCase())

  const emailKey = (email || '').toLowerCase()
  const candidates = React.useMemo(() => buildCandidateUrls(emailKey), [emailKey])
  const [srcIndex, setSrcIndex] = React.useState<number>(() => 0)
  const [resolvedSrc, setResolvedSrc] = React.useState<string | null>(() =>
    emailKey && avatarCache.has(emailKey) ? avatarCache.get(emailKey)! : candidates[0] || null
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(
    !!(emailKey && (avatarCache.get(emailKey) || candidates[0]))
  )

  // When email changes, reset state
  React.useEffect(() => {
    if (!emailKey) {
      setResolvedSrc(null)
      setSrcIndex(0)
      // no-op
      return
    }
    if (avatarCache.has(emailKey)) {
      setResolvedSrc(avatarCache.get(emailKey) || null)
      setSrcIndex(0)
      // no-op
    } else {
      setResolvedSrc(candidates[0] || null)
      setSrcIndex(0)
      // no-op
    }
  }, [emailKey, candidates])

  const handleImgError = (): void => {
    if (!candidates.length) return
    const next = srcIndex + 1
    if (next < candidates.length) {
      setSrcIndex(next)
      setResolvedSrc(candidates[next])
    } else {
      // Exhausted
      setResolvedSrc(null)
      setIsLoading(false)
      if (emailKey) avatarCache.set(emailKey, null)
    }
  }

  const handleImgLoad = (): void => {
    setIsLoading(false)
    if (emailKey && resolvedSrc) avatarCache.set(emailKey, resolvedSrc)
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden border border-third/20 select-none flex-none ${className}`}
      style={{ width: size, height: size }}
      aria-label={name || email || 'Sender avatar'}
      title={name || email || ''}
    >
      {/* Skeleton while loading */}
      {resolvedSrc && isLoading ? (
        <div className="absolute inset-0 rounded-full skeleton-pulse" />
      ) : null}
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={name || email || 'Sender avatar'}
          className="absolute inset-0 w-full h-full rounded-full object-cover"
          onError={handleImgError}
          onLoad={handleImgLoad}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ background: bg, fontSize: Math.max(10, Math.floor(size / 2.8)) }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}

export default SenderAvatar
