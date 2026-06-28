# CLAUDE.md — Guía para agentes en juanma_web

Portfolio personal de Juan Manuel Ruiz (ML Engineer & Computer Vision). **Hugo** como generador estático, **Tailwind CSS 4**, JS vanilla, desplegado en GitHub Pages.

## Comandos esenciales

```bash
npm install          # instalar dependencias
hugo server          # dev en localhost:1313
npm run build        # build producción (Hugo + Pagefind)
```

> El build escribe en `docs/`. Nunca edites `docs/` manualmente.

---

## Dónde está cada cosa

### Datos del sitio → `config.yaml`

**Toda la información del perfil está en `config.yaml` bajo `params`**, no en archivos de contenido separados.

| Sección | Clave en `config.yaml` | Renderizado por |
|---------|------------------------|-----------------|
| Experiencia | `params.experience.list` | `layouts/partials/accordion/experience.html` |
| Educación | `params.education.list` | `layouts/partials/accordion/education.html` |
| Proyectos | `params.project.list` | `layouts/partials/projects.html` |
| Skills | `params.skill.list` | `layouts/partials/skills_by_category.html` |
| Publicaciones | `params.publication.list` | `layouts/partials/accordion/publication.html` |
| Redes sociales | `params.social.list` | `layouts/partials/social.html` |
| Perfil (nombre, bio) | `params.profile` | `layouts/index.html` |

### Contenido en markdown → `content/`

```
content/
├── blog/         # Posts del blog
├── material/     # Apuntes universitarios
└── search/       # Página de búsqueda (solo _index.md)
```

### Layouts → `layouts/`

```
layouts/
├── index.html              # Homepage completa
├── _default/
│   ├── baseof.html         # Plantilla base (HTML, head, body wrapper)
│   ├── single.html         # Post individual (blog, material)
│   ├── list.html           # Lista genérica
│   └── search.html         # Página de búsqueda (Pagefind)
├── blog/list.html          # Índice del blog (grid paginado)
├── material/list.html      # Índice de material universitario
└── partials/               # Componentes reutilizables
    ├── head.html           # Meta tags, CSS, fonts, detección de tema
    ├── header.html         # Barra de navegación + reloj + toggles
    ├── footer.html
    ├── i18n.html           # Sistema i18n JS + todas las traducciones
    ├── command_palette.html # Paleta ⌘K
    ├── accordion/          # Secciones colapsables (experience, education, etc.)
    └── ...
```

### Estilos → `assets/main.css` + `static/css/`

- `assets/main.css` — Tailwind imports + utilidades custom (fuente principal)
- `static/css/general.css` — Clases de componentes reutilizables
- `tailwind.config.js` — Configuración de Tailwind (paths de purge, tipografía)

### JS → `static/js/`

- `accordion.js` — Lógica de expand/collapse + persistencia en localStorage
- `cv-mode.js` — Easter egg YOLO (activar con "yolo" o ⌘K → "CV Mode")
- `neural-hero.js` — Animación canvas del hero

---

## Cómo modificar cosas

### Añadir un post de blog

Crear `content/blog/mi-post.md`:

```markdown
---
title: "Título del post"
date: 2025-01-01
description: "Descripción corta para SEO y cards"
tags: ["tag1", "tag2"]
---

Contenido en markdown...
```

### Editar experiencia laboral

En `config.yaml` bajo `params.experience.list`:

```yaml
- position: "Cargo"
  dates: "2024 - *Presente*"
  company: "Empresa"
  url: "https://empresa.com"
  details: |
    Descripción en markdown...
  tags: [Python, PyTorch, Docker]
```

### Añadir un proyecto

En `config.yaml` bajo `params.project.list`:

```yaml
- title: "Nombre del proyecto"
  description: "Qué hace"
  icon: "fas fa-eye"        # Icono Font Awesome
  color: "cyan"             # cyan | violet | emerald | amber
  tech: [Python, Docker]
  url: ""                   # URL externa (vacío = sin enlace)
  status: "En producción"   # texto libre del badge
```

### Añadir una skill

1. Añadir a `config.yaml` bajo `params.skill.list`:
   ```yaml
   - skill: "Nombre"
     url: "https://..."
   ```
2. Para que aparezca en una categoría específica, editar los arrays hardcodeados en `layouts/partials/skills_by_category.html`.

### Añadir traducciones (i18n)

El sitio tiene un sistema dual de i18n:

1. **Hugo estático** (para contenido estructural): añadir clave en `i18n/es.yaml` e `i18n/en.yaml`, usar con `{{ i18n "clave" }}` en templates.
2. **JS runtime** (para toggle de idioma sin reload): añadir clave en el objeto `window.__i18n` dentro de `layouts/partials/i18n.html`, usar con `data-i18n="clave"` en HTML.

### Añadir una página nueva

1. Crear el archivo de contenido:
   ```
   content/nueva-seccion/index.md   (o _index.md para listas)
   ```
2. Hugo usará `layouts/_default/single.html` por defecto.
3. Para un layout custom, crear `layouts/nueva-seccion/single.html`.
4. Añadir al nav en `layouts/partials/header.html` y a la paleta en `layouts/partials/command_palette.html`.

---

## Arquitectura de la homepage

La homepage (`layouts/index.html`) usa un grid 40/60:

```
┌─────────────────┬────────────────────────────────┐
│  40% (sticky)   │  60% (scroll)                  │
│                 │                                 │
│  Foto + stats   │  Proyectos                      │
│  Redes sociales │  Experiencia (accordion)        │
│                 │  Último post                    │
│                 │  Educación (accordion)          │
│                 │  Publicaciones (accordion)      │
│                 │  Skills por categoría           │
│                 │  GitHub activity calendar       │
│                 │  Contacto                       │
└─────────────────┴────────────────────────────────┘
```

En mobile colapsa a una sola columna.

---

## Sistema de temas y estado

| Feature | Mecanismo | Clave localStorage |
|---------|-----------|-------------------|
| Dark/light mode | CSS `dark:` prefix + toggle JS | `theme` |
| Idioma ES/EN | `data-i18n` + `toggleLang()` | `lang` |
| Acordeón abierto | `accordion.js` | `lastAccordionPanel` |
| Modal de bienvenida | cookie check | `welcomeShown` |

---

## Build y despliegue

```bash
npm run build
# Equivalente a: hugo --gc --cleanDestinationDir && pagefind --site docs
```

- Output: `docs/` (GitHub Pages sirve desde aquí en rama master)
- CI/CD: `.github/workflows/hugo.yml` — trigger manual
- Pagefind indexa el HTML generado y crea `docs/pagefind/` para búsqueda estática

---

## Rutas del sitio

| URL | Fuente | Layout |
|-----|--------|--------|
| `/` | `layouts/index.html` | Homepage |
| `/blog/` | `content/blog/_index.md` | `layouts/blog/list.html` |
| `/blog/{slug}/` | `content/blog/*.md` | `layouts/_default/single.html` |
| `/material/` | `content/material/_index.md` | `layouts/material/list.html` |
| `/material/{slug}/` | `content/material/*.md` | `layouts/_default/single.html` |
| `/search/` | `content/search/_index.md` | `layouts/_default/search.html` |
| `/agent-context/` | `content/agent-context/index.md` | `layouts/_default/single.html` |
| `/tags/{tag}/` | Taxonomía Hugo automática | — |

---

## Easter eggs (no tocar sin querer)

- **Konami Code** (↑↑↓↓←→←→BA): partículas animadas — `layouts/index.html`
- **CV Mode** (escribir "yolo" o ⌘K → "CV Mode"): overlay YOLO — `static/js/cv-mode.js`
- **Terminal** (⌘K → "Abrir terminal"): shell simulado — `layouts/partials/terminal.html`

---

## Qué NO hacer

- No editar nada dentro de `docs/` directamente (es output del build)
- No editar `resources/` (caché interna de Hugo)
- No cambiar `publishDir` en `config.yaml` sin actualizar también el workflow de GitHub Actions
- No borrar `static/fontawesome/` (Font Awesome está self-hosted, sin CDN)
