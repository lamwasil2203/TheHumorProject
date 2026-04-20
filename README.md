# Caption Votes

A community caption-voting app where users upload images, AI generates funny captions, and the community votes on them.

## Features

- **Feed** — Browse all images and vote on captions with upvote/downvote
- **Quick Vote** — Blind voting mode: scores are hidden until you vote, then the community result is revealed
- **Leaderboard** — Top 100 captions ranked by net score
- **Upload** — Upload any image and get AI-generated captions instantly

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) — auth (Google OAuth) and database
- [Tailwind CSS](https://tailwindcss.com)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need a Supabase project configured with the schema in `schema.sql`.
