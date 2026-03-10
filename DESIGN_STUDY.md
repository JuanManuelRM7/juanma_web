# 📊 Estudio de Diseño y UX/UI - Página Web
## Juan Manuel Ruiz Muñoz

---

## 🔍 ANÁLISIS ACTUAL

### 1. **Tecnología & Stack**
- Framework: Hugo (Static Site Generator)
- Estilos: Tailwind CSS 4.x
- Color Scheme: Emerald (verde) como principal
- Dark Mode: Implementado (class-based)
- Responsive: Mobile-first con breakpoints en `md` (768px)

### 2. **Estructura Actual**
**Layout Principal:**
- Grid de 5 columnas en desktop
- Sidebar izquierdo (col-span-2): Foto, skills, redes sociales
- Contenido derecho (col-span-3): Acordeones de Experience, Education, Publications

**Mobile:** Stack vertical (col-span-1)

### 3. **Colores Actuales**
```
Primario: Emerald (#10b981) - Verde
Secundario: Gray/Slate - Neutral
Acento: Emerald con gradientes
Dark Mode: Slate 700-900
Fondo: Gray 200 (light) / Slate 800 (dark)
```

### 4. **Problemas Identificados**

#### 🔴 **Desktop Issues:**
1. **Too much whitespace** - Mucho espacio vacío en desktop
2. **Sidebar separado** - La foto y skills están en columna aparte
3. **Header vacío** - No hay un hero section o introducción visual
4. **Acordeones pesados** - Sistema de acordeones puede ser abrumador visualmente
5. **Skills repetidas** - Skills en sidebar + skills en skillsbar (duplicación)
6. **Blog poco visible** - Post recientes no se destacan

#### 🟠 **Mobile Issues:**
1. **Stack vertical muy largo** - Mucho scroll request
2. **Pequeña foto de perfil** - No se destaca lo suficiente
3. **Skills ticker overflow** - Problemas en pantallas muy pequeñas
4. **CV button duplicado** - Se ve tanto en desktop como mobile
5. **Navigation unclear** - No hay navegación clara entre secciones

#### ⚠️ **General Issues:**
1. **Color muy monótono** - Solo emerald, podría tener más variedad
2. **Typography hierarchy débil** - Títulos no destacan suficiente
3. **Spacing inconsistente** - Gaps variables (gap-2, gap-3, gap-4)
4. **No hay CTA claro** - Sin call-to-action evidente (blog, contacto)
5. **Links azules en CV** - Contraste pobre vs fondo

---

## 💡 PROPUESTAS DE MEJORA

### **OPCIÓN 1: Modern Tech Minimal (Recomendado)**
Clean, profesional, foco en CV

**Cambios:**
- Header con hero section minimalista
- Color primario más fuerte (Indigo/Cyan en lugar de Emerald)
- Mejor separación de secciones
- Cards para experiencia/educación (no acordeones)
- Blog destacado arriba
- CTA claro al contacto

**Ventajas:**
- ✅ Más profesional para recruiters
- ✅ Mejor para escaneo visual
- ✅ Menos clicks para encontrar info
- ✅ Moderno pero no trendy

---

### **OPCIÓN 2: Creative Dark (Arriesgado pero atractivo)**
Portfolio-style con dark mode por defecto

**Cambios:**
- Dark mode obligatorio (tema más profesional)
- Color primario: Cyan/Blue (#06B6D4)
- Gradientes más prominentes
- Animaciones suaves
- Layout 3D/cards más sofisticadas
- Blog como galería visual

**Ventajas:**
- ✅ Diferenciador visual
- ✅ Muy actual (2024-2026)
- ✅ Impacta más en redes

**Desventajas:**
- ❌ Menos "empresarial"
- ❌ Más trabajo frontend

---

### **OPCIÓN 3: Scientific/Academic (Clásico profesional)**
Enfocado en investigador + ingeniero

**Cambios:**
- Colores: Navy + Gold (profesional + académico)
- Layout tipo "CV expandido"
- Citas/referencias visibles
- Publicaciones destacadas
- Timeline visual de carrera

**Ventajas:**
- ✅ Respeta tu formación
- ✅ Muy profesional
- ✅ Diferencia bien entre roles

---

## 🎨 PROPUESTA DETALLADA - OPCIÓN 1 (RECOMENDADA)

### **Colores Propuestos**
```
Primario: Cyan/Teal (#06B6D4 o #0891B2)
Complementario: Slate (#1E293B)
Acento: Amber (#F59E0B) - para highlights
Neutro: Gray
Dark: Slate 950
Light: Gray 50
```

### **Nuevo Layout - Desktop**
```
┌─────────────────────────────────────────┐
│         HERO SECTION (Full Width)       │ ← New
│  "AI Developer - Computer Vision"       │
│  Subtle gradient background             │
└─────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  Left (40%)    │    Right (60%)          │
│  ─────────────┼──────────────────        │
│  Foto        │  Featured: Latest Blog    │ ← New
│  Quick Info  │  + CTA                    │
│  Social      │  ─────────────────────    │
│  ─────────────  Card Grid:               │
│  Stats (?)   │  • Experience (Cards)     │
│             │  • Education (Cards)      │
│             │  • Publications           │
└──────────────────────────────────────────┘
```

### **Cambios de Componentes**

#### 1. **Hero Section (NEW)**
```
Background: Subtle gradient (Cyan → Slate)
Content:
  - Large title: "Física | IA Developer"
  - Subtitle: "Computer Vision Specialist"
  - Brief description (2-3 líneas)
  - Icons: Python, PyTorch, etc.
Height: 300px (desktop) / 250px (mobile)
```

#### 2. **Profile Card (Mejorado)**
```
Layout: Vertical card
- Foto circular más grande (mejor quality)
- Name + Title
- Location
- Quick stats box:
  * Years exp
  * Publications
  * Current role
- Social icons (horizontal)
- Download CV button
```

#### 3. **Featured Blog Post (NEW)**
```
Location: Top right in desktop
Card style with:
- Thumbnail image (o colored background)
- Title
- Date + Reading time
- Brief description
- "Read more" button
```

#### 4. **Experience/Education - Cards (No Acordeones)**
```
Style: Card grid (2 columns desktop, 1 mobile)
Per card:
- Company/University name
- Position + Dates (smaller)
- 3-4 bullet points (visible, not collapsed)
- Tags: Skills

Benefits:
- No need to click to see content
- Better for scanning
- Can expand on hover for details
```

#### 5. **Skills Section**
```
Remove: Sidebar skills ticker
New layout:
- Skills organized by category
- Category badges (CV, ML, Data, Sci)
- Better visual hierarchy
- Horizontal scroll on mobile

Categories:
1. Computer Vision (Primary)
   PyTorch, TensorFlow, OpenCV...
   
2. Deep Learning (Primary)
   Keras, CNN, PyTorch Lightning...
   
3. Engineering (Secondary)
   Docker, AWS, Git...
   
4. Data & Science (Tertiary)
   Python, SQL, MATLAB...
```

---

## 📱 Mobile-Specific Improvements

### **Issues to Fix:**
1. Stack vertical optimal
2. Smaller header/hero
3. Better tap targets (48px minimum)
4. Sticky header con navegación
5. Bottom CTA (WhatsApp/Email)

### **Proposed Mobile Layout:**
```
┌─────────────────┐
│  Mini Hero (150)│
├─────────────────┤
│  Foto + CTA     │  ← Sticky at top
├─────────────────┤
│  Featured Post  │
├─────────────────┤
│  Experience     │  ← SingleColumn cards
│  [Card]         │
│  [Card]         │
├─────────────────┤
│  Education      │
│  [Card]         │
├─────────────────┤
│  Publications   │
├─────────────────┤
│  Skills         │
│  [Horizontal]   │
├─────────────────┤
│ Footer / CTA    │  ← Sticky at bottom
└─────────────────┘
```

---

## 🎬 Animaciones & Interactions (Subtle)

```
1. Hover on cards: Lift + shadow
2. Hover on links: Color change + underline
3. Scroll: Fade-in for cards
4. Skills: Tooltip on hover
5. Social: Bounce animation
6. Hero: Parallax (light)
```

---

## 🔤 Typography Changes

**Current Issues:**
- Headings too small
- Line height inconsistent
- Font pairing unclear

**Proposed:**
- Font main: System fonts (Segoe, SF Pro, Roboto)
- Font mono: JetBrains Mono or Fira Code
- h1: 3.5rem (mobile: 2.5rem)
- h2: 2.5rem (mobile: 2rem)
-Body: 1.125rem (16px)
- Line height: 1.6 for readability

---

## 📊 Spacing & Layout System

**Current:**
- Gaps: gap-2, gap-3, gap-4 (irregular)
- Padding: p-2, p-4 (mixed)

**Proposed: 8px Grid System**
- 2px (xs) = 0.125rem
- 4px (sm) = 0.25rem
- 8px (md) = 0.5rem
- 12px (lg) = 0.75rem
- 16px (xl) = 1rem
- 24px (2xl) = 1.5rem
- 32px (3xl) = 2rem
- 48px (4xl) = 3rem

---

## 🛠️ Implementation Priority

### **Phase 1 (Easy wins)** - 1-2 horas
1. Update color scheme (Cyan → replace Emerald)
2. Improve typography (heading sizes)
3. Remove cards from accordions → simple layout
4. Better spacing consistency
5. Add featured blog section

### **Phase 2 (Medium)** - 3-4 horas
1. Create hero section
2. Redesign profile card
3. Card-based experience/education
4. Skills reorganization
5. Mobile sticky header

### **Phase 3 (Polish)** - 2-3 horas
1. Add subtle animations
2. Improve dark mode colors
3. Better responsive breakpoints
4. Optimize mobile layout
5. Performance tweaks

---

## 📈 Expected Impact

**Before:**
- Long page, lots of scrolling
- Desktop-centric layout
- Overcrowded information
- Not mobile-friendly

**After:**
- Clear hierarchy
- Faster scanning
- Better UX on mobile
- More professional appearance
- Higher engagement

---

## 🎯 SIGUIENTE PASO

¿Cuál opción te atrae más?
- **Opción 1 (Modern Tech Minimal)** - RECOMENDADA ✅
- **Opción 2 (Creative Dark)** - Arriesgada pero moderna
- **Opción 3 (Scientific/Academic)** - Clásica profesional

O ¿Quieres que proponga una mezcla de elementos de varias?

