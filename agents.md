# AI Agent Instructions

This file sets ground rules for AI assistants (Claude, Codex, etc.) working on this project.

## Database Schema

If you need the database structure, refer to `schema.sql`.

## Project Overview

This is a Next.js application that connects to Supabase to display caption likes and their associated images.

### Key Files
- `lib/supabase.ts` - Supabase client configuration
- `app/page.tsx` - Main page that fetches and displays data
- `app/components/ImageGrid.tsx` - Interactive grid component with modal

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
