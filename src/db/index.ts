import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Allow build to proceed without DATABASE_URL (for static generation)
const connectionString = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db'
const sql = neon(connectionString)

export const db = drizzle(sql, { schema })
