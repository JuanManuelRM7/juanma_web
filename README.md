# juanmanuel.petrer.eu

Portfolio y blog personal de **Juan Manuel Ruiz Muñoz** — físico e ingeniero en IA especializado en visión computacional y deep learning.

**Live:** [juanmanuel.petrer.eu](https://juanmanuel.petrer.eu/)

---

## Características

| Área | Detalle |
|------|---------|
| **Diseño** | Layout responsive 40/60 con sidebar fija, hero con gradiente animado, cards con hover lift, flip card en perfil |
| **Secciones** | Experiencia (con cálculo dinámico de duración), Educación, Publicaciones, Skills, Proyectos, Blog, Contacto |
| **Blog** | Card grid con gradientes por temática, lectura estimada, tags de colores, TOC automático en cada post |
| **SEO** | Open Graph, Twitter Cards, JSON-LD (Person + BlogPosting), meta tags completos, sitemap |
| **i18n** | Toggle ES/EN en tiempo real con persistencia en localStorage |
| **Dark mode** | Tema claro/oscuro con detección automática del sistema y toggle manual |
| **UX** | Barra de progreso de lectura, scroll-to-top, page loader, smooth scroll, typing effect |
| **Easter egg** | 🎮 Código Konami (`↑↑↓↓←→←→BA`) — pruébalo |
| **Print** | CSS optimizado para impresión / exportar a PDF |

## Stack técnico

```
Hugo 0.149+          Generador de sitios estáticos
Tailwind CSS 4       Utilidades CSS con PostCSS
JavaScript vanilla    Animaciones, i18n, interacciones
GitHub Pages         Hosting desde /docs
```

## Estructura del proyecto

```
├── assets/           CSS fuente (Tailwind)
├── content/          Posts de blog y material académico
├── layouts/          Templates Hugo (index, partials, shortcodes)
├── static/           Assets estáticos (imágenes, JS, CSS adicional)
├── config.yaml       Configuración y todos los datos del sitio
└── docs/             Build de producción (GitHub Pages)
```

## Desarrollo local

```bash
npm install
hugo server
```

## Despliegue

```bash
hugo --gc --minify
git push origin master
```

## Licencia

MIT
