---
title: "Detectar desinformación en la ficción: una ontología que se construye sola"
date: 2026-06-20
draft: false
description: "Cómo construimos, en un trabajo publicado en DCAI'25, un sistema que genera automáticamente una base de conocimiento (ontología) con LLMs y RAG, y la usa para detectar información falsa en películas, podcasts y otros formatos de ficción."
tags: ["LLMs", "NLP", "RAG", "ontologías", "desinformación", "deep learning"]
icon: "fa-clapperboard"
cardGradient: "blog-gradient-indigo"
math: true
---

> Una serie puede colarte un dato falso sin que pestañees. El problema no es solo la mentira: es que la recuerdas como si fuera verdad.

---

La mayoría de las herramientas contra la desinformación apuntan a las *fake news*: tuits, titulares, artículos. Pero hay un flanco mucho más silencioso: la **ficción**. Películas, documentales, podcasts y series mezclan hechos y licencias creativas, y nuestro cerebro no siempre separa unos de otras. Los datos asustan un poco: la gente es un **40% más propensa a creer** información falsa cuando se presenta de forma visual, y la desinformación, una vez asimilada, sigue influyéndonos en torno a un **50%** de las veces *incluso después* de corregirla.

En el grupo **BISITE** (Universidad de Salamanca) abordamos justamente ese hueco, y el resultado es un trabajo que firmamos y presentamos en **DCAI'25**: [*AI-Powered Ontology-Based Architecture for Misinformation Detection in Fiction Works*](/DCAI.pdf). Este post es el recorrido en cristiano por lo que construimos, qué funcionó y, sobre todo, qué *no* funcionó del todo.

## La idea: una base de conocimiento que se construye sola

El planteamiento tiene dos mitades:

1. **Construir un conocimiento verificado.** A partir de fuentes fiables, generamos automáticamente una **ontología**: una estructura de conocimiento donde cada concepto es una *clase* con sus propiedades y sus relaciones jerárquicas (superclases y subclases). La clave: no la escribe nadie a mano, la **construye el propio sistema** de forma incremental.
2. **Contrastar la ficción contra ese conocimiento.** Cuando llega una obra nueva, la convertimos a texto y, mediante **RAG** (*Retrieval-Augmented Generation*), comparamos lo que dice con la ontología. Si hay discrepancia, el sistema decide si se trata de **falta de información** o de **desinformación**.

La ontología es la pieza central, y lo interesante es que es *viva*: crece y se reorganiza sola a medida que entra texto nuevo.

## Cómo funciona, por dentro

El sistema tiene tres etapas.

### 1. Fusión de información: todo a texto

La ficción viene en muchos formatos, así que lo primero es normalizarlo todo a texto plano:

- **Audio → texto** con Whisper (de OpenAI).
- **Imágenes → descripción** con un modelo multimodal (InstructBLIP / Vicuna-7B), que convierte cada fotograma en una descripción textual.
- **Vídeo** se trocea en escenas con SceneDetect y cada escena se descompone en audio + imágenes, que pasan por los dos modelos anteriores.

El resultado es un único fichero de texto (`kernel.txt`) que el resto del sistema puede digerir.

### 2. Creación de la ontología: embeddings + un agente LLM

Aquí está el corazón del trabajo. El sistema procesa el texto **frase a frase**, y para cada frase nueva calcula su *embedding* (una representación vectorial de su significado) con un modelo tipo SBERT (`paraphrase-MiniLM-L6-v2`). La ontología, a su vez, guarda embeddings a dos niveles: de **clase** (global) y de **propiedad**. Todo vive en una base de datos vectorial y se consulta por **similitud del coseno**:

$$\cos(\theta) = \frac{\mathbf{a}\cdot\mathbf{b}}{\lVert\mathbf{a}\rVert\,\lVert\mathbf{b}\rVert}$$

Con eso, una regla sencilla de umbral ($0.75$) decide qué hacer con cada frase:

- **Si se parece mucho a algo que ya existe** (similitud > 0,75): un agente LLM (GPT-4o) toma el fragmento de ontología más parecido, la frase nueva y su contexto, y **actualiza** ese fragmento en JSON, respetando la jerarquía.
- **Si no se parece a nada** (similitud < 0,75): se **crea un nodo nuevo**. Al agente se le pasa la lista de nombres de clases existentes para que decida si encaja en una o hay que inventar una clase nueva.
- **Si crea un nodo con un nombre que ya existe**: se dispara un mecanismo de **fusión** que une la información duplicada y elimina redundancias.

Cada nodo acaba con esta forma:

```json
{
  "SolarSystem": {
    "Properties": {
      "Description": "The gravitationally bound system of the Sun and the objects that orbit it."
    },
    "Superclasses": ["MilkyWay"],
    "Subclasses": ["Planets"]
  }
}
```

Todo el proceso es incremental, con funciones de limpieza y validación que corrigen errores del JSON, eliminan duplicados y mantienen la coherencia entre superclases y subclases. Es, en esencia, mucha **ingeniería alrededor del modelo** para que el LLM no se descontrole.

### 3. Verificación: ¿falta un dato o es directamente falso?

Para comprobar una obra nueva, la pasamos también a texto y calculamos embeddings con un modelo más rápido (`all-MiniLM-L6-v2`, entrenado con más de mil millones de pares de frases). Recuperamos de la base vectorial los fragmentos más relevantes de la ontología y se los damos a un agente LLM (GPT-4o Mini) con **temperatura 0**.

Ese detalle no es cosmético: temperatura 0 hace el modelo **determinista**, de modo que la misma entrada produce siempre la misma salida. Sin eso, las métricas bailarían entre ejecuciones y no serían comparables. Si detecta una discrepancia, el modelo genera un informe distinguiendo si la causa es **falta de información** en la ontología o **desinformación** en la obra.

## Los resultados (y la parte honesta)

Como prueba de concepto usamos la entrada de Wikipedia sobre el **Sistema Solar** (~7.300 palabras). El sistema generó una ontología de **246 clases**. Para evaluar la verificación, dividimos el texto en 80 párrafos y de cada uno sacamos 2 frases correctas y 2 frases alteradas (cambiando un concepto o un número): **320 frases** de test en total.

| Métrica | Valor |
|---|---|
| Precisión | **0,98** |
| Recall | 0,76 |
| F1 | 0,86 |
| Accuracy | 0,88 |

La lectura es clara y tiene dos caras. La **precisión de 0,98** es excelente: de todo lo que el sistema marca como verdadero, casi nunca se cuela una mentira (solo **2 falsos positivos** en toda la prueba). Para una herramienta anti-desinformación, esto es justo lo que quieres: que no dé por bueno un bulo.

Pero el **recall de 0,76** es la parte incómoda: el sistema se deja sin detectar parte de la información verdadera (**38 falsos negativos**). ¿Por qué? Porque si un concepto no llegó a entrar en la ontología, queda un hueco en la base de conocimiento, y el verificador tampoco afina cuando la diferencia es muy sutil. El propio LLM, además, tiende a **omitir detalles** pese a pedírselos explícitamente, y los filtros que limpian el JSON a veces descartan clases válidas. Es el clásico compromiso precisión–recall, y aquí pagamos recall a cambio de no equivocarnos al aceptar.

## Lo que me llevo

Si tuviera que quedarme con una idea, es la misma que repito siempre que trabajo con LLMs: **el modelo es solo una pieza; el sistema es lo que funciona**. Aquí el LLM genera y actualiza la ontología, sí, pero lo que hace el resultado utilizable es todo lo de alrededor: el umbral de similitud, la fusión de nodos, la limpieza del JSON, la temperatura 0 para tener métricas estables, la separación entre "falta info" y "es falso".

Es un primer paso —un único caso de estudio, todavía sobre texto— y el camino hacia delante está claro: enriquecer la ontología con fuentes externas para tapar huecos, reintroducir los falsos negativos como aprendizaje, y dar el salto a lo **multimodal** de verdad (audio y vídeo alineados) para captar matices como la ironía o el lenguaje figurado, donde una "mentira" no siempre es un dato mal puesto.

Puedes leer el trabajo completo en el [PDF del paper](/DCAI.pdf).

---

*Relacionado: sobre por qué la ingeniería alrededor del modelo importa más que el modelo, escribo en [OCR en condiciones extremas](/blog/ocr-industrial-glm-ocr/); y sobre cómo elijo arquitecturas de visión, en [CNNs vs Vision Transformers](/blog/cnn-vs-vision-transformers-inspeccion-industrial/).*
