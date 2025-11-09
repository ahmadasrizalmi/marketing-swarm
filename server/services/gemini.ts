import axios from 'axios';

interface GeminiImageData {
  data: string; // base64
  mimeType: string;
}

interface GenerateImageOptions {
  prompt: string;
  temperature?: number;
  topK?: number;
  topP?: number;
}

export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
    
    if (!this.apiKey) {
      console.warn('[Gemini] API key not configured');
    }
  }

  async generateImage(options: GenerateImageOptions): Promise<GeminiImageData | null> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: options.prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 1.0,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: 8192
        }
      };

      console.log('[Gemini] Generating image...');
      
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 seconds
        }
      );

      // Extract image data from response
      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inline_data && part.inline_data.data) {
              console.log('[Gemini] Image generated successfully');
              return {
                data: part.inline_data.data,
                mimeType: part.inline_data.mime_type || 'image/png'
              };
            }
          }
        }
      }

      console.error('[Gemini] No image data in response');
      return null;

    } catch (error: any) {
      if (error.response) {
        console.error('[Gemini] API Error:', error.response.status, error.response.data);
      } else {
        console.error('[Gemini] Error:', error.message);
      }
      return null;
    }
  }

  async generateImageWithRetry(
    options: GenerateImageOptions, 
    maxRetries: number = 3
  ): Promise<GeminiImageData | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini] Attempt ${attempt}/${maxRetries}`);
        const imageData = await this.generateImage(options);
        
        if (imageData) {
          return imageData;
        }
        
        if (attempt < maxRetries) {
          const delay = 3000 * attempt; // Exponential backoff
          console.log(`[Gemini] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`[Gemini] Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
    
    return null;
  }
}

export const geminiService = new GeminiService();
