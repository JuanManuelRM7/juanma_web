---
title: "vcalib: filtros de calibración diferenciables para RF-DETR bajo cambios de iluminación"
description: "Un filtro de ~2 KB, ajustado sin etiquetas en minutos sobre CPU, devuelve a un detector congelado las activaciones y el mAP que pierde cuando cambia la luz."
date: 2026-07-04
role: "Autor · investigación y desarrollo"
period: "Junio – julio 2026"
org: "Proyecto personal, open source"
stack: [PyTorch, RF-DETR, SAM3, LibreYOLO, uv, pytest]
links:
  repo: "https://github.com/juanmanuelruizm/vcalib"
metrics:
  - value: "35,9 %"
    label: "menos distancia de activaciones en 6 escenas reales held-out"
  - value: "20,4 %"
    label: "de recuperación de las salidas de detección, mejorando en todas las escenas"
  - value: "0,580"
    label: "AP@[.5:.95] con filtro, frente a 0,544 de referencia y 0,377 con el cambio de luz"
  - value: "~2 KB"
    label: "de filtro; ~3,5 min de ajuste en la CPU de un portátil"
tags: ["computer vision", "RF-DETR", "domain shift", "PyTorch"]
---

> Cuando cambia la luz, un detector entrenado en otras condiciones se degrada. La respuesta habitual es recoger datos, etiquetar, reentrenar y redesplegar. vcalib explora la respuesta barata: dejar el modelo congelado y ajustar, en minutos y sin etiquetas, un filtro diminuto que corrige la entrada.

## El problema

RF-DETR es un detector en tiempo real del estado del arte y, como casi cualquier modelo de visión, es sensible a la iluminación: amanecer frente a atardecer, interior frente a nublado, una cámara nueva, una planta nueva. Cuando la distribución de entrada se aleja de la de entrenamiento, la calidad de detección cae. Reentrenar o hacer fine-tuning es caro, necesita etiquetas y es poco práctico en dispositivos edge.

{{< img src="images/proyectos/vcalib/illumination_triplet.jpg" alt="La misma escena bajo tres condiciones reales de iluminación" caption="La misma escena capturada bajo tres condiciones reales de iluminación: exactamente el tipo de cambio que saca de distribución las features internas del modelo." >}}

## La idea

En lugar de adaptar los pesos del modelo, vcalib adapta su **entrada**. Un filtro diferenciable de entre 3 y 2.187 parámetros, según el tipo, transforma la imagen desplazada *antes* de que llegue al detector congelado. Es la misma lógica económica que hizo ganar a LoRA y a los adapters en NLP, aplicada a la entrada en lugar de a los pesos.

{{< img src="images/proyectos/vcalib/economics.png" alt="Coste de reentrenar frente a calibrar con vcalib" caption="Reentrenar frente a calibrar: sin etiquetas, minutos en CPU en lugar de horas de GPU, y un artefacto de ~2 KB en lugar de un checkpoint nuevo." >}}

En despliegue esto se convierte en **un modelo congelado más una biblioteca de filtros diminutos**, uno por condición. Cambiar de condición es cambiar un fichero de ~2 KB: sin reentrenar y sin redesplegar.

{{< img src="images/proyectos/vcalib/deployment_model.png" alt="Modelo de despliegue: un detector congelado y filtros intercambiables por condición" caption="Modelo de despliegue: un detector congelado y un filtro intercambiable por cada condición de iluminación." >}}

## Cómo funciona

{{< img src="images/proyectos/vcalib/pipeline_diagram.png" alt="Diagrama del pipeline de calibración" caption="El filtro se optimiza contra las activaciones intermedias del detector congelado; el modelo no cambia." >}}

1. Se capturan unos pocos pares de imágenes de la misma escena bajo la condición de referencia **A** y la desplazada **B**.
2. El filtro se aplica a B sobre el tensor RGB en [0, 1], antes de la normalización de ImageNet.
3. RF-DETR, congelado, procesa `filter(B)` y sus **activaciones intermedias** se comparan con las de A, precomputadas.
4. La pérdida es la distancia relativa media entre activaciones en un grupo de capas, más un término de regularización. Adam actualiza solo los parámetros del filtro; unos 100 pasos por par bastan.

Tres decisiones de diseño explican por qué esto no es un balance de blancos con otro nombre:

- **La señal son las activaciones, no los píxeles.** El objetivo es consciente de la tarea sin necesitar etiquetas: el filtro optimiza lo que el detector realmente usa, no el color que percibe un humano. Las transformaciones lineales clásicas (balance de blancos, afín) están en la biblioteca y quedan sistemáticamente por debajo.
- **El grupo de capas es un eje de búsqueda.** Se barre qué capas de RF-DETR alimentan la pérdida; el `projector` multiescala del backbone gana de forma consistente.
- **Validación held-out como guardarraíl.** Cada calibración se evalúa en pares no vistos, y una puerta de sobreajuste (val/train ≥ 0,5) rechaza las configuraciones degeneradas.

## Resultados en pares reales

El filtro ganador (`spatial_tone_curve`, P=16, K=5, sobre `projector`) se entrenó con 24 escenas reales capturadas y se evaluó en 6 escenas totalmente excluidas del entrenamiento.

| | Resultado |
|---|---|
| Reducción media de la distancia de activaciones (6 escenas held-out) | **35,9 %** |
| Rango por escena | 6,5 % – 52,6 % |
| Parámetros del filtro | 1.200 |
| Tiempo de ajuste | ~211 s en la CPU de un portátil (24 pares, 60 épocas) |
| Pesos del modelo modificados | **0** |

La mayor parte de la recuperación llega en las primeras 15 épocas.

{{< img src="images/proyectos/vcalib/money_shot_level2.jpg" alt="Antes y después de la calibración en escenas reales" caption="De izquierda a derecha: referencia A, la misma escena bajo iluminación desplazada B, la corrección filter(B) y dónde ayudó el filtro (verde = más cerca de A). Escenas reales que el filtro nunca vio en entrenamiento." >}}

## ¿Recupera la detección o solo las activaciones?

La distancia de activaciones es un proxy. Lo que importa en producción es si el modelo *detecta lo mismo* bajo el cambio de luz. Medido sin etiquetas, tomando como objetivo las propias detecciones del modelo bajo A, un filtro calibrado contra el objetivo de detección acerca las salidas (logits y cajas) un **20,4 %** a A, y mejora en las seis escenas.

Aquí aparece una lección limpia: **lo que optimizas es lo que recuperas.** El filtro entrenado sobre activaciones recupera muy bien las activaciones (35,9 %) pero solo modestamente las salidas de detección (9,5 %); calibrar contra la detección duplica esa cifra.

{{< img src="images/proyectos/vcalib/detection_recovery.png" alt="Recuperación de las salidas de detección por escena" caption="Recuperación de las salidas de detección en las 6 escenas held-out." >}}

Para convertirlo en un mAP real sin la circularidad de puntuar al modelo contra sí mismo, las escenas se etiquetan con **SAM3**, un modelo de segmentación independiente de RF-DETR, y esas cajas se usan como pseudo-ground-truth. AP COCO class-agnostic sobre las 6 escenas held-out (`level_1 → level_2`):

| Variante | AP@[.5:.95] | AP50 |
|---|---|---|
| A, referencia | 0,544 | 0,703 |
| B, desplazada | 0,377 | 0,497 |
| `filter(B)`, entrenado sobre activaciones | 0,379 | 0,551 |
| **`filter(B)`, entrenado sobre detección** | **0,580** | **0,841** |

El filtro calibrado contra la detección cierra **todo** el gap de AP entre A y B (121,5 %) y en este conjunto supera incluso a la referencia en AP, AP50 y AP75 (0,614 → 0,619). El entrenado sobre activaciones recupera apenas un 1 % del AP.

**Matices honestos.** (1) Es pseudo-ground-truth de SAM3, no anotación humana. (2) Son 6 escenas de test: unas pocas cajas mueven las cifras, así que superar a la referencia es real en este conjunto pero no una afirmación a gran escala. (3) La recuperación es más limpia en `level_2`; bajo el desplazamiento más fuerte de `level_3` el filtro recupera AP50 por encima de la referencia (0,756 frente a 0,569 desplazado y 0,703 de referencia) pero sacrifica precisión de caja a IoU alto, así que el AP estricto se queda plano o negativo.

## Barrido de 200 configuraciones

Antes de los pares reales, un barrido sintético de 200 configuraciones (filtro × grupo de capas × nivel de desplazamiento) fijó el diseño:

- **El grupo de capas importa más que el tipo de filtro.** El `projector` del backbone da la señal más fuerte para todos los filtros; el resultado empeora al ir de capas tardías a tempranas.
- **Los filtros no lineales superan a los lineales.** Curvas de tono espaciales y LUTs 3D capturan mejor el carácter no lineal y por canal de un cambio real de luz que las transformaciones afines.
- **La señal generaliza entre niveles de desplazamiento.** `level_1 → level_3` da cifras algo menores pero con el mismo ranking.

Mejor configuración del barrido: `spatial_tone_curve` (P=8, K=3) sobre `projector`, con un 30,7 % de reducción; `lut_3d` (N=9) queda en 29,6 %.

## Qué está demostrado y qué falta

**Demostrado.** Un filtro diminuto y sin etiquetas devuelve las representaciones internas de un detector congelado hacia la condición de referencia (35,9 % en pares reales held-out). El efecto llega a la cabeza de detección (20,4 %) y al mAP frente a pseudo-ground-truth independiente. Y es barato: miles de parámetros, minutos en CPU, cero reentrenamiento.

**Siguiente hito.** mAP frente a ground truth humano con un reentrenamiento completo como cota superior; confirmar que un filtro ajustado una vez por entorno aguanta un flujo entero de frames, no solo pares sueltos; y un CLI de despliegue edge que convierta «ajustar y cambiar un filtro» en un solo comando.

## Cómo está construido

- **Biblioteca de filtros:** 18 filtros paramétricos más uno neuronal, todos con la misma interfaz `Tensor[B,3,H,W] → Tensor[B,3,H,W]`, inicializados a la identidad y diferenciables de extremo a extremo. Desde `brightness_2param` (2 parámetros) hasta `lut_3d` (2.187) o `neural_pixel`, un MLP residual por píxel.
- **Experimentación reproducible:** configuraciones en YAML, `run_experiments.py` para barridos, resultados en CSV, tests con pytest y linting con ruff y mypy.
- **Stack:** Python 3.10+, PyTorch 2+, transformers, RF-DETR nano vía LibreYOLO como submódulo, y `uv` como gestor de paquetes.

El código, los datos de ejemplo y los resultados completos están en el [repositorio de vcalib](https://github.com/juanmanuelruizm/vcalib).
