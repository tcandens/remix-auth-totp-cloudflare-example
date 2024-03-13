import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from '@paralleldrive/cuid2'
import { createInsertSchema } from 'drizzle-zod'

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SessionUser = Pick<User, "id" | "email">;

export const settings = sqliteTable('settings', {
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  values: text('values', { mode: 'json' }).default('{}'),
})

export type Settings = typeof settings.$inferSelect
export type InsertSettings = typeof settings.$inferInsert

export const messages = sqliteTable("messages", {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  content: text("content").notNull(),
  agent: text("agent").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const committees = sqliteTable('committees', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
export const insertCommitteeSchema = createInsertSchema(committees)
export type Committee = typeof committees.$inferSelect
export type InsertCommittee = typeof committees.$inferInsert

export const members = sqliteTable('members', {
  id: integer('id').primaryKey(),
  role: text('role').$type<'owner' | 'user' | 'admin'>().default('user').notNull(),
  committeeId: text('committee_id').references(() => committees.id, { onDelete: 'cascade'}).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`),
})
export type Member = typeof members.$inferSelect
export type InsertMember = typeof members.$inferInsert

export const invites = sqliteTable('invites', {
  id: integer('id').primaryKey(),
  invitingEmail: text('inviting_email').notNull(),
  fromMemberId: integer('from_member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
  acceptedAt: integer("accepted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
export type Invite = typeof invites.$inferSelect
export type InsertInvite = typeof invites.$inferInsert
export const insertInviteSchema = createInsertSchema(invites)
