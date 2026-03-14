# 🏆 Bacancy Hackathon — Global Prompt File
> Stack: Next.js + Supabase + Vercel | Duration: 10 Hours | Format: Solo

---

## 🧠 HOW TO USE THIS FILE

Feed this file to Codex CLI at the start of your session:
```bash
codex --instructions HACKATHON_GLOBAL_PROMPT.md
```
Or reference it in every major prompt:
> "Following the rules in my global prompt, build [feature]..."

---

## 🎯 MASTER SYSTEM PROMPT

You are an elite full-stack engineer and product designer helping me build and ship a production-quality SaaS application in **10 hours** during a solo hackathon.

### Core Constraints
- **Framework**: Next.js 16+ (App Router)
- **Database & Auth**: Supabase (Postgres + Row Level Security + Auth)
- **Deployment**: Vercel
- **AI Tooling**: Codex CLI (this session)
- **Time Budget**: 10 hours total — ruthlessly prioritize shipping

### Non-Negotiables
1. Every form/input must have **client-side AND server-side validation**
2. **Authentication** via Supabase Auth (email/password + optional OAuth)
3. **Row Level Security (RLS)** policies on all Supabase tables
4. **Responsive design** — mobile-first, looks great on all screen sizes
5. **Error boundaries** and user-friendly error messages everywhere
6. **Loading states** on all async operations
7. **TypeScript** throughout — no `any` types

### Code Quality Rules
- Use **Zod** for all schema validation (shared between client and server)
- Use **React Hook Form** for all forms
- Use **Server Actions** for mutations (not API routes unless necessary)
- All DB queries go through typed Supabase client helper functions
- No inline styles — use **Tailwind CSS** utility classes only
- Components live in `/components`, pages in `/app`, utils in `/lib`

---

## 📁 PROJECT SCAFFOLD

### Immediate Setup Commands
```bash
# 1. Create Next.js app
npx create-next-app@latest flowboard --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd flowboard

# 2. Install core dependencies
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers
npm install lucide-react clsx tailwind-merge
npm install -D @types/node

# 3. Install UI (pick one)
npx shadcn@latest init   # Recommended for speed

# 4. Install testing
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 5. Install additional utilities
npm install sonner date-fns zustand
```

### Create `.mcp.json` in project root (Next.js DevTools MCP)
**Always create this file immediately after scaffolding — required for Next.js MCP:**
```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```
> Requires Next.js 16+ (already satisfied by `create-next-app@latest`).
> Start `npm run dev` first, then run `codex` — Next.js MCP auto-connects.
> Gives Codex live access to runtime errors, logs, and routes.

### Folder Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx               # projects list
│   │   ├── dashboard/new-project/page.tsx   # create project
│   │   ├── dashboard/[projectSlug]/
│   │   │   ├── board/page.tsx               # Kanban board ⭐
│   │   │   ├── issues/page.tsx              # issues list
│   │   │   ├── members/page.tsx             # team members
│   │   │   └── settings/page.tsx            # project settings
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                             # landing page
├── components/
│   ├── ui/                   # shadcn components
│   ├── forms/                # form components with validation
│   ├── layout/               # header, sidebar, footer
│   ├── board/                # KanbanBoard, IssueCard, IssueDetailDialog
│   ├── issues/               # IssuesTable, IssueFilters
│   └── members/              # MembersList, InviteMemberForm
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # browser client
│   │   ├── server.ts         # server client
│   │   └── middleware.ts
│   ├── validations/
│   │   ├── issue.ts          # Zod schema for issues
│   │   ├── project.ts        # Zod schema for projects
│   │   ├── member.ts         # Zod schema for members
│   │   └── auth.ts           # Zod schema for auth
│   ├── actions/
│   │   ├── issues.ts         # createIssue, updateIssue, deleteIssue
│   │   ├── projects.ts       # createProject, updateProject, deleteProject
│   │   ├── members.ts        # inviteMember, removeMember
│   │   └── auth.ts           # login, signup, logout
│   └── utils.ts
├── hooks/                    # useProjects, useIssues, useMembers
├── types/
│   └── database.ts           # Supabase generated types
└── middleware.ts
```

---

## 🗄️ SUPABASE SETUP TEMPLATE

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase Client — Browser (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Supabase Client — Server (`lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
```

### Middleware (`middleware.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Standard RLS Policies (apply to every table)
```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON [table_name]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON [table_name]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON [table_name]
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON [table_name]
  FOR DELETE USING (auth.uid() = user_id);
```

---

## ✅ VALIDATION PATTERN (Client + Server)

### Zod Schema (`lib/validations/[feature].ts`)
```typescript
import { z } from 'zod'

// Define ONCE, use everywhere
export const createItemSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be under 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be under 500 characters')
    .optional(),
  // Add fields specific to your topic
})

export type CreateItemInput = z.infer<typeof createItemSchema>
```

### Server Action with Validation (`lib/actions/[feature].ts`)
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createItemSchema } from '@/lib/validations/[feature]'

export async function createItem(formData: unknown) {
  // 1. Server-side validation
  const parsed = createItemSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // 2. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { _global: ['Unauthorized'] } }

  // 3. Database operation
  const { error } = await supabase
    .from('items')
    .insert({ ...parsed.data, user_id: user.id })

  if (error) return { error: { _global: [error.message] } }

  revalidatePath('/dashboard')
  return { success: true }
}
```

### Form Component with Client Validation (`components/forms/CreateItemForm.tsx`)
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createItemSchema, type CreateItemInput } from '@/lib/validations/[feature]'
import { createItem } from '@/lib/actions/[feature]'
import { toast } from 'sonner'

export function CreateItemForm() {
  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema), // CLIENT-SIDE validation
    defaultValues: { title: '', description: '' },
  })

  async function onSubmit(data: CreateItemInput) {
    const result = await createItem(data) // SERVER-SIDE validation inside
    if (result?.error) {
      // Handle server errors
      if ('_global' in result.error) {
        toast.error(result.error._global?.[0])
      }
      return
    }
    toast.success('Created successfully!')
    form.reset()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <input
          id="title"
          {...form.register('title')}
          className="mt-1 w-full rounded-md border px-3 py-2"
          aria-describedby="title-error"
        />
        {form.formState.errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {form.formState.isSubmitting ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

---

## 🎨 DESIGN SYSTEM

### Tailwind Config Additions (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      }
    },
  },
  plugins: [],
}

export default config
```

### Design Checklist
- [ ] Consistent spacing scale (4, 8, 12, 16, 24, 32, 48px)
- [ ] 2-3 brand colors max + neutrals
- [ ] Clear visual hierarchy (H1 > H2 > body > caption)
- [ ] Focus states on all interactive elements (accessibility)
- [ ] Hover states on all clickable elements
- [ ] Empty states for all list/table views
- [ ] Skeleton loaders for data fetching
- [ ] Toast notifications for all actions (success + error)
- [ ] Mobile hamburger menu if sidebar exists
- [ ] Consistent border-radius throughout

---

## 🧪 TESTING STRATEGY

> **Yes, include tests — but be smart about what to test in 10 hours.**
> Tests demonstrate professionalism and catch regressions fast. Focus on **critical paths only**.

### Test Setup (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

### Test Setup File (`src/tests/setup.ts`)
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }),
}))
```

### Priority Tests to Write (in order)

**1. Validation Schemas — HIGHEST PRIORITY** (`src/tests/validations/[feature].test.ts`)
```typescript
import { describe, it, expect } from 'vitest'
import { createItemSchema } from '@/lib/validations/[feature]'

describe('createItemSchema', () => {
  it('accepts valid input', () => {
    const result = createItemSchema.safeParse({ title: 'Test Item', description: 'A description' })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = createItemSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.title).toBeDefined()
  })

  it('rejects title over 100 characters', () => {
    const result = createItemSchema.safeParse({ title: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })
})
```

**2. Critical UI Components** (`src/tests/components/[Component].test.tsx`)
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CreateItemForm } from '@/components/forms/CreateItemForm'

describe('CreateItemForm', () => {
  it('renders form fields', () => {
    render(<CreateItemForm />)
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<CreateItemForm />)
    await user.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('calls server action with valid data', async () => {
    const mockAction = vi.fn().mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<CreateItemForm onSubmit={mockAction} />)
    await user.type(screen.getByLabelText(/title/i), 'My Test Item')
    await user.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => expect(mockAction).toHaveBeenCalledWith({ title: 'My Test Item' }))
  })
})
```

**3. Utility Functions** (`src/tests/lib/utils.test.ts`)
```typescript
import { describe, it, expect } from 'vitest'
import { formatDate, truncate } from '@/lib/utils'

describe('formatDate', () => {
  it('formats a date correctly', () => {
    expect(formatDate(new Date('2026-01-15'))).toBe('Jan 15, 2026')
  })
})
```

### Package.json Test Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

> **Rule**: Write validation tests FIRST (they're fast, pure, and prove your core logic works). Write component tests for the 2-3 most critical user flows. Skip tests for UI-only components.

---

## ⏱️ 10-HOUR EXECUTION PLAN

```
Hour 1   — Setup & Architecture
  - Receive topic, define MVP scope (3 core features max)
  - Scaffold Next.js app, install dependencies
  - Set up Supabase project, design DB schema
  - Create GitHub repo, push initial commit

Hour 2   — Database & Auth
  - Write all Supabase migrations
  - Add RLS policies
  - Add seed data
  - Implement auth (login, signup, logout, middleware)

Hours 3–4 — Core Feature #1 (CRUD + Validation)
  - Zod schemas
  - Server Actions
  - Form components with validation
  - Data display component (table/list/cards)
  - Write validation tests

Hours 5–6 — Core Feature #2 + #3 (lean)
  - Repeat pattern from above for remaining features
  - Keep it simple — ship over perfect

Hour 7   — Design Polish
  - Consistent layout, header, sidebar/nav
  - Empty states, loading states, error states
  - Responsive mobile layout
  - Toast notifications

Hour 8   — Testing & Bug Fixes
  - Run all tests, fix failures
  - Manual QA on all flows
  - Fix critical bugs only

Hour 9   — Deploy & Seed
  - Push to GitHub
  - Deploy on Vercel (connect repo)
  - Set all environment variables on Vercel
  - Verify production build works
  - Add realistic seed data to Supabase

Hour 10  — Demo Video & Submission
  - Record 5-min demo (Loom recommended)
  - Write Product Hunt description
  - Submit all links on event platform
```

---

## 🌱 SEED DATA TEMPLATE

```sql
-- Run in Supabase SQL editor after creating tables
-- Replace YOUR_USER_ID with your actual auth user ID

INSERT INTO projects (name, description, slug, owner_id) VALUES
  ('FlowBoard Demo', 'A sample project to showcase all features', 'flowboard-demo', 'YOUR_USER_ID');

-- Replace PROJECT_ID with the id from above insert
INSERT INTO issues (title, description, status, priority, project_id, reporter_id, created_at) VALUES
  ('Set up CI/CD pipeline', 'Configure GitHub Actions for automated deployment', 'todo', 'high', 'PROJECT_ID', 'YOUR_USER_ID', NOW() - INTERVAL '3 days'),
  ('Design login page', 'Create responsive login and signup pages', 'in_progress', 'medium', 'PROJECT_ID', 'YOUR_USER_ID', NOW() - INTERVAL '2 days'),
  ('Fix auth bug on mobile', 'Session not persisting on iOS Safari', 'in_review', 'urgent', 'PROJECT_ID', 'YOUR_USER_ID', NOW() - INTERVAL '1 day'),
  ('Write onboarding docs', 'Document the getting started guide', 'done', 'low', 'PROJECT_ID', 'YOUR_USER_ID', NOW() - INTERVAL '5 days'),
  ('Add dark mode support', 'Implement theme toggle across all pages', 'todo', 'medium', 'PROJECT_ID', 'YOUR_USER_ID', NOW() - INTERVAL '4 hours'),
  ('Performance audit', 'Run Lighthouse and fix issues above 90 score', 'in_progress', 'high', 'PROJECT_ID', 'YOUR_USER_ID', NOW() - INTERVAL '6 hours');
```

---

## 🚀 VERCEL DEPLOYMENT CHECKLIST

```bash
# Before deploying
- [ ] All .env.local vars added to Vercel project settings
- [ ] NEXT_PUBLIC_SUPABASE_URL set
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set
- [ ] SUPABASE_SERVICE_ROLE_KEY set (as secret)
- [ ] Supabase Auth redirect URLs include your Vercel domain
      (Supabase Dashboard → Auth → URL Configuration)
- [ ] Production build passes locally: npm run build
- [ ] No TypeScript errors: npm run type-check
```

---

## 📋 PROMPTS TO USE WITH CLAUDE CLI

Copy-paste these during the hackathon. Replace placeholders before use.

### Prompt 1: Generate DB Schema
```
Given this SaaS app idea: Jira clone called FlowBoard — project management SaaS 
with Kanban board, issue tracking, comments, and team members.

Generate a complete Supabase PostgreSQL schema including:
- profiles (extends auth.users: full_name, avatar_url)
- projects (name, description, slug, owner_id)
- project_members (project_id, user_id, role: admin/member/viewer)
- issues (title, description, status: todo/in_progress/in_review/done,
  priority: low/medium/high/urgent, project_id, assignee_id,
  reporter_id, due_date, order_index)
- comments (issue_id, user_id, body)
- labels (name, color, project_id)
- issue_labels (issue_id, label_id)
- All tables with created_at/updated_at timestamps
- Foreign key relationships
- RLS policies for each table
- Indexes on all foreign keys
- TypeScript Database type definitions for Supabase
Output as one complete SQL migration file + TypeScript types.
```

### Prompt 2A: Board Feature (Kanban) ⭐ Hero Feature
```
Build the Kanban board feature for FlowBoard following HACKATHON_GLOBAL_PROMPT.md rules.
Files to create:
1. src/lib/validations/issue.ts — Zod schema (title, description, status, priority, assignee_id, due_date)
2. src/lib/actions/issues.ts — createIssue, updateIssue, updateIssueStatus, deleteIssue, getIssuesByProject
3. src/app/(dashboard)/dashboard/[projectSlug]/board/page.tsx — server component
4. src/components/board/KanbanBoard.tsx — drag-drop with @hello-pangea/dnd, 4 columns
5. src/components/board/IssueCard.tsx — title, color-coded priority badge, assignee avatar
6. src/components/board/IssueDetailDialog.tsx — full editor: title, description, status, priority, assignee, comments
7. src/components/board/CreateIssueDialog.tsx — create form with validation
8. src/tests/validations/issue.test.ts — vitest tests for Zod schema
Both client-side (zodResolver) and server-side (server action) validation required.
Create all files now.
```

### Prompt 2B: Issues List Feature
```
Build the issues list page for FlowBoard following HACKATHON_GLOBAL_PROMPT.md rules.
Files to create:
1. src/app/(dashboard)/dashboard/[projectSlug]/issues/page.tsx — server component
2. src/components/issues/IssuesTable.tsx — sortable table (title, status, priority, assignee, due date)
3. src/components/issues/IssueFilters.tsx — filter by status + priority using URL search params
4. src/components/issues/IssueStatusBadge.tsx — color-coded status badge
Empty state when no issues. Loading skeleton. Create all files now.
```

### Prompt 2C: Members Feature
```
Build the members management page for FlowBoard following HACKATHON_GLOBAL_PROMPT.md rules.
Files to create:
1. src/lib/validations/member.ts — Zod schema (email, role: admin/member/viewer)
2. src/lib/actions/members.ts — inviteMember, removeMember, updateMemberRole, getMembersByProject
3. src/app/(dashboard)/dashboard/[projectSlug]/members/page.tsx — server component
4. src/components/members/MembersList.tsx — table of members with role badge + remove button
5. src/components/members/InviteMemberForm.tsx — invite by email with role select
6. src/tests/validations/member.test.ts — vitest tests
Both client-side and server-side validation required. Create all files now.
```

### Prompt 2D: Settings Feature
```
Build the project settings page for FlowBoard following HACKATHON_GLOBAL_PROMPT.md rules.
Files to create:
1. src/lib/validations/project.ts — Zod schema (name, description, slug)
2. src/lib/actions/projects.ts — createProject, updateProject, deleteProject, getProjects, getProjectBySlug
3. src/app/(dashboard)/dashboard/page.tsx — projects grid for logged-in user
4. src/app/(dashboard)/dashboard/new-project/page.tsx — create project form
5. src/app/(dashboard)/dashboard/[projectSlug]/settings/page.tsx — edit name/description, danger zone delete
6. src/tests/validations/project.test.ts — vitest tests
Both client-side and server-side validation. Create all files now.
```

### Prompt 3: Auth Pages
```
Generate complete auth pages for my Next.js + Supabase app:
1. /app/(auth)/login/page.tsx — email + password login form
2. /app/(auth)/signup/page.tsx — signup with email, password, confirm password
3. Both with React Hook Form + Zod validation
4. Client-side validation messages shown inline
5. Server Action for each form
6. Redirect to /dashboard on success
7. Error handling with toast notifications
Match my global prompt's validation and styling patterns.
```

### Prompt 4: Dashboard Layout
```
Create a responsive dashboard layout for FlowBoard (Jira clone):
- Dark left sidebar with:
  - FlowBoard logo at top
  - Project switcher dropdown
  - Nav links per project: Board, Issues, Members, Settings
  - lucide-react icons for each nav item
- Top header: project name breadcrumb + user avatar dropdown (profile, sign out)
- Mobile: sidebar collapses to hamburger menu
- Active route highlighted in sidebar
- Main content area with consistent padding
Make it look like a professional SaaS — clean, modern, dark sidebar like Linear or Jira.
Create all layout files now.
```

### Prompt 5: Fix + Polish Pass
```
Review this component and:
1. Add any missing loading states
2. Add proper error handling with user-friendly messages
3. Ensure all interactive elements have hover + focus states
4. Make it fully responsive (mobile-first)
5. Add aria labels for accessibility
6. Check for any TypeScript errors
[PASTE COMPONENT CODE]
```

---

## ⚡ SHORTCUTS & TIME-SAVERS

### Use shadcn components to skip building from scratch
```bash
npx shadcn@latest add button input label form card table badge toast dialog
```

### Quick utility function (`lib/utils.ts`)
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str
}
```

### Reusable error component
```typescript
// components/ui/FormError.tsx
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
      {message}
    </p>
  )
}
```

### Reusable loading skeleton
```typescript
// components/ui/Skeleton.tsx
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)} />
  )
}
```

---

## 🔌 MCP SERVERS AVAILABLE

Always use these MCP tools instead of asking me to do things manually.
**Never ask me to copy-paste SQL, push git commands, or click in dashboards.**

| MCP | Use For |
|---|---|
| **Supabase MCP** | Create tables, run migrations, insert seed data, add RLS policies, debug data |
| **Vercel MCP** | Deploy app, set env vars, check build logs, get live URL |
| **Context7 MCP** | Fetch latest docs for Next.js 16, Supabase SSR, any library — always do this before generating code |
| **GitHub MCP** | Create repo in Bacancy org, push code, create commits, monitor CI |
| **Next.js DevTools MCP** | Check live runtime errors, logs, routes — auto-connects when `npm run dev` is running |

### Windows — Start Codex (only GitHub token needed)
```powershell
# Supabase + Vercel use browser OAuth — no token needed
# Only GitHub requires a personal access token
$env:GITHUB_TOKEN = "your_github_personal_access_token"
cd C:\Users\admin\hackathon\[appname]
codex
```

> **First time only** — Supabase and Vercel will open a browser window
> automatically asking you to log in and authorize. Do this once and
> it's saved for all future sessions. No tokens needed for them.

### config.toml — Full MCP Configuration
Location: `C:\Users\admin\.codex\config.toml`
```toml
experimental_use_rmcp_client = true

[mcp_servers.supabase]
url = "https://mcp.supabase.com/mcp"
startup_timeout_sec = 120
tool_timeout_sec = 600

[mcp_servers.vercel]
url = "https://mcp.vercel.com/"
startup_timeout_sec = 120
tool_timeout_sec = 600

[mcp_servers.context7]
url = "https://mcp.context7.com/mcp"

[mcp_servers.github]
url = "https://api.githubcopilot.com/mcp/"
bearer_token_env_var = "GITHUB_TOKEN"
startup_timeout_sec = 120
tool_timeout_sec = 600
```

Get GitHub token → github.com → Settings → Developer Settings →
Personal Access Tokens (Classic) → Generate → select scopes: `repo` + `workflow`

### Example Combined MCP Prompt
```
Using Context7 MCP: fetch latest Next.js 16 App Router + @supabase/ssr docs.
Using Supabase MCP: create the issues table with all columns and RLS policies, then insert seed data.
Using GitHub MCP: commit all new files with message "feat: add issues feature".
Now generate the complete Kanban board feature following those docs and my global prompt rules.
Using Vercel MCP: after I confirm code looks good, deploy and give me the live URL.
```

---

## ✅ FINAL SUBMISSION CHECKLIST

### Technical
- [ ] App deployed and accessible on Vercel URL
- [ ] Auth (signup, login, logout) working
- [ ] Kanban board with drag-drop between 4 columns ⭐
- [ ] Create/edit/delete issues with validation
- [ ] Issues list page with status + priority filters
- [ ] Members invite + remove working
- [ ] Project settings update + delete working
- [ ] Client-side validation on all forms (zodResolver)
- [ ] Server-side validation on all server actions (Zod)
- [ ] RLS policies active on all tables
- [ ] Seed data in Supabase (for demo)
- [ ] `npm run build` passes with 0 errors
- [ ] Vitest tests passing for all Zod schemas

### Product
- [ ] Landing page (even a simple one) at root `/`
- [ ] Clear value proposition visible above the fold
- [ ] Demo video recorded (5 min max — Loom)
- [ ] GitHub repo pushed to Bacancy org
- [ ] Product Hunt listing text ready

### Submission Links to Gather
- [ ] Live Vercel URL
- [ ] GitHub repo URL  
- [ ] Demo video URL (Loom)
- [ ] Product Hunt listing URL (post launch day)

---

*Good luck! Ship fast, validate everything, and make it look great.* 🚀
# 💰 LiquidIQ — Enterprise Treasury & Cash Flow Command Center
> Stack: Next.js 16 + Supabase + Vercel + TypeScript + Recharts
> Modules: Auth · Dashboard · Bank Accounts · Transactions · Cash Flow Forecasting · Payments & Approvals · Risk Management · Reports
> Goal: Build locally → test → deploy to Vercel

---

## ⚠️ IMPORTANT NOTES FOR CODEX

> **Git / GitHub:** Repo will be provided by the organisation before deployment. Do NOT set up git during Phase 1. All git commands are in Phase 2 only. Focus entirely on building and running locally first.
>
> **MCP Servers:** GitHub MCP, Vercel MCP, and Supabase MCP are all offline (HTTP handshake error). Supabase and Vercel are handled manually. Codex handles code generation only.
>
> **Loaders:** Every page MUST have a full skeleton loader AND button-level spinners. No blank white screens ever. See the dedicated LOADING & SKELETON SYSTEM section.
>
> **Design:** Follow the DESIGN SYSTEM section strictly — colors, typography, spacing, component patterns all defined there.
>
> **Quality:** Every feature must work end-to-end. See the QUALITY RULES section. No broken links, no console errors, no empty error states.

---

## 📋 BUILD ORDER FOR CODEX

```
PHASE 1 — LOCAL DEV (no git needed):
0A. MANUAL: Create Supabase project via supabase.com → run SQL schema + seed in SQL Editor
0B. Scaffold Next.js app in current folder + install all dependencies
0C. Create .mcp.json for Next.js DevTools MCP + .env.local
1.  Supabase clients (browser + server) + middleware + TypeScript types
2.  Auth pages (login + register) + server actions + validation
3.  App layout (sidebar + header + mobile drawer)
4.  Dashboard home (KPI cards + cash position chart)
5.  Bank Accounts list + add + edit + detail
6.  Transactions list (search + filter)
7.  Cash Flow Forecasts (chart + add forecast entry)
8.  Payments list + initiate payment + approval workflow
9.  Risk Management dashboard (exposure table + alerts)
10. Reports page (cash position + exposure + compliance)
11. Loading skeletons for ALL pages + button spinners
12. Write all Vitest unit tests + Playwright E2E tests
13. npm run dev — verify everything works locally

PHASE 2 — DEPLOY (only after Phase 1 fully working locally):
14. npm run build — fix ALL errors
15. npm run test:run + npm run test:e2e — all must pass
16. MANUAL: git clone org-provided repo → copy files → commit → push
17. MANUAL: Deploy to Vercel via vercel.com dashboard or Vercel CLI
18. MANUAL: Add Vercel URL to Supabase Auth redirect URLs
19. Verify production — test auth, all modules, logout
20. Record demo + submit
```

---

## 🗄️ STEP 0A — CREATE SUPABASE PROJECT ⚠️ MANUAL (MCP offline)

**Option A — Supabase Dashboard (recommended):**
1. Go to https://supabase.com/dashboard → **New project**
2. Name: `liquidiq` | Choose your region | Set a strong DB password
3. Wait ~2 minutes for provisioning
4. Go to **SQL Editor** → paste and run the entire DATABASE SCHEMA section below (all tables + triggers + RLS + seed data) in one go
5. Go to **Project Settings → API** and copy these 3 values into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon / public key
   - `SUPABASE_SERVICE_ROLE_KEY` → service_role key

**Option B — Supabase CLI:**
```bash
npm install -g supabase
supabase login
supabase projects create liquidiq --org-id YOUR_ORG_ID
# Then link and run migrations locally
supabase init
supabase db push
```

---

## 🗃️ DATABASE SCHEMA

### Table: `profiles`
Extends Supabase auth.users — auto-created on signup via trigger.
```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  avatar_url  text,
  role        text not null default 'treasurer'
              check (role in ('admin', 'treasurer', 'approver', 'viewer')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### Table: `bank_accounts`
```sql
create table bank_accounts (
  id              uuid primary key default gen_random_uuid(),
  account_number  text not null unique,
  account_name    text not null,
  bank_name       text not null,
  bank_code       text,
  currency        text not null default 'USD',
  account_type    text not null default 'current'
                  check (account_type in ('current', 'savings', 'money_market', 'loan', 'investment')),
  status          text not null default 'active'
                  check (status in ('active', 'inactive', 'frozen')),
  current_balance numeric(18,2) not null default 0,
  available_balance numeric(18,2) not null default 0,
  entity_name     text,
  country         text,
  iban            text,
  swift_bic       text,
  last_synced_at  timestamptz,
  notes           text,
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger bank_accounts_updated_at
  before update on bank_accounts
  for each row execute procedure update_updated_at();
```

### Table: `transactions`
```sql
create table transactions (
  id              uuid primary key default gen_random_uuid(),
  transaction_ref text not null unique,
  bank_account_id uuid not null references bank_accounts(id) on delete cascade,
  transaction_type text not null
                  check (transaction_type in ('credit', 'debit', 'transfer', 'fee', 'interest', 'fx')),
  amount          numeric(18,2) not null,
  currency        text not null default 'USD',
  base_amount     numeric(18,2),
  exchange_rate   numeric(12,6) default 1,
  value_date      date not null,
  booking_date    date,
  description     text,
  counterparty    text,
  category        text
                  check (category in ('payroll', 'vendor', 'tax', 'intercompany', 'investment', 'debt_service', 'fx', 'other')),
  reference       text,
  status          text not null default 'completed'
                  check (status in ('pending', 'completed', 'failed', 'cancelled', 'reconciled')),
  reconciled      boolean default false,
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger transactions_updated_at
  before update on transactions
  for each row execute procedure update_updated_at();
```

### Table: `cash_flow_forecasts`
```sql
create table cash_flow_forecasts (
  id              uuid primary key default gen_random_uuid(),
  forecast_date   date not null,
  entity_name     text,
  currency        text not null default 'USD',
  inflow_amount   numeric(18,2) not null default 0,
  outflow_amount  numeric(18,2) not null default 0,
  net_position    numeric(18,2) generated always as (inflow_amount - outflow_amount) stored,
  category        text
                  check (category in ('operating', 'investing', 'financing', 'fx', 'other')),
  description     text,
  confidence      text default 'medium'
                  check (confidence in ('high', 'medium', 'low')),
  is_actual       boolean default false,
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger cash_flow_forecasts_updated_at
  before update on cash_flow_forecasts
  for each row execute procedure update_updated_at();
```

### Table: `payments`
```sql
create table payments (
  id              uuid primary key default gen_random_uuid(),
  payment_ref     text not null unique,
  from_account_id uuid references bank_accounts(id),
  to_account_id   uuid references bank_accounts(id),
  beneficiary_name text not null,
  beneficiary_iban text,
  beneficiary_bank text,
  amount          numeric(18,2) not null,
  currency        text not null default 'USD',
  payment_type    text not null default 'wire'
                  check (payment_type in ('wire', 'ach', 'sepa', 'swift', 'internal', 'check')),
  value_date      date,
  purpose         text,
  status          text not null default 'draft'
                  check (status in ('draft', 'pending_approval', 'approved', 'rejected', 'processing', 'completed', 'cancelled', 'failed')),
  priority        text default 'normal'
                  check (priority in ('low', 'normal', 'high', 'urgent')),
  approval_level  integer default 0,
  required_approvals integer default 1,
  notes           text,
  created_by      uuid references profiles(id),
  approved_by     uuid references profiles(id),
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger payments_updated_at
  before update on payments
  for each row execute procedure update_updated_at();
```

### Table: `approval_workflows`
```sql
create table approval_workflows (
  id          uuid primary key default gen_random_uuid(),
  payment_id  uuid not null references payments(id) on delete cascade,
  approver_id uuid not null references profiles(id),
  action      text not null check (action in ('approved', 'rejected', 'recalled')),
  comments    text,
  actioned_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
```

### Table: `risk_exposures`
```sql
create table risk_exposures (
  id              uuid primary key default gen_random_uuid(),
  exposure_date   date not null,
  risk_type       text not null
                  check (risk_type in ('fx', 'interest_rate', 'credit', 'liquidity', 'counterparty')),
  currency_pair   text,
  notional_amount numeric(18,2),
  base_currency   text default 'USD',
  exposure_amount numeric(18,2) not null,
  mark_to_market  numeric(18,2),
  hedge_ratio     numeric(5,2) default 0,
  entity_name     text,
  counterparty    text,
  maturity_date   date,
  severity        text default 'medium'
                  check (severity in ('low', 'medium', 'high', 'critical')),
  notes           text,
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger risk_exposures_updated_at
  before update on risk_exposures
  for each row execute procedure update_updated_at();
```

### Table: `currency_rates`
```sql
create table currency_rates (
  id          uuid primary key default gen_random_uuid(),
  base        text not null,
  target      text not null,
  rate        numeric(12,6) not null,
  rate_date   date not null,
  source      text default 'manual',
  created_at  timestamptz not null default now(),
  unique(base, target, rate_date)
);
```

### Table: `audit_logs`
```sql
create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);
```

### Shared update trigger
```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

### RLS Policies

```sql
-- profiles
alter table profiles enable row level security;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- bank_accounts
alter table bank_accounts enable row level security;
create policy "Authenticated users full access on bank_accounts"
  on bank_accounts for all using (auth.role() = 'authenticated');

-- transactions
alter table transactions enable row level security;
create policy "Authenticated users full access on transactions"
  on transactions for all using (auth.role() = 'authenticated');

-- cash_flow_forecasts
alter table cash_flow_forecasts enable row level security;
create policy "Authenticated users full access on forecasts"
  on cash_flow_forecasts for all using (auth.role() = 'authenticated');

-- payments
alter table payments enable row level security;
create policy "Authenticated users full access on payments"
  on payments for all using (auth.role() = 'authenticated');

-- approval_workflows
alter table approval_workflows enable row level security;
create policy "Authenticated users full access on approvals"
  on approval_workflows for all using (auth.role() = 'authenticated');

-- risk_exposures
alter table risk_exposures enable row level security;
create policy "Authenticated users full access on risk_exposures"
  on risk_exposures for all using (auth.role() = 'authenticated');

-- currency_rates
alter table currency_rates enable row level security;
create policy "Authenticated users full access on currency_rates"
  on currency_rates for all using (auth.role() = 'authenticated');

-- audit_logs: insert only, no delete
alter table audit_logs enable row level security;
create policy "Authenticated users can insert audit_logs"
  on audit_logs for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can view audit_logs"
  on audit_logs for select using (auth.role() = 'authenticated');
```

### Seed Data

```sql
-- Currency rates
insert into currency_rates (base, target, rate, rate_date) values
('USD', 'EUR', 0.921400, current_date),
('USD', 'GBP', 0.789200, current_date),
('USD', 'JPY', 149.850000, current_date),
('USD', 'INR', 83.120000, current_date),
('USD', 'AUD', 1.530000, current_date),
('EUR', 'USD', 1.084800, current_date),
('GBP', 'USD', 1.267000, current_date);

-- Bank accounts
insert into bank_accounts (
  account_number, account_name, bank_name, currency, account_type,
  status, current_balance, available_balance, entity_name, country
) values
('US-001-4521', 'Main Operating Account', 'JPMorgan Chase', 'USD', 'current',   'active', 4250000.00, 4100000.00, 'LiquidIQ Corp',     'US'),
('US-002-7834', 'Payroll Disbursement',   'Bank of America', 'USD', 'current',  'active', 820000.00,  820000.00,  'LiquidIQ Corp',     'US'),
('EU-003-2291', 'EU Operations Account', 'Deutsche Bank',   'EUR', 'current',   'active', 1750000.00, 1600000.00, 'LiquidIQ Europe',   'DE'),
('GB-004-5512', 'UK Subsidiary Account', 'Barclays',        'GBP', 'current',   'active', 980000.00,  950000.00,  'LiquidIQ UK Ltd',   'GB'),
('US-005-9103', 'Money Market Reserve',  'Goldman Sachs',   'USD', 'money_market','active',12000000.00,12000000.00,'LiquidIQ Corp',     'US'),
('US-006-3374', 'Credit Line Account',   'Citibank',        'USD', 'loan',      'active', -2500000.00,-2500000.00,'LiquidIQ Corp',     'US'),
('SG-007-8821', 'APAC Treasury Account', 'DBS Bank',        'USD', 'current',   'active', 2200000.00, 2100000.00, 'LiquidIQ Asia Pte', 'SG'),
('US-008-6647', 'Tax Reserve Account',   'Wells Fargo',     'USD', 'savings',   'active', 650000.00,  650000.00,  'LiquidIQ Corp',     'US');

-- Transactions
insert into transactions (
  transaction_ref, bank_account_id, transaction_type, amount, currency,
  value_date, description, counterparty, category, status, reconciled
)
select
  'TXN-' || lpad(row_number() over ()::text, 6, '0'),
  ba.id,
  t.ttype, t.amount, t.currency, t.vdate,
  t.descr, t.cparty, t.cat, 'completed', true
from bank_accounts ba
cross join lateral (
  values
  ('credit', 850000.00, 'USD', current_date - 1, 'Customer payment received', 'Acme Corp',   'vendor'),
  ('debit',  125000.00, 'USD', current_date - 2, 'Monthly payroll run',       'ADP Payroll', 'payroll'),
  ('debit',   42000.00, 'USD', current_date - 3, 'Vendor invoice payment',    'Oracle Corp', 'vendor'),
  ('credit',  320000.00,'USD', current_date - 4, 'Intercompany funding',      'LiquidIQ EU', 'intercompany'),
  ('debit',   18500.00, 'USD', current_date - 5, 'Q1 tax installment',        'IRS',         'tax')
) as t(ttype, amount, currency, vdate, descr, cparty, cat)
where ba.account_number = 'US-001-4521';

-- Cash flow forecasts (next 14 days)
insert into cash_flow_forecasts (forecast_date, entity_name, currency, inflow_amount, outflow_amount, category, description, confidence)
select
  current_date + n,
  'LiquidIQ Corp',
  'USD',
  case when n % 3 = 0 then 500000 + (random() * 200000)::numeric
       when n % 2 = 0 then 150000 + (random() * 100000)::numeric
       else 80000 + (random() * 50000)::numeric end,
  case when n % 4 = 0 then 420000 + (random() * 150000)::numeric
       when n % 3 = 1 then 95000 + (random() * 60000)::numeric
       else 45000 + (random() * 30000)::numeric end,
  (array['operating','investing','financing','other'])[1 + (n % 4)],
  'Projected cash flow day ' || n,
  (array['high','medium','medium','low'])[1 + (n % 4)]
from generate_series(1, 14) as n;

-- Payments
insert into payments (
  payment_ref, beneficiary_name, amount, currency, payment_type,
  value_date, purpose, status, priority
) values
('PAY-000001', 'Oracle Corporation',  98500.00, 'USD', 'wire',  current_date + 2, 'Software license renewal Q1', 'pending_approval', 'normal'),
('PAY-000002', 'AWS EMEA SARL',       42200.00, 'EUR', 'sepa',  current_date + 1, 'Cloud infrastructure invoice', 'approved',        'high'),
('PAY-000003', 'Salesforce Inc',      29750.00, 'USD', 'ach',   current_date + 3, 'CRM annual subscription',      'draft',           'normal'),
('PAY-000004', 'LiquidIQ Europe GmbH',350000.00,'EUR', 'swift', current_date,     'Intercompany funding transfer', 'processing',      'urgent'),
('PAY-000005', 'HMRC Tax Authority',   88000.00,'GBP', 'wire',  current_date + 5, 'UK corporation tax Q1',        'pending_approval','high'),
('PAY-000006', 'Deloitte Advisory',   55000.00, 'USD', 'wire',  current_date + 7, 'Audit services Q4',            'draft',           'normal');

-- Risk exposures
insert into risk_exposures (
  exposure_date, risk_type, currency_pair, notional_amount, base_currency,
  exposure_amount, mark_to_market, hedge_ratio, entity_name, severity
) values
(current_date, 'fx',            'EUR/USD', 1750000, 'USD', 161150,   -8200,  45.0, 'LiquidIQ Corp',     'medium'),
(current_date, 'fx',            'GBP/USD', 980000,  'USD', 195216,    4100,  60.0, 'LiquidIQ Corp',     'medium'),
(current_date, 'interest_rate', null,      2500000, 'USD', 2500000,  -12500, 0.0,  'LiquidIQ Corp',     'high'),
(current_date, 'liquidity',     null,      null,    'USD', 4250000,   null,  0.0,  'LiquidIQ Corp',     'low'),
(current_date, 'credit',        null,      500000,  'USD', 500000,    null,  0.0,  'LiquidIQ Asia Pte', 'medium'),
(current_date, 'fx',            'USD/JPY', 320000,  'USD', 47952000, -3800,  30.0, 'LiquidIQ Asia Pte', 'low');
```

---

## ⚡ STEP 0B — PROJECT SETUP

### Scaffold + Install
```bash
# Scaffold directly in current working directory (no git clone needed yet)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react clsx tailwind-merge sonner date-fns
npm install recharts

# shadcn UI
npx shadcn@latest init
npx shadcn@latest add button input label form card dialog select textarea badge avatar dropdown-menu sheet separator skeleton toast table tabs progress popover calendar command

# Testing
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E
npm install -D @playwright/test
npx playwright install chromium

# Page loader
npm install nextjs-toploader
```

### Create `.mcp.json`
```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

### Create `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=paste_from_supabase_dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_from_supabase_dashboard
SUPABASE_SERVICE_ROLE_KEY=paste_from_supabase_dashboard
```

> ⚠️ Only manual step: paste the 3 keys from Supabase Dashboard → Project Settings → API.
> ⚠️ Do NOT commit .env.local to git. It is in .gitignore by default.

> 🚫 NO GIT SETUP HERE — git is configured in Phase 2 when the org repo is provided.

---

## 🎨 DESIGN SYSTEM

> Codex MUST follow this design system for every component. Do not use random colors or spacing.

### Color Palette
```
Background (app):     #0f172a  (slate-950)
Background (card):    #1e293b  (slate-800)
Background (surface): #334155  (slate-700)
Border:               #475569  (slate-600)
Text primary:         #f1f5f9  (slate-100)
Text secondary:       #94a3b8  (slate-400)
Text muted:           #64748b  (slate-500)

Accent green:         #22c55e  (green-500)   — positive values, credits, success
Accent red:           #ef4444  (red-500)     — negative values, debits, errors
Accent blue:          #3b82f6  (blue-500)    — info, links, charts secondary
Accent yellow:        #eab308  (yellow-500)  — warnings, medium risk
Accent orange:        #f97316  (orange-500)  — high priority, high risk

Sidebar bg:           #0f172a  (slate-950)
Sidebar active item:  #1e293b  (slate-800) with green-500 left border (3px)
Header bg:            #1e293b  (slate-800) with border-b slate-700
```

### Typography
```
Font family:  Inter (system font fallback: ui-sans-serif)
Headings:     font-semibold text-slate-100
Sub-headings: font-medium text-slate-200
Body text:    font-normal text-slate-300
Muted text:   font-normal text-slate-400
Labels:       text-xs font-medium uppercase tracking-wide text-slate-400
Values (KPI): text-2xl font-bold text-slate-100
```

### Spacing & Layout
```
Page padding:        p-6 (desktop), p-4 (mobile)
Card padding:        p-6
Card border radius:  rounded-xl
Card border:         border border-slate-700
Gap between cards:   gap-6 (desktop), gap-4 (mobile)
Table row height:    h-12
Form max-width:      max-w-2xl
```

### Component Patterns

**KPI Card:**
```
bg-slate-800 rounded-xl border border-slate-700 p-6
  Icon (colored, 40x40, bg colored/10 rounded-lg)
  Label: text-sm text-slate-400
  Value: text-2xl font-bold text-slate-100
  Trend: text-xs with ↑ green-500 / ↓ red-500
```

**Data Table:**
```
bg-slate-800 rounded-xl border border-slate-700 overflow-hidden
  thead: bg-slate-900 text-xs uppercase text-slate-400 tracking-wide
  tbody tr: border-b border-slate-700 hover:bg-slate-700/50 transition
  td: text-sm text-slate-300 py-3 px-4
```

**Form Card:**
```
bg-slate-800 rounded-xl border border-slate-700 p-6
  Input: bg-slate-900 border-slate-600 text-slate-100 focus:ring-green-500
  Label: text-sm font-medium text-slate-300 mb-1.5
  Error: text-xs text-red-400 mt-1
```

**Buttons:**
```
Primary:   bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg px-4 py-2
Danger:    bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg px-4 py-2
Secondary: bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg px-4 py-2
Ghost:     hover:bg-slate-700 text-slate-400 hover:text-slate-100 rounded-lg px-4 py-2
Disabled:  opacity-50 cursor-not-allowed (always applied when loading)
```

**Status / Severity Badges:**
```
active / completed / approved → bg-green-500/10 text-green-400 border-green-500/20
inactive / cancelled / draft  → bg-slate-500/10 text-slate-400 border-slate-500/20
pending / medium              → bg-yellow-500/10 text-yellow-400 border-yellow-500/20
failed / critical / rejected  → bg-red-500/10 text-red-400 border-red-500/20
processing / high             → bg-orange-500/10 text-orange-400 border-orange-500/20
frozen / low                  → bg-blue-500/10 text-blue-400 border-blue-500/20

Badge style: text-xs font-medium px-2.5 py-0.5 rounded-full border inline-flex items-center
```

**Auth Pages:**
```
Full screen: bg-gradient-to-br from-slate-950 to-slate-900
Center card: bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 w-full max-w-md
Logo area above card: 💰 LiquidIQ in green-400, tagline in slate-400
Subtle grid pattern overlay on background (CSS grid lines, very low opacity)
```

**Charts (Recharts):**
```
Container bg:    transparent
Grid lines:      stroke="#334155" (slate-700)
Axis text:       fill="#94a3b8" (slate-400) fontSize=12
Tooltip bg:      #1e293b (slate-800) border slate-700 text slate-100
Area fill:       green-500 with 20% opacity fill, green-500 stroke
Bar (inflow):    #22c55e (green-500)
Bar (outflow):   #ef4444 (red-500)
Line (net):      #3b82f6 (blue-500)
```

### Sidebar Design
```
Width:        260px fixed
Background:   slate-950
Logo section: py-6 px-4 — 💰 icon + "LiquidIQ" text-xl font-bold text-white
              subtext: "Treasury Command Center" text-xs text-slate-500

Nav items:    px-3 py-2 rounded-lg mx-2 flex items-center gap-3
  Default:    text-slate-400 hover:text-slate-100 hover:bg-slate-800
  Active:     text-green-400 bg-slate-800 border-l-2 border-green-500 font-medium

Bottom:       border-t border-slate-800 mt-auto p-4
  User info:  avatar (32px circle) + name text-sm text-slate-300 + email text-xs text-slate-500
  Sign out:   ghost button with LogOut icon, text-slate-400

Mobile:       Sheet component sliding from left, same design
```

---

## ⏳ LOADING & SKELETON SYSTEM

> CRITICAL: Every single page and every button interaction MUST have proper loading states.
> NO blank white screens. NO layout shift. NO unresponsive buttons.

### Rule 1 — Top Progress Bar (every navigation)
`NextTopLoader` in `src/app/layout.tsx`:
```tsx
<NextTopLoader color="#22c55e" height={3} showSpinner={false} />
```

### Rule 2 — Page Skeleton Files
Every route segment MUST have a `loading.tsx` that renders a skeleton matching the page layout exactly. Skeletons use `<Skeleton>` from shadcn with `bg-slate-700 animate-pulse`.

**`src/app/(dashboard)/loading.tsx`** — Generic fallback:
```tsx
Full page centered spinner: <Loader2 className="animate-spin text-green-500 h-8 w-8" />
```

**`src/app/(dashboard)/dashboard/loading.tsx`** — Dashboard skeleton:
```
6 skeleton KPI cards (same grid as real cards, h-28)
1 skeleton chart area (h-64 rounded-xl)
1 skeleton table (5 rows h-12)
```

**`src/app/(dashboard)/accounts/loading.tsx`** — Accounts skeleton:
```
Page header skeleton (h-8 w-48)
Search + filter bar skeleton (h-10 full width)
Table skeleton: header row + 8 data rows (h-12 each)
```

**`src/app/(dashboard)/accounts/add/loading.tsx` + `accounts/[id]/loading.tsx` + `accounts/[id]/edit/loading.tsx`:**
```
Form card skeleton: title (h-8 w-64) + 6 input field skeletons (h-10) + button (h-10 w-32)
```

**`src/app/(dashboard)/transactions/loading.tsx`:**
```
Filter bar skeleton (h-10 full width)
Table skeleton: header + 10 rows (h-12 each)
```

**`src/app/(dashboard)/forecasts/loading.tsx`:**
```
Chart skeleton (h-72 rounded-xl)
Table skeleton: 8 rows
```

**`src/app/(dashboard)/payments/loading.tsx`:**
```
Tabs skeleton (h-10 w-96)
Table skeleton: header + 6 rows
```

**`src/app/(dashboard)/payments/add/loading.tsx` + `payments/[id]/loading.tsx`:**
```
Form card skeleton with 8 input skeletons
```

**`src/app/(dashboard)/risk/loading.tsx`:**
```
4 summary card skeletons (h-28)
FX rates skeleton (h-48)
Table skeleton: 6 rows
```

**`src/app/(dashboard)/reports/loading.tsx`:**
```
6 report card skeletons (h-36)
```

### Rule 3 — Button Loading States
Every form submit button and action button MUST:
1. Show `<Loader2 className="animate-spin h-4 w-4 mr-2" />` + loading text while pending
2. Be `disabled` while loading (prevents double-clicks)
3. Never revert to normal state if the action is navigating away

```tsx
// Pattern for ALL buttons:
<Button disabled={isLoading} onClick={handleAction}>
  {isLoading ? (
    <>
      <Loader2 className="animate-spin h-4 w-4 mr-2" />
      {loadingText}
    </>
  ) : (
    <>{icon} {label}</>
  )}
</Button>
```

**Required button loading texts:**
```
Login:              "Signing in..."
Register:           "Creating account..."
Logout:             "Signing out..."
Add Account:        "Saving account..."
Edit Account:       "Saving changes..."
Delete Account:     "Deleting..."
Initiate Payment:   "Creating payment..."
Submit for Approval:"Submitting..."
Approve Payment:    "Approving..."
Reject Payment:     "Rejecting..."
Add Forecast:       "Saving forecast..."
Delete Forecast:    "Deleting..."
Generate Report:    "Generating..."
Mark Reconciled:    "Updating..."
```

### Rule 4 — Table/List Loading Overlay
When search or filter changes trigger a re-fetch (client-side), show a semi-transparent overlay spinner over the table:
```tsx
<div className="relative">
  {isFiltering && (
    <div className="absolute inset-0 bg-slate-900/50 rounded-xl flex items-center justify-center z-10">
      <Loader2 className="animate-spin h-6 w-6 text-green-500" />
    </div>
  )}
  <DataTable ... />
</div>
```

### Rule 5 — Sidebar Navigation Spinner
When navigating between pages, the active sidebar nav item shows a small spinner replacing its icon:
```tsx
// In Sidebar.tsx — for the active route during navigation
{isNavigating && activeRoute === item.href
  ? <Loader2 className="animate-spin h-4 w-4" />
  : <item.icon className="h-4 w-4" />
}
```

### Rule 6 — Empty States (not skeletons — for when data is genuinely empty)
Every list/table must handle the empty state gracefully:
```tsx
// Pattern: show inside the table card, never a blank area
<div className="flex flex-col items-center justify-center py-16 text-slate-500">
  <Icon className="h-12 w-12 mb-4 opacity-30" />
  <p className="text-lg font-medium text-slate-400">No {entity} found</p>
  <p className="text-sm mt-1">Try adjusting your filters or add a new {entity}.</p>
  {showAddButton && <Button className="mt-4">Add {entity}</Button>}
</div>
```

### Rule 7 — Error States
Every server component that fetches data must handle errors:
```tsx
// In every page.tsx that fetches:
if (error) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <AlertCircle className="h-12 w-12 mb-4 text-red-500 opacity-60" />
      <p className="text-lg font-medium text-slate-400">Failed to load data</p>
      <p className="text-sm mt-1 text-slate-500">{error.message}</p>
    </div>
  )
}
```

---

## ✅ QUALITY RULES

> Codex MUST follow all these rules. Do not skip any of them.

### Functional Completeness
- Every link in the sidebar navigates to a real working page
- Every "Add" / "Edit" button opens a real form that saves to Supabase
- Every "Delete" button shows a confirmation dialog before deleting
- Every form shows inline validation errors (not just toast)
- Every action shows a success toast (`sonner`) on completion
- Every action shows an error toast if Supabase returns an error
- Search and filter controls actually filter the data (not just UI placeholders)
- All amounts are formatted with `Intl.NumberFormat` — never raw numbers
- All dates are formatted with `date-fns` — never raw ISO strings

### Form Validation UX
- Errors shown inline below the field using react-hook-form + zod
- Submit button disabled until form is valid (optional) or shows errors on submit
- No field clears its value after a failed submission
- Required fields are marked with `*`
- Currency inputs accept only numbers, show 2 decimal places

### Navigation & Routing
- Clicking any row in a table navigates to the detail page (or opens edit)
- Breadcrumb or Back button present on all detail/edit/add pages
- After save/delete, user is redirected to the list page (not left on blank form)
- `/` redirects to `/dashboard` when logged in, to `/login` when not

### Responsive Design
- Mobile breakpoint: below `md` (768px)
- Tables become card stacks on mobile (use `AccountCard`, `TransactionCard` pattern)
- Sidebar becomes Sheet drawer on mobile
- All forms are full-width on mobile, max-w-2xl on desktop
- No horizontal overflow on any screen size

### TypeScript
- No `any` types anywhere
- All Supabase responses properly typed using the interfaces in `src/types/index.ts`
- All server actions return typed responses: `{ data: T } | { error: string }`

### Supabase Best Practices
- All data fetching in server components uses the server Supabase client
- All mutations use server actions (not client-side fetch)
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Revalidate cache after every mutation using `revalidatePath`

---



```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  ← sidebar + header
│   │   ├── dashboard/page.tsx          ← KPI cards + charts
│   │   ├── accounts/
│   │   │   ├── page.tsx                ← accounts list
│   │   │   ├── add/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx            ← account detail + txns
│   │   │       └── edit/page.tsx
│   │   ├── transactions/
│   │   │   └── page.tsx                ← transactions list
│   │   ├── forecasts/
│   │   │   └── page.tsx                ← chart + forecast entries
│   │   ├── payments/
│   │   │   ├── page.tsx                ← payments list
│   │   │   ├── add/page.tsx            ← initiate payment
│   │   │   └── [id]/page.tsx           ← payment detail + approvals
│   │   ├── risk/
│   │   │   └── page.tsx                ← risk dashboard
│   │   └── reports/
│   │       └── page.tsx                ← reports hub
│   ├── auth/callback/route.ts
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileDrawer.tsx
│   ├── dashboard/
│   │   ├── KpiCard.tsx
│   │   ├── CashPositionChart.tsx       ← Recharts AreaChart
│   │   └── RecentPayments.tsx
│   ├── accounts/
│   │   ├── AccountTable.tsx
│   │   ├── AccountCard.tsx             ← mobile
│   │   ├── AccountForm.tsx
│   │   ├── AccountDetail.tsx
│   │   ├── AccountStatusBadge.tsx
│   │   └── DeleteAccountDialog.tsx
│   ├── transactions/
│   │   ├── TransactionTable.tsx
│   │   ├── TransactionFilters.tsx
│   │   ├── TransactionStatusBadge.tsx
│   │   └── TransactionTypeBadge.tsx
│   ├── forecasts/
│   │   ├── ForecastChart.tsx           ← Recharts BarChart grouped
│   │   ├── ForecastTable.tsx
│   │   └── ForecastForm.tsx
│   ├── payments/
│   │   ├── PaymentTable.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── PaymentDetail.tsx
│   │   ├── PaymentStatusBadge.tsx
│   │   ├── ApprovalTimeline.tsx
│   │   └── ApproveRejectButtons.tsx
│   ├── risk/
│   │   ├── RiskSummaryCards.tsx
│   │   ├── ExposureTable.tsx
│   │   ├── RiskSeverityBadge.tsx
│   │   └── FxRatesWidget.tsx
│   └── reports/
│       ├── ReportCard.tsx
│       └── CashPositionReport.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   ├── payment.ts
│   │   └── forecast.ts
│   └── utils.ts
├── actions/
│   ├── auth.ts
│   ├── accounts.ts
│   ├── transactions.ts
│   ├── payments.ts
│   ├── forecasts.ts
│   └── risk.ts
└── types/
    └── index.ts
```

---

## 🔷 TYPESCRIPT TYPES — `src/types/index.ts`

```typescript
export type UserRole = 'admin' | 'treasurer' | 'approver' | 'viewer'
export type AccountType = 'current' | 'savings' | 'money_market' | 'loan' | 'investment'
export type AccountStatus = 'active' | 'inactive' | 'frozen'
export type TransactionType = 'credit' | 'debit' | 'transfer' | 'fee' | 'interest' | 'fx'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'reconciled'
export type TransactionCategory = 'payroll' | 'vendor' | 'tax' | 'intercompany' | 'investment' | 'debt_service' | 'fx' | 'other'
export type PaymentType = 'wire' | 'ach' | 'sepa' | 'swift' | 'internal' | 'check'
export type PaymentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled' | 'failed'
export type PaymentPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ForecastCategory = 'operating' | 'investing' | 'financing' | 'fx' | 'other'
export type ForecastConfidence = 'high' | 'medium' | 'low'
export type RiskType = 'fx' | 'interest_rate' | 'credit' | 'liquidity' | 'counterparty'
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface BankAccount {
  id: string
  account_number: string
  account_name: string
  bank_name: string
  bank_code: string | null
  currency: string
  account_type: AccountType
  status: AccountStatus
  current_balance: number
  available_balance: number
  entity_name: string | null
  country: string | null
  iban: string | null
  swift_bic: string | null
  last_synced_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  transaction_ref: string
  bank_account_id: string
  transaction_type: TransactionType
  amount: number
  currency: string
  base_amount: number | null
  exchange_rate: number
  value_date: string
  booking_date: string | null
  description: string | null
  counterparty: string | null
  category: TransactionCategory | null
  reference: string | null
  status: TransactionStatus
  reconciled: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  bank_accounts?: Pick<BankAccount, 'account_name' | 'bank_name' | 'currency'>
}

export interface Payment {
  id: string
  payment_ref: string
  from_account_id: string | null
  to_account_id: string | null
  beneficiary_name: string
  beneficiary_iban: string | null
  beneficiary_bank: string | null
  amount: number
  currency: string
  payment_type: PaymentType
  value_date: string | null
  purpose: string | null
  status: PaymentStatus
  priority: PaymentPriority
  approval_level: number
  required_approvals: number
  notes: string | null
  created_by: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface ApprovalWorkflow {
  id: string
  payment_id: string
  approver_id: string
  action: 'approved' | 'rejected' | 'recalled'
  comments: string | null
  actioned_at: string
  profiles?: Pick<Profile, 'full_name' | 'email'>
}

export interface CashFlowForecast {
  id: string
  forecast_date: string
  entity_name: string | null
  currency: string
  inflow_amount: number
  outflow_amount: number
  net_position: number
  category: ForecastCategory | null
  description: string | null
  confidence: ForecastConfidence
  is_actual: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface RiskExposure {
  id: string
  exposure_date: string
  risk_type: RiskType
  currency_pair: string | null
  notional_amount: number | null
  base_currency: string
  exposure_amount: number
  mark_to_market: number | null
  hedge_ratio: number
  entity_name: string | null
  counterparty: string | null
  maturity_date: string | null
  severity: RiskSeverity
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CurrencyRate {
  id: string
  base: string
  target: string
  rate: number
  rate_date: string
  source: string
  created_at: string
}

export interface DashboardKpis {
  totalCashUsd: number
  totalAccounts: number
  pendingPayments: number
  pendingPaymentsValue: number
  forecastNetNext7d: number
  criticalAlerts: number
  totalInflow30d: number
  totalOutflow30d: number
}
```

---

## ✅ STEP 1 — SUPABASE CLIENTS + MIDDLEWARE

### `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `src/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
```

### `src/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isPublicRoute = PUBLIC_ROUTES.some(r =>
    request.nextUrl.pathname.startsWith(r))

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register' ||
    request.nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## 🔐 STEP 2 — VALIDATION SCHEMAS

### `src/lib/validations/auth.ts`
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

### `src/lib/validations/account.ts`
```typescript
import { z } from 'zod'

export const accountSchema = z.object({
  account_number: z.string().min(3, 'Account number required').max(50),
  account_name: z.string().min(2, 'Account name required').max(100),
  bank_name: z.string().min(2, 'Bank name required').max(100),
  bank_code: z.string().max(20).optional().or(z.literal('')),
  currency: z.string().length(3, 'Must be 3-letter currency code').default('USD'),
  account_type: z.enum(['current','savings','money_market','loan','investment']),
  status: z.enum(['active','inactive','frozen']).default('active'),
  current_balance: z.coerce.number().default(0),
  available_balance: z.coerce.number().default(0),
  entity_name: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(2).optional().or(z.literal('')),
  iban: z.string().max(34).optional().or(z.literal('')),
  swift_bic: z.string().max(11).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type AccountInput = z.infer<typeof accountSchema>
```

### `src/lib/validations/payment.ts`
```typescript
import { z } from 'zod'

export const paymentSchema = z.object({
  beneficiary_name: z.string().min(2, 'Beneficiary name required').max(100),
  beneficiary_iban: z.string().max(34).optional().or(z.literal('')),
  beneficiary_bank: z.string().max(100).optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  payment_type: z.enum(['wire','ach','sepa','swift','internal','check']),
  value_date: z.string().optional(),
  purpose: z.string().max(200).optional().or(z.literal('')),
  priority: z.enum(['low','normal','high','urgent']).default('normal'),
  from_account_id: z.string().uuid().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type PaymentInput = z.infer<typeof paymentSchema>
```

### `src/lib/validations/forecast.ts`
```typescript
import { z } from 'zod'

export const forecastSchema = z.object({
  forecast_date: z.string().min(1, 'Date is required'),
  entity_name: z.string().max(100).optional().or(z.literal('')),
  currency: z.string().length(3).default('USD'),
  inflow_amount: z.coerce.number().min(0).default(0),
  outflow_amount: z.coerce.number().min(0).default(0),
  category: z.enum(['operating','investing','financing','fx','other']).optional(),
  description: z.string().max(200).optional().or(z.literal('')),
  confidence: z.enum(['high','medium','low']).default('medium'),
  is_actual: z.boolean().default(false),
})

export type ForecastInput = z.infer<typeof forecastSchema>
```

---

## 🔐 STEP 3 — AUTH PAGES

### Auth Layout — `src/app/(auth)/layout.tsx`
Centered card layout. Background: dark gradient from `slate-900` to `slate-800`.
LiquidIQ logo + tagline centered above the card. Show a subtle financial grid pattern in background.

### Login Page — `src/app/(auth)/login/page.tsx`
Fields:
- Email (type email)
- Password (type password, show/hide toggle)
- Sign In button (full width, loading state: "Signing in...")
- Link to /register: "Don't have an account? Register"

Server action (`src/actions/auth.ts → loginAction`):
1. Validate with loginSchema
2. `supabase.auth.signInWithPassword()`
3. On success → redirect('/dashboard')
4. On error → return `{ error: 'Invalid email or password' }`

### Register Page — `src/app/(auth)/register/page.tsx`
Fields:
- Full Name
- Email
- Password (with strength indicator bar)
- Confirm Password
- Create Account button (full width, loading state: "Creating account...")
- Link to /login: "Already have an account? Sign In"

Server action (`src/actions/auth.ts → registerAction`):
1. Validate with registerSchema
2. `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
3. Profile auto-created via DB trigger
4. On success → redirect('/dashboard')
5. On error → return `{ error: 'Email already registered' }`

---

## 🏠 STEP 4 — APP LAYOUT

### `src/app/(dashboard)/layout.tsx`
- Desktop: fixed sidebar (260px, dark `slate-900` bg) + main content area
- Mobile: hidden sidebar + hamburger → Sheet drawer

### `src/components/layout/Sidebar.tsx`
```
Logo: 💰 LiquidIQ (green-400 accent on dark bg)

Navigation:
  📊 Dashboard       → /dashboard
  🏦 Bank Accounts   → /accounts
  📋 Transactions    → /transactions
  📈 Forecasts       → /forecasts
  💳 Payments        → /payments
  ⚠️  Risk            → /risk
  📄 Reports         → /reports

Bottom:
  User avatar + name + email
  Sign Out button
```

### `src/components/layout/Header.tsx`
```
Left: page title (dynamic per route)
Right: currency indicator (USD) + notifications bell + user avatar
```

---

## 📊 STEP 5 — DASHBOARD

### `src/app/(dashboard)/dashboard/page.tsx`
Server component. Fetches:
- All bank accounts → sum balances → total cash position in USD
- Pending payments count + total value
- 7-day forecast net position
- 30-day inflows and outflows from transactions

### KPI Cards (`src/components/dashboard/KpiCard.tsx`)
Display 6 cards in a 3-col grid (2-col mobile):
1. Total Cash Position — sum of all active account balances converted to USD
2. Active Accounts — count of active bank_accounts
3. Pending Approvals — payments with status 'pending_approval'
4. 7-Day Net Forecast — sum of net_position from forecasts for next 7 days
5. 30-Day Total Inflows — sum of credits from transactions
6. 30-Day Total Outflows — sum of debits from transactions

Each card: icon + label + value (formatted with currency) + small trend indicator.

### Cash Position Chart (`src/components/dashboard/CashPositionChart.tsx`)
Recharts AreaChart:
- X-axis: last 14 days
- Y-axis: daily closing balance (USD millions)
- Two areas: Actual (green) + Forecast (dashed blue)
- Tooltip with formatted USD values

### Recent Payments (`src/components/dashboard/RecentPayments.tsx`)
Last 5 payments with status badge, beneficiary, amount, date.

---

## 🏦 STEP 6 — BANK ACCOUNTS

### `src/app/(dashboard)/accounts/page.tsx`
Server component. Lists all bank_accounts.
- Search by account name, bank name, entity
- Filter by currency, account_type, status
- Sort by balance (desc default)
- "Add Account" button → /accounts/add

### Account Table (`src/components/accounts/AccountTable.tsx`)
Desktop table columns: Account Name | Bank | Currency | Type | Balance | Available | Status | Actions
Each row: edit icon → /accounts/[id]/edit, view icon → /accounts/[id]

### Account Card (`src/components/accounts/AccountCard.tsx`)
Mobile card view: shows account name, bank, balance prominently, status badge.

### Account Detail (`src/app/(dashboard)/accounts/[id]/page.tsx`)
- Account info header (all fields)
- Balance gauge visual
- Recent transactions for this account (last 10)
- Edit and Back buttons

### Account Form (`src/components/accounts/AccountForm.tsx`)
Shared add/edit form. Fields: account_number, account_name, bank_name, currency (select), account_type (select), status, current_balance, available_balance, entity_name, country, iban, swift_bic, notes.

Server actions (`src/actions/accounts.ts`):
- `createAccountAction` — insert + redirect to /accounts
- `updateAccountAction` — update by id + redirect to /accounts/[id]
- `deleteAccountAction` — soft delete (set status='inactive') + redirect to /accounts

---

## 📋 STEP 7 — TRANSACTIONS

### `src/app/(dashboard)/transactions/page.tsx`
Server component. Lists all transactions with joins to bank_accounts.
- Search by description, counterparty, reference
- Filter by: account, transaction_type, category, status, date range
- Sort by value_date (desc default)
- Color-coded rows: green tint for credits, red tint for debits

### Transaction Table (`src/components/transactions/TransactionTable.tsx`)
Columns: Date | Account | Type | Description | Counterparty | Amount | Status | Reconciled
Amount: green for credits, red for debits with +/- prefix.

### Filters (`src/components/transactions/TransactionFilters.tsx`)
Filter bar above table: date range picker (from/to), account select, type select, status select.

> No add/edit form for transactions — transactions are read-only (imported from bank feeds). Only status and reconciled flag can be updated.

Server action (`src/actions/transactions.ts`):
- `markReconciledAction(id)` — toggle reconciled flag
- `updateTransactionStatusAction(id, status)` — update status

---

## 📈 STEP 8 — CASH FLOW FORECASTS

### `src/app/(dashboard)/forecasts/page.tsx`
Server component. Shows forecast chart + table.

### Forecast Chart (`src/components/forecasts/ForecastChart.tsx`)
Recharts BarChart (grouped):
- X-axis: next 30 days (dates)
- Grouped bars: Inflows (green) vs Outflows (red)
- Line overlay: cumulative net position
- Toggle: daily view / weekly aggregated view
- Filter by entity_name and currency

### Forecast Table (`src/components/forecasts/ForecastTable.tsx`)
Columns: Date | Entity | Currency | Inflows | Outflows | Net | Category | Confidence | Type (Actual/Forecast)
Badge colors: confidence high=green, medium=yellow, low=red.

### Add Forecast Entry
Dialog (not separate page). Form fields: forecast_date, entity_name, currency, inflow_amount, outflow_amount, category, description, confidence, is_actual toggle.

Server actions (`src/actions/forecasts.ts`):
- `createForecastAction`
- `updateForecastAction`
- `deleteForecastAction`

---

## 💳 STEP 9 — PAYMENTS & APPROVALS

### `src/app/(dashboard)/payments/page.tsx`
Server component. Lists all payments.
- Tabs: All | Draft | Pending Approval | Approved | Completed
- Filter by currency, priority, payment_type
- "Initiate Payment" button → /payments/add

### Payment Table (`src/components/payments/PaymentTable.tsx`)
Columns: Ref | Beneficiary | Amount | Type | Value Date | Priority | Status | Actions
Priority badge: urgent=red, high=orange, normal=blue, low=gray.

### Initiate Payment (`src/app/(dashboard)/payments/add/page.tsx`)
Full page form. Fields: beneficiary_name, beneficiary_iban, beneficiary_bank, amount, currency (select), payment_type (select), from_account_id (select from active accounts), value_date, purpose, priority, notes.

On submit: creates payment with status='draft', then button "Submit for Approval" → changes status to 'pending_approval'.

### Payment Detail (`src/app/(dashboard)/payments/[id]/page.tsx`)
- Payment info + status timeline
- Approval/Reject buttons (shown when status='pending_approval')
- Approval timeline (`src/components/payments/ApprovalTimeline.tsx`): list of approval_workflows records with approver name, action, comments, timestamp

### Approve/Reject Actions (`src/actions/payments.ts`):
- `submitForApprovalAction(id)` — draft → pending_approval
- `approvePaymentAction(id, comments)` — creates approval_workflow record, updates payment status to 'approved'
- `rejectPaymentAction(id, comments)` — creates approval_workflow record, updates payment status to 'rejected'
- `cancelPaymentAction(id)` — updates status to 'cancelled'

---

## ⚠️ STEP 10 — RISK MANAGEMENT

### `src/app/(dashboard)/risk/page.tsx`
Server component. Dashboard layout with:
- Summary cards row
- FX rates widget
- Exposure table

### Risk Summary Cards (`src/components/risk/RiskSummaryCards.tsx`)
4 cards in a row:
1. Total FX Exposure (sum of fx-type exposures in USD)
2. Open Interest Rate Risk (sum of interest_rate exposures)
3. Credit Exposure (sum of credit exposures)
4. Critical Alerts (count of severity='critical')

### FX Rates Widget (`src/components/risk/FxRatesWidget.tsx`)
Small table showing latest currency_rates for major pairs: EUR/USD, GBP/USD, USD/JPY, USD/INR, AUD/USD with rate and last updated date.

### Exposure Table (`src/components/risk/ExposureTable.tsx`)
All risk_exposures. Columns: Date | Risk Type | Currency Pair | Notional | Exposure (USD) | MTM | Hedge % | Entity | Severity
Severity badge: critical=red, high=orange, medium=yellow, low=green.
Row highlight: critical rows highlighted with red-50 background.

Server actions (`src/actions/risk.ts`):
- `createExposureAction`
- `updateExposureAction`
- `deleteExposureAction`

---

## 📄 STEP 11 — REPORTS

### `src/app/(dashboard)/reports/page.tsx`
Reports hub page. Grid of report cards.

### Report Cards (`src/components/reports/ReportCard.tsx`)
6 report types as clickable cards:
1. Cash Position Report — balances across all accounts by currency
2. Transaction Summary — volume and value by category and date range
3. Forecast vs Actual — compare forecasted vs actual cash flows
4. Payment Summary — payments by status, type, and currency
5. Risk Exposure Summary — all exposures grouped by risk type
6. Audit Log — full user activity trail

Each card: icon + title + description + "Generate" button.

Clicking "Generate" renders an inline preview of the report as a formatted table within the page (no separate page, use a Sheet or Dialog to show the rendered report).

### Cash Position Report (`src/components/reports/CashPositionReport.tsx`)
Table showing: Entity | Bank | Account | Currency | Balance | Balance (USD equiv) | Status
Footer: Total across all accounts in USD.

---

## 🧪 STEP 12 — TESTS

### Unit Tests (Vitest)
```
src/tests/
  validations/
    auth.test.ts          — loginSchema + registerSchema edge cases
    account.test.ts       — accountSchema validation
    payment.test.ts       — paymentSchema, currency validation
    forecast.test.ts      — forecastSchema, date validation
  components/
    auth/
      LoginForm.test.tsx
      RegisterForm.test.tsx
    accounts/
      AccountStatusBadge.test.tsx
    payments/
      PaymentStatusBadge.test.tsx
    risk/
      RiskSeverityBadge.test.tsx
```

### E2E Tests (Playwright)
```
src/tests/e2e/
  helpers/
    auth.ts               — login helper function
  auth.spec.ts            — login, register, logout, redirect protection
  accounts.spec.ts        — list, add, edit, detail, delete account
  transactions.spec.ts    — list, filter, reconcile
  payments.spec.ts        — initiate, submit approval, approve, reject
  forecasts.spec.ts       — list, add entry, chart renders
  risk.spec.ts            — risk dashboard renders, exposure table
  loading.spec.ts         — all loading states visible
  responsive.spec.ts      — mobile layout, sidebar drawer
```

### `package.json` test scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "type-check": "tsc --noEmit"
  }
}
```

### Commit after all tests pass
```bash
git add .
git commit -m "feat: complete LiquidIQ — all modules + tests"
git push origin main
```

---

## 🚀 PHASE 2 — DEPLOY TO VERCEL

> ⚠️ Only start after Phase 1 is fully working locally.
> Tell Codex: **"Phase 1 done. Execute Phase 2 — Deploy."**

---

## PHASE 2 — STEP 1: Pre-Deploy Checks
```bash
npm run type-check   # 0 TypeScript errors
npm run build        # must succeed with 0 errors
npm run test:run     # all unit tests pass
npm run test:e2e     # all browser tests pass
```
Fix every error before continuing. Paste errors to Codex: "Fix these build errors: [paste]"

---

## PHASE 2 — STEP 2: Git Setup + Push ⚠️ MANUAL
> This is the first time git is set up. The org will provide the repo URL now.

```bash
# Navigate to your project folder
cd liquidiq

# Initialise git and connect to org repo
git init
git remote add origin https://github.com/YOUR_ORG/liquidiq.git
git branch -M main

# Stage and push everything
git add .
git commit -m "feat: complete LiquidIQ — treasury platform production ready"
git push -u origin main
```
Confirm on the org's GitHub that all files are present.

---

## PHASE 2 — STEP 3: Deploy to Vercel ⚠️ MANUAL (MCP offline)

**Option A — Vercel Dashboard (easiest):**
1. Go to https://vercel.com/new
2. Click **Import Git Repository** → select the org repo `liquidiq`
3. Framework preset: **Next.js** (auto-detected)
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = [from .env.local]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [from .env.local]
   SUPABASE_SERVICE_ROLE_KEY     = [from .env.local]
   ```
5. Click **Deploy**
6. Wait for build to complete (~2-3 min)
7. Copy your live Vercel URL (e.g. `https://liquidiq.vercel.app`)

**Option B — Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
# Follow prompts, then set env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod  # redeploy with env vars
```

---

## PHASE 2 — STEP 4: Fix Supabase Auth URLs ⚠️ MANUAL

> Without this step, login/register will FAIL in production.

Go to: supabase.com → Your Project → Authentication → URL Configuration

```
Site URL:
https://liquidiq.vercel.app

Redirect URLs (add all):
https://liquidiq.vercel.app/**
https://liquidiq.vercel.app/auth/callback
http://localhost:3000/**
```

Save changes.

---

## PHASE 2 — STEP 5: Verify Production
```
[ ] https://liquidiq.vercel.app loads
[ ] /login works
[ ] Register new user works → /dashboard
[ ] Login works → /dashboard
[ ] Dashboard KPI cards load with correct data
[ ] Bank Accounts list loads with 8 seeded accounts
[ ] Transactions load with seeded data
[ ] Forecasts chart renders correctly
[ ] Payments list loads with 6 seeded payments
[ ] Risk dashboard loads
[ ] Reports page renders
[ ] Logout works → /login
[ ] /dashboard without login → /login (protected)
[ ] No console errors in browser DevTools
```

---

## 🗂️ FILES SUMMARY

```
Config:
  .env.local
  .mcp.json
  middleware.ts
  playwright.config.ts
  package.json

Auth (6 files):
  src/app/(auth)/layout.tsx
  src/app/(auth)/login/page.tsx
  src/app/(auth)/register/page.tsx
  src/app/auth/callback/route.ts
  src/components/auth/LoginForm.tsx
  src/components/auth/RegisterForm.tsx

Layout (3 files):
  src/app/(dashboard)/layout.tsx
  src/components/layout/Sidebar.tsx
  src/components/layout/Header.tsx

Dashboard (4 files):
  src/app/(dashboard)/dashboard/page.tsx
  src/components/dashboard/KpiCard.tsx
  src/components/dashboard/CashPositionChart.tsx
  src/components/dashboard/RecentPayments.tsx

Bank Accounts (8 files):
  src/app/(dashboard)/accounts/page.tsx
  src/app/(dashboard)/accounts/add/page.tsx
  src/app/(dashboard)/accounts/[id]/page.tsx
  src/app/(dashboard)/accounts/[id]/edit/page.tsx
  src/components/accounts/AccountTable.tsx
  src/components/accounts/AccountCard.tsx
  src/components/accounts/AccountForm.tsx
  src/components/accounts/AccountStatusBadge.tsx
  src/components/accounts/DeleteAccountDialog.tsx

Transactions (4 files):
  src/app/(dashboard)/transactions/page.tsx
  src/components/transactions/TransactionTable.tsx
  src/components/transactions/TransactionFilters.tsx
  src/components/transactions/TransactionStatusBadge.tsx
  src/components/transactions/TransactionTypeBadge.tsx

Forecasts (5 files):
  src/app/(dashboard)/forecasts/page.tsx
  src/components/forecasts/ForecastChart.tsx
  src/components/forecasts/ForecastTable.tsx
  src/components/forecasts/ForecastForm.tsx

Payments (7 files):
  src/app/(dashboard)/payments/page.tsx
  src/app/(dashboard)/payments/add/page.tsx
  src/app/(dashboard)/payments/[id]/page.tsx
  src/components/payments/PaymentTable.tsx
  src/components/payments/PaymentForm.tsx
  src/components/payments/PaymentStatusBadge.tsx
  src/components/payments/ApprovalTimeline.tsx
  src/components/payments/ApproveRejectButtons.tsx

Risk (4 files):
  src/app/(dashboard)/risk/page.tsx
  src/components/risk/RiskSummaryCards.tsx
  src/components/risk/ExposureTable.tsx
  src/components/risk/RiskSeverityBadge.tsx
  src/components/risk/FxRatesWidget.tsx

Reports (3 files):
  src/app/(dashboard)/reports/page.tsx
  src/components/reports/ReportCard.tsx
  src/components/reports/CashPositionReport.tsx

Lib (9 files):
  src/lib/supabase/client.ts
  src/lib/supabase/server.ts
  src/lib/supabase/middleware.ts
  src/lib/validations/auth.ts
  src/lib/validations/account.ts
  src/lib/validations/payment.ts
  src/lib/validations/forecast.ts
  src/lib/utils.ts

Actions (6 files):
  src/actions/auth.ts
  src/actions/accounts.ts
  src/actions/transactions.ts
  src/actions/payments.ts
  src/actions/forecasts.ts
  src/actions/risk.ts

Types (1 file):
  src/types/index.ts

Loading (16 files):
  src/app/(dashboard)/loading.tsx                    ← generic spinner fallback
  src/app/(dashboard)/dashboard/loading.tsx          ← KPI + chart skeletons
  src/app/(dashboard)/accounts/loading.tsx           ← table skeleton
  src/app/(dashboard)/accounts/add/loading.tsx       ← form skeleton
  src/app/(dashboard)/accounts/[id]/loading.tsx      ← detail skeleton
  src/app/(dashboard)/accounts/[id]/edit/loading.tsx ← form skeleton
  src/app/(dashboard)/transactions/loading.tsx       ← table skeleton
  src/app/(dashboard)/forecasts/loading.tsx          ← chart + table skeleton
  src/app/(dashboard)/payments/loading.tsx           ← tabs + table skeleton
  src/app/(dashboard)/payments/add/loading.tsx       ← form skeleton
  src/app/(dashboard)/payments/[id]/loading.tsx      ← detail + timeline skeleton
  src/app/(dashboard)/risk/loading.tsx               ← cards + table skeleton
  src/app/(dashboard)/reports/loading.tsx            ← report cards skeleton
  src/app/layout.tsx                                 ← NextTopLoader (green, height=3)
  src/components/ui/PageSkeleton.tsx                 ← reusable skeleton primitives
  src/components/ui/TableSkeleton.tsx                ← reusable table row skeletons

Unit Tests (9 files):
  src/tests/validations/auth.test.ts
  src/tests/validations/account.test.ts
  src/tests/validations/payment.test.ts
  src/tests/validations/forecast.test.ts
  src/tests/components/auth/LoginForm.test.tsx
  src/tests/components/auth/RegisterForm.test.tsx
  src/tests/components/accounts/AccountStatusBadge.test.tsx
  src/tests/components/payments/PaymentStatusBadge.test.tsx
  src/tests/components/risk/RiskSeverityBadge.test.tsx

E2E Tests (8 files):
  src/tests/e2e/helpers/auth.ts
  src/tests/e2e/auth.spec.ts
  src/tests/e2e/accounts.spec.ts
  src/tests/e2e/transactions.spec.ts
  src/tests/e2e/payments.spec.ts
  src/tests/e2e/forecasts.spec.ts
  src/tests/e2e/risk.spec.ts
  src/tests/e2e/loading.spec.ts
  src/tests/e2e/responsive.spec.ts
```

---

## 🧾 MANUAL QA CHECKLIST

```
Auth:
[ ] /login loads correctly
[ ] Login with wrong credentials shows error
[ ] Login with correct credentials → /dashboard
[ ] Register with new email → /dashboard
[ ] Register with duplicate email shows error
[ ] Logout button works → /login
[ ] /dashboard without login → redirected to /login
[ ] Session persists after page refresh

Dashboard:
[ ] 6 KPI cards show with real data
[ ] Cash position area chart renders with 14-day data
[ ] Recent payments list shows

Bank Accounts:
[ ] 8 seeded accounts visible in table
[ ] Search by account name works
[ ] Filter by currency works
[ ] Add account form validates + saves
[ ] Edit account → pre-populated → saves changes
[ ] Account detail shows balance + recent transactions
[ ] Delete (deactivate) account works

Transactions:
[ ] Transactions list loads with seeded data
[ ] Filter by account works
[ ] Filter by type works
[ ] Date range filter works
[ ] Credit rows green tint, debit rows red tint
[ ] Mark reconciled toggle works

Forecasts:
[ ] Bar chart renders with 14-day data
[ ] Inflow bars green, outflow bars red
[ ] Net position line overlay renders
[ ] Forecast table shows all entries
[ ] Add forecast dialog opens + validates + saves
[ ] Delete forecast entry works

Payments:
[ ] 6 seeded payments visible
[ ] Tabs filter by status correctly
[ ] Initiate payment form validates
[ ] Submit for approval changes status to pending_approval
[ ] Approve payment → status = approved
[ ] Reject payment with comment → status = rejected
[ ] Approval timeline shows history

Risk:
[ ] Summary cards show correct totals
[ ] FX rates widget shows latest rates
[ ] Exposure table loads all 6 seeded exposures
[ ] Critical severity rows highlighted red
[ ] Severity badges correct colors

Reports:
[ ] 6 report cards visible
[ ] Cash Position Report generates correctly
[ ] Audit log visible

Responsive:
[ ] Mobile: sidebar hidden, hamburger visible
[ ] Mobile: hamburger opens sidebar drawer
[ ] Mobile: accounts show as cards not table
[ ] Mobile: no horizontal scroll
[ ] Desktop: sidebar always visible
[ ] Desktop: data shown as tables

Loading States — Top Bar:
[ ] Green top progress bar appears on EVERY page navigation (not just some)
[ ] Progress bar disappears after page fully loads

Loading States — Page Skeletons (MUST CHECK ALL PAGES):
[ ] /dashboard shows 6 skeleton KPI cards + skeleton chart + skeleton table while loading
[ ] /accounts shows skeleton table (8 rows) while loading
[ ] /accounts/add shows skeleton form while loading
[ ] /accounts/[id] shows skeleton detail card while loading
[ ] /accounts/[id]/edit shows skeleton form while loading
[ ] /transactions shows skeleton table (10 rows) while loading
[ ] /forecasts shows skeleton chart + skeleton table while loading
[ ] /payments shows skeleton tabs + skeleton table while loading
[ ] /payments/add shows skeleton form while loading
[ ] /payments/[id] shows skeleton detail + skeleton timeline while loading
[ ] /risk shows 4 skeleton cards + skeleton table while loading
[ ] /reports shows 6 skeleton report cards while loading
[ ] NO page ever shows blank white screen while loading

Loading States — Button Spinners (MUST CHECK ALL):
[ ] Login button → "Signing in..." + spinner + DISABLED while submitting
[ ] Register button → "Creating account..." + spinner + DISABLED while submitting
[ ] Logout button → "Signing out..." + spinner + DISABLED while signing out
[ ] Add Account button → "Saving account..." + spinner + DISABLED while saving
[ ] Edit Account button → "Saving changes..." + spinner + DISABLED while saving
[ ] Delete Account button → "Deleting..." + spinner + DISABLED while deleting
[ ] Initiate Payment button → "Creating payment..." + spinner + DISABLED
[ ] Submit for Approval button → "Submitting..." + spinner + DISABLED
[ ] Approve button → "Approving..." + spinner + DISABLED
[ ] Reject button → "Rejecting..." + spinner + DISABLED
[ ] Add Forecast button → "Saving forecast..." + spinner + DISABLED
[ ] Generate Report button → "Generating..." + spinner + DISABLED
[ ] All loading buttons CANNOT be double-clicked (disabled state enforced)

Loading States — Table Overlay:
[ ] Accounts table shows spinner overlay when search/filter changes
[ ] Transactions table shows spinner overlay when filter changes
[ ] Payments table shows spinner overlay when tab/filter changes

Loading States — Sidebar:
[ ] Active sidebar nav icon shows spinner while page is navigating

Empty States:
[ ] Accounts list shows empty state illustration if no accounts
[ ] Transactions list shows empty state if no transactions match filter
[ ] Payments list shows empty state per tab if no payments
[ ] Forecasts table shows empty state if no forecast entries
[ ] Risk table shows empty state if no exposures
```

---

## 🚀 PHASE 2 — STEP 6: Submit
```
Links to submit:
[ ] Live URL:    https://liquidiq.vercel.app
[ ] GitHub Repo: https://github.com/YOUR_ORG/liquidiq
[ ] Demo Video:  https://loom.com/share/[id]

Demo video script (4 min):
0:00 - 0:30  Show app name + login page
0:30 - 1:00  Register → dashboard → KPI cards + chart
1:00 - 1:30  Bank accounts → add account → transactions
1:30 - 2:00  Initiate payment → submit for approval → approve
2:00 - 2:30  Forecasts chart → add entry
2:30 - 3:00  Risk dashboard → exposures
3:00 - 3:30  Reports → generate cash position report
3:30 - 4:00  Show mobile responsive + GitHub repo
```

---

*Phase 1 done when: `npm run dev` works + all tests pass + manual QA checklist done ✅*
*Phase 2 done when: live Vercel URL works + all production checks pass ✅*
