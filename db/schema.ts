import { boolean, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const themeEnum = pgEnum("theme", [
  "light",
  "dark",
  "system",
]);

export const sharingPermissionEnum = pgEnum(
  "sharing_permission",
  [
    "private",
    "view",
    "edit",
  ]
);

export const projectSharePermissionEnum = pgEnum("project_share_permission", ["view", "edit"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  credits: integer('credits').default(10).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  projectId: varchar('projectId').notNull().unique(),
  projectName: varchar('projectName').notNull(),
  userEmail: varchar('userEmail').notNull(),
  createdAt : timestamp("created_at").defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
})

export const WhiteBoardData = pgTable('whiteBoardData', {
  id: serial("id").primaryKey(),
  projectId: varchar('projectId').notNull().unique().references(() => projects.projectId),
  elements: jsonb('elements'),
  appState: jsonb('appState'),
  files: jsonb('files'),
  previewImage : text('previewImage'),
  updatedAt: timestamp("created_at").defaultNow().notNull(),
})

export const projectShares = pgTable('project_shares', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id').notNull().references(() => projects.projectId, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  permission: projectSharePermissionEnum('permission').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [uniqueIndex('project_shares_project_email_unique').on(table.projectId, table.email)]);

export const userSettings = pgTable("user_settings",{
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    theme: themeEnum("theme").default("light").notNull(),

    defaultDiagramColor: varchar("default_diagram_color",{ length: 20 })
      .default("#000000")
      .notNull(),

    defaultStrokeWidth: integer("default_stroke_width")
      .default(2)
      .notNull(),

    defaultBackgroundColor: varchar("default_background_color",
      { length: 20 })
      .default("#ffffff")
      .notNull(),

    defaultSharingPermission:
      sharingPermissionEnum(
        "default_sharing_permission")
        .default("private")
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type WhiteBoard = typeof WhiteBoardData.$inferSelect;
export type NewWhiteBoard = typeof WhiteBoardData.$inferInsert;
