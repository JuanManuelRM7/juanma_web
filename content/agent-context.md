---
title: "Agent context"
date: 2025-01-01
description: "Quick reference guide for AI agents working on the juanma_web repo. Structure, conventions, and how to modify each section of the site."
tags: ["meta", "docs"]
---

> This page exists to give an AI agent quick context about the repo without having to read everything. The full guide for modifications lives in [`CLAUDE.md`](https://github.com/juanmanuelrm7/juanma_web/blob/master/CLAUDE.md) at the repo root.

## Stack

**Hugo** (static site generator) + **Tailwind CSS 4** + vanilla JS. Deployed to **GitHub Pages** from the `docs/` folder.

```bash
npm install          # install dependencies
hugo server -M       # dev server at localhost:1313 (-M renders in memory, never writes docs/)
npm run build        # production build (Hugo + Pagefind) → docs/
```

Never edit `docs/` by hand; it is build output. After adding a post or a case study, regenerate the Open Graph images with `npm i --no-save sharp && node scripts/generate-og-posts.mjs`.

## Where everything lives

### Profile data → `config.yaml`

All profile data lives in `config.yaml`: Spanish under `params`, English under `languages.en.params`, same keys. The runtime ES/EN toggle strings for hero, projects, experience, education, publications, skills and certifications are **generated** from those two branches, so editing the YAML is enough.

| Section | Key | Rendered by |
|---|---|---|
| Hero (headline, value proposition, metrics) | `params.profile`, `params.hero` | `layouts/index.html`, `partials/hero_metrics.html` |
| Project cards | `params.project.list` | `partials/projects.html` → `project_card.html` |
| Experience (summary + `highlights`) | `params.experience.list` | `partials/accordion/experience.html` |
| Education | `params.education.list` | `partials/accordion/education.html` |
| Certifications | `params.certifications.list` | `partials/certifications.html` |
| Publications | `params.publication.list` | `partials/accordion/publication.html` |
| Skills by category | `params.skill.categories` | `partials/skills_by_category.html` |
| Social / contact | `params.social.list` | homepage contact, sidebar, footer |

### Content → `content/`

- `blog/` — blog posts (Spanish only)
- `proyectos/` — case studies: `<slug>.md` (ES) and `<slug>.en.md` (EN); front matter carries `role`, `period`, `org`, `stack`, `links`, `metrics`
- `material/` — university notes
- `search/` — search page

### Layouts → `layouts/`

- `index.html` — homepage
- `proyectos/list.html`, `proyectos/single.html` — projects index and case-study page (sticky fact sheet + TOC)
- `blog/list.html`, `material/list.html`, `_default/single.html`
- `shortcodes/img.html` — processed webp images from `assets/images/`
- `partials/` — `head`, `meta` (OG + JSON-LD), `header`, `footer`, `i18n` (static UI strings + generated `window.__i18nDyn`), `projects`/`project_card`, `hero_metrics`, `latest_posts`, `certifications`, `command_palette`, `terminal`, `accordion/*`

### Images

Processed images (profile photo, case-study figures) live in `assets/images/` and are converted to webp by Hugo. PDFs, OG images and icons are in `static/`.

### Styles and JS

- `assets/main.css` — Tailwind imports, self-hosted `@font-face` (`static/fonts/`), custom components. Project colors and status badges are plain CSS: do not build Tailwind classes dynamically from config data (the purge cannot see them).
- `static/js/` — `accordion.js`, `cv-mode.js` (YOLO easter egg), `neural-hero.js`, `cmdk.js` (⌘K palette), `terminal.js` (terminal easter egg)

## Common tasks

### Add a project card

Add an entry with a stable `id` to **both** `params.project.list` and `languages.en.params.project.list`:

```yaml
- id: my-project
  featured: false
  home: false             # true = also shown on the homepage (the rest only on /proyectos/)
  title: "..."
  description: "..."
  metrics: ["one short line with a number"]
  tech: [Python]
  icon: "fas fa-eye"      # must exist in the Font Awesome subset (scripts/subset-fontawesome.mjs)
  color: "cyan"           # cyan | violet | amber | rose | indigo | emerald
  status: active          # production | published | active | development | completed
  links: { repo: "...", case_study: "/proyectos/my-project/", paper: "...", posts: [{ title: "...", url: "..." }] }
```

### Add a case study

Create `content/proyectos/<slug>.md` and `<slug>.en.md`, put figures in `assets/images/proyectos/<slug>/`, use `{{</* img src="images/proyectos/<slug>/fig.png" alt="..." caption="..." */>}}`, link it from the card via `links.case_study`, regenerate OG images.

### Add a blog post

Create `content/blog/<slug>.md` with `title`, `date`, `description`, `tags`. Regenerate OG images.

### Edit experience or skills

Edit `params.experience.list[].highlights` (bullets, markdown bold for metrics) or `params.skill.categories[].items` in both languages.

### UI strings

Interface strings (buttons, section titles) live in `i18n/es.yaml`, `i18n/en.yaml` and the two static objects in `layouts/partials/i18n.html`. Profile content strings are generated; never write them by hand.

## Rules

- Every claim on the site comes from the CV (`static/cv.pdf`), the repos' READMEs or the paper. Do not invent metrics.
- Keep `params` and `languages.en.params` in sync.
- Do not touch `docs/`, `resources/`, `static/fontawesome/` or `static/fonts/`.
