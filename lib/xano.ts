/**
 * Xano API helper
 * Centralizes auth/leave base URL selection, token handling, and error parsing.
 */

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE_URL || ''
const LEAVE_BASE = process.env.NEXT_PUBLIC_LEAVE_BASE_URL || ''

function isBrowser() {
  return typeof window !== 'undefined'
}

export function setAuthToken(token: string) {
  if (!isBrowser()) return
  localStorage.setItem('authToken', token)
}

export function getAuthToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem('authToken')
}

export function clearAuthToken() {
  if (!isBrowser()) return
  localStorage.removeItem('authToken')
}

type ApiGroup = 'auth' | 'leave'

function getBaseForGroup(group: ApiGroup) {
  if (group === 'auth') {
    if (!AUTH_BASE) throw new Error('Missing auth base URL. Set NEXT_PUBLIC_AUTH_BASE_URL in .env.local')
    return AUTH_BASE.replace(/\/$/, '')
  }
  if (group === 'leave') {
    if (!LEAVE_BASE) throw new Error('Missing leave base URL. Set NEXT_PUBLIC_LEAVE_BASE_URL in .env.local')
    return LEAVE_BASE.replace(/\/$/, '')
  }
  throw new Error(`Unsupported API group: ${String(group)}`)
}

function getRequestUrl(path: string, group: ApiGroup) {
  if (!path.startsWith('/')) throw new Error(`API path must start with '/': ${path}`)

  const base = getBaseForGroup(group)

  if (group === 'auth') {
    // Expect paths like '/auth/login' or '/auth/me'
    return `${base}${path}`
  }

  // leave group: ensure exactly one '/leave-requests' segment
  const hasLeaveSegment = /leave-requests(\/|$)/.test(base)
  const finalBase = hasLeaveSegment ? base : `${base}/leave-requests`
  const suffix = path.replace(/^\/+/, '')
  return `${finalBase}/${suffix}`
}

function getErrorMessage(responseText: string, statusText: string) {
  if (!responseText) return statusText || 'Request failed'

  try {
    const data = JSON.parse(responseText)
    if (typeof data === 'string') return data
    return data?.message || data?.error || JSON.stringify(data)
  } catch {
    return responseText
  }
}

export async function xanoFetch(path: string, options: RequestInit = {}, group: ApiGroup) {
  if (!group) throw new Error('API group must be provided: "auth" or "leave"')
  const url = getRequestUrl(path, group)

  const headers = new Headers(options.headers || {})
  const token = getAuthToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  // If body is present and not FormData, default to JSON
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const headerDebug: Record<string, string> = {}
  headers.forEach((value, key) => {
    headerDebug[key] = key.toLowerCase() === 'authorization' ? 'Bearer [REDACTED]' : value
  })

  console.groupCollapsed('[xanoFetch debug]', options.method || 'GET', url)
  console.log('URL:', url)
  console.log('Method:', options.method || 'GET')
  console.log('Headers:', headerDebug)

  if (options.body instanceof FormData) {
    const entries: Array<{ key: string; value: string | '[File]' }> = []
    for (const [key, value] of options.body.entries()) {
      entries.push({ key, value: value instanceof File ? '[File]' : String(value) })
    }
    console.log('Body type: FormData')
    console.log('Body fields:', entries)
  } else if (options.body) {
    console.log('Body type: JSON')
    console.log('Body value:', options.body)
  } else {
    console.log('Body: none')
  }
  console.groupEnd()

  const res = await fetch(url, { ...options, headers })
  const text = await res.text()

  console.groupCollapsed('[xanoFetch response]', options.method || 'GET', url)
  console.log('Status:', res.status, res.statusText)
  console.log('Response body:', text)
  console.groupEnd()

  if (!res.ok) {
    const message = getErrorMessage(text, res.statusText)
    throw new Error(message)
  }

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export { AUTH_BASE, LEAVE_BASE }
