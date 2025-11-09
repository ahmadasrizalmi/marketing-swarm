import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Campaign management
  campaign: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserCampaigns } = await import('./db');
      return await getUserCampaigns(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'id' in val) {
          return val as { id: number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input }) => {
        const { getCampaign, getCampaignContents, getPublishedPosts } = await import('./db');
        const campaign = await getCampaign(input.id);
        if (!campaign) return null;
        
        const contents = await getCampaignContents(input.id);
        const posts = await getPublishedPosts(input.id);
        
        return {
          campaign,
          contents,
          posts
        };
      }),
    
    create: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'message' in val) {
          return val as { message: string };
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        const { strategistAgent } = await import('./agents');
        const response = await strategistAgent.handle(
          {
            history: [],
            message: input.message,
            user: ctx.user,
            profile: { name: 'Strategist' }
          },
          ctx.user.id
        );
        return { response };
      }),
  }),
  
  // Content gallery
  content: router({
    list: protectedProcedure
      .input((val: unknown) => {
        if (val === undefined || val === null) {
          return { campaignId: undefined };
        }
        if (typeof val === 'object' && 'campaignId' in val) {
          return val as { campaignId?: number };
        }
        return { campaignId: undefined };
      })
      .query(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { contents, campaigns } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const { desc } = await import('drizzle-orm');
        const db = await getDb();
        if (!db) return [];
        
        // Build query based on filter
        if (input.campaignId) {
          // Filter by specific campaign
          const result = await db
            .select({
              id: contents.id,
              campaignId: contents.campaignId,
              type: contents.type,
              mediaPath: contents.mediaPath,
              mediaUrl: contents.mediaUrl,
              caption: contents.caption,
              keywords: contents.keywords,
              status: contents.status,
              createdAt: contents.createdAt,
              campaignName: campaigns.name,
              campaignStatus: campaigns.status,
            })
            .from(contents)
            .innerJoin(campaigns, eq(contents.campaignId, campaigns.id))
            .where(eq(contents.campaignId, input.campaignId))
            .orderBy(desc(contents.createdAt));
          return result;
        } else {
          // Get all contents for user's campaigns
          const result = await db
            .select({
              id: contents.id,
              campaignId: contents.campaignId,
              type: contents.type,
              mediaPath: contents.mediaPath,
              mediaUrl: contents.mediaUrl,
              caption: contents.caption,
              keywords: contents.keywords,
              status: contents.status,
              createdAt: contents.createdAt,
              campaignName: campaigns.name,
              campaignStatus: campaigns.status,
            })
            .from(contents)
            .innerJoin(campaigns, eq(contents.campaignId, campaigns.id))
            .where(eq(campaigns.userId, ctx.user.id))
            .orderBy(desc(contents.createdAt));
          return result;
        }
      }),
  }),
  
  // Zapier webhooks
  zapier: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserWebhooks } = await import('./db');
      return await getUserWebhooks(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'platform' in val && 'webhookUrl' in val) {
          return val as { platform: string; webhookUrl: string };
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        const { createZapierWebhook } = await import('./db');
        const webhookId = await createZapierWebhook({
          userId: ctx.user.id,
          platform: input.platform as any,
          webhookUrl: input.webhookUrl,
          isActive: 1,
        });
        return { id: webhookId };
      }),
    
    delete: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'id' in val) {
          return val as { id: number };
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ input }) => {
        const { deleteWebhook } = await import('./db');
        await deleteWebhook(input.id);
        return { success: true };
      }),
    
    toggle: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'id' in val && 'isActive' in val) {
          return val as { id: number; isActive: number };
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ input }) => {
        const { toggleWebhook } = await import('./db');
        await toggleWebhook(input.id, input.isActive);
        return { success: true };
      }),
  }),
  
  // Agent logs
  logs: router({
    getCampaignLogs: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'campaignId' in val) {
          return val as { campaignId: number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input }) => {
        const { getCampaignLogs } = await import('./db');
        return await getCampaignLogs(input.campaignId);
      }),
  }),
  
  // Agent webhook handler (public endpoint for Circlo)
  agentWebhook: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null) {
        return val as any;
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input }) => {
      const { strategistAgent, creatorAgent, engagerAgent } = await import('./agents');
      const { profile, message, user, history } = input;
      
      let response: string;
      
      // Route to appropriate agent based on profile
      if (profile?.username?.includes('strategist')) {
        response = await strategistAgent.handle(input, user?.id || 1);
      } else if (profile?.username?.includes('creator')) {
        response = await creatorAgent.handle(input);
      } else if (profile?.username?.includes('engager')) {
        response = await engagerAgent.handle(input);
      } else {
        response = "I'm not sure how to help with that.";
      }
      
      return { response };
    }),
});

export type AppRouter = typeof appRouter;
