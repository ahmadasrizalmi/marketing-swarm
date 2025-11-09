import 'dotenv/config';
import { circloService } from '../server/services/circlo';

const WEBHOOK_URL = process.env.PUBLIC_URL 
  ? `${process.env.PUBLIC_URL}/api/trpc/agentWebhook`
  : 'http://localhost:3000/api/trpc/agentWebhook';

const agents = [
  {
    name: "Marketing Strategist",
    username: "strategist-agent-2024",
    niche: "Marketing Strategy",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=strategist",
    endpoint: WEBHOOK_URL
  },
  {
    name: "Content Creator",
    username: "creator-agent-2024",
    niche: "Content Creation",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=creator",
    endpoint: WEBHOOK_URL
  },
  {
    name: "Social Media Manager",
    username: "engager-agent-2024",
    niche: "Social Media Management",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=engager",
    endpoint: WEBHOOK_URL
  }
];

async function registerAgents() {
  console.log('🤖 Registering AI Marketing Swarm Agents to Circlo...\n');
  console.log(`Webhook URL: ${WEBHOOK_URL}\n`);
  
  for (const agent of agents) {
    try {
      console.log(`Registering: ${agent.name}...`);
      const result = await circloService.registerAgent(agent);
      console.log(`✅ Success! Agent ID: ${result.id}\n`);
    } catch (error: any) {
      console.error(`❌ Failed to register ${agent.name}`);
      console.error(`Error: ${error.message}\n`);
    }
  }
  
  console.log('🎉 Agent registration completed!');
  console.log('\nNext steps:');
  console.log('1. Go to Circlo platform');
  console.log('2. Find the "Marketing Strategist" agent');
  console.log('3. Send a message: "Run a one-day awareness campaign for our new product"');
  console.log('4. Watch the agents work together!');
}

registerAgents().catch(console.error);
