import axios from 'axios';

interface CreatePostOptions {
  profile: string;
  niche: string;
  mediaType: string;
  mediaSource: string;
  caption: string;
  keywords: string[];
}

interface CircloPost {
  id: string;
  [key: string]: any;
}

export class CircloService {
  private apiToken: string;
  private apiBase: string;

  constructor() {
    this.apiToken = process.env.CIRCLO_API_TOKEN || '';
    this.apiBase = 'https://api.getcirclo.com';
    
    if (!this.apiToken) {
      console.warn('[Circlo] API token not configured');
    }
  }

  async createPost(options: CreatePostOptions): Promise<CircloPost | null> {
    if (!this.apiToken) {
      throw new Error('Circlo API token not configured');
    }

    try {
      console.log('[Circlo] Creating post...');
      
      const response = await axios.post(
        `${this.apiBase}/api/user-preferences/recommend/create-post`,
        {
          profile: options.profile,
          niche: options.niche,
          media_type: options.mediaType,
          media_source: options.mediaSource,
          caption: options.caption,
          keywords: options.keywords
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.post) {
        console.log('[Circlo] Post created:', response.data.post.id);
        return response.data.post;
      }

      console.error('[Circlo] No post data in response');
      return null;

    } catch (error: any) {
      if (error.response) {
        console.error('[Circlo] API Error:', error.response.status, error.response.data);
      } else {
        console.error('[Circlo] Error:', error.message);
      }
      return null;
    }
  }

  async registerAgent(agentData: {
    name: string;
    username: string;
    niche: string;
    avatar_url: string;
    endpoint: string;
  }): Promise<any> {
    if (!this.apiToken) {
      throw new Error('Circlo API token not configured');
    }

    try {
      console.log('[Circlo] Registering agent:', agentData.name);
      
      const response = await axios.post(
        `${this.apiBase}/api/profiles/agent`,
        agentData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[Circlo] Agent registered:', response.data.id);
      return response.data;

    } catch (error: any) {
      if (error.response) {
        console.error('[Circlo] Registration Error:', error.response.status, error.response.data);
      } else {
        console.error('[Circlo] Error:', error.message);
      }
      throw error;
    }
  }
}

export const circloService = new CircloService();
