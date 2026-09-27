# Minimal App Icon Generator

A web app that generates **ultra-minimal, flat, geometric app icons** from a text prompt. It calls OpenAI's image model (`gpt-image-1`) through the Vercel AI SDK with a strict style guide (no mascots, no text, no emoji, black/neutral duotone, full-bleed 1024×1024 PNG), then lets you preview the icon on a checkerboard transparency background and download it.

## Features

- Prompt-to-icon generation via `POST /api/generate` (AI SDK `experimental_generateImage` + `openai.image("gpt-image-1")`)
- Strict minimal style guide baked into every prompt (flat shapes, generous negative space, timeless design)
- Live preview on a transparency checkerboard with an animated noise-canvas backdrop
- One-click PNG download of the 1024×1024 icon
- Clean error states (missing API key, no image generated, request failures)
- Dark-mode support via `next-themes`
- Tailwind CSS + shadcn/ui (`Button`) + Lucide icons

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **AI:** `ai` (Vercel AI SDK) + `@ai-sdk/openai`, model `gpt-image-1`
- **Styling:** Tailwind CSS, Geist Mono font
- **Package manager:** pnpm (pnpm-lock.yaml included)

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), type a subject (e.g. "weather app"), and click generate.

Production:

```bash
pnpm build
pnpm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key with access to the `gpt-image-1` image model |

Set it in `.env.local`:

```
OPENAI_API_KEY=sk-...
```

Without it, `/api/generate` returns a 500 ("OpenAI API key is missing on the server").

## Project Structure

```
app/
  page.tsx              # Client UI: prompt form, preview, download
  api/generate/route.ts # POST endpoint: style guide + prompt -> gpt-image-1 -> PNG
  layout.tsx, globals.css
components/
  noise-canvas.tsx      # Animated grain backdrop
  checkerboard.tsx      # Transparency preview background
  theme-provider.tsx
  ui/button.tsx         # shadcn/ui Button
lib/utils.ts            # cn() helper
public/                 # Static assets
```

## Deployment

This app **cannot be statically exported** — it needs a Node server for the `/api/generate` route and the `OPENAI_API_KEY` secret. Deploy on Vercel (zero config, set the env var in project settings) or any Node host (`pnpm build && pnpm start`). Not deployable to GitHub Pages / Cloudflare Pages static hosting.

## Cost Note

Every generation calls OpenAI's `gpt-image-1` image model, which is billed per image — add rate limiting / auth before exposing publicly.

---

Built by Girish Lade · https://ladestack.in
