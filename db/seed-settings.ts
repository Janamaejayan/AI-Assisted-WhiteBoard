import "dotenv/config";

import { db, users, userSettings } from "@/db";
import { eq } from "drizzle-orm";

async function seedUserSettings() {
  try {
    const existingUsers = await db
      .select({
        id: users.id,
      })
      .from(users);

    for (const user of existingUsers) {
      await db
        .insert(userSettings)
        .values({
          userId: user.id,
        })
        .onConflictDoNothing({
          target: userSettings.userId,
        });
    }

    console.log(
      "Default settings created for existing users."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to seed user settings:",
      error
    );

    process.exit(1);
  }
}

seedUserSettings();