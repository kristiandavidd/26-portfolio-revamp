# Kristian David — monorepo

Three Next.js applications sharing one database, one asset store and one set of
UI components.

| App | Path | Local port | What it is |
| --- | --- | --- | --- |
| Portfolio | `apps/portfolio` | 3000 | The professional portfolio (the existing site) |
| Manage | `apps/manage` | 3001 | Content panel: profile, experience, companies, projects, products, credentials, messages |
| Personal | `apps/personal` | 3002 | The personal side: landing, story, places, gallery, wishlist |

## Stack

- **Next.js 16.3.2** (App Router, Turbopack), React 19
- **Prisma 6** with PostgreSQL (Neon)
- **Tailwind CSS 4**
- **npm workspaces** (no extra monorepo tool required)
- **Silos** for object storage (images served from `cdn.dephilia.com`)
- **Echo** for transactional email

## Layout

```
apps/
  portfolio/          public portfolio
  manage/             content panel
  personal/           personal site (landing, story, places, gallery, wishlist)
packages/
  config/             shared tsconfig + next-with-root-env launcher
  db/                 Prisma schema, client, queries, seed, migrations
  integrations/       Silos and Echo API clients
  ui/                 shared components (Container, Button, Field, Card, ...)
docs/api/             Postman collections for Silos and Echo
```

## Getting started

```bash
cp .env.example .env      # fill in the values
npm install               # installs all workspaces and generates Prisma Client
npm run db:migrate        # create/apply the schema (already applied on Neon)
npm run db:seed           # optional: seed content from the original portfolio
```

Run the apps in separate terminals:

```bash
npm run dev:portfolio     # http://localhost:3000
npm run dev:manage        # http://localhost:3001
npm run dev:personal      # http://localhost:3002
```

The panel signs in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`. It
issues an HMAC-signed, httpOnly cookie using `AUTH_SECRET`.

## Assets

All images were uploaded to Silos and are served from the CDN. The portfolio no
longer references any file under a local `public/images` folder.

- `npm run assets:upload` uploads everything under
  `apps/portfolio/public/images` (or `ASSET_SOURCE_DIR`) that is not already in
  `packages/db/prisma/seed/assets.manifest.json`, then records the CDN URL in
  that manifest. It is idempotent and safe to re-run. The original source
  images are not kept in the repo, so this is only needed when adding new files
  from a folder; the manifest already contains every existing asset.
- The seed reads the manifest and creates `tb_asset` rows.
- There is no separate asset library. Every artwork field in the panel uploads a
  replacement in place: the new file goes to Silos, `tb_asset` records it, the
  section points at it, and the previous file is removed from Silos and the
  database once nothing else references it.

Silos has no public “create folder” endpoint for API keys, so uploads land at
the project root. The panel uses the `folder` column as a logical grouping.

## Personal side

`apps/personal` is a separate site that shares the portfolio's design system —
the same type stack, smooth scrolling and reveal motion, with a violet accent in
place of orange — and the same floating dock navigation. It differs by content
and layout, not by a second visual identity.

| Route | What it shows |
| --- | --- |
| `/` | Landing: portrait, intro, and an index of the four sections |
| `/story` | Chapters by year, each with subchapters and paragraphs |
| `/places` | Grid of visited places with year, note and map link |
| `/gallery` | Masonry photo wall with a keyboard-navigable lightbox |
| `/wishlist` | Checklist split into still-to-do and done, with progress |

Everything is edited in the panel under **Personal** (Landing, Story, Places,
Gallery, Wishlist). Story, places, gallery and wishlist are reorderable with the
arrow buttons; wishlist items are ticked off from the panel.

## Crawlers, SEO and error pages

Both sites publish their own `sitemap.xml` and `robots.txt`, and both allow the
major assistant crawlers explicitly. The portfolio adds a `/llms.txt` brief and a
JSON-LD `@graph` (person, site, profile page, Dephilia, selected work); the
personal side links back to the same person entity instead of declaring a second
one. Canonicals resolve against `NEXT_PUBLIC_PORTFOLIO_URL` and
`NEXT_PUBLIC_PERSONAL_URL`.

Each app ships `not-found.tsx` (404), `forbidden.tsx` (403, reached through
`forbidden()` with `experimental.authInterrupts`) and `error.tsx` (500, with a
retry button).

## Email

The panel sends replies and test email through Echo, and mirrors every attempt
in `tb_email_log`.

## Database conventions

- `ms_*` — master/reference data: tags, companies.
- `tb_*` — regular data: content, assets, messages, logs.
- Every table and column is `snake_case`; Prisma fields stay `camelCase` and map
  to snake_case columns with `@map` / `@@map`.

Site metadata and studio copy are hardcoded in the apps, not in the database.

Main tables:

| Table | Purpose |
| --- | --- |
| `ms_tag` | Technology vocabulary shared by projects |
| `ms_company` | Employers and clients (with logo asset) |
| `tb_profile` | Singleton profile: copy and hero/about/footer artwork |
| `tb_social_link`, `tb_hero_pattern` | Profile relations |
| `tb_experience`, `tb_experience_highlight` | Experience rail |
| `tb_project`, `tb_project_feature`, `tb_project_tag` | Project wall and case pages |
| `tb_dephilia_product` | Studio products |
| `tb_certification`, `tb_community_role`, `tb_education` | Credentials |
| `tb_asset` | Silos files and metadata |
| `tb_contact_message`, `tb_email_log` | Inbox and email trail |
| `tb_personal_profile` | Personal landing: name, headline, intro, portrait |
| `tb_personal_story`, `tb_personal_place`, `tb_personal_gallery_item`, `tb_personal_wishlist_item` | Personal sections, ordered by `sort_order` |

Schema: [`packages/db/prisma/schema.prisma`](packages/db/prisma/schema.prisma).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev:portfolio` / `dev:manage` / `dev:personal` | Start one app |
| `npm run build` | Build all three apps |
| `npm run typecheck` | Type-check every app |
| `npm run lint` | Lint every app |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:migrate` | Create/apply migrations |
| `npm run db:push` | Push schema without a migration |
| `npm run db:seed` | Re-seed content (assets are upserted) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run assets:upload` | Upload new source images to Silos |

## Deploying to Vercel

Create **three** Vercel projects from this repository. Each one is a normal
Next.js project; the only difference is the root directory.

| Project | Root Directory |
| --- | --- |
| Portfolio | `apps/portfolio` |
| Manage | `apps/manage` |
| Personal | `apps/personal` |

For every project:

1. Framework preset: **Next.js**.
2. Enable **Include files outside the root directory** so the workspace
   packages (`packages/*`) are available.
3. Leave the install command at the default (`npm install`). Vercel detects the
   root workspace and installs once from the repo root.
4. Build command: `npm run build` (the app script wraps Next and loads `.env`
   locally; on Vercel the variables come from project settings).
5. Add the environment variables the app needs (below).

### Environment variables per project

| Variable | Portfolio | Manage | Personal |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | yes | yes |
| `SILOS_API_URL`, `SILOS_API_KEY` | — | yes | — |
| `ECHO_API_URL`, `ECHO_API_KEY` | — | yes | — |
| `ECHO_FROM_EMAIL` (optional verified sender) | — | yes | — |
| `AUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` | — | yes | — |
| `NEXT_PUBLIC_PORTFOLIO_URL` | yes | yes | yes |
| `NEXT_PUBLIC_PERSONAL_URL` | yes | — | yes |
| `NEXT_PUBLIC_MANAGE_URL` | — | yes | — |

`NEXT_PUBLIC_*` variables are baked in at build time — set them before the first
deploy and redeploy after changing them.

Prisma Client is generated by the root `postinstall` script, so no extra Vercel
build step is needed. Run migrations locally against the Neon database
(`npm run db:migrate`) rather than during the Vercel build.

## Notes

- Portfolio and personal pages render dynamically, so content changes made in
  the panel appear on the next request — no redeploy needed.
- `next.config.ts` only allows remote images from `cdn.dephilia.com`; add the
  host if the Silos CDN domain changes.
- Postman references for both internal services live in `docs/api/`.
