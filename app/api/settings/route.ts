import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, userSettings } from "@/db/schema";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = user.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    /* ================= FIND USER ================= */

    const userResult = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = userResult[0].id;

    /* ================= GET SETTINGS ================= */

    const settingsResult = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (settingsResult.length === 0) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    const settings = settingsResult[0];

    /*
     * Map DB column names to frontend names.
     */
    return NextResponse.json({
      success: true,
      settings: {
        theme: settings.theme,
        diagramColor: settings.defaultDiagramColor,
        strokeWidth: settings.defaultStrokeWidth,
        backgroundColor: settings.defaultBackgroundColor,
        sharingPermission:
          settings.defaultSharingPermission,
      },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);

    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = user.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      theme,
      diagramColor,
      strokeWidth,
      backgroundColor,
      sharingPermission,
    } = body;

    /* ================= VALIDATION ================= */

    if (
      theme !== undefined &&
      !["light", "dark", "system"].includes(theme)
    ) {
      return NextResponse.json(
        { error: "Invalid theme" },
        { status: 400 }
      );
    }

    if (
      diagramColor !== undefined &&
      typeof diagramColor !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid diagram color" },
        { status: 400 }
      );
    }

    if (
      strokeWidth !== undefined &&
      (
        typeof strokeWidth !== "number" ||
        strokeWidth < 1 ||
        strokeWidth > 8
      )
    ) {
      return NextResponse.json(
        { error: "Invalid stroke width" },
        { status: 400 }
      );
    }

    if (
      backgroundColor !== undefined &&
      typeof backgroundColor !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid background color" },
        { status: 400 }
      );
    }

    if (
      sharingPermission !== undefined &&
      !["private", "view", "edit"].includes(
        sharingPermission
      )
    ) {
      return NextResponse.json(
        { error: "Invalid sharing permission" },
        { status: 400 }
      );
    }

    /* ================= FIND USER ================= */

    const userResult = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = userResult[0].id;

    /* ================= CHECK SETTINGS ================= */

    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    /* ================= UPDATE SETTINGS ================= */

    const updated = await db
      .update(userSettings)
      .set({
        ...(theme !== undefined && {
          theme,
        }),

        ...(diagramColor !== undefined && {
          defaultDiagramColor: diagramColor,
        }),

        ...(strokeWidth !== undefined && {
          defaultStrokeWidth: strokeWidth,
        }),

        ...(backgroundColor !== undefined && {
          defaultBackgroundColor: backgroundColor,
        }),

        ...(sharingPermission !== undefined && {
          defaultSharingPermission: sharingPermission,
        }),

        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    const settings = updated[0];

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      settings: {
        theme: settings.theme,
        diagramColor: settings.defaultDiagramColor,
        strokeWidth: settings.defaultStrokeWidth,
        backgroundColor:
          settings.defaultBackgroundColor,
        sharingPermission:
          settings.defaultSharingPermission,
      },
    });
  } catch (error) {
    console.error("PATCH /api/settings error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update settings",
      },
      { status: 500 }
    );
  }
}