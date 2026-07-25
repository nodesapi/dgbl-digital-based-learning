const API_BASE = '/api'

async function parseResponse(response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const payload = await response.json()
      message = payload.message ?? message
    } catch {
      // Ignore JSON parse failure and keep the default message.
    }

    throw new Error(message)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('text/csv')) {
    return response.text()
  }

  return response.json()
}

export async function getApiHealth() {
  const response = await fetch(`${API_BASE}/health`)
  return parseResponse(response)
}

export async function syncSession(session) {
  const response = await fetch(`${API_BASE}/sync/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  })

  return parseResponse(response)
}

export async function fetchDashboardSessions() {
  const response = await fetch(`${API_BASE}/dashboard/sessions`)
  const payload = await parseResponse(response)
  return payload.sessions ?? []
}

export async function fetchDashboardCsv() {
  const response = await fetch(`${API_BASE}/dashboard/export.csv`)
  return parseResponse(response)
}

export async function deleteParticipant(participantCode) {
  const response = await fetch(`${API_BASE}/dashboard/participants/${encodeURIComponent(participantCode)}`, {
    method: 'DELETE',
  })

  return parseResponse(response)
}
