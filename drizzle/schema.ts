import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Campaign management tables
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  targetAudience: text("targetAudience"),
  duration: varchar("duration", { length: 100 }),
  platforms: text("platforms"), // JSON array
  status: mysqlEnum("status", ["planning", "creating", "publishing", "completed", "failed"]).default("planning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id),
  type: varchar("type", { length: 50 }).notNull(), // image, video
  mediaPath: text("mediaPath"),
  mediaUrl: text("mediaUrl"),
  caption: text("caption").notNull(),
  keywords: text("keywords"), // JSON array
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const publishedPosts = mysqlTable("publishedPosts", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id),
  contentId: int("contentId").notNull().references(() => contents.id),
  postId: varchar("postId", { length: 255 }), // Circlo post ID
  scheduledTime: varchar("scheduledTime", { length: 50 }),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type Content = typeof contents.$inferSelect;
export type InsertContent = typeof contents.$inferInsert;
export type PublishedPost = typeof publishedPosts.$inferSelect;
export type InsertPublishedPost = typeof publishedPosts.$inferInsert;

export const agentLogs = mysqlTable("agent_logs", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id),
  agentType: mysqlEnum("agentType", ["strategist", "creator", "engager"]).notNull(),
  action: text("action").notNull(),
  details: text("details"),
  level: mysqlEnum("level", ["info", "success", "warning", "error"]).default("info").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = typeof agentLogs.$inferInsert;

export const zapierWebhooks = mysqlTable("zapier_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "facebook", "twitter"]).notNull(),
  webhookUrl: text("webhookUrl").notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ZapierWebhook = typeof zapierWebhooks.$inferSelect;
export type InsertZapierWebhook = typeof zapierWebhooks.$inferInsert;