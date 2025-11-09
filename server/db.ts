import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, campaigns, InsertCampaign, contents, InsertContent, publishedPosts, InsertPublishedPost, agentLogs, InsertAgentLog, zapierWebhooks, InsertZapierWebhook } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Campaign management queries
export async function createCampaign(data: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(campaigns).values(data);
  return result[0].insertId;
}

export async function getCampaign(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result[0] || null;
}

export async function updateCampaignStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(campaigns).set({ status: status as any }).where(eq(campaigns.id, id));
}

export async function createContent(data: InsertContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contents).values(data);
  return result[0].insertId;
}

export async function getCampaignContents(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contents).where(eq(contents.campaignId, campaignId));
}

export async function createPublishedPost(data: InsertPublishedPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(publishedPosts).values(data);
  return result[0].insertId;
}

export async function getPublishedPosts(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(publishedPosts).where(eq(publishedPosts.campaignId, campaignId));
}

export async function getUserCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
}

// Agent logging functions
export async function createAgentLog(data: InsertAgentLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(agentLogs).values(data);
  return result[0].insertId;
}

export async function getCampaignLogs(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(agentLogs).where(eq(agentLogs.campaignId, campaignId));
}

// Zapier webhook functions
export async function createZapierWebhook(data: InsertZapierWebhook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(zapierWebhooks).values(data);
  return result[0].insertId;
}

export async function getUserWebhooks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(zapierWebhooks).where(eq(zapierWebhooks.userId, userId));
}

export async function deleteWebhook(webhookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(zapierWebhooks).where(eq(zapierWebhooks.id, webhookId));
}

export async function toggleWebhook(webhookId: number, isActive: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(zapierWebhooks)
    .set({ isActive })
    .where(eq(zapierWebhooks.id, webhookId));
}
