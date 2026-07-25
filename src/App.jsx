import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  moduleOrder,
  modules,
  posttestQuestions,
  pretestQuestions,
  teacherAccessCode,
} from './data/gameContent'
import {
  appendSessionHistory,
  clearActiveSession,
  loadActiveSession,
  loadSessionHistory,
  saveActiveSession,
  saveSessionHistory,
} from './lib/storage'
import {
  deleteParticipant,
  fetchDashboardCsv,
  fetchDashboardSessions,
  getApiHealth,
  syncSession,
} from './lib/api'
import appLogo from './assets/app-logo.png'
import { getQuestionVisualLabel } from './lib/questionVisuals'
import { getWordImageAsset } from './lib/wordImageAssets'
import unjLogo from './assets/unj-logo.png'

const PHASE_LABELS = {
  pretest: 'Pre-test',
  posttest: 'Post-test',
}

const thesisIdentity = {
  author: 'Agustina Djunaedi',
  studentId: '1112822026',
}

const universityIdentity = {
  name: 'Universitas Negeri Jakarta',
  logo: unjLogo,
}

const appIdentity = {
  name: 'Petualangan Kata',
  logo: appLogo,
}

function createModuleProgress() {
  return modules.reduce((accumulator, module) => {
    accumulator[module.id] = {
      completed: false,
      score: 0,
      accuracy: 0,
      stars: 0,
    }
    return accumulator
  }, {})
}

function getParticipantName(session) {
  return session?.participantName ?? session?.participantCode ?? ''
}

function getParticipantClass(session) {
  return session?.className ?? session?.classGroup ?? ''
}

function createSession(participantName, className) {
  const normalizedName = participantName.trim()
  const normalizedClass = className.trim() || 'Belum diisi'

  return {
    id: `SESSION-${Date.now()}`,
    participantName: normalizedName,
    className: normalizedClass,
    participantCode: normalizedName,
    classGroup: normalizedClass,
    consentAccepted: true,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stage: 'pretest',
    currentQuestionIndex: 0,
    currentModuleId: null,
    moduleProgress: createModuleProgress(),
    results: [],
    logs: [],
    status: 'in_progress',
    pendingSync: true,
  }
}

function getPhaseDeck(session) {
  if (!session) {
    return []
  }

  if (session.stage === 'pretest') {
    return pretestQuestions
  }

  if (session.stage === 'posttest') {
    return posttestQuestions
  }

  if (session.stage === 'module') {
    return modules.find((module) => module.id === session.currentModuleId)?.questions ?? []
  }

  return []
}

function getSummaryForPhase(results, phase, moduleId = null) {
  const filtered = results.filter((item) => item.phase === phase && item.moduleId === moduleId)
  const total = filtered.length
  const totalScore = filtered.reduce((sum, item) => sum + item.score, 0)
  const accuracy = total === 0 ? 0 : Math.round((filtered.filter((item) => item.isCorrect).length / total) * 100)

  return {
    total,
    totalScore,
    accuracy,
    averageScore: total === 0 ? 0 : Math.round(totalScore / total),
  }
}

function computeStars(averageScore) {
  if (averageScore >= 90) {
    return 3
  }

  if (averageScore >= 70) {
    return 2
  }

  return 1
}

function flattenAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.join(' ')
  }

  return String(answer ?? '')
}

function formatTimestamp(isoString) {
  if (!isoString) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(isoString))
}

function getQuestionNarration(question) {
  const baseText = question.audioText ?? question.prompt ?? question.instruction ?? ''

  return baseText
    .replace(/^Pre-test:\s*/i, '')
    .replace(/^Post-test:\s*/i, '')
    .trim()
}

function getQuestionSupportText(question) {
  if (getQuestionVisualLabel(question)) {
    return question.instruction ?? question.clue ?? ''
  }

  return question.clue ?? question.instruction ?? ''
}

function getQuestionTimeLimitSeconds(question) {
  if (question.timeLimitSeconds) {
    return question.timeLimitSeconds
  }

  return 45
}

function calculateQuestionScore({
  attemptNumber,
  durationMs,
  helpUsed,
  timeLimitSeconds,
}) {
  const timeRatio = Math.min(durationMs / (timeLimitSeconds * 1000), 1)
  const timePenalty = Math.round(timeRatio * 20)

  return Math.max(40, 100 - (attemptNumber - 1) * 15 - (helpUsed ? 20 : 0) - timePenalty)
}

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function buildCsv(history) {
  const header = [
    'session_id',
    'participant_name',
    'class_name',
    'phase',
    'module_id',
    'question_id',
    'attempt',
    'answer',
    'is_correct',
    'help_used',
    'duration_ms',
    'time_limit_seconds',
    'timed_out',
    'answered_at',
  ]

  const rows = history.flatMap((session) =>
    session.logs.map((log) => [
      session.id,
      getParticipantName(session),
      getParticipantClass(session),
      log.phase,
      log.moduleId ?? '',
      log.questionId,
      log.attempt,
      flattenAnswer(log.answer),
      log.isCorrect ? 'true' : 'false',
      log.helpUsed ? 'true' : 'false',
      log.durationMs,
      log.timeLimitSeconds ?? '',
      log.timedOut ? 'true' : 'false',
      log.answeredAt,
    ]),
  )

  return [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n')
}

function sortSessionsByDate(sessions) {
  return [...sessions].sort((left, right) => {
    const leftTime = new Date(left.startedAt ?? 0).getTime()
    const rightTime = new Date(right.startedAt ?? 0).getTime()
    return rightTime - leftTime
  })
}

function mergeSessionHistory(localHistory, remoteHistory) {
  const byId = new Map()

  for (const session of remoteHistory) {
    byId.set(session.id, session)
  }

  for (const session of localHistory) {
    const existing = byId.get(session.id)
    byId.set(session.id, existing ? { ...existing, ...session } : session)
  }

  return sortSessionsByDate(Array.from(byId.values()))
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

function speakText(text) {
  if (!text || !('speechSynthesis' in window)) {
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID'
  utterance.rate = 0.92
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}

function speakTextAsync(text) {
  if (!text || !('speechSynthesis' in window)) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    let settled = false

    function finish() {
      if (settled) {
        return
      }
      settled = true
      resolve()
    }

    utterance.lang = 'id-ID'
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onend = finish
    utterance.onerror = finish

    // Fallback in case some browsers skip events.
    window.setTimeout(finish, 2500)
    window.speechSynthesis.speak(utterance)
  })
}

let feedbackAudioContext = null

function getFeedbackAudioContext() {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return null
  }

  if (!feedbackAudioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    feedbackAudioContext = new AudioContextClass()
  }

  return feedbackAudioContext
}

function playToneSequence(steps) {
  const context = getFeedbackAudioContext()
  if (!context) {
    return Promise.resolve()
  }

  if (context.state === 'suspended') {
    context.resume().catch(() => {})
  }

  const startTime = context.currentTime
  const totalDuration = Math.max(...steps.map((step) => step.start + step.duration), 0)

  for (const step of steps) {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.type = step.wave ?? 'sine'
    oscillator.frequency.setValueAtTime(step.frequency, startTime + step.start)

    gainNode.gain.setValueAtTime(0.0001, startTime + step.start)
    gainNode.gain.exponentialRampToValueAtTime(
      step.gain ?? 0.07,
      startTime + step.start + 0.02,
    )
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + step.start + step.duration,
    )

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start(startTime + step.start)
    oscillator.stop(startTime + step.start + step.duration + 0.02)
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, Math.ceil((totalDuration + 0.08) * 1000))
  })
}

async function playFeedbackAudio(type) {
  if (type === 'success') {
    await Promise.all([
      playToneSequence([
        { frequency: 659.25, start: 0, duration: 0.16, gain: 0.07, wave: 'triangle' },
        { frequency: 783.99, start: 0.12, duration: 0.18, gain: 0.07, wave: 'triangle' },
        { frequency: 987.77, start: 0.24, duration: 0.24, gain: 0.08, wave: 'triangle' },
      ]),
      speakTextAsync('Benar. Hebat.'),
    ])
    return
  }

  if (type === 'error') {
    await Promise.all([
      playToneSequence([
        { frequency: 349.23, start: 0, duration: 0.16, gain: 0.06, wave: 'sawtooth' },
        { frequency: 293.66, start: 0.14, duration: 0.2, gain: 0.06, wave: 'sawtooth' },
      ]),
      speakTextAsync('Belum tepat. Coba lagi.'),
    ])
    return
  }

  if (type === 'timeout') {
    await playToneSequence([
      { frequency: 415.3, start: 0, duration: 0.12, gain: 0.05, wave: 'square' },
      { frequency: 349.23, start: 0.14, duration: 0.14, gain: 0.05, wave: 'square' },
      { frequency: 261.63, start: 0.32, duration: 0.26, gain: 0.05, wave: 'square' },
    ])
  }
}

function resetQuestionState(question) {
  const tokens = Array.isArray(question.options)
    ? question.options.map((option, index) => ({
        id: `${question.id}-${index}`,
        label: typeof option === 'string' ? option : option.label,
        rawValue: option,
      }))
    : []

  return {
    selectedAnswer: null,
    builtTokens: [],
    availableTokens: tokens,
    helpUsed: false,
    feedback: '',
    feedbackTone: 'neutral',
    attempts: 0,
    mazePosition: { row: 3, col: 1 },
  }
}

function WelcomeScreen({
  draftSession,
  installReady,
  onOpenDashboard,
  onResume,
  onStart,
  onInstall,
}) {
  const [participantName, setParticipantName] = useState('')
  const [className, setClassName] = useState('')
  const [consent, setConsent] = useState(false)
  const formRef = useRef(null)

  return (
    <section className="screen screen-grid">
      <div className="panel hero-panel">
        <div className="eyebrow">Petualangan Kata</div>
        <h1>Ayo belajar membaca</h1>
        <p className="lead">
          Huruf, suku kata, kata, dan gambar dipelajari lewat permainan yang sederhana,
          menyenangkan, dan mudah diikuti anak.
        </p>

        <div className="hero-quick-grid">
          <button
            type="button"
            className="quick-action-card quick-action-card--primary"
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          >
            <span className="quick-action-label">Mulai</span>
            <strong>Isi data peserta</strong>
            <small>Mulai pre-test</small>
          </button>
          <button type="button" className="quick-action-card" onClick={onOpenDashboard}>
            <span className="quick-action-label">Guru</span>
            <strong>Lihat hasil</strong>
            <small>Masuk dashboard</small>
          </button>
          <button
            type="button"
            className="quick-action-card"
            onClick={installReady ? onInstall : undefined}
            disabled={!installReady}
          >
            <span className="quick-action-label">Aplikasi</span>
            <strong>{installReady ? 'Pasang sekarang' : 'Buka di browser'}</strong>
            <small>{installReady ? 'Simpan ke layar utama' : 'Siap dipakai sekarang'}</small>
          </button>
        </div>

        <div className="hero-highlights">
          <span className="status-pill soft">Untuk siswa kelas 1-2 SD</span>
          <span className="status-pill soft">Cocok untuk ponsel dan laptop</span>
        </div>

        <div className="thesis-note" aria-label="Identitas penelitian tesis">
          <div className="thesis-note__header">
            <span className="eyebrow muted">Identitas Penelitian</span>
            <span className="thesis-note__badge">Tesis S2</span>
          </div>
          <div className="thesis-note__grid">
            <div className="thesis-note__item">
              <span>Nama mahasiswa</span>
              <strong>{thesisIdentity.author}</strong>
            </div>
            <div className="thesis-note__item">
              <span>NIM</span>
              <strong>{thesisIdentity.studentId}</strong>
            </div>
          </div>
        </div>

        {draftSession ? (
          <div className="resume-card">
            <strong>Sesi tersimpan ditemukan.</strong>
            <p>
              Peserta <b>{getParticipantName(draftSession)}</b> dapat melanjutkan dari tahap{' '}
              <b>{draftSession.stage === 'module'
                ? modules.find((item) => item.id === draftSession.currentModuleId)?.region
                : PHASE_LABELS[draftSession.stage] ?? draftSession.stage}</b>.
            </p>
            <button type="button" className="primary-button" onClick={onResume}>
              Lanjutkan sesi
            </button>
          </div>
        ) : null}

      </div>

      <form
        ref={formRef}
        className="panel form-panel"
        onSubmit={(event) => {
          event.preventDefault()
          if (!consent) {
            return
          }
          onStart(participantName, className)
        }}
      >
        <div className="eyebrow">Data Peserta</div>
        <h2>Mulai sesi belajar</h2>
        <label className="field">
          <span>Nama siswa</span>
          <input
            value={participantName}
            onChange={(event) => setParticipantName(event.target.value)}
            placeholder="Contoh: Budi Santoso"
            required
            minLength={2}
          />
        </label>
        <label className="field">
          <span>Kelas</span>
          <input
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            placeholder="Contoh: Kelas 1A"
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>Pendamping menyetujui sesi uji coba dan penyimpanan data belajar lokal.</span>
        </label>
        <button type="submit" className="primary-button" disabled={!participantName || !consent}>
          Mulai pre-test
        </button>
        <p className="microcopy">
          Data peserta digunakan untuk pencatatan hasil belajar.
        </p>
      </form>
    </section>
  )
}

function TutorialScreen({ onContinue }) {
  return (
    <section className="screen">
      <div className="panel tutorial-panel">
        <div className="eyebrow">Tutorial</div>
        <h2>Cara bermain</h2>
        <div className="tutorial-steps">
          <article className="tutorial-card">
            <span className="step-badge">1</span>
            <h3>Dengar instruksi</h3>
            <p>Tekan tombol audio kapan saja jika ingin mendengar petunjuk lagi.</p>
          </article>
          <article className="tutorial-card">
            <span className="step-badge">2</span>
            <h3>Pilih atau susun jawaban</h3>
            <p>Setiap layar hanya punya satu tugas utama supaya anak fokus.</p>
          </article>
          <article className="tutorial-card">
            <span className="step-badge">3</span>
            <h3>Coba lagi tanpa takut salah</h3>
            <p>Kalau belum tepat, game memberi umpan balik dan bantuan bertahap.</p>
          </article>
        </div>
        <button type="button" className="primary-button" onClick={onContinue}>
          Buka peta permainan
        </button>
      </div>
    </section>
  )
}

function MapScreen({ session, onOpenDashboard, onResetSession, onStartModule, onStartPosttest }) {
  const allModulesComplete = moduleOrder.every((moduleId) => session.moduleProgress[moduleId].completed)
  const activeIndex = moduleOrder.findIndex((moduleId) => !session.moduleProgress[moduleId].completed)

  return (
    <section className="screen">
      <div className="panel map-panel">
        <div className="map-header">
          <div>
            <div className="eyebrow">Peta Permainan</div>
            <h2>Pulau Kata</h2>
            <p className="lead compact">
              Selesaikan kelima wilayah untuk membuka post-test. Progres otomatis tersimpan.
            </p>
          </div>
          <div className="top-actions">
            <button type="button" className="secondary-button" onClick={onOpenDashboard}>
              Dashboard
            </button>
            <button type="button" className="ghost-button" onClick={onResetSession}>
              Reset sesi
            </button>
          </div>
        </div>

        <div className="map-grid">
          {modules.map((module, index) => {
            const progress = session.moduleProgress[module.id]
            const unlocked = index === 0 || session.moduleProgress[moduleOrder[index - 1]].completed

            return (
              <article key={module.id} className="map-card" style={{ '--card-accent': module.color }}>
                <div className="map-badge">{module.badge}</div>
                <div className="map-copy">
                  <span className="eyebrow muted">Level {index + 1}</span>
                  <h3>{module.region}</h3>
                  <p>{module.goal}</p>
                </div>
                <div className="map-meta">
                  <span className="status-pill soft">
                    {progress.completed ? `${progress.stars} bintang` : unlocked ? 'Siap dimainkan' : 'Terkunci'}
                  </span>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={!unlocked}
                    onClick={() => onStartModule(module.id)}
                  >
                    {progress.completed ? 'Main lagi' : activeIndex === index ? 'Mulai level' : 'Buka level'}
                  </button>
                </div>
              </article>
            )
          })}

          <div className="posttest-bar posttest-bar--map">
            <div>
              <div className="eyebrow">Tahap akhir</div>
              <h3>Post-test</h3>
              <p>Buka setelah seluruh level selesai untuk melihat peningkatan hasil belajar.</p>
            </div>
            <button
              type="button"
              className="primary-button"
              disabled={!allModulesComplete}
              onClick={onStartPosttest}
            >
              Mulai post-test
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ActivityScreen({
  deck,
  phaseLabel,
  progressLabel,
  onAttempt,
  onComplete,
}) {
  const [questionState, setQuestionState] = useState(() => resetQuestionState(deck[0]))
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [showTimeoutOverlay, setShowTimeoutOverlay] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [timeRemainingMs, setTimeRemainingMs] = useState(() => getQuestionTimeLimitSeconds(deck[0]) * 1000)
  const question = deck[progressLabel.currentIndex]
  const visualLabel = getQuestionVisualLabel(question)
  const visualAsset = getWordImageAsset(visualLabel)
  const visualSrc = visualAsset?.src ?? null
  const visualImageStyle = visualAsset
    ? {
        '--visual-shift-x': visualAsset.shiftX ?? '0px',
        '--visual-shift-y': visualAsset.shiftY ?? '0px',
        '--visual-scale': visualAsset.scale ?? 1,
      }
    : undefined
  const handleMazeMoveRef = useRef(() => {})
  const submitAnswerRef = useRef(() => Promise.resolve())
  const handleTimeExpiredRef = useRef(() => Promise.resolve())
  const timeLimitSeconds = getQuestionTimeLimitSeconds(question)
  const timeRemainingSeconds = Math.max(0, Math.ceil(timeRemainingMs / 1000))
  const isQuestionLocked = showSuccessOverlay || showTimeoutOverlay

  useEffect(() => {
    setQuestionState(resetQuestionState(question))
    setStartedAt(Date.now())
    setShowSuccessOverlay(false)
    setShowTimeoutOverlay(false)
    setSuccessMessage('')
    setTimeRemainingMs(timeLimitSeconds * 1000)
    speakText(getQuestionNarration(question))
  }, [question, timeLimitSeconds])

  useEffect(() => {
    if (isQuestionLocked) {
      return
    }

    const deadlineAt = Date.now() + timeLimitSeconds * 1000
    const timerId = window.setInterval(() => {
      const remaining = Math.max(0, deadlineAt - Date.now())
      setTimeRemainingMs(remaining)

      if (remaining <= 0) {
        window.clearInterval(timerId)
        handleTimeExpiredRef.current()
      }
    }, 200)

    return () => window.clearInterval(timerId)
  }, [isQuestionLocked, question, timeLimitSeconds])

  useEffect(() => {
    if (question.type !== 'maze') {
      return
    }

    function handleKeyDown(event) {
      const target = event.target
      const tagName = target?.tagName?.toLowerCase?.()
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return
      }

      if (isQuestionLocked) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleMazeMoveRef.current('left')
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleMazeMoveRef.current('right')
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        handleMazeMoveRef.current('up')
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        handleMazeMoveRef.current('down')
      }

      if ((event.key === 'Enter' || event.key === ' ') && questionState.mazePosition.row === 0) {
        event.preventDefault()
        submitAnswerRef.current()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isQuestionLocked, question.type, questionState.mazePosition.row])

  const builtAnswer = questionState.builtTokens.map((token) => token.label)
  const canSubmitChoice = question.type === 'choice' || question.type === 'picture'
    ? questionState.selectedAnswer !== null
    : question.type === 'maze'
      ? questionState.mazePosition.row === 0
      : builtAnswer.length === question.correctAnswer.length
  const canSubmitNow = canSubmitChoice && !isQuestionLocked

  function getAnswerSnapshot(state) {
    if (question.type === 'choice' || question.type === 'picture') {
      return state.selectedAnswer
    }

    if (question.type === 'maze') {
      return question.options[state.mazePosition.col]
    }

    return state.builtTokens.map((token) => token.label)
  }

  function registerFeedback(message, tone) {
    setQuestionState((current) => ({
      ...current,
      feedback: message,
      feedbackTone: tone,
    }))
  }

  function handleTokenPick(tokenId) {
    setQuestionState((current) => {
      const token = current.availableTokens.find((item) => item.id === tokenId)
      if (!token) {
        return current
      }

      return {
        ...current,
        builtTokens: [...current.builtTokens, token],
        availableTokens: current.availableTokens.filter((item) => item.id !== tokenId),
      }
    })
  }

  function handleTokenRemove(tokenId) {
    setQuestionState((current) => {
      const token = current.builtTokens.find((item) => item.id === tokenId)
      if (!token) {
        return current
      }

      return {
        ...current,
        builtTokens: current.builtTokens.filter((item) => item.id !== tokenId),
        availableTokens: [...current.availableTokens, token],
      }
    })
  }

  function handleMazeMove(direction) {
    setQuestionState((current) => {
      const nextPosition = { ...current.mazePosition }
      if (direction === 'left') {
        nextPosition.col = Math.max(0, current.mazePosition.col - 1)
      }
      if (direction === 'right') {
        nextPosition.col = Math.min(2, current.mazePosition.col + 1)
      }
      if (direction === 'up') {
        nextPosition.row = Math.max(0, current.mazePosition.row - 1)
      }
      if (direction === 'down') {
        nextPosition.row = Math.min(3, current.mazePosition.row + 1)
      }

      return {
        ...current,
        mazePosition: nextPosition,
      }
    })
  }

  async function submitAnswer() {
    if (isQuestionLocked) {
      return
    }

    const isLastQuestion = progressLabel.currentIndex >= deck.length - 1
    const answer = getAnswerSnapshot(questionState)

    const isCorrect = Array.isArray(question.correctAnswer)
      ? JSON.stringify(answer) === JSON.stringify(question.correctAnswer)
      : answer === question.correctAnswer

    const attemptNumber = questionState.attempts + 1
    const durationMs = Date.now() - startedAt

    onAttempt({
      questionId: question.id,
      phase: progressLabel.phase,
      moduleId: progressLabel.moduleId,
      attempt: attemptNumber,
      answer,
      isCorrect,
      helpUsed: questionState.helpUsed,
      durationMs,
      timeLimitSeconds,
      timedOut: false,
      answeredAt: new Date().toISOString(),
    })

    if (isCorrect) {
      const score = calculateQuestionScore({
        attemptNumber,
        durationMs,
        helpUsed: questionState.helpUsed,
        timeLimitSeconds,
      })
      const nextMessage = isLastQuestion
        ? progressLabel.phase === 'pretest'
          ? 'Siap masuk ke tahap berikutnya'
          : progressLabel.phase === 'posttest'
            ? 'Menyiapkan hasil akhir'
            : 'Kembali ke peta permainan'
        : 'Lanjut ke soal berikutnya'

      setShowSuccessOverlay(true)
      setSuccessMessage(nextMessage)
      registerFeedback('Benar. Lanjut ke tantangan berikutnya.', 'success')
      await playFeedbackAudio('success')
      window.setTimeout(() => {
        onComplete({
          questionId: question.id,
          phase: progressLabel.phase,
          moduleId: progressLabel.moduleId,
          answer,
          isCorrect: true,
          helpUsed: questionState.helpUsed,
          attempts: attemptNumber,
          durationMs,
          timeLimitSeconds,
          timedOut: false,
          score,
          answeredAt: new Date().toISOString(),
        })
      }, 500)
      return
    }

    await playFeedbackAudio('error')
    setQuestionState((current) => ({
      ...current,
      attempts: attemptNumber,
      feedback:
        attemptNumber >= 2
          ? 'Masih belum tepat. Coba lagi atau tekan bantuan.'
          : 'Belum tepat. Coba sekali lagi.',
      feedbackTone: 'error',
      builtTokens: question.type === 'maze' ? current.builtTokens : current.builtTokens,
      mazePosition: question.type === 'maze' ? { row: 3, col: 1 } : current.mazePosition,
      selectedAnswer:
        question.type === 'choice' || question.type === 'picture' ? null : current.selectedAnswer,
    }))
  }

  async function handleTimeExpired() {
    if (isQuestionLocked) {
      return
    }

    const answer = getAnswerSnapshot(questionState)
    const durationMs = timeLimitSeconds * 1000
    const attemptNumber = questionState.attempts + 1

    setShowTimeoutOverlay(true)
    setSuccessMessage('Waktu habis. Lanjut ke soal berikutnya.')

    onAttempt({
      questionId: question.id,
      phase: progressLabel.phase,
      moduleId: progressLabel.moduleId,
      attempt: attemptNumber,
      answer,
      isCorrect: false,
      helpUsed: questionState.helpUsed,
      durationMs,
      timeLimitSeconds,
      timedOut: true,
      answeredAt: new Date().toISOString(),
    })

    await Promise.all([
      playFeedbackAudio('timeout'),
      speakTextAsync('Waktu habis. Kita lanjut ke soal berikutnya.'),
    ])

    window.setTimeout(() => {
      onComplete({
        questionId: question.id,
        phase: progressLabel.phase,
        moduleId: progressLabel.moduleId,
        answer,
        isCorrect: false,
        helpUsed: questionState.helpUsed,
        attempts: attemptNumber,
        durationMs,
        timeLimitSeconds,
        timedOut: true,
        score: 0,
        answeredAt: new Date().toISOString(),
      })
    }, 700)
  }

  useEffect(() => {
    handleMazeMoveRef.current = handleMazeMove
    submitAnswerRef.current = submitAnswer
    handleTimeExpiredRef.current = handleTimeExpired
  })

  return (
    <section className="screen">
      <div className="panel activity-panel">
        <div className="activity-header">
          <div>
            <div className="eyebrow">{phaseLabel}</div>
            <h2>{question.prompt}</h2>
            <p className="lead compact">{getQuestionSupportText(question)}</p>
          </div>
          <div className="activity-actions">
            <span className="status-pill soft">{progressLabel.progressText}</span>
            <div
              className={`activity-timer ${timeRemainingSeconds <= 10 ? 'warning' : ''}`}
              aria-live="polite"
            >
              <div className="activity-timer__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="8.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  />
                  <path
                    d="M12 7.5v4.8l3.1 1.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.2 3.8h5.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="activity-timer__copy">
                <span className="activity-timer__label">Sisa waktu</span>
                <strong className="activity-timer__value">{formatCountdown(timeRemainingSeconds)}</strong>
              </div>
            </div>
            <button type="button" className="secondary-button" onClick={() => speakText(getQuestionNarration(question))}>
              Ulangi audio
            </button>
          </div>
        </div>

        <div className="question-card">
          {showTimeoutOverlay ? (
            <div className="success-overlay success-overlay--timeout" aria-hidden="true">
              <div className="success-overlay__badge success-overlay__badge--timeout">00</div>
              <div className="success-overlay__text">{successMessage}</div>
            </div>
          ) : null}

          {showSuccessOverlay ? (
            <div className="success-overlay" aria-hidden="true">
              <div className="success-overlay__badge">
                <svg viewBox="0 0 24 24" className="success-overlay__icon">
                  <path
                    d="M20 6 9 17l-5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="success-overlay__text">{successMessage}</div>
            </div>
          ) : null}

          <div
            className={`question-stage ${question.type === 'maze' ? 'question-stage--maze' : ''} ${
              visualLabel && visualSrc && question.type !== 'picture' ? 'question-stage--with-visual' : ''
            }`}
          >
            {visualLabel && visualSrc && question.type !== 'picture' && question.type !== 'maze' ? (
              <div className="question-visual">
                <div className="question-visual__art">
                  <img
                    src={visualSrc}
                    alt={`Gambar ${visualLabel}`}
                    loading="eager"
                    style={visualImageStyle}
                  />
                </div>
                <div className="question-visual__caption">{visualLabel.toUpperCase()}</div>
              </div>
            ) : null}

            {question.type === 'choice' ? (
              <div className="option-grid">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={isQuestionLocked}
                    className={`option-button ${questionState.selectedAnswer === option ? 'selected' : ''}`}
                    onClick={() =>
                      setQuestionState((current) => ({
                        ...current,
                        selectedAnswer: option,
                      }))
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}

            {question.type === 'picture' ? (
              <div className="picture-grid">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={isQuestionLocked}
                    className={`picture-card ${questionState.selectedAnswer === option.id ? 'selected' : ''}`}
                    onClick={() =>
                      setQuestionState((current) => ({
                        ...current,
                        selectedAnswer: option.id,
                      }))
                    }
                  >
                    <span className="picture-emoji" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {(question.type === 'sequence' || question.type === 'arrange') ? (
              <div className="builder-layout">
                <div className="answer-zone">
                  <div className="answer-title">Jawabanmu</div>
                  <div className="answer-track">
                    {questionState.builtTokens.length === 0 ? (
                      <span className="placeholder-chip">Pilih kartu di bawah</span>
                    ) : (
                      questionState.builtTokens.map((token) => (
                        <button
                          key={token.id}
                          type="button"
                          disabled={isQuestionLocked}
                          className="token-chip selected"
                          onClick={() => handleTokenRemove(token.id)}
                        >
                          {token.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <div className="token-pool">
                  {questionState.availableTokens.map((token) => (
                    <button
                      key={token.id}
                      type="button"
                      disabled={isQuestionLocked}
                      className="token-chip"
                      onClick={() => handleTokenPick(token.id)}
                    >
                      {token.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {question.type === 'maze' ? (
              <div className={`maze-layout ${visualLabel && visualSrc ? 'maze-layout--with-visual' : ''}`}>
                <div className="maze-clue">
                  <span className="word-pattern">{question.pattern}</span>
                  {!visualLabel ? <span>{question.clue}</span> : null}
                </div>
                <div className="maze-body">
                  {visualLabel && visualSrc ? (
                    <div className="question-visual question-visual--maze">
                      <div className="question-visual__art">
                        <img
                          src={visualSrc}
                          alt={`Gambar ${visualLabel}`}
                          loading="eager"
                          style={visualImageStyle}
                        />
                      </div>
                      <div className="question-visual__caption">{visualLabel.toUpperCase()}</div>
                    </div>
                  ) : null}

                  <div className="maze-play-area">
                    <div className="maze-keyboard-hint">
                      Panah keyboard bisa dipakai
                    </div>
                    <div className="maze-grid" role="img" aria-label="Maze pilihan jawaban">
                      {[0, 1, 2, 3].map((row) => (
                        <div key={row} className="maze-row">
                          {[0, 1, 2].map((col) => {
                            const isPlayer = questionState.mazePosition.row === row && questionState.mazePosition.col === col
                            const isAnswerRow = row === 0
                            const isPathRow = row > 0
                            return (
                              <div
                                key={`${row}-${col}`}
                                className={`maze-cell ${isAnswerRow ? 'answer-row' : ''} ${isPathRow ? 'path-row' : ''} ${isPlayer ? 'active' : ''}`}
                              >
                                {isAnswerRow ? question.options[col] : null}
                                {isPlayer ? <span className="maze-player" aria-label="Posisi pemain"></span> : null}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="maze-controls">
                      <button type="button" className="secondary-button" onClick={() => handleMazeMove('left')}>
                        Kiri
                      </button>
                      <button type="button" className="secondary-button" disabled={isQuestionLocked} onClick={() => handleMazeMove('up')}>
                        Atas
                      </button>
                      <button type="button" className="secondary-button" disabled={isQuestionLocked} onClick={() => handleMazeMove('right')}>
                        Kanan
                      </button>
                      <button type="button" className="ghost-button" disabled={isQuestionLocked} onClick={() => handleMazeMove('down')}>
                        Turun
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="question-footer">
            <div className="action-row">
              <button
                type="button"
                className="ghost-button"
                disabled={isQuestionLocked}
                onClick={() =>
                  setQuestionState((current) => ({
                    ...current,
                    helpUsed: true,
                    feedback: question.hint,
                    feedbackTone: 'hint',
                  }))
                }
              >
                Bantuan
              </button>
              <button type="button" className="primary-button" disabled={!canSubmitNow} onClick={submitAnswer}>
                Cek jawaban
              </button>
            </div>

            {questionState.feedback ? (
              <div className={`feedback-box ${questionState.feedbackTone}`}>{questionState.feedback}</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultsScreen({ session, onNewSession, onOpenDashboard }) {
  const pretestSummary = getSummaryForPhase(session.results, 'pretest')
  const posttestSummary = getSummaryForPhase(session.results, 'posttest')
  const totalStars = Object.values(session.moduleProgress).reduce((sum, module) => sum + module.stars, 0)

  return (
    <section className="screen">
      <div className="panel results-panel">
        <div className="eyebrow">Hasil Akhir</div>
        <h2>Perjalanan belajar selesai</h2>
        <p className="lead compact">
          {session.pendingSync
            ? <>Progres sudah tersimpan lokal dan sedang menunggu sinkronisasi ke PostgreSQL.</>
            : <>Progres sudah tersimpan lokal dan berhasil disinkronkan ke PostgreSQL.</>}
        </p>

        <div className="result-grid">
          <article className="result-card">
            <span className="result-label">Pre-test</span>
            <strong>{pretestSummary.accuracy}%</strong>
            <p>{pretestSummary.total} soal dinilai</p>
          </article>
          <article className="result-card">
            <span className="result-label">Post-test</span>
            <strong>{posttestSummary.accuracy}%</strong>
            <p>{posttestSummary.total} soal dinilai</p>
          </article>
          <article className="result-card">
            <span className="result-label">Bintang Level</span>
            <strong>{totalStars}</strong>
            <p>Total bintang dari 5 wilayah</p>
          </article>
        </div>

        <div className="module-summary-grid">
          {modules.map((module) => {
            const progress = session.moduleProgress[module.id]
            return (
              <article key={module.id} className="module-summary-card">
                <h3>{module.region}</h3>
                <p>Skor rata-rata {progress.score}%</p>
                <div className="star-row">{'★'.repeat(progress.stars)}{'☆'.repeat(3 - progress.stars)}</div>
              </article>
            )
          })}
        </div>

        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={onNewSession}>
            Mulai peserta baru
          </button>
          <button type="button" className="secondary-button" onClick={onOpenDashboard}>
            Buka dashboard guru
          </button>
        </div>
      </div>
    </section>
  )
}

function DashboardScreen({
  history,
  pendingDraft,
  apiStatus,
  syncState,
  onBack,
  onResetParticipant,
  onExportCsv,
}) {
  const [code, setCode] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const totalLogs = history.reduce((sum, session) => sum + session.logs.length, 0)

  const handleUnlock = (event) => {
    event.preventDefault()

    const normalizedCode = code.trim().toUpperCase()

    if (normalizedCode === teacherAccessCode.toUpperCase()) {
      setIsUnlocked(true)
      setUnlockError('')
      return
    }

    setUnlockError('Kode akses belum sesuai. Silakan cek lagi.')
  }

  if (!isUnlocked) {
    return (
      <section className="screen">
        <div className="panel dashboard-lock">
          <div className="dashboard-lock__layout">
            <article className="dashboard-lock__intro">
              <h2>Dashboard hasil peserta</h2>
              <p className="lead compact">
                Lihat nilai, progres, dan unduh hasil belajar dalam satu tempat.
              </p>

              <div className="dashboard-lock__points">
                <div className="dashboard-lock__point">
                  <strong>Nilai belajar</strong>
                  <span>Pre-test dan post-test.</span>
                </div>
                <div className="dashboard-lock__point">
                  <strong>Progress level</strong>
                  <span>Perkembangan tiap permainan.</span>
                </div>
                <div className="dashboard-lock__point">
                  <strong>Ekspor data</strong>
                  <span>Unduh hasil dalam CSV.</span>
                </div>
              </div>
            </article>

            <form className="dashboard-lock__form-card" onSubmit={handleUnlock}>
              <h3>Masuk dashboard guru</h3>

              <label className="field">
                <span>Kode akses guru</span>
                <input
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value)
                    if (unlockError) {
                      setUnlockError('')
                    }
                  }}
                  placeholder="Masukkan kode akses"
                />
              </label>

              <p className={`dashboard-lock__message ${unlockError ? 'error' : ''}`}>
                {unlockError || 'Masukkan kode akses guru untuk membuka dashboard.'}
              </p>

              <div className="action-row dashboard-lock__actions">
                <button type="button" className="ghost-button" onClick={onBack}>
                  Kembali
                </button>
                <button type="submit" className="primary-button">
                  Buka dashboard
                </button>
              </div>

              <div className="dashboard-lock__hint">
                <span className="status-pill soft">Kode demo</span>
                <strong>{teacherAccessCode}</strong>
              </div>
            </form>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="screen">
      <div className="panel dashboard-panel">
        <div className="map-header">
          <div>
            <div className="eyebrow">Dashboard Guru</div>
            <h2>Ringkasan hasil peserta</h2>
            <div className="dashboard-research-note" aria-label="Identitas penelitian">
              <div className="dashboard-research-note__item">
                <span>Nama mahasiswa</span>
                <strong>{thesisIdentity.author}</strong>
              </div>
              <div className="dashboard-research-note__item">
                <span>NIM</span>
                <strong>{thesisIdentity.studentId}</strong>
              </div>
            </div>
          </div>
          <div className="top-actions">
            <span className={`status-pill ${apiStatus === 'online' ? 'online' : 'offline'}`}>
              {apiStatus === 'online' ? 'API PostgreSQL aktif' : 'API belum terhubung'}
            </span>
            <span className="status-pill soft">
              {syncState === 'syncing'
                ? 'Sedang sinkron'
                : syncState === 'synced'
                  ? 'Sinkron selesai'
                  : syncState === 'error'
                    ? 'Sinkron bermasalah'
                    : 'Standby'}
            </span>
            <button type="button" className="secondary-button" onClick={onExportCsv}>
              Export CSV
            </button>
            <button type="button" className="ghost-button" onClick={onBack}>
              Kembali
            </button>
          </div>
        </div>

        <div className="result-grid">
          <article className="result-card">
            <span className="result-label">Sesi selesai</span>
            <strong>{history.length}</strong>
            <p>Riwayat permainan tersimpan</p>
          </article>
          <article className="result-card">
            <span className="result-label">Jawaban tercatat</span>
            <strong>{totalLogs}</strong>
            <p>Termasuk percobaan salah dan benar</p>
          </article>
          <article className="result-card">
            <span className="result-label">Draft aktif</span>
            <strong>{pendingDraft ? '1' : '0'}</strong>
            <p>{pendingDraft ? getParticipantName(pendingDraft) : 'Tidak ada sesi yang tertunda'}</p>
          </article>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama siswa</th>
                <th>Kelas</th>
                <th>Mulai</th>
                <th>Pre-test</th>
                <th>Post-test</th>
                <th>Status sinkron</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7">Belum ada data sesi selesai.</td>
                </tr>
              ) : (
                history.map((session) => {
                  const pretestSummary = getSummaryForPhase(session.results, 'pretest')
                  const posttestSummary = getSummaryForPhase(session.results, 'posttest')

                  return (
                    <tr key={session.id}>
                      <td>{getParticipantName(session)}</td>
                      <td>{getParticipantClass(session)}</td>
                      <td>{formatTimestamp(session.startedAt)}</td>
                      <td>{pretestSummary.accuracy}%</td>
                      <td>{posttestSummary.accuracy}%</td>
                      <td>{session.pendingSync ? 'pending_sync' : 'synced'}</td>
                      <td>
                        <button
                          type="button"
                          className="table-button"
                          onClick={() => onResetParticipant(getParticipantName(session))}
                        >
                          Reset peserta
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Lanjutkan',
  cancelLabel = 'Batal',
  tone = 'warning',
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, open])

  if (!open) {
    return null
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`dialog-icon dialog-icon--${tone}`} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 7.75v5.5M12 16.75h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="dialog-copy">
          <h3 id="confirm-dialog-title">{title}</h3>
          <p>{message}</p>
        </div>
        <div className="dialog-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`primary-button dialog-confirm dialog-confirm--${tone}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(() => loadActiveSession())
  const [history, setHistory] = useState(() => loadSessionHistory())
  const [serverHistory, setServerHistory] = useState([])
  const [screen, setScreen] = useState(() => (loadActiveSession() ? 'game' : 'welcome'))
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [apiStatus, setApiStatus] = useState('checking')
  const [syncState, setSyncState] = useState('idle')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const hasBooted = useRef(false)
  const isSyncingRef = useRef(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (!hasBooted.current) {
      hasBooted.current = true
      return
    }

    if (session && session.status === 'in_progress') {
      saveActiveSession(session)
    }
  }, [session])

  useEffect(() => {
    if (!isOnline) {
      setApiStatus('offline')
      return
    }

    let isCurrent = true

    async function checkApi() {
      try {
        await getApiHealth()
        if (isCurrent) {
          setApiStatus('online')
        }
      } catch {
        if (isCurrent) {
          setApiStatus('offline')
        }
      }
    }

    checkApi()
    const healthInterval = window.setInterval(checkApi, 12000)

    return () => {
      isCurrent = false
      window.clearInterval(healthInterval)
    }
  }, [isOnline])

  useEffect(() => {
    if (apiStatus !== 'online') {
      return
    }

    let isCurrent = true

    async function loadServerHistory() {
      try {
        const remoteSessions = await fetchDashboardSessions()
        if (isCurrent) {
          setServerHistory(sortSessionsByDate(remoteSessions))
        }
      } catch {
        if (isCurrent) {
          setServerHistory([])
        }
      }
    }

    loadServerHistory()

    return () => {
      isCurrent = false
    }
  }, [apiStatus, screen])

  useEffect(() => {
    if (!isOnline || apiStatus !== 'online' || isSyncingRef.current) {
      return
    }

    const pendingSessions = history.filter((item) => item.pendingSync)
    if (pendingSessions.length === 0) {
      return
    }

    let isCurrent = true
    isSyncingRef.current = true
    setSyncState('syncing')

    async function runSync() {
      const syncedSessions = []

      try {
        for (const pendingSession of pendingSessions) {
          const response = await syncSession(pendingSession)
          syncedSessions.push(response.session)
        }

        if (!isCurrent) {
          return
        }

        if (syncedSessions.length > 0) {
          setHistory((current) => {
            const nextHistory = current.map((localSession) => {
              const syncedSession = syncedSessions.find((item) => item.id === localSession.id)
              return syncedSession ? { ...localSession, ...syncedSession, pendingSync: false } : localSession
            })
            saveSessionHistory(nextHistory)
            return nextHistory
          })

          setSession((current) => {
            if (!current) {
              return current
            }

            const syncedSession = syncedSessions.find((item) => item.id === current.id)
            return syncedSession ? { ...current, ...syncedSession, pendingSync: false } : current
          })

          const remoteSessions = await fetchDashboardSessions()
          if (isCurrent) {
            setServerHistory(sortSessionsByDate(remoteSessions))
            setSyncState('synced')
          }
        } else if (isCurrent) {
          setSyncState('idle')
        }
      } catch {
        if (isCurrent) {
          setSyncState('error')
        }
      } finally {
        isSyncingRef.current = false
      }
    }

    runSync()

    return () => {
      isCurrent = false
    }
  }, [apiStatus, history, isOnline])

  const currentDeck = useMemo(() => getPhaseDeck(session), [session])
  const currentQuestion = session ? currentDeck[session.currentQuestionIndex] : null
  const dashboardHistory = useMemo(
    () => mergeSessionHistory(history, serverHistory),
    [history, serverHistory],
  )

  function updateSession(mutator) {
    setSession((current) => {
      if (!current) {
        return current
      }

      const next = mutator(current)
      return {
        ...next,
        updatedAt: new Date().toISOString(),
      }
    })
  }

  function handleStart(participantName, className) {
    const nextSession = createSession(participantName, className)
    setSession(nextSession)
    setScreen('game')
  }

  function handleResume() {
    setScreen('game')
  }

  function handleAttempt(log) {
    updateSession((current) => ({
      ...current,
      logs: [...current.logs, log],
    }))
  }

  function handleQuestionComplete(result) {
    updateSession((current) => {
      const nextResults = [...current.results, result]
      const currentDeckSize = getPhaseDeck(current).length
      const isLastQuestion = current.currentQuestionIndex >= currentDeckSize - 1

      if (current.stage === 'pretest') {
        if (isLastQuestion) {
          return {
            ...current,
            results: nextResults,
            stage: 'tutorial',
            currentQuestionIndex: 0,
          }
        }

        return {
          ...current,
          results: nextResults,
          currentQuestionIndex: current.currentQuestionIndex + 1,
        }
      }

      if (current.stage === 'module') {
        if (isLastQuestion) {
          const moduleSummary = getSummaryForPhase(nextResults, 'module', current.currentModuleId)
          return {
            ...current,
            results: nextResults,
            stage: 'map',
            currentQuestionIndex: 0,
            currentModuleId: null,
            moduleProgress: {
              ...current.moduleProgress,
              [result.moduleId]: {
                completed: true,
                score: moduleSummary.averageScore,
                accuracy: moduleSummary.accuracy,
                stars: computeStars(moduleSummary.averageScore),
              },
            },
          }
        }

        return {
          ...current,
          results: nextResults,
          currentQuestionIndex: current.currentQuestionIndex + 1,
        }
      }

      if (current.stage === 'posttest') {
        if (isLastQuestion) {
          const finishedSession = {
            ...current,
            results: nextResults,
            stage: 'results',
            currentQuestionIndex: 0,
            currentModuleId: null,
            status: 'completed',
          }
          const nextHistory = appendSessionHistory(finishedSession)
          clearActiveSession()
          setHistory(nextHistory)
          return finishedSession
        }

        return {
          ...current,
          results: nextResults,
          currentQuestionIndex: current.currentQuestionIndex + 1,
        }
      }

      return current
    })
  }

  function openDashboard() {
    setScreen('dashboard')
  }

  function closeDashboard() {
    setScreen(session ? 'game' : 'welcome')
  }

  function handleStartModule(moduleId) {
    updateSession((current) => ({
      ...current,
      stage: 'module',
      currentModuleId: moduleId,
      currentQuestionIndex: 0,
    }))
    setScreen('game')
  }

  function handleStartPosttest() {
    updateSession((current) => ({
      ...current,
      stage: 'posttest',
      currentModuleId: null,
      currentQuestionIndex: 0,
    }))
  }

  function performResetSession() {
    setSession(null)
    clearActiveSession()
    setScreen('welcome')
  }

  function openConfirmDialog(config) {
    setConfirmDialog(config)
  }

  function closeConfirmDialog() {
    setConfirmDialog(null)
  }

  async function handleConfirmDialogConfirm() {
    if (!confirmDialog?.onConfirm) {
      return
    }

    const nextAction = confirmDialog.onConfirm
    setConfirmDialog(null)
    await nextAction()
  }

  function handleResetSession() {
    openConfirmDialog({
      title: 'Reset sesi aktif?',
      message: 'Progres yang belum selesai akan hilang dan peserta akan kembali ke halaman awal.',
      confirmLabel: 'Reset sesi',
      tone: 'warning',
      onConfirm: performResetSession,
    })
  }

  function handleNewSession() {
    setSession(null)
    setScreen('welcome')
  }

  async function performResetParticipant(participantName) {
    const nextHistory = history.filter((item) => getParticipantName(item) !== participantName)
    setHistory(nextHistory)
    saveSessionHistory(nextHistory)

    const nextServerHistory = serverHistory.filter((item) => getParticipantName(item) !== participantName)
    setServerHistory(nextServerHistory)

    if (getParticipantName(session) === participantName && session?.status !== 'completed') {
      setSession(null)
      clearActiveSession()
      setScreen('welcome')
    }

    if (apiStatus === 'online') {
      try {
        await deleteParticipant(participantName)
      } catch {
        setSyncState('error')
      }
    }
  }

  function handleResetParticipant(participantName) {
    openConfirmDialog({
      title: `Hapus riwayat ${participantName}?`,
      message: 'Semua data hasil belajar peserta ini akan dihapus dari tampilan dan penyimpanan lokal.',
      confirmLabel: 'Hapus riwayat',
      tone: 'danger',
      onConfirm: () => performResetParticipant(participantName),
    })
  }

  async function handleInstall() {
    if (!installPrompt) {
      return
    }

    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  async function handleExportCsv() {
    if (apiStatus === 'online') {
      try {
        const csv = await fetchDashboardCsv()
        downloadCsv(`petualangan-kata-hasil-${new Date().toISOString().slice(0, 10)}.csv`, csv)
        return
      } catch {
        setSyncState('error')
      }
    }

    if (dashboardHistory.length === 0) {
      return
    }

    const csv = buildCsv(dashboardHistory)
    downloadCsv(`petualangan-kata-hasil-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  const showAcademicIdentity = screen === 'welcome' || screen === 'dashboard'

  return (
    <main className={`app-shell app-shell--${screen}`}>
      <header className={`app-header app-header--${screen}`}>
        <div className="app-header__title">
          {showAcademicIdentity ? (
            <div className="app-header__institution" aria-label="Identitas universitas">
              <img src={universityIdentity.logo} alt="Logo Universitas Negeri Jakarta" />
              <span>{universityIdentity.name}</span>
            </div>
          ) : null}
          <div className="app-header__brand">
            <img src={appIdentity.logo} alt="Logo aplikasi Petualangan Kata" className="app-header__brand-logo" />
            <div className="app-header__brand-copy">
              <span className="eyebrow">Digital Game-Based Learning</span>
              <h1>{appIdentity.name}</h1>
            </div>
          </div>
          {showAcademicIdentity ? (
            <div className="app-header__subtitle">
              Media pembelajaran membaca dasar untuk kebutuhan penelitian tesis.
            </div>
          ) : null}
        </div>
        {session || screen !== 'welcome' ? (
          <div className="header-meta">
            {session ? <span className="status-pill soft">{getParticipantName(session)}</span> : null}
            {screen !== 'welcome' ? (
              <span className={`status-pill ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Tersambung' : 'Tidak tersambung'}
              </span>
            ) : null}
            {screen !== 'welcome' ? (
              <span className={`status-pill ${apiStatus === 'online' ? 'online' : 'offline'}`}>
                {apiStatus === 'online' ? 'Data aktif' : 'Data lokal'}
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      {screen === 'welcome' ? (
        <WelcomeScreen
          draftSession={session?.status === 'in_progress' ? session : null}
          installReady={Boolean(installPrompt)}
          onOpenDashboard={openDashboard}
          onResume={handleResume}
          onStart={handleStart}
          onInstall={handleInstall}
        />
      ) : null}

      {screen === 'dashboard' ? (
        <DashboardScreen
          history={dashboardHistory}
          pendingDraft={session?.status === 'in_progress' ? session : null}
          apiStatus={apiStatus}
          syncState={syncState}
          onBack={closeDashboard}
          onExportCsv={handleExportCsv}
          onResetParticipant={handleResetParticipant}
        />
      ) : null}

      {screen === 'game' && session?.stage === 'tutorial' ? (
        <TutorialScreen
          onContinue={() =>
            updateSession((current) => ({
              ...current,
              stage: 'map',
            }))
          }
        />
      ) : null}

      {screen === 'game' && session?.stage === 'map' ? (
        <MapScreen
          session={session}
          onOpenDashboard={openDashboard}
          onResetSession={handleResetSession}
          onStartModule={handleStartModule}
          onStartPosttest={handleStartPosttest}
        />
      ) : null}

      {screen === 'game' && currentQuestion ? (
        session.stage === 'pretest' || session.stage === 'module' || session.stage === 'posttest' ? (
          <ActivityScreen
            deck={currentDeck}
            phaseLabel={
              session.stage === 'module'
                ? modules.find((module) => module.id === session.currentModuleId)?.region ?? 'Level'
                : PHASE_LABELS[session.stage]
            }
            progressLabel={{
              currentIndex: session.currentQuestionIndex,
              phase: session.stage === 'module' ? 'module' : session.stage,
              moduleId: session.currentModuleId,
              progressText: `Soal ${session.currentQuestionIndex + 1} dari ${currentDeck.length}`,
            }}
            onAttempt={handleAttempt}
            onComplete={handleQuestionComplete}
          />
        ) : null
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel}
        cancelLabel={confirmDialog?.cancelLabel}
        tone={confirmDialog?.tone}
        onCancel={closeConfirmDialog}
        onConfirm={handleConfirmDialogConfirm}
      />

      {screen === 'game' && session?.stage === 'results' ? (
        <ResultsScreen
          session={session}
          onNewSession={handleNewSession}
          onOpenDashboard={openDashboard}
        />
      ) : null}
    </main>
  )
}

export default App
