import { db, projects, projectShares } from '@/db'
import { and, eq } from 'drizzle-orm'

export type ProjectAccess = 'owner' | 'edit' | 'view'

export async function getProjectAccess(projectId: string, email: string): Promise<ProjectAccess | null> {
  const [project] = await db.select({ ownerEmail: projects.userEmail })
    .from(projects)
    .where(and(eq(projects.projectId, projectId), eq(projects.isDeleted, false)))
    .limit(1)

  if (!project) return null
  if (project.ownerEmail.toLowerCase() === email.toLowerCase()) return 'owner'

  const [share] = await db.select({ permission: projectShares.permission })
    .from(projectShares)
    .where(and(
      eq(projectShares.projectId, projectId),
      eq(projectShares.email, email.toLowerCase())
    ))
    .limit(1)

  return share?.permission ?? null
}
