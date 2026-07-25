import pg from 'pg'
import { dbConfig } from './config.js'

const { Pool } = pg

export const pool = new Pool(dbConfig)

export async function query(text, params = []) {
  return pool.query(text, params)
}

export async function withTransaction(work) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function checkDatabase() {
  const result = await query('SELECT NOW() AS now')
  return result.rows[0]
}
