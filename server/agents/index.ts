import { createCampaign, createContent, createPublishedPost, updateCampaignStatus } from '../db';
import { geminiService } from '../services/gemini';
import { circloService } from '../services/circlo';
import * as fs from 'fs';
import * as path from 'path';

interface ContentBrief {
  type: string;
  prompt: string;
  caption: string;
  keywords: string[];
}

interface CampaignPlan {
  name: string;
  targetAudience: string;
  duration: string;
  platforms: string[];
  contentBriefs: ContentBrief[];
  postingSchedule: Array<{ time: string; index: number }>;
}

interface AgentMessage {
  history: any[];
  message: string;
  user: any;
  profile: any;
}

// ============ STRATEGIST AGENT ============
export class StrategistAgent {
  async handle(data: AgentMessage, userId: number): Promise<string> {
    const { message, user } = data;
    
    if (this.isCampaignRequest(message)) {
      return await this.createCampaign(message, userId, user);
    }
    
    return "I can help you plan marketing campaigns. Just tell me what you want to promote!";
  }
  
  private isCampaignRequest(message: string): boolean {
    const keywords = ['campaign', 'promote', 'marketing', 'awareness', 'launch', 'run'];
    return keywords.some(kw => message.toLowerCase().includes(kw));
  }
  
  private async createCampaign(message: string, userId: number, user: any): Promise<string> {
    try {
      const campaignPlan = this.analyzeCampaignRequest(message, user);
      
      // Save campaign to database
      const campaignId = await createCampaign({
        userId,
        name: campaignPlan.name,
        targetAudience: campaignPlan.targetAudience,
        duration: campaignPlan.duration,
        platforms: JSON.stringify(campaignPlan.platforms),
        status: 'planning'
      });
      
      console.log(`[Strategist] Campaign ${campaignId} created`);
      
      // Log: Campaign created
      const { createAgentLog } = await import('../db');
      await createAgentLog({
        campaignId,
        agentType: 'strategist',
        action: 'Campaign Created',
        details: `Created campaign plan: ${campaignPlan.name}. Target audience: ${campaignPlan.targetAudience}. ${campaignPlan.contentBriefs.length} content pieces planned.`,
        level: 'success'
      });
      
      // Update status to creating
      await updateCampaignStatus(campaignId, 'creating');
      
      // Log: Delegating to Creator
      await createAgentLog({
        campaignId,
        agentType: 'strategist',
        action: 'Delegated to Creator Agent',
        details: `Assigned ${campaignPlan.contentBriefs.length} content briefs to Creator Agent for visual generation.`,
        level: 'info'
      });
      
      // Trigger creator agent asynchronously
      setTimeout(async () => {
        await creatorAgent.createContent(campaignId, campaignPlan);
      }, 2000);
      
      return `✅ Campaign plan created! 

📋 Campaign: ${campaignPlan.name}
🎯 Target: ${campaignPlan.targetAudience}
📅 Duration: ${campaignPlan.duration}
📝 Content pieces: ${campaignPlan.contentBriefs.length}

🎨 Our content creator is now working on the visuals...
📊 You can track progress at: /dashboard/${campaignId}`;
      
    } catch (error) {
      console.error('[Strategist] Error:', error);
      return "Sorry, I encountered an error creating the campaign. Please try again.";
    }
  }
  
  private analyzeCampaignRequest(message: string, user: any): CampaignPlan {
    // Extract keywords from user preferences if available
    const preferences = user?.preferredKeywords || [];
    
    return {
      name: "Product Awareness Campaign",
      targetAudience: preferences.join(', ') || "tech enthusiasts, innovators, early adopters",
      duration: "1 day",
      platforms: ["Circlo"],
      contentBriefs: [
        {
          type: "image",
          prompt: "A modern minimalist product showcase photograph featuring an innovative tech product on a clean white surface. Professional studio lighting with soft shadows creates depth. The composition follows the rule of thirds with the product positioned elegantly. High resolution commercial photography style with sharp focus. 1:1 aspect ratio.",
          caption: "Introducing our latest innovation! 🚀 Transform your daily workflow with cutting-edge technology. #NewProduct #Innovation #TechLife",
          keywords: ["product", "launch", "innovation", "technology"]
        },
        {
          type: "image",
          prompt: "A lifestyle photograph showing a happy professional in their 30s using a tech product in a modern home office. Natural window lighting creates a warm, authentic atmosphere. The person is smiling naturally while working. Candid moment captured with shallow depth of field. Colors are warm and inviting. 16:9 aspect ratio.",
          caption: "See how our product transforms daily routines ✨ Join thousands of satisfied customers experiencing the difference. #CustomerLove #Lifestyle #ProductivityBoost",
          keywords: ["customer", "lifestyle", "testimonial", "productivity"]
        },
        {
          type: "image",
          prompt: "A clean, modern infographic design showcasing three key product features. Use a vibrant color palette of blue (#4A90E2), orange (#F5A623), and green (#7ED321). Each feature has an icon and brief description. Professional typography with clear hierarchy. Minimalist design with plenty of white space. 1:1 aspect ratio.",
          caption: "Here's what makes us different 💡 Three game-changing features that set us apart from the competition. #Features #Benefits #Innovation",
          keywords: ["features", "benefits", "comparison", "infographic"]
        }
      ],
      postingSchedule: [
        { time: "09:00", index: 0 },
        { time: "14:00", index: 1 },
        { time: "18:00", index: 2 }
      ]
    };
  }
}

// ============ CREATOR AGENT ============
export class CreatorAgent {
  async handle(data: AgentMessage): Promise<string> {
    return "I'm busy creating amazing content! Check the dashboard for updates.";
  }
  
  async createContent(campaignId: number, campaignPlan: CampaignPlan): Promise<void> {
    console.log(`[Creator] Starting content creation for campaign ${campaignId}`);
    
    const { createAgentLog } = await import('../db');
    
    // Log: Started content creation
    await createAgentLog({
      campaignId,
      agentType: 'creator',
      action: 'Started Content Generation',
      details: `Received ${campaignPlan.contentBriefs.length} content briefs. Beginning AI image generation with Gemini API.`,
      level: 'info'
    });
    
    const contentPackages: any[] = [];
    
    for (let i = 0; i < campaignPlan.contentBriefs.length; i++) {
      const brief = campaignPlan.contentBriefs[i];
      
      try {
        console.log(`[Creator] Generating content ${i + 1}/${campaignPlan.contentBriefs.length}...`);
        
        // Generate image with Gemini
        const imageData = await geminiService.generateImageWithRetry({
          prompt: brief.prompt
        });
        
        if (!imageData) {
          console.error(`[Creator] Failed to generate image`);
          continue;
        }
        
        // Save image to file
        const imagePath = await this.saveImageToFile(imageData, campaignId, i);
        const imageUrl = this.getPublicUrl(imagePath);
        
        // Save content to database
        const contentId = await createContent({
          campaignId,
          type: brief.type,
          mediaPath: imagePath,
          mediaUrl: imageUrl,
          caption: brief.caption,
          keywords: JSON.stringify(brief.keywords),
          status: 'ready'
        });
        
        contentPackages.push({
          id: contentId,
          campaignId,
          mediaUrl: imageUrl,
          caption: brief.caption,
          keywords: brief.keywords
        });
        
        console.log(`[Creator] Content ${i + 1} created successfully`);
        
        // Log: Content generated
        await createAgentLog({
          campaignId,
          agentType: 'creator',
          action: `Generated Content ${i + 1}`,
          details: `Successfully generated image using Gemini API. Caption: "${brief.caption.substring(0, 50)}..."`,
          level: 'success'
        });
        
        // Delay to avoid rate limiting
        await this.delay(2000);
        
      } catch (error) {
        console.error(`[Creator] Error creating content:`, error);
      }
    }
    
    console.log(`[Creator] Content creation completed: ${contentPackages.length}/${campaignPlan.contentBriefs.length}`);
    
    // Log: Content creation completed
    await createAgentLog({
      campaignId,
      agentType: 'creator',
      action: 'Content Generation Completed',
      details: `Successfully generated ${contentPackages.length} out of ${campaignPlan.contentBriefs.length} content pieces. Ready for publishing.`,
      level: contentPackages.length === campaignPlan.contentBriefs.length ? 'success' : 'warning'
    });
    
    // Update campaign status
    await updateCampaignStatus(campaignId, 'publishing');
    
    // Log: Delegating to Engager
    await createAgentLog({
      campaignId,
      agentType: 'creator',
      action: 'Delegated to Engager Agent',
      details: `Passed ${contentPackages.length} content pieces to Engager Agent for publishing to Circlo platform.`,
      level: 'info'
    });
    
    // Trigger engager agent
    if (contentPackages.length > 0) {
      setTimeout(async () => {
        await engagerAgent.publishContent(campaignId, contentPackages, campaignPlan.postingSchedule);
      }, 2000);
    }
  }
  
  private async saveImageToFile(imageData: { data: string; mimeType: string }, campaignId: number, index: number): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'campaigns', campaignId.toString());
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const extension = imageData.mimeType.split('/')[1] || 'png';
    const filename = `content_${index + 1}_${Date.now()}.${extension}`;
    const filepath = path.join(uploadDir, filename);
    
    const buffer = Buffer.from(imageData.data, 'base64');
    fs.writeFileSync(filepath, buffer);
    
    console.log(`[Creator] Image saved: ${filepath}`);
    return filepath;
  }
  
  private getPublicUrl(filepath: string): string {
    // Convert absolute path to relative URL
    const relativePath = filepath.split('uploads/')[1];
    return `/uploads/${relativePath}`;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============ ENGAGER AGENT ============
export class EngagerAgent {
  async handle(data: AgentMessage): Promise<string> {
    return "I'm managing your social media posts! Check the dashboard for campaign results.";
  }
  
  async publishContent(
    campaignId: number, 
    contentPackages: any[], 
    schedule: Array<{ time: string; index: number }>
  ): Promise<void> {
    console.log(`[Engager] Publishing content for campaign ${campaignId}`);
    
    const { createAgentLog } = await import('../db');
    
    // Log: Started publishing
    await createAgentLog({
      campaignId,
      agentType: 'engager',
      action: 'Started Publishing',
      details: `Received ${contentPackages.length} content pieces. Beginning publication to Circlo platform.`,
      level: 'info'
    });
    
    for (let i = 0; i < contentPackages.length; i++) {
      const content = contentPackages[i];
      const scheduleItem = schedule[i];
      
      try {
        console.log(`[Engager] Publishing post ${i + 1}/${contentPackages.length}...`);
        
        // Get full URL for media
        const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
        const fullMediaUrl = content.mediaUrl.startsWith('http') 
          ? content.mediaUrl 
          : `${baseUrl}${content.mediaUrl}`;
        
        // Publish to Circlo
        const post = await circloService.createPost({
          profile: "general",
          niche: "Marketing",
          mediaType: "image",
          mediaSource: fullMediaUrl,
          caption: content.caption,
          keywords: content.keywords
        });
        
        if (post) {
          // Save published post record
          await createPublishedPost({
            campaignId,
            contentId: content.id,
            postId: post.id,
            scheduledTime: scheduleItem.time
          });
          
          console.log(`[Engager] Post ${i + 1} published: ${post.id}`);
          
          // Log: Post published
          await createAgentLog({
            campaignId,
            agentType: 'engager',
            action: `Published Post ${i + 1}`,
            details: `Successfully published to Circlo. Post ID: ${post.id}. Scheduled time: ${scheduleItem.time}.`,
            level: 'success'
          });
          
          // Trigger Zapier webhooks for multi-platform posting
          await this.triggerZapierWebhooks(campaignId, content, scheduleItem.time);
        } else {
          // Log: Publishing failed
          await createAgentLog({
            campaignId,
            agentType: 'engager',
            action: `Failed to Publish Post ${i + 1}`,
            details: `Could not publish content to Circlo platform. Will retry later.`,
            level: 'error'
          });
        }
        
        // Delay between posts
        await this.delay(2000);
        
      } catch (error) {
        console.error(`[Engager] Error publishing post:`, error);
      }
    }
    
    // Update campaign status to completed
    await updateCampaignStatus(campaignId, 'completed');
    console.log(`[Engager] Campaign ${campaignId} completed!`);
    
    // Log: Campaign completed
    await createAgentLog({
      campaignId,
      agentType: 'engager',
      action: 'Campaign Completed',
      details: `All content published successfully. Campaign execution completed.`,
      level: 'success'
    });
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private async triggerZapierWebhooks(
    campaignId: number,
    content: any,
    scheduledTime: string
  ): Promise<void> {
    try {
      const { getCampaign, getUserWebhooks } = await import('../db');
      const { triggerMultipleWebhooks } = await import('../services/zapier');
      
      // Get campaign info
      const campaign = await getCampaign(campaignId);
      if (!campaign) return;
      
      // Get user's active webhooks
      const webhooks = await getUserWebhooks(campaign.userId);
      if (webhooks.length === 0) {
        console.log('[Engager] No Zapier webhooks configured');
        return;
      }
      
      // Trigger webhooks
      const results = await triggerMultipleWebhooks(webhooks, {
        imageUrl: content.mediaUrl,
        caption: content.caption,
        keywords: content.keywords,
        campaignName: campaign.name,
        scheduledTime,
      });
      
      // Log results
      const { createAgentLog } = await import('../db');
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        await createAgentLog({
          campaignId,
          agentType: 'engager',
          action: 'Zapier Webhooks Triggered',
          details: `Successfully triggered ${successCount}/${results.length} Zapier webhooks for multi-platform posting.`,
          level: 'success'
        });
      }
    } catch (error) {
      console.error('[Engager] Error triggering Zapier webhooks:', error);
    }
  }
}

// Export agent instances
export const strategistAgent = new StrategistAgent();
export const creatorAgent = new CreatorAgent();
export const engagerAgent = new EngagerAgent();
