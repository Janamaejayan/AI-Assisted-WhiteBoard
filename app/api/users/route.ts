import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  db,
  users,
  userSettings,
} from "@/db";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const user = await currentUser();

    // --------------------------------------------------
    // Check Clerk user
    // --------------------------------------------------

    if (!user) {
      return NextResponse.json(
        { message: "User Not Found" },
        { status: 404 }
      );
    }

    const email =
      user.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { message: "User email not found" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Check if user already exists
    // --------------------------------------------------

    const userData = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // --------------------------------------------------
    // EXISTING USER
    // --------------------------------------------------

    if (userData.length > 0) {
      const existingUser = userData[0];

      // Make sure existing user has settings
      const existingSettings = await db
        .select()
        .from(userSettings)
        .where(
          eq(
            userSettings.userId,
            existingUser.id
          )
        )
        .limit(1);

      // If settings don't exist, create them
      // Schema defaults will be used automatically
      if (existingSettings.length === 0) {
        await db.insert(userSettings).values({
          userId: existingUser.id,
        });
      }

      return NextResponse.json(existingUser);
    }

    // --------------------------------------------------
    // NEW USER
    // --------------------------------------------------

    const result = await db
      .insert(users)
      .values({
        name: user.fullName,
        email: email,
      })
      .returning();

    const newUser = result[0];

    // --------------------------------------------------
    // CREATE DEFAULT SETTINGS
    // --------------------------------------------------

    await db.insert(userSettings).values({
      userId: newUser.id,
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error(
      "POST /api/users error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to create/fetch user",
      },
      { status: 500 }
    );
  }
}