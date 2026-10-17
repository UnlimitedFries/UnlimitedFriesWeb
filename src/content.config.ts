import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const games = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/games' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    status: z.enum(['In Development', 'Released', 'Prototype']),
    platforms: z.array(z.string()),
    releaseDate: z.string().optional(),
    price: z.string().optional(),
    steamUrl: z.url().optional(),
    websiteUrl: z.url().optional(),
    discordUrl: z.url().optional(),
    itchUrl: z.url().optional(),
    trailerUrl: z.url().optional(),
    cover: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    press: z.array(z.object({ quote: z.string(), source: z.string(), url: z.url().optional() })).default([]),
    steamReviews: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const devlog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/devlog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    game: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number().default(100),
    photo: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  }),
});

export const collections = { games, devlog, team };
