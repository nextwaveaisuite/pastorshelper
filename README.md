# ✝ The Pastors Helper

> Spirit-Led Sermon Builder — Build powerful, Scripture-anchored sermons with AI

A complete SaaS platform for pastors and ministers. From anchor scripture to altar call — structured, Spirit-prompted, and ready to preach.

---

## 🚀 Deploy in 4 Steps

### Step 1 — Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run the contents of `supabase/schema.sql`
3. Go to **Authentication → URL Configuration** → add your Netlify URL to "Site URL" and "Redirect URLs"  
   Example: `https://your-app.netlify.app`
4. Copy your credentials from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for server-side API routes)

---

### Step 2 — Get Your API Keys

**Anthropic (AI sermon generation)**
- Get your key at [console.anthropic.com](https://console.anthropic.com)
- Copy `ANTHROPIC_API_KEY`

**Resend (email — optional but recommended)**
- Create a free account at [resend.com](https://resend.com)
- Create an API key → copy `RESEND_API_KEY`
- Add and verify your sending domain in Resend
- Update the `from` email in `lib/resend.ts`

---

### Step 3 — Upload to GitHub

1. Create a new repository on GitHub
2. Upload all project files (drag and drop into the repo, or use Git)
3. Make sure `.gitignore` is included — it excludes `.env` from uploads

---

### Step 4 — Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Select your GitHub repository
3. Build settings are auto-detected via `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Go to **Site settings → Environment variables** → add all variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=https://your-app.netlify.app
```

5. Click **Deploy** ✅

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side) |
| `ANTHROPIC_API_KEY` | ✅ | Claude AI API key for sermon generation |
| `RESEND_API_KEY` | Optional | For sending welcome emails |
| `NEXT_PUBLIC_SITE_URL` | Optional | Your deployed URL (used in emails) |

---

## 🗄️ Database Schema

Tables created by `supabase/schema.sql`:

- **sermons** — stores all generated sermons (title, content JSON, topic, tone, audience)
- **series** — sermon series (Week 1, 2, 3 grouping)
- Row-level security enabled: users only see their own data

---

## ✨ Features

- **Anchor Scripture Engine** — AI finds the perfect verse and cross-references
- **9-Section Sermon Flow** — Opening → Foundation → Teaching → Ministry Flow → Altar Call
- **Ministry Flow Prompts** — Gift of Knowledge, Impartation, Slow Down moments
- **Preach Mode** — Full-screen delivery view for behind the pulpit
- **Sermon Library** — Save, browse, and re-open saved sermons
- **PDF Export** — Export full manuscript as PDF
- **Magic Link Auth** — No passwords, just email login via Supabase

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| AI | Anthropic Claude (claude-sonnet) |
| Auth + DB | Supabase |
| Email | Resend |
| Hosting | Netlify |

---

## 📁 Project Structure

```
the-pastors-helper/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Magic link auth
│   ├── dashboard/page.tsx    # Main app
│   └── api/
│       ├── generate/         # AI sermon generator
│       ├── save-sermon/      # Save to Supabase
│       ├── load-sermons/     # Load from Supabase
│       ├── delete-sermon/    # Delete sermon
│       └── send-email/       # Resend emails
├── lib/
│   ├── supabase.ts           # Supabase client + types
│   └── resend.ts             # Email templates
├── styles/globals.css        # Global dark theme styles
├── supabase/schema.sql       # Run in Supabase SQL editor
├── netlify.toml              # Netlify config
└── .env.example              # Copy → .env.local for local dev
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in your keys

# 3. Run development server
npm run dev
# Open http://localhost:3000
```

---

## 📖 Scripture

> *"Preach the word; be ready in season and out of season."* — 2 Timothy 4:2

> *"Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth."* — 2 Timothy 2:15
