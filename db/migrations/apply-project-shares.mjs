import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

const statements = readFileSync(
  new URL('./20261011_project_shares.sql', import.meta.url), 'utf8'
).split(';').map((statement) => statement.trim()).filter(Boolean)

const sql = neon(process.env.DATABASE_URL)
await sql.transaction(statements.map((statement) => sql.query(statement)))
console.log('Project shares migration applied')
