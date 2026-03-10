# Plan de Mejora - Página Web (config.yaml)
## Juan Manuel Ruiz Muñoz

---

## 📋 CAMBIOS A REALIZAR

### 1. ✏️ SECCIÓN "ABOUTME" - Mejorar Descripción
**ACTUAL:**
```
Soy un apasionado de la física y las matemáticas, con un gran interés en el cambio 
climático. Esta preocupación me ha llevado a sentir una especial afinidad por áreas 
como la meteorología y las energías renovables. Actualmente trabajo en VRAIA Corp., 
donde desarrollamos, entre muchas otras cosas, soluciones de deep learning para la 
industria del neumático.
```

**PROPUESTO:**
```
Físico e ingeniero en inteligencia artificial especializado en visión computacional 
y deep learning. Mi motivación es emplear IA avanzada para resolver problemas complejos 
del mundo real y generar un impacto positivo. Actualmente trabajo en VRAIA Corp. 
desarrollando modelos de Deep Learning para detección de defectos en la industria 
del neumático.

Interesado en física computacional, meteorología y energías renovables.
```

**Por qué:** 
- Destaca "visión computacional" en el primer párrafo
- Especifica aplicación real (defectos en neumáticos)
- Mantiene el tono personal
- Más conciso

---

### 2. 🔧 SECCIÓN "EXPERIENCE" - Reorganizar y Mejorar

#### PUESTO 1: AI Developer - VRAIA Corp.
**ACTUAL:** (está bien documentado en config.yaml)

**CAMBIO RECOMENDADO:** Agregar skills específicas al final de cada descripción

```yaml
- position: AI Developer - Computer Vision Specialist
  dates: Junio 2025 - *Presente*
  company: VRAIA Corp.
  url: "https://vraia.com/"
  details: |1-
      - Desarrollo de pipelines de extracción, transformación y carga (ETL) para bases de datos, creación de datasets y preprocesamiento de imágenes.
      - Entrenamiento, fine-tuning y validación de modelos de visión, orientados a la detección de defectos en neumáticos.
      - Diseño e implementación de algoritmos de aprendizaje automático personalizados para distintos proyectos de visión artificial.
      - Definición, análisis y seguimiento de métricas de desempeño para la selección de modelos en producción.
      - Redacción y revisión de documentación técnica.
      - Investigación y actualización constante en avances de inteligencia artificial.
      - Colaboración interdisciplinaria para alcanzar los objetivos del proyecto.
      
      Skills: PyTorch | TensorFlow | Computer Vision | Deep Learning | CNN | Object Detection | OpenCV | MLflow | Docker | AWS
```

---

### 3. 📚 SECCIÓN "EDUCATION" - Agregar Especialidades

#### GRADO EN FÍSICA
**CAMBIO RECOMENDADO:**
```yaml
- degree: Grado en Física
  college: Universidad de Alicante
  dates: 2020 - 2024
  thesis_title: "Un método lagrangiano para la identificación de situaciones de bloqueo atmosférico"
  thesis_url: "/tfg.pdf"
  specialization: "Física Computacional, Métodos Numéricos, Física de la Atmósfera"
  skills: "Computational Physics | Numerical Methods | Python | MATLAB | Data Analysis"
```

#### GRADO EN MATEMÁTICAS
**CAMBIO RECOMENDADO:**
```yaml
- degree: Grado en Matemáticas
  college: Universidad de Alicante
  dates: 2018 - 2023
  specialization: "Análisis Numérico, Ecuaciones Diferenciales, Computación Científica"
  skills: "Linear Algebra | Numerical Analysis | Optimization | Statistics | Probability"
```

#### SICUE
```yaml
- degree: Estudiante SICUE
  college: Universidad de Salamanca
  dates: 2022 - 2023
  details: "Intercambio académico nacional"
```

---

### 4. 🛠️ SECCIÓN "SKILLS" - REORGANIZAR POR PRIORIDAD

**ACTUAL:** Probablemente desordenado

**PROPUESTO - Nueva Orden (prioridad para VRAIA + general):**

```yaml
skill:
  title: Skills
  panelId: skill-panel
  icon: fas fa-cogs
  list:
    # === COMPUTER VISION CORE (Highlight first) ===
    - skill: "PyTorch"
      url: "https://pytorch.org/"
    - skill: "TensorFlow"
      url: "https://www.tensorflow.org/"
    - skill: "Computer Vision"
      url: "https://en.wikipedia.org/wiki/Computer_vision"
    - skill: "OpenCV"
      url: "https://opencv.org/"
    - skill: "Deep Learning"
      url: "https://en.wikipedia.org/wiki/Deep_learning"
    
    # === NEURAL NETWORKS ===
    - skill: "Keras"
      url: "https://keras.io/"
    - skill: "Convolutional Neural Networks"
      url: "https://en.wikipedia.org/wiki/Convolutional_neural_network"
    - skill: "Pytorch Lightning"
      url: "https://pytorch-lightning.readthedocs.io/en/stable/"
    
    # === ML & DATA SCIENCE ===
    - skill: "Machine Learning"
      url: "https://en.wikipedia.org/wiki/Machine_learning"
    - skill: "scikit-learn"
      url: "https://scikit-learn.org/"
    - skill: "pandas"
      url: "https://pandas.pydata.org/"
    - skill: "NumPy"
      url: "https://numpy.org/"
    
    # === TOOLS & ENGINEERING ===
    - skill: "Python"
      url: "https://www.python.org/"
    - skill: "Docker"
      url: "https://www.docker.com/"
    - skill: "AWS"
      url: "https://aws.amazon.com/"
    - skill: "MLflow"
      url: "https://mlflow.org/"
    - skill: "Git"
      url: "https://git-scm.com/"
    - skill: "GitHub"
      url: "https://github.com/"
    
    # === VISUALIZATION & ANALYSIS ===
    - skill: "Matplotlib"
      url: "https://matplotlib.org/"
    - skill: "Tensorboard"
      url: "https://www.tensorflow.org/tensorboard"
    - skill: "SQL"
      url: "https://www.sql.org/"
    
    # === SCIENTIFIC & MATH ===
    - skill: "Transformers"
      url: "https://huggingface.co/docs/transformers/"
    - skill: "Torchmetrics"
      url: "https://torchmetrics.readthedocs.io/en/latest/"
    - skill: "LaTeX"
      url: "https://www.latex-project.org/"
    
    # === ADDITIONAL ===
    - skill: "R"
      url: "https://www.r-project.org/"
    - skill: "MATLAB"
      url: "https://www.mathworks.com/products/matlab.html"
    - skill: "HYSPLIT"
      url: "https://www.ready.noaa.gov/HYSPLIT.php"
    - skill: "HTML"
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML"
    - skill: "CSS"
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS"
    - skill: "JavaScript"
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
```

---

## ✅ RESUMEN DE CAMBIOS

| Sección | Cambio | Impacto |
|---------|--------|---------|
| **About Me** | Agregar "visión computacional" en primer párrafo | Visitor comprende especialización de inmediato |
| **Experience VRAIA** | Cambiar a "AI Developer - Computer Vision Specialist" | Destaca especialización |
| **Experience VRAIA** | Agregar skills al final | Keywords para búsqueda + claridad |
| **Education Física** | Agregar specialization + skills field | Muestra base teórica |
| **Education Matemáticas** | Agregar specialization + skills field | Refuerza credibilidad en ML/DL |
| **Skills** | Reorganizar: CV core primero | Mejor navegabilidad y SEO |

---

## 🎯 IMPACTO ESPERADO

**ANTES:**
- About Me: Parece enfocado en atmósfera/energías
- VRAIA: Solo "AI Developer"
- Skills: Desordenadas
- Education: Parece "irrelevante" para CV

**DESPUÉS:**
- About Me: Claro que especialista en CV + Deep Learning
- VRAIA: "AI Developer - Computer Vision Specialist" con skills específicas
- Skills: Prioridad CV/DL → visibilidad + SEO
- Education: Muestra base sólida (Física + Matemáticas)

---

## 📝 NOTA IMPORTANTE

Estos cambios en tu web complementan los cambios en LinkedIn, pero van en la misma dirección:
- **LinkedIn:** Optimizado para reclutadores
- **Tu Web:** Optimizada para visitantes interesados + SEO + Google

Ambos deben contar la misma historia: "Especialista en Computer Vision, con base sólida en Física y Matemáticas"

