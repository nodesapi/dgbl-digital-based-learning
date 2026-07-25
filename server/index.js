import cors from 'cors'
import express from 'express'
import { dbConfig, serverConfig } from './config.js'
import { checkDatabase, query, withTransaction } from './db.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

function buildSummary(results = [], phase) {
  const filtered = results.filter((item) => item.phase === phase)
  const total = filtered.length
  const totalScore = filtered.reduce((sum, item) => sum + (item.score ?? 0), 0)

  return {
    accuracy: total === 0 ? 0 : Math.round((filtered.filter((item) => item.isCorrect).length / total) * 100),
    averageScore: total === 0 ? 0 : Math.round(totalScore / total),
  }
}

function getTotalStars(moduleProgress = {}) {
  return Object.values(moduleProgress).reduce((sum, module) => sum + (module.stars ?? 0), 0)
}

function normalizeSession(session) {
  const pretest = buildSummary(session.results, 'pretest')
  const posttest = buildSummary(session.results, 'posttest')
  const participantName = session.participantName ?? session.participantCode ?? ''
  const className = session.className ?? session.classGroup ?? 'Belum diisi'

  return {
    ...session,
    participantName,
    className,
    participantCode: participantName,
    classGroup: className,
    pendingSync: false,
    syncedAt: new Date().toISOString(),
    pretestAccuracy: pretest.accuracy,
    posttestAccuracy: posttest.accuracy,
    totalStars: getTotalStars(session.moduleProgress),
  }
}

function serializeCsvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function buildLogsCsv(sessions, logs) {
  const sessionMap = new Map(sessions.map((session) => [session.id, session]))
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
    'answered_at',
  ]

  const rows = logs.map((log) => {
    const session = sessionMap.get(log.session_id)
    return [
      log.session_id,
      session?.participant_code ?? '',
      session?.class_group ?? '',
      log.phase,
      log.module_id,
      log.question_id,
      log.attempt,
      JSON.stringify(log.answer ?? ''),
      log.is_correct,
      log.help_used,
      log.duration_ms,
      log.answered_at,
    ]
  })

  return [header, ...rows]
    .map((row) => row.map(serializeCsvValue).join(','))
    .join('\n')
}

app.get('/api/health', async (_request, response) => {
  try {
    const database = await checkDatabase()
    response.json({
      ok: true,
      database: 'connected',
      now: database.now,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
      },
    })
  } catch (error) {
    response.status(503).json({
      ok: false,
      database: 'disconnected',
      message: error.message,
    })
  }
})

app.post('/api/sync/session', async (request, response) => {
  const session = request.body

  if (!session?.id || !(session?.participantName || session?.participantCode)) {
    response.status(400).json({
      ok: false,
      message: 'Session payload is incomplete.',
    })
    return
  }

  const normalizedSession = normalizeSession(session)

  try {
    await withTransaction(async (client) => {
      await client.query(
        `
          INSERT INTO participants (participant_code, class_group, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW())
          ON CONFLICT (participant_code)
          DO UPDATE SET class_group = EXCLUDED.class_group, updated_at = NOW()
        `,
        [normalizedSession.participantCode, normalizedSession.classGroup],
      )

      await client.query(
        `
          INSERT INTO game_sessions (
            id,
            participant_code,
            class_group,
            started_at,
            updated_at,
            completed_at,
            status,
            pending_sync,
            pretest_accuracy,
            posttest_accuracy,
            total_stars,
            raw_session
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9, $10, $11::jsonb)
          ON CONFLICT (id)
          DO UPDATE SET
            participant_code = EXCLUDED.participant_code,
            class_group = EXCLUDED.class_group,
            started_at = EXCLUDED.started_at,
            updated_at = EXCLUDED.updated_at,
            completed_at = EXCLUDED.completed_at,
            status = EXCLUDED.status,
            pending_sync = FALSE,
            pretest_accuracy = EXCLUDED.pretest_accuracy,
            posttest_accuracy = EXCLUDED.posttest_accuracy,
            total_stars = EXCLUDED.total_stars,
            raw_session = EXCLUDED.raw_session
        `,
        [
          normalizedSession.id,
          normalizedSession.participantCode,
          normalizedSession.classGroup,
          normalizedSession.startedAt,
          normalizedSession.updatedAt,
          normalizedSession.status === 'completed' ? normalizedSession.updatedAt : null,
          normalizedSession.status,
          normalizedSession.pretestAccuracy,
          normalizedSession.posttestAccuracy,
          normalizedSession.totalStars,
          JSON.stringify(normalizedSession),
        ],
      )

      await client.query('DELETE FROM module_progress WHERE session_id = $1', [normalizedSession.id])
      await client.query('DELETE FROM answer_logs WHERE session_id = $1', [normalizedSession.id])
      await client.query('DELETE FROM question_results WHERE session_id = $1', [normalizedSession.id])

      const moduleEntries = Object.entries(normalizedSession.moduleProgress ?? {})
      for (const [moduleId, moduleProgress] of moduleEntries) {
        await client.query(
          `
            INSERT INTO module_progress (
              session_id,
              module_id,
              completed,
              score,
              accuracy,
              stars,
              updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
          `,
          [
            normalizedSession.id,
            moduleId,
            moduleProgress.completed ?? false,
            moduleProgress.score ?? 0,
            moduleProgress.accuracy ?? 0,
            moduleProgress.stars ?? 0,
          ],
        )
      }

      for (const log of normalizedSession.logs ?? []) {
        await client.query(
          `
            INSERT INTO answer_logs (
              session_id,
              question_id,
              phase,
              module_id,
              attempt,
              answer,
              is_correct,
              help_used,
              duration_ms,
              answered_at
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)
          `,
          [
            normalizedSession.id,
            log.questionId,
            log.phase,
            log.moduleId ?? '',
            log.attempt,
            JSON.stringify(log.answer ?? null),
            log.isCorrect,
            log.helpUsed ?? false,
            log.durationMs ?? 0,
            log.answeredAt,
          ],
        )
      }

      for (const result of normalizedSession.results ?? []) {
        await client.query(
          `
            INSERT INTO question_results (
              session_id,
              question_id,
              phase,
              module_id,
              answer,
              is_correct,
              help_used,
              attempts,
              duration_ms,
              score,
              answered_at
            )
            VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11)
          `,
          [
            normalizedSession.id,
            result.questionId,
            result.phase,
            result.moduleId ?? '',
            JSON.stringify(result.answer ?? null),
            result.isCorrect,
            result.helpUsed ?? false,
            result.attempts ?? 1,
            result.durationMs ?? 0,
            result.score ?? 0,
            result.answeredAt,
          ],
        )
      }
    })

    response.json({
      ok: true,
      session: normalizedSession,
    })
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error.message,
    })
  }
})

app.get('/api/dashboard/sessions', async (_request, response) => {
  try {
    const result = await query(
      `
        SELECT raw_session
        FROM game_sessions
        ORDER BY started_at DESC
      `,
    )

    response.json({
      ok: true,
      sessions: result.rows.map((row) => row.raw_session),
    })
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error.message,
    })
  }
})

app.get('/api/dashboard/export.csv', async (_request, response) => {
  try {
    const sessionsResult = await query(
      'SELECT id, participant_code, class_group FROM game_sessions ORDER BY started_at DESC',
    )
    const logsResult = await query(
      `
        SELECT session_id, question_id, phase, module_id, attempt, answer, is_correct, help_used, duration_ms, answered_at
        FROM answer_logs
        ORDER BY answered_at DESC
      `,
    )

    const csv = buildLogsCsv(sessionsResult.rows, logsResult.rows)
    response.setHeader('Content-Type', 'text/csv; charset=utf-8')
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="petualangan-kata-hasil-${new Date().toISOString().slice(0, 10)}.csv"`,
    )
    response.send(csv)
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error.message,
    })
  }
})

app.delete('/api/dashboard/participants/:participantCode', async (request, response) => {
  const participantCode = request.params.participantCode

  try {
    await query('DELETE FROM participants WHERE participant_code = $1', [participantCode])
    response.json({
      ok: true,
      participantCode,
    })
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error.message,
    })
  }
})

app.listen(serverConfig.port, () => {
  console.log(`Petualangan Kata API listening on http://localhost:${serverConfig.port}`)
})
