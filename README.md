# FlowWink

**Flow into Content Creation** — The modern CMS that makes content creation effortless.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker Image](https://img.shields.io/badge/Docker-ghcr.io-blue)](https://github.com/magnusfroste/flowwink/pkgs/container/flowwink)

## What is FlowWink?

FlowWink is a modern, open-source Content Management System built for organizations that need:

- ✅ A complete website without developers
- ✅ Headless API for multi-channel delivery
- ✅ **AI chat with your content as context** — Instant value, no training needed
- ✅ GDPR and WCAG compliance built-in
- ✅ Full control with self-hosting

### Killer Feature: AI Chat with Multi-Module Context

**First system to use all your content as AI context:**

- Pages, blog posts, knowledge base articles
- Instant answers from your own content
- No training required — works immediately
- Saves hours of customer support time

### Use Case: Outreach-Focused Teams

For teams building their digital presence and lead generation:

```
AI → Blog (content) → Pages (landings) → Forms (capture)
→ Leads (nurture) → Newsletter (email) → Analytics (measure)
```

**5 modules = complete outreach loop:**
- **Pages** — Landings pages for campaigns
- **Blog** — Content marketing, SEO, thought leadership
- **Leads** — Capture leads from forms
- **Newsletter** — Nurture leads via email
- **AI** — Generate content 10x faster

### Head + Headless

Unlike traditional CMS (website only) or pure headless solutions (API only, requires separate frontend), FlowWink delivers **both**:

```
┌─────────────────────────────────────────────────────────────┐
│                     FLOWWINK CONTENT                        │
│                    (Single Source of Truth)                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │   HEAD   │       │ HEADLESS │       │  FUTURE  │
    │ Website  │       │   API    │       │ Channels │
    │(Built-in)│       │(REST/GQL)│       │          │
    └──────────┘       └──────────┘       └──────────┘
```

## Features

### Content Management
- **46 block types** — Text, images, galleries, accordions, CTAs, booking, and more
- **Drag & drop** — Reorder blocks visually
- **Rich text editor** — Powered by Tiptap
- **Media library** — With automatic WebP optimization

### Blog Module
- **Full blog engine** — Posts, categories, tags, and author profiles
- **SEO optimized** — Meta tags, reading time, featured images
- **Editorial workflow** — Draft → Review → Published with scheduling
- **RSS feed** — Auto-generated feed for subscribers

### Newsletter
- **Subscriber management** — Double opt-in, GDPR-compliant
- **Email campaigns** — Create and send newsletters
- **Analytics** — Open rates, click tracking, engagement metrics
- **GDPR tools** — Export and delete subscriber data

### Integration Module (N8N Webhooks)
- **Webhook system** — Trigger on page, blog, form, and newsletter events
- **N8N templates** — Pre-built workflows for common automations
- **Event types** — `page.published`, `blog_post.published`, `newsletter.subscribed`, `form.submitted`, and more
- **Delivery logs** — Track webhook success/failure with retry support

### Editorial Workflow
- **Roles** — Writer, Approver, Admin
- **Approval flow** — Draft → Review → Published
- **Version history** — Track and restore changes
- **Scheduled publishing** — Set it and forget it

### AI Features
- **AI Chat** — Multi-provider support (OpenAI, Local LLM, N8N)
- **AI Migration** — Import existing websites automatically
- **AI Brand Analysis** — Extract colors and fonts from any URL
- **Knowledge Base** — Your content becomes AI context

### Compliance & Security
- **GDPR** — Audit logging, cookie consent, privacy by design
- **WCAG 2.1 AA** — Accessibility built into every component
- **Row Level Security** — Powered by Supabase RLS
- **Security Hardening** — Regular dependency audits, production-safe logging

### Headless API
- **REST API** — `/content-api/pages`, `/content-api/page/:slug`
- **GraphQL** — Full schema for flexible queries
- **Edge caching** — Fast responses worldwide

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Editor | Tiptap |
| State | TanStack Query |

## Self-Hosting

FlowWink is **free to self-host**. Deploy on your own Supabase instance with full control over your data.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/magnusfroste/flowwink.git
cd flowwink

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations (see docs/SETUP.md)

# Start development server (migrations run automatically)
npm run dev
```

**✨ Auto-Migrations:** Database migrations run automatically when you start the dev server or build for production. No manual migration steps needed!

### Connecting to Your Own Supabase

The entire purpose of this project is to allow you to clone it from GitHub and connect it to **your own Supabase instance**. Here's how:

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com/) and create a new project
   - Note your **project ref** (e.g., `trpejhoieysrwiuhskkm`) from the URL

2. **Get Your Credentials**
   - Go to Supabase Dashboard → Settings → API
   - Copy these three values:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **Anon/Public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
     - **Project ref** → `VITE_SUPABASE_PROJECT_ID`

3. **Set Environment Variables**
   - For local development: Edit `.env` file
   - For deployment: Pass as build arguments (see DEPLOYMENT.md)

4. **Run Setup Script** (optional but recommended)
   ```bash
   ./scripts/setup-supabase.sh
   ```
   This deploys edge functions and runs initial migrations.

**Auto-Migrations:** After initial setup, migrations run automatically when you:
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Pull latest Docker image: migrations included in build

### Detailed Setup

See **[docs/SETUP.md](docs/SETUP.md)** for complete self-hosting instructions including:

- Supabase project setup
- Database migrations
- Edge Functions deployment
- Production deployment

### Database Schema

A complete SQL schema is available at **[supabase/schema.sql](supabase/schema.sql)** — run it in your Supabase SQL Editor to set up a new instance.

## Deployment Options

### Option 1: Docker (Recommended for Self-Hosting)

Deploy with Docker on any platform for complete control and easy upgrades:

```bash
# Pull the latest image
docker pull ghcr.io/magnusfroste/flowwink:latest

# Or use docker-compose (see docs/DEPLOYMENT.md)
docker-compose up -d
```

**What you get:**
- ✅ Easy upgrades (`docker pull` for new versions)
- ✅ Works with Supabase Cloud OR Self-Hosted Supabase
- ✅ Deploy on Easypanel, Railway, Fly.io, or any VPS
- ✅ Your data, your infrastructure

**Platforms:**
- **Easypanel** — One-click Docker deployment with auto-HTTPS ([Guide](docs/DEPLOYMENT.md))
- **Railway** — Git-based deployment with automatic builds
- **Fly.io** — Global edge deployment
- **VPS** — Any server with Docker (Hetzner, DigitalOcean, etc.)

### Option 2: Static Hosting (Alternative)

Deploy on static hosting platforms with your own Supabase backend:

| Component | Your Choice |
|-----------|-------------|
| **Frontend** | Vercel, Netlify, Cloudflare Pages, or any static host |
| **Backend** | Your own Supabase project (Cloud or Self-Hosted) |
| **AI** | Private LLM (OpenAI, Gemini, Ollama, LM Studio, etc.) |

**Note:** When deploying to Vercel/Netlify, run migrations manually before deployment:
```bash
npx supabase db push
```

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for complete deployment guides.

**AI Features:** When self-hosting, configure a Private LLM endpoint (OpenAI, Gemini, Ollama, LM Studio, or N8N) in the CMS admin panel.

## Documentation

- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Docker deployment guide (Easypanel, Railway, Fly.io)
- **[docs/SETUP.md](docs/SETUP.md)** — Supabase setup guide
- **[docs/PRD.md](docs/PRD.md)** — Full product documentation

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Made in Sweden 🇸🇪**
