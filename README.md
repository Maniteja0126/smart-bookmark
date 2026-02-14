# Smart Bookmarks

A realtime personal bookmark manager built with **Next.js (App Router)** and **Supabase**.

Users can sign in with Google, save bookmarks, and see updates instantly across multiple tabs — without page refresh.

This project was built as part of a take‑home assignment and focuses on correctness, realtime sync, and UX polish.

---

## 🚀 Live Demo

👉 Vercel URL: ""  
👉 GitHub Repo: https://github.com/Maniteja0126/smart-bookmark.git

---

## ✨ Features

- Google OAuth login (no email/password)
- Private bookmarks per user (Row Level Security)
- Add / delete bookmarks
- Realtime sync across browser tabs
- Auto-fetch page title from URL
- Duplicate URL detection
- Search bookmarks
- Favicon + domain preview
- Smart handling of private/auth-gated URLs
- Polished landing, login, and dashboard UI

---

## 🧱 Tech Stack

- Next.js (App Router)
- Supabase (Auth, Postgres, Realtime)
- Tailwind CSS
- TypeScript

---

## 🛠 Local Setup

```bash
git clone https://github.com/Maniteja0126/smart-bookmark.git
cd smart-bookmarks
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Run:

```bash
npm run dev
```

---

## 📦 Database Schema

```sql
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  title text,
  url text not null,
  created_at timestamp default now()
);

alter table bookmarks enable row level security;

create policy "users can read own bookmarks"
on bookmarks for select
using (auth.uid() = user_id);

create policy "users can insert own bookmarks"
on bookmarks for insert
with check (auth.uid() = user_id);

create policy "users can delete own bookmarks"
on bookmarks for delete
using (auth.uid() = user_id);
```

---

## 🔥 Key Challenges & How I Solved Them


### 1. Realtime not syncing across tabs

**Problem:**  
Bookmarks updated locally but not in other tabs.

**Cause:**  
Realtime websocket was connecting anonymously, so RLS blocked events.

**Solution:**  

Explicitly authenticated realtime:

```ts
supabase.realtime.setAuth(session.access_token);
```

before subscribing to `postgres_changes`.

Also ensured subscription only happens after session restoration.

---

### 2. Realtime race condition on initial load

**Problem:**  
Dashboard sometimes showed “No bookmarks” even when data existed.

**Cause:**  
`onAuthStateChange` does not fire on initial page load if a session already exists.

**Solution:**  
Explicitly called `getSession()` on mount to:

- authenticate realtime
- fetch bookmarks immediately
- then subscribe to realtime

---

### 3. Duplicate fetches after insert

**Problem:**  
Optimistic UI + realtime caused double refresh.

**Solution:**  
Removed optimistic updates and relied purely on realtime events once websocket auth was stable.

Now:

- Same tab updates via realtime echo  
- Other tabs update via websocket  

Single source of truth.

---

### 4. Empty or incorrect titles from modern websites

**Problem:**  
Some sites don’t expose `<title>` or return “Access Denied”.

**Solution:**  
Implemented `/api/metadata` endpoint that checks:

- `<title>`
- `og:title`
- decodes HTML entities

Also ignored “Access Denied” titles so private URLs remain blank.

---


## 💡 UX Improvements

- Auto title fetch while typing URL (debounced)
- Fallback metadata fetch on submit
- Search bookmarks
- Favicon + domain display
- Empty state
- Loading states
- Dark UI polish
- Keyboard submit (Enter)

