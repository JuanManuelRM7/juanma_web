---
title: "Misinformation detection in fiction works with LLM-generated ontologies"
description: "An LLM + RAG architecture, published at DCAI'25, that builds a verified ontology incrementally and uses it to flag false claims in films, podcasts and texts."
date: 2025-06-15
role: "Co-author · research and development (RAG pipelines and semantic retrieval)"
period: "2024 – 2025"
org: "BISITE Research Group, University of Salamanca · AIR Institute"
stack: [Python, LLMs, RAG, Sentence-BERT, GPT-4o, Whisper, InstructBLIP, PySceneDetect]
links:
  paper: "/DCAI.pdf"
  post: "/blog/desinformacion-en-la-ficcion-ontologias-llm/"
metrics:
  - value: "0.98"
    label: "precision: only 2 false positives out of 320 sentences"
  - value: "0.86"
    label: "F1 (recall 0.76, accuracy 0.88)"
  - value: "246"
    label: "classes in the ontology generated from ~7,300 words"
  - value: "DCAI'25"
    label: "published with the BISITE group at the University of Salamanca"
tags: ["LLMs", "RAG", "NLP", "ontologies", "misinformation"]
---

> Most anti-misinformation tools target fake news. Films, series and podcasts blend facts with creative license, and the brain does not always tell them apart: people are 40% more likely to believe a false claim when it arrives visually, and once absorbed it keeps influencing them about half of the time even after a correction.

## Context

Work carried out at the **BISITE** research group (University of Salamanca) within the **TRUESTORIES** project (CPP2021-008358), funded by MICIU/AEI and the European Union (NextGenerationEU/PRTR), and published at **DCAI 2025**, the International Conference on Distributed Computing and Artificial Intelligence: [*AI-Powered Ontology-Based Architecture for Misinformation Detection in Fiction Works*](/DCAI.pdf).

Authors: Marcos Arias-González, **Juan Manuel Ruiz Muñoz**, Pablo Armenteros Cosme, Lucía Isabel Rodríguez González and Javier Curto Hernández.

## The problem

Detecting false information in fiction has two difficulties that news does not. The first is format: a film is video, a podcast is audio, a book is text, and the system has to handle all of them. The second is the knowledge base: you need a verified, structured, queryable source to check every claim against, and building and maintaining it by hand does not scale. That is precisely the contribution: an ontology that **builds and updates itself** with language models, and a RAG module that uses it to verify new works.

## A three-stage architecture

<figure class="my-6">
<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pipeline: information fusion, ontology creation and RAG verification" style="width:100%;height:auto;font-family:var(--font-sans);font-size:13px;">
  <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="10" y="30" width="200" height="90" rx="10"/>
    <rect x="280" y="30" width="200" height="90" rx="10"/>
    <rect x="550" y="30" width="200" height="90" rx="10"/>
    <line x1="210" y1="75" x2="278" y2="75" marker-end="url(#arr)"/>
    <line x1="480" y1="75" x2="548" y2="75" marker-end="url(#arr)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="110" y="56" font-weight="700">1 · Information fusion</text>
    <text x="110" y="78">Whisper · InstructBLIP</text>
    <text x="110" y="98">PySceneDetect → text</text>
    <text x="380" y="56" font-weight="700">2 · Ontology creation</text>
    <text x="380" y="78">SBERT + 0.75 threshold</text>
    <text x="380" y="98">GPT-4o → incremental JSON</text>
    <text x="650" y="56" font-weight="700">3 · RAG verification</text>
    <text x="650" y="78">all-MiniLM-L6-v2</text>
    <text x="650" y="98">GPT-4o-mini (T = 0) → report</text>
  </g>
</svg>
<figcaption class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">The three stages: every format ends up as text, verified text feeds the ontology, and the ontology verifies new works.</figcaption>
</figure>

### 1. Information fusion

Every work is converted to a common format: text. **Whisper** (base) transcribes audio, **InstructBLIP** (`Salesforce/instructblip-vicuna-7b`) describes images, and **PySceneDetect** splits video into scenes to be processed by the previous two. With everything as text, the rest of the system can rely on pre-trained language models.

### 2. Ontology creation

The ontology is a JSON where each node is a class with three sections: *Properties*, *Superclasses* and *Subclasses*. The verified text is processed **sentence by sentence**:

- Each sentence becomes an embedding with `paraphrase-MiniLM-L6-v2` (Sentence-BERT). The ontology keeps embeddings at two levels, per class and per property, stored in a vector database and queried by cosine similarity.
- If the similarity with any node exceeds **0.75**, a **GPT-4o**-based agent (temperature 0.5, top-p 0.9) receives the closest fragment, the new sentence and its context paragraph, and returns the updated fragment while preserving the hierarchy.
- Otherwise the agent creates a new node from the list of existing node names. If the name matches an existing one, a fusion mechanism merges the information and removes redundancies.
- Cleaning and validation functions fix JSON generation errors and keep superclass/subclass relationships consistent.

The process is fully incremental: each new fragment generates its embeddings, which serve as references for the following entries, with near-constant update times regardless of the knowledge base size.

### 3. Verifying new works

The work goes through the fusion module and its text is checked against the ontology with RAG. Query embeddings use `all-MiniLM-L6-v2`, about five times faster than larger models with comparable quality; similar fragments are retrieved at the property level, enriched with their classes, and a **GPT-4o-mini agent at temperature 0** decides deterministically whether there is concordance. When it detects a discrepancy, it generates a report that distinguishes *missing information* in the knowledge base from *misinformation* in the work.

## Results

The Wikipedia article on the Solar System (about 7,300 words) served as the case study. The creator module generated an ontology of **246 classes**, averaging 18.66 words per class (standard deviation 31.4).

To evaluate verification, the same text was split into 80 paragraphs, and from each one two correct and two altered sentences (changing a concept or a numeric value) were extracted: **320 evaluation sentences**.

| | Predicted: no match | Predicted: match |
|---|---|---|
| **Actual: no match** | 158 | 2 |
| **Actual: match** | 38 | 122 |

| Precision | Recall | F1 | Accuracy |
|---|---|---|---|
| **0.98** | 0.76 | 0.86 | 0.88 |

The reading is clear: the system is **very conservative when accepting information**. Only two false positives out of 320 sentences means it almost never lets a false claim through. The cost is recall: 38 false negatives, correct sentences it did not recognize, mostly due to concepts missing from the ontology and subtle differences between the new sentence and the existing content.

## My role

Co-author of the work during my time as a Data Scientist and researcher at AIR Institute and BISITE. Research and development of the architecture, focused on the **RAG pipelines and semantic retrieval with vector databases** and on orchestrating the LLM-based agents, with the goal of reducing cost and latency.

## Limitations and future work

- **Recall.** Two strategies to improve it: enriching the ontology with external verified sources, and feedback cycles that reintegrate false negatives into the knowledge base.
- **Detail omission by the LLM.** The agent tends to omit information despite explicit prompt instructions; the correction mechanisms can discard new classes and make the loss worse.
- **Real multimodality.** Evaluation was done on text; the next step is evaluating with real video and audio, aligning Whisper and PySceneDetect to correlate visual and sound information.
- **Irony, ambiguity and metaphor.** The system detects factual discrepancies; interpreting figurative content will require deeper contextual modeling and possibly figurative-language analysis and emotion recognition.

The [full paper](/DCAI.pdf) describes the architecture in detail. [This post](/blog/desinformacion-en-la-ficcion-ontologias-llm/) (in Spanish) tells the longer story of what worked and what did not.
