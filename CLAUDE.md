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
| Hero (titular, propuesta de valor, métricas) | `params.profile`, `params.hero.value`, `params.hero.metrics` | `layouts/index.html`, `layouts/partials/hero_metrics.html` (la segunda métrica, el exact match del OCR, aparece también en la etiqueta del neumático) |
| Proyectos (destacados + tabla) | `params.project.list` | `layouts/partials/projects.html` → `project_card.html` (destacados) y `project_row.html` (resto) |
| Experiencia (resumen + `highlights`) | `params.experience.list` | `layouts/partials/accordion/experience.html` |
| Educación | `params.education.list` | `layouts/partials/accordion/education.html` |
| Certificaciones | `params.certifications.list` | `layouts/partials/certifications.html` |
| Publicaciones | `params.publication.list` | `layouts/partials/accordion/publication.html` |
| Skills por categoría | `params.skill.categories` | `layouts/partials/skills_by_category.html` |
| Redes / contacto (con `label`) | `params.social.list` | `layouts/index.html` (contacto), barra móvil, footer |
| Sobre mí (texto, foto, terminal) | `params.aboutme`, `params.profile.photo` | `layouts/index.html` (sección «Sobre mí») |

Las estadísticas de «Sobre mí» (años de experiencia, publicaciones, proyectos open source) se calculan a partir de esos datos en `profile_stats.html` y `experience_calculator.html` (usa `start`/`end` en formato `YYYY-MM` de cada experiencia).

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
├── blog/list.html          # Índice del blog (lista paginada con reglas)
├── proyectos/
│   ├── list.html           # /proyectos/: intro + los mismos proyectos que la portada
│   └── single.html         # Caso de estudio: cifras, ficha lateral (rol, periodo, stack, enlaces) + TOC
├── material/list.html      # Índice de material universitario
├── shortcodes/img.html     # {{< img src="images/..." alt="" caption="" width="1200" >}} → webp procesado desde assets/
└── partials/
    ├── head.html           # Meta tags, CSS, preload de fuentes (siempre oscuro)
    ├── meta.html           # <title>, OG, Twitter, JSON-LD (Person en la portada; BlogPosting/Article en posts, casos y apuntes; CollectionPage/WebPage en el resto; BreadcrumbList)
    ├── header.html         # Nav: Inicio · Proyectos · Blog · Material + paleta ⌘K e idioma (sin botón de tema)
    ├── footer.html         # Pie común: nombre dibujado con puntos (scan.js) y enlaces
    ├── i18n.html           # Sistema i18n JS: textos de interfaz (generados desde i18n/*.yaml) + bloque generado desde config.yaml
    ├── loop_video.html     # Reproduce los vídeos en bucle (GIF convertidos) solo cuando están a la vista
    ├── hero_metrics.html   # Franja de métricas del hero
    ├── projects.html / project_card.html / project_row.html
    ├── latest_posts.html   # Tres últimos posts (fallback a ES en la home EN)
    ├── post_row.html       # Fila de post (fecha, título, descripción, minutos) para listas
    ├── toc.html            # Índice lateral (marca en lima la sección leída) y plegable en móvil
    ├── certifications.html
    ├── command_palette.html # Paleta ⌘K (HTML + datos; lógica en static/js/cmdk.js)
    ├── terminal.html        # Terminal easter egg (HTML + datos; lógica en static/js/terminal.js)
    └── accordion/          # experience, education, publication
```

### Imágenes → `assets/images/`

Las imágenes que se procesan (foto de perfil, figuras de casos de estudio) viven en `assets/images/` y se convierten a webp con Hugo (`resources.Get` + `Resize`). Lo que va tal cual (PDFs, OG, iconos) está en `static/`.

Las imágenes escritas en markdown (`![alt](/images/figura.png)`, con el fichero en `static/images/`) pasan por el render hook `layouts/_default/_markup/render-image.html`, que añade `loading="lazy"` y el ancho y alto reales. Usa siempre rutas absolutas (`/images/...`) para que pueda leer las dimensiones.

**Animaciones: no subas GIF.** Conviértelos a vídeo con `scripts/gif2mp4.swift` (macOS, sin ffmpeg; instrucciones en la cabecera): genera `figura.mp4` y su póster `figura.png` junto al GIF, unas 5 veces más ligeros. En el post se enlaza igual que una imagen, `![texto alternativo](/images/figura.mp4)`, y el render hook lo pinta como `<video>` en bucle, sin sonido, que solo se descarga y reproduce al entrar en pantalla.

### Estilos → `assets/main.css`

Diseño **Vantage** (de [Hallmark](https://github.com/Nutlope/hallmark)), **solo modo oscuro**: fondo azul acero con un degradado suave (`.atmos`), tinta gris acero, Geologica fina con esquinas afiladas (eje `SHRP`), marcos de esquina (`.ticks`) y **un único verde lima** (`--color-accent`) reservado para lo encontrado, lo vivo o lo principal (botón primario, «en producción», puesto actual, sección leída en el índice, defecto del neumático). No uses el lima para títulos ni fondos grandes.

- `assets/main.css` — todo el CSS: tokens (`:root`), `@font-face` (Geologica y JetBrains Mono en `static/fonts/`), componentes con clases propias (`.hero`, `.figures`, `.feature`, `.ledger`, `.role`, `.entry`, `.article`, `.toc`…), paleta ⌘K, terminal, Pagefind, impresión. Ya no hay `static/css/`.
- `tailwind.config.js` — Tailwind sigue cargado solo para las pocas utilidades que puedan aparecer en el contenido; las plantillas no usan utilidades (salvo `min-w-0`).
- Texto de los artículos: clase `.article` (no `prose`). Avisos dentro del markdown: `<div class="note note--warn">…</div>`.
- Colores: cambia los tokens de `:root`, nunca valores sueltos. Las cifras van con `.num` (tabular) y la unidad en `.u`.

### JS → `static/js/`

- `cv-mode.js` — Easter egg YOLO (activar con "yolo" o ⌘K → "CV Mode")
- `scan.js` — Nube de puntos del hero (neumático en WebGL con barrido de luz, texto del flanco y defecto en lima; un OCR lee el texto del flanco como un escáner: una línea de luz recorre el texto, los caracteres leídos se encienden en lima y la etiqueta los escribe; el defecto en lima no lleva cifra) y el nombre del pie dibujado con puntos. Se pausa fuera de pantalla y respeta «reducir movimiento»
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
  featured: true             # opcional: fila grande con imagen al principio; sin él, va a la tabla «Más proyectos»
  home: true                 # ya no se usa: la portada muestra los destacados y la tabla con todos los demás
  title: "Nombre del proyecto"
  description: "Qué hace y qué resultado tiene"
  metrics:                   # opcional, 1-3 líneas cortas con números
    - "mAP 0,83 en producción"
  tech: [Python, Docker]
  cover: "images/proyectos/mi-proyecto/portada.png"  # opcional: imagen de portada (en assets/); sin ella, gradiente + icono
  cover_fit: contain         # opcional: muestra la imagen entera (para diagramas) en vez de recortarla
  icon: "fas fa-eye"         # icono Font Awesome (debe existir en el subset); solo si es destacado y no tiene cover
  color: "cyan"              # ya no se usa en el diseño actual
  status: active             # production | published | active | development | completed (solo production lleva el punto lima)
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

Una sola columna, de arriba abajo:

```
Hero: kicker (puesto) · nombre · propuesta de valor · CTAs · ubicación   |  neumático escaneado (scan.js) con 2 etiquetas
Franja de 4 cifras (params.hero.metrics)
Proyectos: destacados (imagen + ficha) y tabla «Más proyectos» (stack, estado, enlaces)
Experiencia: fecha | puesto, empresa, resumen, logros plegados, stack
Del blog: tres últimos posts
Banda: Publicaciones | Educación + certificaciones
Herramientas (skills por categoría) + actividad en GitHub
Sobre mí: foto, texto, estadísticas
Contacto: CV, email (con copiar), LinkedIn, GitHub, ORCID
Pie: nombre en puntos + enlaces
```

En móvil todo pasa a una columna (el neumático va debajo del texto) y aparece una barra inferior fija con CV, LinkedIn y email.

---

## Sistema de temas y estado

| Feature | Mecanismo | Clave localStorage |
|---------|-----------|-------------------|
| Modo oscuro | Siempre activo (`class="dark"` en `<html>`, `color-scheme: dark`); ya no hay toggle | — |
| Idioma ES/EN | `data-i18n` + `toggleLang()` (navega si hay traducción) | `lang` |

Sin elección guardada, quien tiene el navegador en un idioma que no es español (ni catalán, gallego o euskera) ve en inglés las páginas renderizadas en español (`browserLang()` en `i18n.html`). Esa detección no se guarda en `localStorage` y nunca pasa una página `/en/` a español.

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
- **Neumático del hero**: no es un easter egg, pero `static/js/scan.js` tiene la geometría; el exact match de su etiqueta sale de `params.hero.metrics`
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
- No inventar métricas: todo lo que afirma la web sale del CV (`static/cv.pdf`, fuente en `cv/`), de los README de los repos o del paper
- El CV se edita en `cv/*.tex` (ES y EN) y se recompila a `static/cv.pdf` y `static/cv-en.pdf` (ver `cv/README.md`); mantén la web y los dos CV con la misma redacción de las métricas
