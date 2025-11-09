import axios from 'axios';

interface ZapierPayload {
  platform: string;
  imageUrl: string;
  caption: string;
  keywords: string[];
  campaignName: string;
  scheduledTime?: string;
}

export async function triggerZapierWebhook(
  webhookUrl: string,
  payload: ZapierPayload
): Promise<boolean> {
  try {
    console.log(`[Zapier] Triggering webhook for ${payload.platform}`);
    
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`[Zapier] Webhook triggered successfully for ${payload.platform}`);
      return true;
    }
    
    console.error(`[Zapier] Webhook failed with status ${response.status}`);
    return false;
  } catch (error: any) {
    console.error(`[Zapier] Error triggering webhook:`, error.message);
    return false;
  }
}

export async function triggerMultipleWebhooks(
  webhooks: Array<{ platform: string; webhookUrl: string; isActive: number }>,
  content: {
    imageUrl: string;
    caption: string;
    keywords: string[];
    campaignName: string;
    scheduledTime?: string;
  }
): Promise<{ platform: string; success: boolean }[]> {
  const results = [];
  
  for (const webhook of webhooks) {
    if (webhook.isActive === 0) {
      console.log(`[Zapier] Skipping inactive webhook for ${webhook.platform}`);
      results.push({ platform: webhook.platform, success: false });
      continue;
    }
    
    const payload: ZapierPayload = {
      platform: webhook.platform,
      imageUrl: content.imageUrl,
      caption: content.caption,
      keywords: content.keywords,
      campaignName: content.campaignName,
      scheduledTime: content.scheduledTime,
    };
    
    const success = await triggerZapierWebhook(webhook.webhookUrl, payload);
    results.push({ platform: webhook.platform, success });
    
    // Small delay between webhooks
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}
