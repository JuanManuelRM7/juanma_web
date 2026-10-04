# CLAUDE.md — Guía para agentes en juanma_web

Portfolio personal de Juan Manuel Ruiz Muñoz (ML Engineer · Computer Vision & LLMs). **Hugo** como generador estático, **Tailwind CSS 4**, JS vanilla, desplegado en GitHub Pages desde `docs/`.

## Comandos esenciales

```bash
npm install          # instalar dependencias
hugo server -M       # dev en localhost:1313 (-M: renderiza en memoria, no pisa docs/)
npm run build        # build producción (Hugo + Pagefind) → docs/
```

> El build escribe en `docs/`. Nunca edites `docs/` manualmente. `hugo server` sin `-M` también escribe en `docs/` y deja un build de desarrollo (URLs localhost:1313, livereload): usa siempre `-M`.

Al añadir un post o un caso de estudio, regenera las imágenes Open Graph: `npm i --no-save sharp && node scripts/generate-og-posts.mjs` (escribe `static/og/<slug>.png`).

---

## Dónde está cada cosa

### Datos del sitio → `config.yaml`

**Toda la información del perfil está en `config.yaml`**: en español bajo `params` y en inglés bajo `languages.en.params` (misma estructura, mismas claves). Las traducciones que muestra el toggle ES/EN en la portada se **generan** desde esas dos ramas (ver i18n), así que basta con editar el YAML.

| Sección | Clave en `config.yaml` | Renderizado por |
|---------|------------------------|-----------------|
| Hero (titular, propuesta de valor, métricas) | `params.profile`, `params.hero.value`, `params.hero.metrics` | `layouts/index.html`, `layouts/partials/hero_metrics.html` |
| Proyectos (tarjetas) | `params.project.list` | `layouts/partials/projects.html` → `project_card.html` |
| Experiencia (resumen + `highlights`) | `params.experience.list` | `layouts/partials/accordion/experience.html` |
| Educación | `params.education.list` | `layouts/partials/accordion/education.html` |
| Certificaciones | `params.certifications.list` | `layouts/partials/certifications.html` |
| Publicaciones | `params.publication.list` | `layouts/partials/accordion/publication.html` |
| Skills por categoría | `params.skill.categories` | `layouts/partials/skills_by_category.html` |
| Redes / contacto (con `label`) | `params.social.list` | `layouts/index.html` (contacto), sidebar, footer |
| Sobre mí (dorso de la foto, terminal) | `params.aboutme` | `layouts/partials/profilePhoto.html` |

Las estadísticas de la sidebar (años de experiencia, publicaciones, proyectos open source) se calculan a partir de esos datos en `profile_stats.html` y `experience_calculator.html` (usa `start`/`end` en formato `YYYY-MM` de cada experiencia).

### Contenido en markdown → `content/`

```
content/
├── blog/         # Posts del blog (solo ES)
├── proyectos/    # Casos de estudio: <slug>.md (ES) + <slug>.en.md (EN)
├── material/     # Apuntes universitarios
├── search/       # Página de búsqueda (solo _index.md)
└── agent-context.md
```

### Layouts → `layouts/`

```
layouts/
├── index.html              # Homepage completa
├── _default/
│   ├── baseof.html         # Plantilla base (HTML, head, body con data-kind)
│   ├── single.html         # Post individual (blog, material)
│   ├── list.html           # Páginas de tags: /tags/ (nube de etiquetas) y /tags/<tag>/ (tarjetas)
│   ├── search.html         # Página de búsqueda (Pagefind)
│   └── _markup/render-image.html  # Imágenes de markdown: lazy + width/height automáticos; los .mp4 salen como vídeo en bucle
├── index.rss.xml           # Feed de la portada: solo posts y casos de estudio
├── robots.txt              # robots.txt con el sitemap (enableRobotsTXT en config.yaml)
├── blog/list.html          # Índice del blog (grid paginado)
├── proyectos/
│   ├── list.html           # /proyectos/: intro + mismas tarjetas que la portada
│   └── single.html         # Caso de estudio: ficha lateral (rol, periodo, stack, enlaces, métricas) + TOC
├── material/list.html      # Índice de material universitario
├── shortcodes/img.html     # {{< img src="images/..." alt="" caption="" width="1200" >}} → webp procesado desde assets/
└── partials/
    ├── head.html           # Meta tags, CSS, preload de fuentes, detección de tema
    ├── meta.html           # <title>, OG, Twitter, JSON-LD (Person en la portada; BlogPosting/Article en posts, casos y apuntes; CollectionPage/WebPage en el resto; BreadcrumbList)
    ├── header.html         # Nav: Inicio · Proyectos · Blog + buscar, idioma, tema
    ├── footer.html
    ├── i18n.html           # Sistema i18n JS: textos de interfaz (generados desde i18n/*.yaml) + bloque generado desde config.yaml
    ├── loop_video.html     # Reproduce los vídeos en bucle (GIF convertidos) solo cuando están a la vista
    ├── hero_metrics.html   # Franja de métricas del hero
    ├── projects.html / project_card.html
    ├── latest_posts.html   # Tres últimos posts (fallback a ES en la home EN)
    ├── certifications.html
    ├── command_palette.html # Paleta ⌘K (HTML + datos; lógica en static/js/cmdk.js)
    ├── terminal.html        # Terminal easter egg (HTML + datos; lógica en static/js/terminal.js)
    └── accordion/          # experience, education, publication
```

### Imágenes → `assets/images/`

Las imágenes que se procesan (foto de perfil, figuras de casos de estudio) viven en `assets/images/` y se convierten a webp con Hugo (`resources.Get` + `Resize`). Lo que va tal cual (PDFs, OG, iconos) está en `static/`.

Las imágenes escritas en markdown (`![alt](/images/figura.png)`, con el fichero en `static/images/`) pasan por el render hook `layouts/_default/_markup/render-image.html`, que añade `loading="lazy"` y el ancho y alto reales. Usa siempre rutas absolutas (`/images/...`) para que pueda leer las dimensiones.

**Animaciones: no subas GIF.** Conviértelos a vídeo con `scripts/gif2mp4.swift` (macOS, sin ffmpeg; instrucciones en la cabecera): genera `figura.mp4` y su póster `figura.png` junto al GIF, unas 5 veces más ligeros. En el post se enlaza igual que una imagen, `![texto alternativo](/images/figura.mp4)`, y el render hook lo pinta como `<video>` en bucle, sin sonido, que solo se descarga y reproduce al entrar en pantalla.

### Estilos → `assets/main.css` + `static/css/`

- `assets/main.css` — Tailwind imports, `@font-face` de las fuentes self-hosted (`static/fonts/`), utilidades custom (hero, proyectos, experiencia, certificaciones, contacto)
- `static/css/general.css` — Clases de componentes reutilizables
- `tailwind.config.js` — Configuración de Tailwind (cargada con `@config`)

Tailwind solo busca clases en `layouts/` y `content/` (la clave `content` de `tailwind.config.js`); `main.css` importa con `source(none)` para que no escanee el resto del repo (antes leía `docs/` y el CSS cambiaba en cada build). Una utilidad que solo aparezca en `static/js/` o en `config.yaml` no se genera.

Las reglas base de `main.css` (`a`, `h1`…) están en `@layer utilities` y salen con `!important` (`important: true`). Un color declarado fuera de capa no puede ganarles ni con `!important`: para un botón con color propio, exclúyelo en la regla `a:where(:not(...))` o dale una utilidad (`text-white`).

Los colores de las tarjetas de proyecto (`project-color-*`, `project-status-*`) son CSS plano, no utilidades Tailwind: evita clases Tailwind construidas dinámicamente desde datos de `config.yaml`, porque el purge no las ve.

### JS → `static/js/`

- `cv-mode.js` — Easter egg YOLO (activar con "yolo" o ⌘K → "CV Mode")
- `neural-hero.js` — Animación canvas del hero
- `cmdk.js` — Paleta de comandos ⌘K
- `terminal.js` — Terminal simulado (datos en `window.__terminalData`, generados por el partial en los dos idiomas; textos desde `i18n/*.yaml`)

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

Después regenera los OG (ver arriba).

### Editar experiencia laboral

En `config.yaml` bajo `params.experience.list` (y su equivalente en `languages.en.params`):

```yaml
- position: "Cargo"
  dates: "Junio 2025 - *Presente*"
  start: "2025-06"        # YYYY-MM, para el cálculo de años de experiencia
  end: ""                 # vacío = presente
  company: "Empresa"
  url: "https://empresa.com"
  details: |
    Resumen de una o dos frases en markdown...
  highlights:
    - "Bullet con **métrica** en negrita"
  tags: [Python, PyTorch, Docker]
```

### Añadir un proyecto (tarjeta)

En `config.yaml` bajo `params.project.list` **y** `languages.en.params.project.list` (mismo `id`):

```yaml
- id: mi-proyecto            # clave estable; se usa para las traducciones
  featured: true             # opcional: tarjeta grande al principio
  home: true                 # opcional: aparece también en la portada (el resto solo en /proyectos/)
  title: "Nombre del proyecto"
  description: "Qué hace y qué resultado tiene"
  metrics:                   # opcional, 1-3 líneas cortas con números
    - "mAP 0,83 en producción"
  tech: [Python, Docker]
  cover: "images/proyectos/mi-proyecto/portada.png"  # opcional: imagen de portada (en assets/); sin ella, gradiente + icono
  cover_fit: contain         # opcional: muestra la imagen entera (para diagramas) en vez de recortarla
  icon: "fas fa-eye"         # icono Font Awesome (debe existir en el subset, ver abajo)
  color: "cyan"              # cyan | violet | amber | rose | indigo | emerald
  status: active             # production | published | active | development | completed
  links:                     # todos opcionales
    repo: "https://github.com/..."
    case_study: "/proyectos/mi-proyecto/"
    paper: "/paper.pdf"
    posts:
      - title: "Post relacionado"
        url: "/blog/..."
```

### Añadir un caso de estudio

1. Crear `content/proyectos/<slug>.md` (ES) y `content/proyectos/<slug>.en.md` (EN) con este front matter:
   ```yaml
   title: "..."
   description: "..."
   date: 2026-01-01
   role: "Autor · investigación y desarrollo"
   period: "Junio – julio 2026"
   org: "Proyecto personal, open source"
   stack: [PyTorch, uv]
   links: { repo: "https://github.com/...", paper: "/x.pdf", post: "/blog/..." }
   metrics:
     - value: "35,9 %"
       label: "qué mide"
   tags: ["computer vision"]
   ```
2. Figuras: copiarlas a `assets/images/proyectos/<slug>/` (JPEG para fotos, PNG para diagramas; máximo ~1600 px) y usarlas con `{{< img src="images/proyectos/<slug>/figura.png" alt="..." caption="..." >}}`.
3. Enlazar la tarjeta correspondiente con `links.case_study` (ES: `/proyectos/<slug>/`, EN: `/en/proyectos/<slug>/`).
4. Regenerar los OG.

### Añadir una skill

En `config.yaml` bajo `params.skill.categories` (ES) y `languages.en.params.skill.categories` (EN), dentro de la categoría que toque (`items`). Para una categoría nueva: `key` único, `name`, `chip` (primary | secondary | tertiary) e `items`.

### Añadir traducciones (i18n)

Hay dos capas:

1. **Textos de interfaz** (botones, títulos de sección, paleta ⌘K, terminal): clave en `i18n/es.yaml` e `i18n/en.yaml`, con las mismas claves en los dos. En el template, `{{ i18n "clave" }}` más `data-i18n="clave"` para que el toggle sin recarga lo sustituya (`data-i18n-aria` para `aria-label`, `data-i18n-placeholder` para `placeholder`). El objeto JS que usa el toggle se genera desde esos dos ficheros en `layouts/partials/i18n.html`; no se escribe a mano.
2. **Contenido del perfil** (hero, proyectos, experiencia, educación, publicaciones, skills, certificaciones): **no se escribe a mano**. El bloque `window.__i18nDyn` de `i18n.html` genera las claves (`proj_title_<id>`, `exp_hl_<n>`, `skill_<cat>_<n>`…) leyendo `params` y `languages.en.params`. Basta con mantener las dos ramas de `config.yaml` sincronizadas. El bloque solo se emite en la portada, que es la única página que sustituye estos textos sin recargar.

En páginas que tienen traducción Hugo (casos de estudio), el toggle navega a la versión traducida en lugar de sustituir textos; al cargar, si el idioma guardado no coincide con el de la página y existe traducción, redirige.

### Añadir una página nueva

1. Crear el archivo de contenido: `content/nueva-seccion/_index.md` (lista) o `content/nueva-seccion/pagina.md`.
2. Hugo usará `layouts/_default/single.html` por defecto; para un layout custom, crear `layouts/nueva-seccion/single.html`.
3. Añadir al nav en `layouts/partials/header.html` y a la paleta en `layouts/partials/command_palette.html`.

### Iconos (Font Awesome)

Font Awesome está self-hosted **y recortado** a los iconos usados (`static/fontawesome/`). Para usar un icono nuevo: añadirlo a `USED` en `scripts/subset-fontawesome.mjs`, ejecutar el script (ver cabecera del fichero) y subir el `?v=` de los `preload` en `layouts/partials/head.html`.

---

## Arquitectura de la homepage

Grid 40/60 (sidebar sticky | contenido) bajo un hero a ancho completo:

```
Hero: kicker (puesto) · nombre · propuesta de valor · 4 métricas · CTAs (proyectos, CV, contacto)
┌─────────────────┬────────────────────────────────┐
│  40% (sticky)   │  60% (scroll)                  │
│                 │                                 │
│  Foto (flip)    │  Proyectos (2 destacados + grid)│
│  Stats          │  Experiencia (timeline + bullets)│
│  Redes sociales │  Del blog (3 últimos posts)     │
│  Botón CV       │  Educación                      │
│  Footer compacto│  Certificaciones                │
│                 │  Publicaciones                  │
│                 │  Skills por categoría           │
│                 │  GitHub activity calendar       │
│                 │  Contacto                       │
└─────────────────┴────────────────────────────────┘
```

En mobile colapsa a una sola columna y aparece una barra inferior sticky con CV, LinkedIn y email.

---

## Sistema de temas y estado

| Feature | Mecanismo | Clave localStorage |
|---------|-----------|-------------------|
| Dark/light mode | CSS `dark:` prefix + toggle JS | `theme` |
| Idioma ES/EN | `data-i18n` + `toggleLang()` (navega si hay traducción) | `lang` |

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
| `/` y `/en/` | `layouts/index.html` + `config.yaml` | Homepage |
| `/proyectos/` y `/en/proyectos/` | `content/proyectos/_index(.en).md` | `layouts/proyectos/list.html` |
| `/proyectos/{slug}/` y `/en/proyectos/{slug}/` | `content/proyectos/{slug}(.en).md` | `layouts/proyectos/single.html` |
| `/blog/` | `content/blog/_index.md` | `layouts/blog/list.html` |
| `/blog/{slug}/` | `content/blog/*.md` | `layouts/_default/single.html` |
| `/material/` | `content/material/_index.md` | `layouts/material/list.html` |
| `/material/{slug}/` | `content/material/*.md` | `layouts/_default/single.html` |
| `/search/` | `content/search/_index.md` | `layouts/_default/search.html` |
| `/agent-context/` | `content/agent-context.md` | `layouts/_default/single.html` |
| `/tags/` y `/tags/{tag}/` | Taxonomía Hugo automática | `layouts/_default/list.html` |
| `/robots.txt` | — | `layouts/robots.txt` |

---

## Easter eggs (no tocar sin querer)

- **Konami Code** (↑↑↓↓←→←→BA): partículas animadas — `layouts/index.html`
- **CV Mode** (escribir "yolo" o ⌘K → "CV Mode"): overlay YOLO — `static/js/cv-mode.js`
- **Terminal** (⌘K → "Abrir terminal"): shell simulado — `static/js/terminal.js` + datos en `layouts/partials/terminal.html`

---

## Qué NO hacer

- No editar nada dentro de `docs/` directamente (es output del build)
- No editar `resources/` (caché interna de Hugo)
- No cambiar `publishDir` en `config.yaml` sin actualizar también el workflow de GitHub Actions
- No borrar `static/fontawesome/` ni `static/fonts/` (fuentes self-hosted, sin CDN)
- No escribir a mano traducciones en `i18n.html`: los textos de interfaz se generan desde `i18n/*.yaml` y los del perfil desde `config.yaml`
- No subir GIF animados: convertirlos a MP4 con `scripts/gif2mp4.swift`
- No inventar métricas: todo lo que afirma la web sale del CV (`static/cv.pdf`), de los README de los repos o del paper
