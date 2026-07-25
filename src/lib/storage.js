const ACTIVE_SESSION_KEY = 'petualangan-kata-active-session'
const SESSION_HISTORY_KEY = 'petualangan-kata-session-history'

export function loadActiveSession() {
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveActiveSession(session) {
  window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session))
}

export function clearActiveSession() {
  window.localStorage.removeItem(ACTIVE_SESSION_KEY)
}

export function loadSessionHistory() {
  try {
    const raw = window.localStorage.getItem(SESSION_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSessionHistory(history) {
  window.localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history))
}

export function appendSessionHistory(session) {
  const history = loadSessionHistory()
  const nextHistory = [session, ...history]
  saveSessionHistory(nextHistory)
  return nextHistory
}

export function clearAllSessionData() {
  clearActiveSession()
  saveSessionHistory([])
}
