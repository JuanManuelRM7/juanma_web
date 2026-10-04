# juanmanuel.petrer.eu

Portfolio y blog personal de **Juan Manuel Ruiz Muñoz** — ML Engineer · Computer Vision & LLMs, físico y matemático de formación.

**Live:** [juanmanuel.petrer.eu](https://juanmanuel.petrer.eu/)

---

## Características

| Área | Detalle |
|------|---------|
| **Portada** | Hero con propuesta de valor y métricas, sidebar fija con foto (flip card) y estadísticas, proyectos, experiencia, educación, certificaciones, publicaciones, skills, actividad en GitHub y contacto |
| **Proyectos** | Tarjetas generadas desde `config.yaml` y casos de estudio bilingües (ES/EN) con ficha, métricas e índice |
| **Blog** | Grid de tarjetas, lectura estimada, tags, índice automático en cada post, fórmulas con KaTeX y comentarios con Giscus |
| **SEO** | Open Graph con imagen por página, Twitter Cards, JSON-LD (Person, BlogPosting/Article, BreadcrumbList), hreflang, sitemap y robots.txt |
| **i18n** | Español por defecto e inglés: toggle en tiempo real en la portada (persistido en localStorage) y páginas traducidas para los casos de estudio |
| **Dark mode** | Tema claro/oscuro con detección automática del sistema y toggle manual |
| **Búsqueda** | Pagefind (índice estático) y paleta de comandos `⌘K` |
| **Easter eggs** | 🎮 Código Konami (`↑↑↓↓←→←→BA`) · 👁️ CV Mode: escribe `yolo` y la web se "auto-detecta" estilo YOLO · terminal simulado (`⌘K` → "Abrir terminal") |
| **Print** | CSS optimizado para impresión / exportar a PDF |

## Stack técnico

```
Hugo 0.151 (extended)   Generador de sitios estáticos
Tailwind CSS 4          Utilidades CSS con PostCSS
JavaScript vanilla      i18n, animaciones, paleta de comandos
Pagefind                Búsqueda estática
GitHub Pages            Hosting desde /docs
```

## Estructura del proyecto

```
├── assets/           CSS fuente (Tailwind) e imágenes que procesa Hugo
├── content/          Posts de blog, casos de estudio y material académico
├── i18n/             Textos de interfaz (ES/EN)
├── layouts/          Templates Hugo (index, partials, shortcodes)
├── scripts/          Generación de imágenes Open Graph y subset de Font Awesome
├── static/           Assets que se copian tal cual (PDFs, fuentes, JS, CSS adicional)
├── config.yaml       Configuración y todos los datos del perfil (ES y EN)
└── docs/             Build de producción (GitHub Pages); no se edita a mano
```

La guía detallada para modificar cada sección está en [`CLAUDE.md`](CLAUDE.md).

## Desarrollo local

```bash
npm install
hugo server -M   # -M renderiza en memoria; sin él, hugo server sobrescribe docs/
```

## Despliegue

```bash
npm run build    # Hugo + Pagefind → docs/
```

Después, commit y push a `master`: GitHub Pages sirve la carpeta `docs/`.

## Licencia

MIT
