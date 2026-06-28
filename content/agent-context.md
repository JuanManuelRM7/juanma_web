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
hugo server          # dev server at localhost:1313
npm run build        # production build (Hugo + Pagefind)
```

## Where everything lives

### Profile data → `config.yaml`

All site content lives in `config.yaml` under `params`. No database, no CMS — pure YAML.

| Section | Key in `config.yaml` |
|---------|----------------------|
| Work experience | `params.experience.list` |
| Education | `params.education.list` |
| Projects | `params.project.list` |
| Skills / tech | `params.skill.list` |
| Publications | `params.publication.list` |
| Social links | `params.social.list` |
| Name, bio, photo | `params.profile` |

### Markdown content → `content/`

```
content/
├── blog/         ← blog posts (frontmatter: title, date, tags, description)
├── material/     ← university notes
└── search/       ← only _index.md exists here; search is handled by Pagefind
```

### Layouts → `layouts/`

```
layouts/
├── index.html              ← Homepage (all sections)
├── _default/
│   ├── baseof.html         ← Base HTML template
│   ├── single.html         ← Individual post layout
│   └── search.html         ← Search page
├── blog/list.html          ← Blog index (paginated grid)
├── material/list.html      ← Material index
└── partials/               ← Reusable components
    ├── head.html           ← Meta tags, CSS, fonts
    ├── header.html         ← Nav bar + clock
    ├── i18n.html           ← JS translation system
    ├── command_palette.html ← ⌘K palette
    └── accordion/          ← Collapsible sections
```

### Styles

- `assets/main.css` — main source (Tailwind imports + custom utilities)
- `static/css/general.css` — component classes
- `tailwind.config.js` — Tailwind configuration

---

## How to modify things

### Add a blog post

Create `content/blog/my-post-slug.md`:

```markdown
---
title: "Post title"
date: 2025-01-15
description: "Short description"
tags: ["python", "ml"]
---

Content here...
```

### Edit experience / education / projects

Edit directly in `config.yaml`. Example for projects:

```yaml
params:
  project:
    list:
      - title: "Project name"
        description: "What it does"
        icon: "fas fa-eye"       # Font Awesome icon class
        color: "cyan"            # cyan | violet | emerald | amber
        tech: [Python, Docker]
        url: ""
        status: "In production"
```

### Add translations (i18n)

The site uses a dual i18n system:

1. **Hugo static**: keys in `i18n/es.yaml` + `i18n/en.yaml` → `{{ i18n "key" }}` in templates
2. **JS runtime** (language toggle without reload): in `layouts/partials/i18n.html` → `data-i18n="key"` on HTML elements

### Add a new page

1. Create `content/new-section.md` (or `content/new-section/index.md`)
2. Hugo will use `layouts/_default/single.html` by default
3. For a custom layout: create `layouts/new-section/single.html`
4. Add it to the nav in `layouts/partials/header.html` and to the palette in `layouts/partials/command_palette.html`

---

## Homepage architecture

`layouts/index.html` uses a 40/60 grid:

- **40% left (sticky):** photo + stats + social links
- **60% right (scroll):** projects → experience → latest post → education → publications → skills → GitHub activity → contact

Collapses to a single column on mobile.

---

## State & persistence

| Feature | `localStorage` key |
|---------|-------------------|
| Dark/light mode | `theme` |
| Language ES/EN | `lang` |
| Open accordion panel | `lastAccordionPanel` |
| Welcome modal seen | `welcomeShown` |

---

## Site routes

| URL | Source |
|-----|--------|
| `/` | `layouts/index.html` |
| `/blog/` | `content/blog/_index.md` + `layouts/blog/list.html` |
| `/blog/{slug}/` | `content/blog/*.md` + `layouts/_default/single.html` |
| `/material/` | `content/material/_index.md` |
| `/material/{slug}/` | `content/material/*.md` |
| `/search/` | Pagefind UI |
| `/agent-context/` | This page |

---

## Hard rules

- **Do not edit `docs/`** — it's build output, overwritten by `npm run build`
- **Do not edit `resources/`** — Hugo's internal cache
- Profile data always goes in `config.yaml`, not in content files
- The build requires both Hugo and Pagefind — always use `npm run build`, not `hugo` alone

---

*Full guide with more detail in [`CLAUDE.md`](https://github.com/juanmanuelrm7/juanma_web/blob/master/CLAUDE.md) at the repo root.*
