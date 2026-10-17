# Unlimited Fries Website

Source for [www.unlimitedfries.com](https://www.unlimitedfries.com), the website of Unlimited Fries, an independent video game studio.

**Stack:** [Astro](https://astro.build) · TypeScript · [Tailwind CSS v4](https://tailwindcss.com) · Markdown/MDX content collections

## Getting started

Requires Node.js 22+ (developed on 24).

```sh
npm install
npm run dev      # http://localhost:4321
```

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server                      |
| `npm run build`   | Build the production site to `dist/`      |
| `npm run preview` | Preview the production build locally      |
| `npm run check`   | Type-check Astro and TypeScript files     |

## Project structure

```
src/
  components/     Header, Footer, GameCard
  content/
    games/        One Markdown file per game
    devlog/       One Markdown file per devlog post
    team/         One Markdown file per team member
  content.config.ts   Frontmatter schemas for the collections
  layouts/        BaseLayout (head tags, header, footer)
  pages/          Home, Games, Devlog, About, Contact, 404
  styles/         global.css (brand colors, font, Tailwind theme)
public/           Static files (favicon, fonts, images)
```

## Updating content

All content lives in `src/content/` as Markdown. Frontmatter is validated at build time, so a typo fails the build instead of shipping.

- **New game:** add `src/content/games/<slug>.md` (see `example-game.md` for fields: status, platforms, Steam/itch/trailer links, cover, `featured`).
- **New devlog post:** add `src/content/devlog/<slug>.md`. Set `draft: true` to hide it.
- **Team member:** add `src/content/team/<slug>.md`. `order` controls sorting.

## Branding

| Color | Hex       | Tailwind class |
| ----- | --------- | -------------- |
| Ivory | `#FFFFF0` | `ivory`        |
| Fry   | `#FEBE27` | `fry`          |
| Night | `#00001F` | `night`        |

Brand font: **Agrandir Grand**, bold italic (`font-brand`). It's a commercial font, so the file is git-ignored. See [`public/fonts/README.md`](public/fonts/README.md) for where to place it.

## Deployment

Planned host is Cloudflare Pages with the `www.unlimitedfries.com` custom domain: build command `npm run build`, output directory `dist`. CI (`.github/workflows/ci.yml`) type-checks and builds on every PR and push to `main`.
