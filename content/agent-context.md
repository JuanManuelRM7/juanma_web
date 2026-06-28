---
title: "Contexto para agentes"
date: 2025-01-01
description: "Guía de referencia del repo juanma_web para agentes de IA. Estructura, convenciones y cómo modificar cada sección del sitio."
tags: ["meta", "docs"]
---

> Esta página existe para dar contexto rápido a un agente de IA sin que tenga que leer todo el repositorio. La guía completa para modificaciones está en [`CLAUDE.md`](https://github.com/juanmanuelrm7/juanma_web/blob/master/CLAUDE.md) en la raíz del repo.

## Stack

**Hugo** (generador estático) + **Tailwind CSS 4** + JS vanilla. Desplegado en **GitHub Pages** desde la carpeta `docs/`.

```bash
npm install          # dependencias
hugo server          # dev en localhost:1313
npm run build        # build producción (Hugo + Pagefind)
```

## Dónde está cada cosa

### Datos del perfil → `config.yaml`

Toda la información del sitio vive en `config.yaml` bajo `params`. No hay base de datos ni CMS — es puro YAML.

| Sección | Clave en `config.yaml` |
|---------|------------------------|
| Experiencia laboral | `params.experience.list` |
| Educación | `params.education.list` |
| Proyectos | `params.project.list` |
| Skills / tecnologías | `params.skill.list` |
| Publicaciones | `params.publication.list` |
| Redes sociales | `params.social.list` |
| Nombre, bio, foto | `params.profile` |

### Contenido en markdown → `content/`

```
content/
├── blog/         ← posts del blog (con frontmatter: title, date, tags, description)
├── material/     ← apuntes universitarios
└── search/       ← solo existe el _index.md, la búsqueda la gestiona Pagefind
```

### Layouts → `layouts/`

```
layouts/
├── index.html              ← Homepage (todas las secciones)
├── _default/
│   ├── baseof.html         ← Plantilla base HTML
│   ├── single.html         ← Post individual
│   └── search.html         ← Página de búsqueda
├── blog/list.html          ← Índice del blog (grid paginado)
├── material/list.html      ← Índice de material
└── partials/               ← Componentes reutilizables
    ├── head.html           ← Meta tags, CSS, fuentes
    ├── header.html         ← Navegación + reloj
    ├── i18n.html           ← Sistema de traducciones JS
    ├── command_palette.html ← Paleta ⌘K
    └── accordion/          ← Secciones colapsables
```

### Estilos

- `assets/main.css` — fuente principal (Tailwind imports + custom)
- `static/css/general.css` — clases de componentes
- `tailwind.config.js` — configuración de Tailwind

---

## Cómo modificar cosas

### Añadir un post de blog

Crear `content/blog/nombre-del-post.md`:

```markdown
---
title: "Título"
date: 2025-01-15
description: "Descripción corta"
tags: ["python", "ml"]
---

Contenido aquí...
```

### Editar experiencia / educación / proyectos

Editar directamente en `config.yaml`. Ejemplo para proyectos:

```yaml
params:
  project:
    list:
      - title: "Nombre del proyecto"
        description: "Qué hace"
        icon: "fas fa-eye"       # Font Awesome
        color: "cyan"            # cyan | violet | emerald | amber
        tech: [Python, Docker]
        url: ""
        status: "En producción"
```

### Añadir traducciones (i18n)

El sitio tiene i18n dual:

1. **Hugo** (estático): claves en `i18n/es.yaml` + `i18n/en.yaml` → `{{ i18n "clave" }}`
2. **JS runtime** (toggle sin reload): en `layouts/partials/i18n.html` → `data-i18n="clave"` en HTML

### Añadir una página nueva

1. Crear `content/nueva-seccion.md` (o `content/nueva-seccion/index.md`)
2. Hugo usará `layouts/_default/single.html` por defecto
3. Para layout custom: crear `layouts/nueva-seccion/single.html`
4. Añadir al nav en `layouts/partials/header.html` y a la paleta en `layouts/partials/command_palette.html`

---

## Arquitectura de la homepage

`layouts/index.html` usa un grid 40/60:

- **40% izquierda (sticky):** foto + stats + redes sociales
- **60% derecha (scroll):** proyectos → experiencia → último post → educación → publicaciones → skills → GitHub activity → contacto

En mobile colapsa a una sola columna.

---

## Estado y persistencia

| Feature | Clave en `localStorage` |
|---------|-------------------------|
| Dark/light mode | `theme` |
| Idioma ES/EN | `lang` |
| Panel de acordeón abierto | `lastAccordionPanel` |
| Modal de bienvenida vista | `welcomeShown` |

---

## Rutas del sitio

| URL | Fuente |
|-----|--------|
| `/` | `layouts/index.html` |
| `/blog/` | `content/blog/_index.md` + `layouts/blog/list.html` |
| `/blog/{slug}/` | `content/blog/*.md` + `layouts/_default/single.html` |
| `/material/` | `content/material/_index.md` |
| `/material/{slug}/` | `content/material/*.md` |
| `/search/` | Pagefind UI |
| `/agent-context/` | Esta página |

---

## Reglas importantes

- **No editar `docs/`** — es output del build, se sobreescribe con `npm run build`
- **No editar `resources/`** — caché interna de Hugo
- Los datos del perfil van siempre en `config.yaml`, no en archivos de contenido
- El build requiere tanto Hugo como Pagefind — usar siempre `npm run build`, no `hugo` solo

---

*Guía completa con más detalles en [`CLAUDE.md`](https://github.com/juanmanuelrm7/juanma_web/blob/master/CLAUDE.md) en la raíz del repo.*
