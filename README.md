# 🤖 AI Marketing Swarm

**Mission 2 Hackathon GetCirclo** - Autonomous Multi-Agent System for Digital Marketing Campaigns

## 📋 Overview

AI Marketing Swarm adalah sistem multi-agent autonomous yang dirancang untuk menjalankan kampanye marketing digital secara otomatis. Sistem ini terdiri dari 3 specialized agents yang bekerja sama untuk merencanakan, membuat konten visual, dan mempublikasikan posts ke berbagai platform social media.

## ✨ Features

### 🎯 Core Features
- **3 AI Agents** yang bekerja secara terkoordinasi:
  - **Strategist Agent**: Menganalisis requirements dan membuat campaign plan
  - **Creator Agent**: Generate visual content menggunakan Gemini AI
  - **Engager Agent**: Publish content ke Circlo dan trigger Zapier webhooks

### 🚀 Key Capabilities
- ✅ Autonomous campaign execution dari planning hingga publishing
- ✅ AI-powered image generation dengan Gemini API
- ✅ Multi-platform posting via Zapier integration (Instagram, TikTok, Facebook, Twitter)
- ✅ Real-time campaign monitoring dashboard
- ✅ Content gallery dengan filter dan search
- ✅ Detailed agent activity logs dengan level indicators
- ✅ Webhook management system untuk automation

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express** + **tRPC 11**
- **MySQL/TiDB** database dengan Drizzle ORM
- **Gemini API** untuk image generation
- **Circlo API** untuk social media posting
- **Zapier Webhooks** untuk multi-platform integration

### Frontend
- **React 19** + **TypeScript**
- **Tailwind CSS 4** untuk styling
- **shadcn/ui** component library
- **Wouter** untuk routing
- **TanStack Query** (via tRPC) untuk data fetching

## 🎨 Architecture

```
┌─────────────────┐
│  User Command   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Strategist     │ ──► Creates campaign plan
│  Agent          │     Delegates to Creator
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Creator        │ ──► Generates images (Gemini API)
│  Agent          │     Delegates to Engager
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Engager        │ ──► Publishes to Circlo
│  Agent          │     Triggers Zapier webhooks
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Multi-Platform Distribution    │
│  (Instagram, TikTok, Facebook)  │
└─────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database
- Gemini API key
- Circlo API token

### Setup Steps

1. **Clone repository**
```bash
git clone https://github.com/ahmadasrizalmi/marketing-swarm.git
cd marketing-swarm
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Circlo API
CIRCLO_API_TOKEN=your_circlo_jwt_token
```

4. **Push database schema**
```bash
pnpm db:push
```

5. **Register agents to Circlo**
```bash
pnpm tsx scripts/register-agents.ts
```

6. **Start development server**
```bash
pnpm dev
```

## 🎮 Usage

### 1. Create Campaign
- Login ke dashboard
- Klik "Create Campaign"
- Masukkan command seperti: "Run a 3-day awareness campaign for our new product"
- Agents akan bekerja secara otomatis

### 2. Monitor Progress
- View real-time status di campaign detail page
- Check agent activity logs untuk detailed tracking
- Browse generated content di gallery

### 3. Setup Zapier Integration
- Buka Zapier Settings page
- Create Zap dengan "Webhooks by Zapier" trigger
- Copy webhook URL dan tambahkan ke settings
- Pilih platform target (Instagram, TikTok, Facebook)
- Posts akan otomatis ter-distribute ke semua platform

## 📊 Database Schema

### Main Tables
- `campaigns` - Campaign information
- `contents` - Generated content (images + captions)
- `published_posts` - Published post records
- `agent_logs` - Agent activity logs
- `zapier_webhooks` - Webhook configurations

## 🔧 API Endpoints

### tRPC Procedures
- `campaign.create` - Create new campaign
- `campaign.list` - Get user campaigns
- `campaign.getById` - Get campaign details
- `content.list` - Get content with filters
- `logs.getCampaignLogs` - Get agent logs
- `zapier.create/list/delete/toggle` - Manage webhooks

## 🌟 Key Features Detail

### Agent Logging System
Setiap action dari agents tercatat dengan:
- **Timestamp** - Waktu eksekusi
- **Agent Type** - Strategist/Creator/Engager
- **Action** - Deskripsi action
- **Details** - Informasi lengkap
- **Level** - info/success/warning/error

### Zapier Integration
Webhook payload yang dikirim:
```json
{
  "platform": "instagram",
  "imageUrl": "https://...",
  "caption": "...",
  "keywords": ["marketing", "ai"],
  "campaignName": "Product Launch",
  "scheduledTime": "2024-01-15 10:00"
}
```

## 🚀 Deployment

Project ini menggunakan Manus platform untuk deployment:
1. Save checkpoint via dashboard
2. Click "Publish" button
3. Website akan live di `*.manus.space`

## 📝 License

Private - Mission 2 Hackathon GetCirclo

## 👨‍💻 Author

Ahmad Asrizalmi - [GitHub](https://github.com/ahmadasrizalmi)

## 🙏 Acknowledgments

- GetCirclo untuk platform dan API
- Google Gemini untuk AI image generation
- Zapier untuk automation capabilities
- Manus platform untuk hosting dan deployment
