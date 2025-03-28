---
title: "Bloqueos atmosféricos desde un punta de vista lagrangiano."
date: 2025-03-05
tags: ["Bloqueo atmosférico", "Método lagrangiano", "HYSPLIT", "Retro-trayectorias", "Cambio climático"]
categories: []
description: "Descripción"
draft: False
---
# Un método lagrangiano para identificar bloqueos atmosféricos (y por qué me parece emocionante)

Los bloqueos atmosféricos son de esos fenómenos que tienen nombre de novela de ciencia ficción, pero consecuencias muy reales: olas de calor, olas de frío, sequías, inundaciones… eventos extremos que trastocan el clima, la agricultura, el consumo energético, la salud pública y prácticamente todo lo que nos rodea.

En los últimos años, con el cambio climático acelerando la frecuencia e intensidad de estos eventos, entenderlos bien ha pasado de ser un tema de nicho a convertirse en una necesidad urgente. Y es ahí donde entra este trabajo: proponer un nuevo enfoque para identificar bloqueos atmosféricos, desde una perspectiva lagrangiana, que además de ser más explícita en la localización de estos fenómenos, es (en mi opinión) bastante más intuitiva.

## ¿Qué es un bloqueo atmosférico y por qué es tan importante?

Un bloqueo atmosférico es, esencialmente, una situación en la que una gran masa de aire —usualmente asociada a un sistema de alta presión— se queda encajada durante varios días (o semanas), impidiendo que las corrientes atmosféricas fluyan como deberían. Esto produce una especie de “tapón” en la circulación general de la atmósfera.

La consecuencia es que los sistemas meteorológicos quedan bloqueados, literalmente. Por ejemplo: una masa de aire cálido no puede disiparse, y eso genera olas de calor brutales como la de Europa en 2003. O se impide la llegada de aire húmedo, y tenemos sequías prolongadas. O se queda estancado aire frío, y se producen heladas intensas.

Estos eventos no son fáciles de predecir. Ni siquiera de definir con claridad. Por eso, tradicionalmente, su identificación se ha basado en criterios algo arbitrarios y en variables termodinámicas. Y ahí es donde vi una oportunidad.

## Mi propuesta: mirar el problema desde una perspectiva lagrangiana

El enfoque clásico en meteorología es euleriano: se fija un punto en el espacio y se observa cómo evolucionan las variables atmosféricas allí con el tiempo. En cambio, el enfoque lagrangiano sigue el movimiento de una partícula (o parcela de aire) a lo largo del tiempo. Y eso permite ver con más claridad cómo se deforma el flujo, cómo se encierra o se desvía… en definitiva, permite detectar bloqueos de una forma más natural.

Para aplicar esta idea, utilicé el software **HYSPLIT** (Hybrid Single-Particle Lagrangian Integrated Trajectory), una herramienta bastante potente que permite simular trayectorias de parcelas de aire. La clave está en calcular *retro-trayectorias* (es decir, mirar hacia atrás en el tiempo) para ver de dónde viene el aire que pasa por cierto punto y cómo se ha movido. Si la trayectoria es corta, tortuosa, o muestra una clara desviación del flujo zonal típico, puede ser señal de bloqueo.

## ¿Qué se mide exactamente?

![Trayectoria end-to-end](https://raw.githubusercontent.com/yourrepo/imagenes-blog/main/end-to-end-diagrama.png)


Me centré en estas cuatro métricas:

- **Longitud de la trayectoria**  
- **Distancia end-to-end**  
- **Proyección zonal**  
- **Proyección meridional**

Estas métricas, combinadas con un análisis masivo de trayectorias en toda una región (Europa Occidental, en mi caso), permiten construir un mapa detallado de dónde y cuándo se están dando estos fenómenos.

## ¿Y por qué a 500 hPa?

Porque es la altura mágica. A unos 5500 metros, este nivel de presión representa una capa media de la atmósfera donde se manifiestan muy claramente los patrones de circulación a gran escala. Además, es un estándar en meteorología, lo cual facilita la comparación con otros estudios.

## Casos de estudio: 2003 y 2019

### 🔥 Verano de 2003  
Una ola de calor histórica. Las trayectorias mostraron una alteración masiva del flujo.

### 🔥 Junio de 2019  
Una triple ola de calor, también muy bien captada por el modelo.

## ¿Y cómo se identifican automáticamente los bloqueos?

Se analizan todas las trayectorias, se aplican percentiles para detectar anomalías, y luego se agrupan las trayectorias sospechosas usando un algoritmo de clustering (DBSCAN).

El resultado: zonas bloqueadas claramente identificadas y caracterizadas.

## En resumen

- Detecta **explícitamente** zonas de bloqueo.  
- Es **más preciso y objetivo** que los métodos tradicionales.  
- Tiene potencial para predecir impactos climáticos.  

---

# El algoritmo para detectar bloqueos atmosféricos: cómo lo desarrollé y por qué funciona

Ya hemos hablado de qué son los bloqueos atmosféricos. Ahora te cuento cómo desarrollé un algoritmo para detectarlos de forma automática.

## ¿Cuál es el objetivo real?

Detectar en qué lugar y momento ocurre un bloqueo, y además caracterizarlo: duración, intensidad, extensión, tipo (Omega o Rex), etc.

## Paso 1: Simular las trayectorias

Con **HYSPLIT**, lanzo retro-trayectorias desde puntos de una malla geográfica (a 500 hPa). Para cada una obtengo una serie de coordenadas y variables asociadas.

## Paso 2: Calcular métricas clave

- **Longitud de la trayectoria**  
- **Distancia end-to-end**  
- **Proyección zonal**  
- **Proyección meridional**

Estas métricas son sensibles a situaciones de flujo deformado o bloqueado.

## Paso 3: Detectar trayectorias “sospechosas”

Uso **percentiles** (por ejemplo, el 10%) para detectar valores anómalos. Si una trayectoria está fuera de lo común en varias métricas a la vez, es candidata a estar bloqueada.

## Paso 4: Agrupar con DBSCAN

Este algoritmo agrupa puntos que están cerca unos de otros y descarta ruido. Así defino **zonas bloqueadas**, no solo trayectorias sueltas.

## Paso 5: Caracterizar el bloqueo

Para cada región detectada:

- Centro, duración, intensidad
- Si tiene forma Omega o Rex
- Cómo evoluciona en el tiempo

## ¿Funciona?

Sí. Lo probé con las olas de calor de 2003 y 2019, y el resultado fue muy bueno. Las trayectorias capturaron perfectamente el estancamiento del flujo.

## Lo mejor del método

- Explícito  
- Flexible  
- Objetivo  
- Integrable con otros sistemas  

---

# ¿Y ahora qué? Aplicaciones reales del método lagrangiano y hacia dónde podría evolucionar

Una vez construido el algoritmo y probado con éxito, toca mirar al futuro. ¿Qué se puede hacer con esto?

## 🔎 1. Vigilancia climática y detección en tiempo real

Montar un sistema automático que detecte bloqueos cada día. Útil para:

- Meteorología operativa  
- Gestión de emergencias  
- Energía y agricultura  

## 🌍 2. Aplicación global

El método puede aplicarse en cualquier región del planeta. Podríamos comparar zonas, estaciones, ver dónde hay más bloqueos, cómo evolucionan, etc.

## 📊 3. Estudios climáticos a largo plazo

Con datos de reanálisis (ERA5, por ejemplo) se pueden estudiar tendencias históricas de bloqueos, relacionarlos con olas de calor, sequías, etc.

## 🧠 4. Machine Learning

El siguiente paso podría ser usar IA para mejorar el sistema:

- Clasificación más robusta  
- Ajuste dinámico de umbrales  
- Modelos predictivos  

## 🧪 5. Otros fenómenos atmosféricos

El enfoque lagrangiano también sirve para estudiar:

- DANAs  
- Rupturas del chorro  
- Transporte de polvo o cenizas  

## 🛠 6. Integración con otros sistemas

Visualizar estos resultados junto con mapas meteorológicos clásicos, para una comprensión mucho más rica.

## En resumen

Este método no es el final, sino el principio. Permite ver el flujo atmosférico con una precisión y claridad que abre muchísimas posibilidades.

Si quieres colaborar, experimentar o simplemente charlar sobre todo esto, yo encantado 😉
  