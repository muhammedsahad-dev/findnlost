# Campus Lost & Found Portal

A modern web application for managing lost and found items on campus — with AI-powered descriptions, full-text search, image uploads, and an admin moderation dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| State / Data | TanStack Query |
| Forms | React Hook Form + Zod |
| AI | Anthropic Claude (`claude-sonnet-4-5`) |
| Components | Radix UI + CVA |

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # never expose to client
ANTHROPIC_API_KEY=your-anthropic-key
# NEXT_PUBLIC_DOMAIN_RESTRICTION=college.edu       # optional: restrict to .edu emails
```

### 3. Set Up Supabase

In your Supabase project SQL Editor, run **in order**:

1. `scripts/schema.sql` — creates `items` table, indexes, RLS policies, AI rate limiting table
2. `scripts/storage.sql` — creates `item-images` storage bucket with RLS

### 4. Promote an Admin User

After registering a user via the portal:

1. Go to **Supabase Dashboard → Authentication → Users**
2. Copy the user's UUID
3. Edit `scripts/seed-admin.sql` with that UUID
4. Run the script in the SQL Editor

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── layout.tsx                   # Root layout (fonts, providers, navbar)
├── page.tsx                     # Home feed
├── items/[id]/                  # Item detail
│   ├── page.tsx                 # SSR + metadata
│   └── ItemDetailClient.tsx     # Client interactions
├── post/
│   ├── lost/page.tsx
│   └── found/page.tsx
├── login/page.tsx
├── register/page.tsx
├── admin/dashboard/page.tsx
└── api/
    ├── items/route.ts           # GET + POST
    ├── items/[id]/route.ts      # GET, PATCH, DELETE
    └── ai-description/route.ts  # AI generation

components/
├── ui/                          # Radix-based primitives
├── Navbar.tsx
├── ItemCard.tsx
├── ItemForm.tsx
├── SearchBar.tsx
├── FilterPanel.tsx
├── AdminItemRow.tsx
└── providers.tsx

lib/
├── supabase/
│   ├── client.ts                # Browser client
│   └── server.ts                # Server client + service role
├── validations/
│   └── item.schema.ts           # Zod schemas
└── utils.ts

scripts/
├── schema.sql
├── storage.sql
└── seed-admin.sql
```

---

## Features

- **Browse items** — search, filter by category/location/status/date, paginated
- **Post lost/found items** — with image upload, AI description generator
- **AI descriptions** — Claude generates 2-3 sentence descriptions from title + category + location (rate limited: 10/user/hour)
- **Mark as claimed** — item owners can close their listings
- **Admin dashboard** — remove/restore posts, filter all statuses
- **Auth** — Supabase email/password, optional `.edu` domain restriction
- **Dark mode** — system default, toggleable in navbar
- **Responsive** — mobile-first layout

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel, set all environment variables
3. Deploy — Vercel auto-detects Next.js
