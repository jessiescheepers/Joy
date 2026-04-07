# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

Joy website (`feeljoy.ai`) — the public-facing site for Joy. Next.js app with a waitlist and marketing pages.

**Repo**: `https://github.com/jessiescheepers/Joy.git` (Jessie's repo)
**Deploy**: Vercel at `feeljoy.ai`

## Development Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build + type-check
npm run lint         # ESLint
```

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript 5** (strict mode)
- **Tailwind CSS v4** — uses `@import "tailwindcss"` in globals.css, no `tailwind.config.js`
- **GSAP** for orb animations on the marketing pages
- **Supabase** for waitlist data storage
- **Resend** for waitlist confirmation emails (sends from `dataroom@mail.feeljoy.ai`)
- **TypeScript path alias**: `@/*` maps to `./src/*`

## Architecture

### Next.js Pages (App Router)

- `/` (`src/app/page.tsx`) — Homepage: hero section with animated orb system, waitlist signup form
- `/about` (`src/app/about/page.tsx`) — About page (founders, team)
- `/joy-code` (`src/app/joy-code/page.tsx`) — Joy Code landing page
- `POST /api/waitlist` (`src/app/api/waitlist/route.ts`) — Waitlist signup (Supabase + Resend, rate-limited 5/hr/IP, CORS-validated)

### Components (`src/app/components/`)

- `OrbSystem.tsx` — Multi-layer animated orbs (GSAP-driven)
- `JoyLogo.tsx` — Joy logo component
- `GoogleAnalytics.tsx`, `CookieConsent.tsx` — Analytics + consent
- Various orb components (`LeadersOrb.tsx`, `FoundersOrb.tsx`, etc.)

### Styling

- Tailwind CSS for layout + utility classes
- CSS custom properties for design tokens (Moonrise color palette) in `globals.css`
- Dark/light theme via `[data-theme]` attribute
- Fonts: Cooper Hewitt (OTF in `/public/fonts/`), Outfit (Google Fonts, body text), Plus Jakarta Sans + Source Serif 4 (display/body)

## Key Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon key
RESEND_API_KEY                    # Resend email API key
```

## Conventions

- Client components use `"use client"` directive
- Functional components with hooks
- No Prettier — ESLint only (Next.js config)
- Images in `/public/images/` (watercolor backgrounds, orbs)
- Redirects configured in `next.config.ts` (`/waitlist` > `/#hero`)

## Git

- Use `/usr/bin/git` (Homebrew git hangs on this machine)
- GitHub CLI (`gh`) works and is authenticated as `jessiescheepers`
