---
title: "¿Qué ve realmente una red neuronal? De los filtros de Sobel a los mapas de atención"
date: 2026-06-11
draft: false
description: "Un recorrido por la interpretabilidad en visión por computador: filtros clásicos, mapas de características, Grad-CAM y atención. Y por qué visualizar lo que ve tu modelo no es opcional en producción"
tags: ["computer vision", "interpretabilidad", "Grad-CAM", "deep learning", "OpenCV", "PyTorch"]
icon: "fa-eye"
cardGradient: "blog-gradient-cyan"
---

> "El modelo acierta" y "el modelo entiende" no son la misma frase. La diferencia se descubre visualizando.

---

Cuando un modelo de visión clasifica una imagen, ¿en qué se está fijando? La pregunta parece filosófica pero es brutalmente práctica: he visto modelos con métricas excelentes en validación que en realidad habían aprendido a mirar *otra cosa* —un reflejo, una marca de la cámara, la esquina de la imagen donde casualmente aparecían los defectos del dataset—. Este post es un recorrido por las herramientas que uso para responder esa pregunta, de las más clásicas a las más actuales.

*(Por cierto: esta web tiene un easter egg relacionado. Escribe `yolo` en cualquier página y verás al "detector" en acción sobre la propia web.)*

## Antes del deep learning: los filtros lo eran todo

La visión por computador clásica no tenía nada que ocultar: los filtros se diseñaban a mano y sabías exactamente qué hacía cada uno. El operador de Sobel, por ejemplo, aproxima el gradiente de intensidad de la imagen:

```python
import cv2

img = cv2.imread("pieza.png", cv2.IMREAD_GRAYSCALE)
gx = cv2.Sobel(img, cv2.CV_64F, 1, 0, ksize=3)  # gradiente horizontal
gy = cv2.Sobel(img, cv2.CV_64F, 0, 1, ksize=3)  # gradiente vertical
edges = cv2.magnitude(gx, gy)
```

Detrás hay una convolución con un kernel de 3×3 que cualquiera puede leer:

```
Gx =  [-1  0  +1]
      [-2  0  +2]
      [-1  0  +1]
```

Un borde vertical produce respuesta alta; una zona plana, cero. Interpretabilidad total. El precio: alguien tenía que diseñar a mano el filtro adecuado para cada problema, y hay patrones (texturas complejas, formas deformables) para los que nadie sabe escribir el kernel.

## Lo que aprende una CNN: Sobel, pero descubierto solo

Lo fascinante de las redes convolucionales es que, al entrenarlas, **la primera capa aprende sola filtros casi idénticos a los clásicos**: detectores de bordes orientados, blobs, transiciones de color. Es uno de los resultados más reproducibles del deep learning: la red redescubre Gabor y Sobel porque son, de hecho, la base óptima para empezar a describir imágenes naturales.

A partir de ahí, cada capa compone lo anterior: bordes → esquinas y texturas → partes → objetos. Puedes asomarte a esa jerarquía visualizando los *feature maps* intermedios:

```python
import torch

activations = {}
def hook(name):
    def fn(module, inp, out):
        activations[name] = out.detach()
    return fn

model.layer1.register_forward_hook(hook("layer1"))
model.layer4.register_forward_hook(hook("layer4"))
_ = model(img_tensor)

# layer1: bordes y texturas. layer4: conceptos abstractos en baja resolución.
```

Los mapas de las primeras capas se parecen a la salida de un Sobel. Los de las últimas son manchas borrosas de "aquí hay algo semánticamente relevante". La red es un procesador de señal cuyas primeras etapas entendemos bien y cuyas últimas etapas son estadística de alto nivel.

## Grad-CAM: ¿dónde miró el modelo para decidir?

Los feature maps te dicen qué *hay* en cada capa, pero no qué usó el modelo para *esta* predicción concreta. Para eso, la herramienta que más uso es **Grad-CAM**: pondera los mapas de la última capa convolucional por el gradiente de la clase predicha, y produce un mapa de calor sobre la imagen original.

```python
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

cam = GradCAM(model=model, target_layers=[model.layer4[-1]])
heatmap = cam(input_tensor=img_tensor,
              targets=[ClassifierOutputTarget(defect_class)])
```

La intuición matemática es limpia: si subir la activación de un canal en cierta zona sube la puntuación de la clase "grieta", esa zona está sosteniendo la decisión. El resultado es un mapa de calor que se superpone a la imagen y responde a la pregunta del millón: *¿está mirando la grieta o está mirando otra cosa?*

Casos reales en los que esta visualización destapa problemas:

- El mapa de calor se concentra en una **esquina fija** de la imagen → el modelo aprendió un artefacto de la cámara o del proceso de captura, no el defecto.
- El modelo acierta la clase pero el calor está **fuera del defecto** → correlación espuria en el dataset (por ejemplo, los defectos de ese tipo se fotografiaron casi siempre con cierta iluminación).
- El calor cubre el defecto **y** su contexto → suele ser buena señal: muchos defectos solo lo son en relación a su entorno.

## Transformers: la atención como mapa (con un asterisco)

En un Vision Transformer la tentación es obvia: la atención ya *es* una matriz de "quién mira a quién", así que basta con pintarla. Funciona razonablemente —los mapas de atención del token de clase suelen señalar el objeto, y en modelos autosupervisados tipo DINO emergen segmentaciones sorprendentemente limpias— pero conviene el asterisco: la atención de una capa no es una explicación completa de la predicción. Hay docenas de capas y cabezas mezclándose, y "dónde atiende" no implica "qué causó la salida". Para auditar decisiones, sigo prefiriendo métodos basados en gradiente (Grad-CAM funciona también en ViTs, aplicado sobre los tokens reorganizados como mapa espacial).

## Por qué esto no es opcional en producción

En un entorno industrial, un falso negativo puede significar que un producto defectuoso llega al cliente. Cuando el modelo se equivoca, "ha fallado la red" no es un diagnóstico aceptable; necesitas saber *por qué*. La visualización convierte la conversación de "el modelo da 0.93" a "el modelo está decidiendo por la zona equivocada", que es algo sobre lo que se puede actuar: recoger más datos de cierto tipo, cambiar el recorte, revisar etiquetas.

Mi checklist mínimo antes de dar un modelo por bueno:

1. **Grad-CAM sobre una muestra de aciertos** — ¿mira donde debe?
2. **Grad-CAM sobre todos los fallos relevantes** — ¿hay un patrón en lo que mira mal?
3. **Feature maps de la primera capa** — ¿ha aprendido filtros razonables o ruido?
4. **Predicciones sobre imágenes "trampa"** (sin defecto pero con el artefacto sospechoso) — ¿cae?

La interpretabilidad en visión no es un lujo académico: es la diferencia entre tener un modelo que acierta en tu dataset y tener un sistema en el que puedes confiar cuando los datos cambien. Y los datos siempre cambian.

---

*Relacionado: en [CNNs vs Vision Transformers](../cnn-vs-vision-transformers-inspeccion-industrial) cuento cómo elijo arquitectura para inspección industrial.*
