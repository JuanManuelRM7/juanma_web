---
title: "CNNs vs Vision Transformers: lecciones desde la inspección industrial"
date: 2026-05-28
draft: false
description: "Qué he aprendido entrenando ambas familias de arquitecturas para detección de defectos en producción real: sesgos inductivos, datos desbalanceados, latencia y cuándo elegir cada una"
tags: ["computer vision", "deep learning", "vision transformers", "CNN", "inspección industrial", "PyTorch"]
---

> En el paper todo funciona. En la fábrica, el modelo se encuentra con polvo, reflejos, vibraciones y un defecto que aparece una vez cada 50.000 imágenes.

---

Llevo tiempo entrenando modelos de detección de defectos para inspección industrial, y una de las preguntas que más me hacen es: *¿CNN o Vision Transformer?* La respuesta corta es "depende". La respuesta larga es este post: qué dice la teoría, qué he visto en la práctica y qué criterios uso para decidir.

## El sesgo inductivo: por qué las CNNs parten con ventaja

Una red convolucional incorpora de serie dos supuestos sobre las imágenes que resultan ser casi siempre ciertos:

- **Localidad**: los píxeles cercanos están correlacionados. Un borde, una textura o una grieta son fenómenos locales.
- **Equivariancia a traslación**: un defecto es el mismo defecto esté donde esté en la imagen. El kernel que lo detecta en una esquina lo detecta en el centro.

Estos *sesgos inductivos* son conocimiento gratis: la red no tiene que aprenderlos de los datos. Por eso una CNN puede funcionar razonablemente bien con pocos miles de imágenes.

Un Vision Transformer (ViT), en cambio, trocea la imagen en parches, los proyecta a un espacio de embeddings y deja que la atención decida qué se relaciona con qué:

```python
# La esencia de un ViT en pocas líneas
patches = rearrange(img, 'b c (h p1) (w p2) -> b (h w) (p1 p2 c)',
                    p1=16, p2=16)          # imagen -> secuencia de parches
tokens = linear_proj(patches) + pos_embed   # embeddings + posición
out = transformer_encoder(tokens)           # atención global entre parches
```

La atención es global desde la primera capa: cualquier parche puede "mirar" a cualquier otro. Eso es potentísimo, pero significa que el modelo tiene que **aprender desde cero** que la localidad importa. Y aprender eso cuesta datos. Muchos datos.

## Lo que dice la teoría vs lo que pasa en la fábrica

La literatura es bastante consistente: con datasets pequeños o medianos, las CNNs ganan; con datasets enormes (o con buen pre-entrenamiento autosupervisado tipo DINO/MAE), los ViTs alcanzan y superan. En inspección industrial hay tres factores adicionales que mueven la balanza:

### 1. El desbalanceo extremo de clases

En una línea de producción, la inmensa mayoría de las imágenes son *OK*. Los defectos graves pueden ser literalmente uno entre decenas de miles. Esto castiga más a los ViTs, porque su hambre de datos se concentra justo en las clases de las que menos ejemplos hay. Las mitigaciones clásicas aplican a ambas familias:

```python
# Sobremuestreo de clases minoritarias + focal loss
sampler = WeightedRandomSampler(weights, num_samples=len(dataset))
criterion = FocalLoss(alpha=class_weights, gamma=2.0)
```

pero en mi experiencia el margen de mejora del *data-centric work* (revisar etiquetas, redefinir clases ambiguas, augmentations específicas del dominio) es mayor que el de cambiar de arquitectura. Primero arregla los datos, luego discute la arquitectura.

### 2. La naturaleza del defecto

Aquí está el criterio más útil que he encontrado:

- **Defectos locales y de textura** (poros, grietas finas, rayas): las CNNs los capturan de maravilla. Son exactamente el tipo de patrón para el que su sesgo inductivo está diseñado.
- **Defectos que dependen del contexto global** (deformaciones geométricas, patrones repetitivos rotos, inconsistencias entre zonas alejadas de la pieza): aquí la atención global del ViT brilla. Una CNN necesita apilar muchas capas para que su campo receptivo conecte dos puntas de la imagen; un transformer lo hace en la capa uno.

### 3. Latencia y despliegue

Un modelo que no entra en el presupuesto de latencia de la línea no existe. Si tienes que procesar miles de imágenes de alta resolución por hora, importan cosas mundanas: cómo cuantiza el modelo, qué tal lo soporta TensorRT, cuánta memoria pide a resolución alta. La atención escala cuadráticamente con el número de parches, así que subir resolución duele mucho más en un ViT que en una CNN (las variantes jerárquicas tipo Swin lo alivian con atención por ventanas).

## Mi receta práctica

Si tuviera que condensarlo en un árbol de decisión honesto:

1. **Empieza con una CNN moderna** (ConvNeXt, EfficientNet, o un YOLO si necesitas localizar) pre-entrenada. Es la línea base barata, rápida y difícil de batir.
2. **Invierte en datos antes que en arquitectura**: auditoría de etiquetas, análisis del desbalanceo, augmentations que simulen la variabilidad real de la línea (iluminación, posición, suciedad).
3. **Prueba un ViT/Swin cuando**: tengas cientos de miles de imágenes (o un buen checkpoint autosupervisado de tu dominio), los defectos tengan estructura global, y tu presupuesto de inferencia lo permita.
4. **Mide lo que le importa al negocio**: a mí me han salvado más de una vez las métricas por clase. Un accuracy global del 95% es irrelevante si la clase crítica (el defecto que no puede pasar) tiene un recall del 60%. Precision, recall y F1 *por clase*, y curvas que muestren el trade-off según el umbral.

## La conclusión incómoda

La pregunta "¿CNN o ViT?" es la que más se hace y probablemente la menos importante. Las dos familias, bien entrenadas y con buenos datos, acaban sorprendentemente cerca en la mayoría de problemas industriales. Las diferencias que de verdad mueven los resultados en producción están en el pipeline: calidad del etiquetado, gestión del desbalanceo, augmentations realistas, validación con datos de días/lotes distintos a los de entrenamiento, y monitorización del *drift* cuando la línea cambia.

La arquitectura es la parte divertida. Los datos son la parte que funciona.

---

*Si te interesa la otra cara de mi trabajo —la física del caos y la predicción atmosférica—, échale un ojo a [Caos](../caos) y [Predicciones por conjuntos](../predicciones-por-conjuntos).*
