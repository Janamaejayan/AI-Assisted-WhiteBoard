import { db, projects, WhiteBoardData } from '@/db'
import { currentUser } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { projectName, projectId } = await req.json();

        const user = await currentUser();

        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "Unauthenticated Request" },
                { status: 401 }
            );
        }

        if (!projectId || !projectName) {
            return NextResponse.json(
                { error: "Project Information is not available" },
                { status: 400 }
            );
        }

        const result = await db
            .insert(projects)
            .values({
                projectId,
                projectName,
                userEmail: user.primaryEmailAddress.emailAddress,

                // New projects are always active
                isDeleted: false,
                deletedAt: null,
            })
            .returning();

        return NextResponse.json(result[0]);

    } catch (error) {
        console.error("POST /api/projects error:", error);

        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;

        const projectId = searchParams.get("projectId");
        const archived = searchParams.get("archived") === "true";

        const user = await currentUser();

        // Check authentication first
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "Unauthenticated Request" },
                { status: 401 }
            );
        }

        const userEmail =
            user.primaryEmailAddress.emailAddress;

        // ============================================
        // GET ALL PROJECTS
        // ============================================

        if (!projectId) {
            const projectList = await db
                .select({
                    id: projects.id,
                    projectId: projects.projectId,
                    projectName: projects.projectName,
                    userEmail: projects.userEmail,
                    createdAt: projects.createdAt,
                    deletedAt: projects.deletedAt,

                    previewImage: WhiteBoardData.previewImage,
                    updatedAt: WhiteBoardData.updatedAt,
                })
                .from(projects)
                .leftJoin(
                    WhiteBoardData,
                    eq(
                        projects.projectId,
                        WhiteBoardData.projectId
                    )
                )
                .where(
                    and(
                        eq(projects.userEmail, userEmail),

                        // Normal dashboard → false
                        // Archive → true
                        archived
                            ? eq(projects.isDeleted, true)
                            : eq(projects.isDeleted, false)
                    )
                );

            return NextResponse.json(projectList);
        }

        // ============================================
        // GET SINGLE PROJECT
        // ============================================

        const userProject = await db
            .select()
            .from(projects)
            .where(
                and(
                    eq(projects.projectId, projectId),
                    eq(projects.userEmail, userEmail),
                    eq(projects.isDeleted, false)
                )
            );

        if (userProject.length === 0) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // ============================================
        // GET WHITEBOARD DATA
        // ============================================

        const result = await db
            .select()
            .from(WhiteBoardData)
            .where(
                eq(
                    WhiteBoardData.projectId,
                    projectId
                )
            );

        // Whiteboard data might not exist yet
        const whiteboardData = result[0] ?? {};

        return NextResponse.json({
            ...whiteboardData,
            projectName: userProject[0].projectName,
        });

    } catch (error) {
        console.error(
            "GET /api/projects error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to fetch project",
                details:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const projectId = searchParams.get("projectId");
    const permanent = searchParams.get("permanent") === "true";

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: "Unauthenticated Request" },
        { status: 401 }
      );
    }

    const userEmail = user.primaryEmailAddress.emailAddress;

    // Verify ownership
    const userProject = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, userEmail)
        )
      );

    if (userProject.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // ============================================
    // HARD DELETE
    // ============================================

    if (permanent) {

      // Delete whiteboard data first
      await db
        .delete(WhiteBoardData)
        .where(eq(WhiteBoardData.projectId, projectId));

      // Permanently delete project
      await db
        .delete(projects)
        .where(
          and(
            eq(projects.projectId, projectId),
            eq(projects.userEmail, userEmail)
          )
        );

      return NextResponse.json({
        success: true,
        message: "Project permanently deleted",
      });
    }

    // ============================================
    // SOFT DELETE
    // ============================================

    const deletedProject = await db
      .update(projects)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, userEmail),
          eq(projects.isDeleted, false)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: "Project moved to trash",
      project: deletedProject[0],
    });

  } catch (error) {
    console.error("DELETE /api/projects error:", error);

    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const projectId = searchParams.get("projectId");
    const action = searchParams.get("action");

    console.log("PATCH project:", {
      projectId,
      action,
    });

    if (!projectId || action !== "restore") {
      return NextResponse.json(
        { error: "Invalid restore request" },
        { status: 400 }
      );
    }

    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: "Unauthenticated Request" },
        { status: 401 }
      );
    }

    const userEmail = user.primaryEmailAddress.emailAddress;

    console.log("Restoring project for:", userEmail);

    // Check whether the archived project belongs to this user
    const existingProject = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, userEmail)
        )
      );

    console.log("Existing project:", existingProject);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!existingProject[0].isDeleted) {
      return NextResponse.json(
        { error: "Project is already active" },
        { status: 400 }
      );
    }

    // Restore
    const restoredProject = await db
      .update(projects)
      .set({
        isDeleted: false,
        deletedAt: null,
      })
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, userEmail)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: "Project restored successfully",
      project: restoredProject[0],
    });

  } catch (error) {
    console.error("PATCH /api/projects error:", error);

    return NextResponse.json(
      { error: "Failed to restore project" },
      { status: 500 }
    );
  }
}