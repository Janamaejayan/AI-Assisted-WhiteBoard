import { neonClient } from '@/db'

async function retrySerialization<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if ((error as { code?: string }).code !== '40001' || attempt === 2) {
        throw error
      }
    }
  }

  throw new Error('Could not complete board operation')
}

export async function createProjectWithinLimit(
  projectId: string,
  projectName: string,
  userEmail: string
) {
  return retrySerialization(async () => {
    const [rows] = await neonClient.transaction([
      neonClient`
        INSERT INTO "projects" ("projectId", "projectName", "userEmail", "is_deleted", "deleted_at")
        SELECT ${projectId}, ${projectName}, ${userEmail}, false, NULL
        FROM "users" AS u
        WHERE u."email" = ${userEmail}
          AND (SELECT count(*) FROM "projects" AS p
               WHERE p."userEmail" = ${userEmail} AND p."is_deleted" = false) < COALESCE(u."credits", 0)
        RETURNING *
      `,
    ], { isolationLevel: 'Serializable' })

    return rows[0] ?? null
  })
}

export async function restoreProjectWithinLimit(
  projectId: string,
  userEmail: string
) {
  return retrySerialization(async () => {
    const [rows] = await neonClient.transaction([
      neonClient`
        UPDATE "projects" AS p
        SET "is_deleted" = false, "deleted_at" = NULL
        WHERE p."projectId" = ${projectId}
          AND p."userEmail" = ${userEmail}
          AND p."is_deleted" = true
          AND (SELECT count(*) FROM "projects" AS active
               WHERE active."userEmail" = ${userEmail} AND active."is_deleted" = false)
              < (SELECT COALESCE(u."credits", 0) FROM "users" AS u WHERE u."email" = ${userEmail})
        RETURNING *
      `,
    ], { isolationLevel: 'Serializable' })

    return rows[0] ?? null
  })
}
