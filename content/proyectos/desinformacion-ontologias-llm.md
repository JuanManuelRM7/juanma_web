---
title: "Detección de desinformación en obras de ficción con ontologías generadas por LLMs"
description: "Arquitectura LLM + RAG, publicada en DCAI'25, que construye una ontología verificada de forma incremental y la usa para detectar afirmaciones falsas en películas, podcasts y textos."
date: 2025-06-15
role: "Co-autor · investigación y desarrollo (pipelines RAG y recuperación semántica)"
period: "2024 – 2025"
org: "BISITE Research Group, Universidad de Salamanca · AIR Institute"
stack: [Python, LLMs, RAG, Sentence-BERT, GPT-4o, Whisper, InstructBLIP, PySceneDetect]
links:
  paper: "/DCAI.pdf"
  post: "/blog/desinformacion-en-la-ficcion-ontologias-llm/"
metrics:
  - value: "0,98"
    label: "precisión: solo 2 falsos positivos en 320 frases"
  - value: "0,86"
    label: "F1 (recall 0,76, accuracy 0,88)"
  - value: "246"
    label: "clases en la ontología generada a partir de ~7.300 palabras"
  - value: "DCAI'25"
    label: "publicado con el grupo BISITE de la Universidad de Salamanca"
tags: ["LLMs", "RAG", "NLP", "ontologías", "desinformación"]
---

> La mayoría de las herramientas contra la desinformación miran a las *fake news*. Las películas, series y podcasts mezclan hechos con licencias creativas, y el cerebro no siempre las separa: somos un 40 % más propensos a creer un dato falso cuando llega en formato visual, y una vez asimilado sigue influyendo en torno a la mitad de las veces incluso después de corregirlo.

## Contexto

Trabajo realizado en el grupo de investigación **BISITE** (Universidad de Salamanca) dentro del proyecto **TRUESTORIES** (CPP2021-008358), financiado por MICIU/AEI y por la Unión Europea (NextGenerationEU/PRTR), y publicado en **DCAI 2025**, la International Conference on Distributed Computing and Artificial Intelligence: [*AI-Powered Ontology-Based Architecture for Misinformation Detection in Fiction Works*](/DCAI.pdf).

Autores: Marcos Arias-González, **Juan Manuel Ruiz Muñoz**, Pablo Armenteros Cosme, Lucía Isabel Rodríguez González y Javier Curto Hernández.

## El problema

Detectar información falsa en ficción tiene dos dificultades que no tienen las noticias. La primera es el formato: una película es vídeo, un podcast es audio, un libro es texto, y el sistema tiene que tratarlos todos. La segunda es la base de conocimiento: hace falta una fuente verificada, estructurada y consultable con la que contrastar cada afirmación, y construirla y mantenerla a mano no escala. La aportación del trabajo es precisamente esa: una ontología que **se construye y se actualiza sola** con modelos de lenguaje, y un módulo RAG que la usa para verificar obras nuevas.

## Arquitectura en tres etapas

<figure class="my-6">
<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pipeline: fusión de información, creación de ontología y verificación RAG" style="width:100%;height:auto;font-family:var(--font-sans);font-size:13px;">
  <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="10" y="30" width="200" height="90" rx="10"/>
    <rect x="280" y="30" width="200" height="90" rx="10"/>
    <rect x="550" y="30" width="200" height="90" rx="10"/>
    <line x1="210" y1="75" x2="278" y2="75" marker-end="url(#arr)"/>
    <line x1="480" y1="75" x2="548" y2="75" marker-end="url(#arr)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="110" y="56" font-weight="700">1 · Fusión de información</text>
    <text x="110" y="78">Whisper · InstructBLIP</text>
    <text x="110" y="98">PySceneDetect → texto</text>
    <text x="380" y="56" font-weight="700">2 · Creación de ontología</text>
    <text x="380" y="78">SBERT + umbral 0,75</text>
    <text x="380" y="98">GPT-4o → JSON incremental</text>
    <text x="650" y="56" font-weight="700">3 · Verificación RAG</text>
    <text x="650" y="78">all-MiniLM-L6-v2</text>
    <text x="650" y="98">GPT-4o-mini (T = 0) → informe</text>
  </g>
</svg>
<figcaption class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">Las tres etapas del sistema: cualquier formato acaba en texto, el texto verificado alimenta la ontología y la ontología verifica las obras nuevas.</figcaption>
</figure>

### 1. Fusión de información

Cualquier obra se convierte a un formato común: texto. **Whisper** (base) transcribe el audio, **InstructBLIP** (`Salesforce/instructblip-vicuna-7b`) describe las imágenes, y **PySceneDetect** parte el vídeo en escenas para procesarlas con los dos anteriores. Con todo en texto, el resto del sistema puede apoyarse en modelos de lenguaje preentrenados.

### 2. Creación de la ontología

La ontología es un JSON en el que cada nodo es una clase con tres secciones: *Properties*, *Superclasses* y *Subclasses*. El texto verificado se procesa **frase a frase**:

- Cada frase se convierte en un embedding con `paraphrase-MiniLM-L6-v2` (Sentence-BERT). La ontología mantiene embeddings a dos niveles, por clase y por propiedad, almacenados en una base de datos vectorial y consultados por similitud coseno.
- Si la similitud con algún nodo supera **0,75**, un agente basado en **GPT-4o** (temperatura 0,5, top-p 0,9) recibe el fragmento más parecido, la frase nueva y su párrafo de contexto, y devuelve el fragmento actualizado respetando la jerarquía.
- Si no lo supera, el agente crea un nodo nuevo a partir de la lista de nombres existentes. Si el nombre coincide con uno anterior, un mecanismo de fusión une la información y elimina redundancias.
- Funciones de limpieza y validación corrigen errores de generación del JSON y mantienen la coherencia entre superclases y subclases.

El proceso es totalmente incremental: cada fragmento nuevo genera sus embeddings, que sirven de referencia para las entradas siguientes, con tiempos de actualización casi constantes independientemente del tamaño de la base de conocimiento.

### 3. Verificación de obras nuevas

La obra pasa por el módulo de fusión y su texto se contrasta con la ontología mediante RAG. Los embeddings de consulta usan `all-MiniLM-L6-v2`, unas cinco veces más rápido que modelos mayores con una calidad comparable; se recuperan los fragmentos similares a nivel de propiedad, enriquecidos con sus clases, y un agente **GPT-4o-mini a temperatura 0** decide de forma determinista si hay concordancia. Cuando detecta una discrepancia, genera un informe que distingue entre *falta de información* en la base de conocimiento y *desinformación* en la obra.

## Resultados

Como caso de estudio se usó el artículo de Wikipedia sobre el Sistema Solar (unas 7.300 palabras). El módulo creador generó una ontología de **246 clases**, con 18,66 palabras por clase de media (desviación típica 31,4).

Para evaluar la verificación, el mismo texto se dividió en 80 párrafos y de cada uno se extrajeron dos frases correctas y dos alteradas (cambiando un concepto o un valor numérico): **320 frases de evaluación**.

| | Predicho: no concuerda | Predicho: concuerda |
|---|---|---|
| **Real: no concuerda** | 158 | 2 |
| **Real: concuerda** | 38 | 122 |

| Precisión | Recall | F1 | Accuracy |
|---|---|---|---|
| **0,98** | 0,76 | 0,86 | 0,88 |

La lectura es clara: el sistema es **muy conservador aceptando información**. Solo dos falsos positivos en 320 frases significa que casi nunca da por buena una afirmación falsa. El coste está en el recall: 38 falsos negativos, frases correctas que no reconoció, sobre todo por conceptos que faltaban en la ontología y por diferencias sutiles entre la frase nueva y el contenido existente.

## Mi papel

Co-autor del trabajo durante mi etapa como Data Scientist e investigador en AIR Institute y BISITE. Investigación y desarrollo de la arquitectura, con foco en los **pipelines RAG y la recuperación semántica con bases de datos vectoriales** y en la orquestación de los agentes basados en LLMs, con el objetivo de reducir coste y latencia.

## Limitaciones y trabajo futuro

- **Recall.** Dos estrategias para mejorarlo: enriquecer la ontología con fuentes externas verificadas y ciclos de realimentación que reintegren los falsos negativos en la base de conocimiento.
- **Omisión de detalles por el LLM.** El agente tiende a omitir información pese a las instrucciones del prompt; los mecanismos de corrección pueden descartar clases nuevas y agravar la pérdida.
- **Multimodalidad real.** La evaluación se hizo sobre texto; el siguiente paso es evaluar con vídeo y audio reales, alineando Whisper y PySceneDetect para correlacionar información visual y sonora.
- **Ironía, ambigüedad y metáfora.** El sistema detecta discrepancias factuales; interpretar contenido figurado requerirá modelado contextual más profundo y, posiblemente, análisis de lenguaje figurado y reconocimiento de emociones.

El [paper completo](/DCAI.pdf) describe la arquitectura en detalle. En [este post](/blog/desinformacion-en-la-ficcion-ontologias-llm/) cuento la versión larga de qué funcionó y qué no.
