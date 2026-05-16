# 🎓 Teacher Portal

A beautiful AI-powered classroom management platform built with Next.js 14, Supabase, and Tailwind CSS.

Upload PDF books → auto-extract topics → attach infographics → present in stunning fullscreen mode.

![Teacher Portal](https://via.placeholder.com/1200x600/1e3a2f/f59e0b?text=Teacher+Portal)

---

## ✨ Features

- **📚 PDF Book Upload** — Upload textbooks up to 50MB, stored securely in Supabase Storage
- **🤖 Auto Topic Extraction** — Topics are automatically extracted from PDF content using pattern matching
- **🖼️ Infographic Management** — Upload images for each topic (JPEG, PNG, WebP, GIF up to 10MB)
- **📽️ Presentation Mode** — Beautiful fullscreen classroom presentation with keyboard navigation
- **🔒 Teacher Auth** — Secure login/signup via Supabase Auth
- **📱 Fully Responsive** — Works on mobile, tablet, and desktop
- **⚡ Real-time Updates** — Sidebar updates in real-time via Supabase subscriptions
- **🎨 Gorgeous UI** — Chalkboard-inspired design with smooth animations

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (for deployment)

---

## 📦 Local Development

### 1. Clone & Install

```bash
git clone https://github.com/your-username/teacher-portal.git
cd teacher-portal
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name, password, and region
3. Wait for the project to be ready (~2 minutes)

#### Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **Run**

This will create:
- `profiles`, `books`, `topics` tables
- Row Level Security (RLS) policies
- Storage buckets (`books` and `infographics`)
- Triggers for auto-profile creation

#### Get Your API Keys
1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → You'll be redirected to login.

---

## 🗄️ Supabase Storage Setup

The schema.sql automatically creates the storage buckets, but if you need to create them manually:

### Via Supabase Dashboard
1. Go to **Storage** in the sidebar
2. Click **New Bucket**

**Bucket 1: books**
- Name: `books`
- Public: **No** (private)
- File size limit: `52428800` (50MB)
- Allowed MIME types: `application/pdf`

**Bucket 2: infographics**
- Name: `infographics`
- Public: **Yes**
- File size limit: `10485760` (10MB)
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

### Storage Policies
The schema.sql sets up all required policies. If you need to add them manually, go to **Storage → Policies** and add policies matching those in `supabase/schema.sql`.

---

## 🌐 Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts. When asked about environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

For production deployment:
```bash
vercel --prod
```

### Method 2: GitHub + Vercel Dashboard

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/teacher-portal.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy**

### Method 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/teacher-portal)

---

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Your Supabase anonymous/public key |

---

## 📁 Project Structure

```
teacher-portal/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── books/
│   │   │   │   ├── route.ts          # GET all books, POST upload book
│   │   │   │   └── [id]/route.ts     # DELETE book
│   │   │   ├── topics/
│   │   │   │   ├── route.ts          # GET topics, POST add topic
│   │   │   │   └── [id]/route.ts     # PATCH update, DELETE topic
│   │   │   ├── infographics/
│   │   │   │   └── route.ts          # POST upload, DELETE infographic
│   │   │   └── auth/
│   │   │       └── signout/route.ts  # POST sign out
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   └── books/[id]/
│   │   │       ├── page.tsx          # Book detail page
│   │   │       └── presentation/
│   │   │           └── page.tsx      # Presentation mode
│   │   ├── login/
│   │   │   └── page.tsx              # Login/signup page
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Root redirect
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Sidebar with book/topic tree
│   │   │   └── Header.tsx            # Top header with user menu
│   │   ├── dashboard/
│   │   │   └── DashboardClient.tsx   # Dashboard stats & book grid
│   │   ├── books/
│   │   │   ├── BookCard.tsx          # Book card component
│   │   │   ├── BookDetailClient.tsx  # Book management page
│   │   │   └── UploadBookModal.tsx   # PDF upload modal with dropzone
│   │   ├── topics/
│   │   │   ├── TopicCard.tsx         # Topic card with infographic
│   │   │   └── AddTopicModal.tsx     # Add topic modal
│   │   ├── infographics/
│   │   │   └── InfographicUploadModal.tsx # Image upload modal
│   │   └── presentation/
│   │       └── PresentationClient.tsx # Fullscreen presentation mode
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client
│   │       ├── server.ts             # Server Supabase client
│   │       └── middleware.ts         # Auth middleware helpers
│   ├── types/
│   │   └── database.ts               # TypeScript types for DB
│   └── middleware.ts                  # Next.js middleware for auth
├── supabase/
│   └── schema.sql                    # Full database schema
├── public/
│   └── favicon.svg
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## 🎮 How to Use

### 1. Sign Up / Log In
- Visit your deployed URL
- Create an account with your school email
- Verify your email (Supabase sends a confirmation)

### 2. Upload a Book
- Click **"Upload Book"** on the dashboard
- Drag & drop a PDF (up to 50MB)
- Enter a title and optional description
- Click **Upload Book**
- Topics are extracted automatically in the background (10–30 seconds)

### 3. Manage Topics
- Click a book card to open its detail page
- View auto-extracted topics from the PDF
- Add topics manually with **"Add Topic"**
- Delete topics you don't need

### 4. Add Infographics
- On the book detail page, click any topic card
- Click **"Add infographic"** or the upload zone
- Upload a JPEG, PNG, WebP, or GIF image (up to 10MB)
- The image is stored in Supabase and shown as a preview

### 5. Present to Your Class
- Click **"Start Presentation"** on a book
- Topics with infographics appear as clickable cards
- Click any topic to view it fullscreen
- Use **← →** arrow keys to navigate between topics
- Press **Esc** to close fullscreen
- Use the thumbnail strip at the bottom to jump to any topic

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Supabase** | Auth, database (PostgreSQL), file storage |
| **@supabase/ssr** | Server-side rendering support |
| **pdf-parse** | Server-side PDF text extraction |
| **react-dropzone** | Drag & drop file uploads |
| **framer-motion** | Animations (available for enhancement) |
| **react-hot-toast** | Toast notifications |
| **lucide-react** | Icons |

---

## 🔐 Security

- All routes protected by Supabase Auth middleware
- Row Level Security (RLS) ensures teachers only see their own data
- Books stored in a **private** bucket (signed URLs)
- Infographics in a **public** bucket (fast CDN delivery for presentations)
- File type and size validation on both client and server

---

## 🐛 Troubleshooting

### "Upload failed: new row violates row-level security policy"
→ Make sure you ran the full `schema.sql` in Supabase SQL Editor, including the storage bucket creation and policies.

### Topics not appearing after upload
→ Topic extraction runs in the background. Wait 10–30 seconds and refresh the page. For large PDFs (100+ pages), it may take up to a minute.

### Images not loading in presentation
→ Check that your `infographics` storage bucket is set to **Public**. Go to Supabase → Storage → infographics → Settings → make public.

### "relation 'profiles' does not exist"
→ Run the `schema.sql` file again in Supabase SQL Editor.

### Auth redirect loop
→ Clear your browser cookies and try again. Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set.

---

## 📄 License

MIT License — free for personal and commercial use.

---

## 🙏 Acknowledgements

Built with ❤️ for educators everywhere. Powered by [Supabase](https://supabase.com) and [Vercel](https://vercel.com).
