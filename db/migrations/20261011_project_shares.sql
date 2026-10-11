CREATE TYPE "project_share_permission" AS ENUM ('view', 'edit');

CREATE TABLE "project_shares" (
  "id" serial PRIMARY KEY,
  "project_id" varchar NOT NULL REFERENCES "projects"("projectId") ON DELETE CASCADE,
  "email" text NOT NULL,
  "permission" "project_share_permission" NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "project_shares_project_email_unique"
  ON "project_shares" ("project_id", "email");
