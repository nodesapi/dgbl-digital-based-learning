import pg from 'pg'
import { dbConfig } from '../config.js'

const { Client } = pg

async function createDatabaseIfNeeded() {
  const adminClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres',
  })

  await adminClient.connect()

  try {
    const existsResult = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbConfig.database],
    )

    if (existsResult.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${dbConfig.database}"`)
      console.log(`Database ${dbConfig.database} created.`)
    } else {
      console.log(`Database ${dbConfig.database} already exists.`)
    }
  } finally {
    await adminClient.end()
  }
}

async function createTables() {
  const appClient = new Client(dbConfig)
  await appClient.connect()

  try {
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS participants (
        participant_code TEXT PRIMARY KEY,
        class_group TEXT NOT NULL DEFAULT 'Belum diisi',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        participant_code TEXT NOT NULL REFERENCES participants(participant_code) ON DELETE CASCADE,
        class_group TEXT NOT NULL,
        started_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        completed_at TIMESTAMPTZ,
        status TEXT NOT NULL,
        pending_sync BOOLEAN NOT NULL DEFAULT FALSE,
        pretest_accuracy INTEGER NOT NULL DEFAULT 0,
        posttest_accuracy INTEGER NOT NULL DEFAULT 0,
        total_stars INTEGER NOT NULL DEFAULT 0,
        raw_session JSONB NOT NULL DEFAULT '{}'::jsonb
      );

      CREATE TABLE IF NOT EXISTS module_progress (
        session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
        module_id TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        score INTEGER NOT NULL DEFAULT 0,
        accuracy INTEGER NOT NULL DEFAULT 0,
        stars INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (session_id, module_id)
      );

      CREATE TABLE IF NOT EXISTS answer_logs (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        module_id TEXT NOT NULL DEFAULT '',
        attempt INTEGER NOT NULL,
        answer JSONB,
        is_correct BOOLEAN NOT NULL,
        help_used BOOLEAN NOT NULL DEFAULT FALSE,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        answered_at TIMESTAMPTZ NOT NULL,
        UNIQUE (session_id, question_id, phase, module_id, attempt)
      );

      CREATE TABLE IF NOT EXISTS question_results (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        module_id TEXT NOT NULL DEFAULT '',
        answer JSONB,
        is_correct BOOLEAN NOT NULL,
        help_used BOOLEAN NOT NULL DEFAULT FALSE,
        attempts INTEGER NOT NULL DEFAULT 1,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        score INTEGER NOT NULL DEFAULT 0,
        answered_at TIMESTAMPTZ NOT NULL,
        UNIQUE (session_id, question_id, phase, module_id)
      );
    `)

    console.log('Tables are ready.')
  } finally {
    await appClient.end()
  }
}

async function main() {
  await createDatabaseIfNeeded()
  await createTables()
}

main().catch((error) => {
  console.error('Database initialization failed.')
  console.error(error)
  process.exitCode = 1
})
