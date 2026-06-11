---
title: "OCR en condiciones extremas: leer texto donde no hay tinta"
date: 2026-06-11
draft: false
description: "Qué pasa cuando llevas el OCR a un entorno industrial real —texto en relieve negro sobre negro, polvo, brillos y cadencia de línea— y qué aprendí probando GLM-OCR, un modelo multimodal de 0.9B parámetros que corre en local"
tags: ["OCR", "computer vision", "inspección industrial", "GLM-OCR", "modelos locales", "deep learning"]
---

> El OCR lleva décadas declarándose resuelto. Luego te piden leer caracteres negros, en relieve, sobre caucho negro, en una superficie curva que se mueve, y descubres dónde estaban escondidos los problemas.

---

Trabajo en visión por computador para inspección industrial en la industria del neumático, y hace poco estuve experimentando por mi cuenta con **GLM-OCR**, un modelo multimodal de OCR pequeño y abierto. La combinación de ambas cosas —el benchmark mental de "qué exigiría mi entorno de trabajo" aplicado a un modelo que cabe en un portátil— me dejó varias reflexiones sobre el estado del OCR que creo que merecen un post. Sin datos ni detalles de proyectos concretos: lo que sigue es la naturaleza del problema, que es pública y fascinante, y lo que aprendí del modelo, que es abierto.

## El documento más hostil no es un documento

Los benchmarks de OCR viven de papers escaneados, tablas, fórmulas y facturas. El flanco verdaderamente débil del estado del arte está en otro sitio: el texto industrial. Piensa en el flanco de un neumático:

- **No hay tinta.** Los caracteres están **moldeados en relieve** sobre el propio caucho: es negro sobre negro. El "contraste" no existe como propiedad de la imagen; existe solo como sombra, y depende por completo de cómo ilumines.
- **La superficie es curva y deformable.** El texto sigue un arco, la goma cede, y dos unidades del mismo modelo nunca son exactamente iguales.
- **El entorno es sucio.** Polvo, restos de fabricación, brillos del propio material, vibración. La foto de estudio no existe; existe la imagen que la línea te da.
- **Hay cadencia.** La línea no espera: el presupuesto de latencia por pieza está fijado por la producción, no por tu modelo.
- **El error es caro y silencioso.** Esos códigos (lotes, fechas de fabricación, identificadores DOT) son **trazabilidad**: leer un carácter mal no produce un error visible, produce un dato falso en un sistema del que luego dependen decisiones reales.

Cualquier OCR genérico, incluido el mejor del mundo, fracasa aquí sin ayuda. Y la ayuda no viene de más parámetros.

## Lección 1: la iluminación es la mitad del modelo

Cuando el contraste no está en el objeto, lo tienes que fabricar tú. En texto en relieve, la diferencia entre ilegible y trivial es **luz rasante**: iluminar casi paralelo a la superficie para que cada carácter proyecte sombra. Técnicas como la triangulación láser o combinar capturas con iluminaciones distintas (la idea detrás del *photometric stereo*) convierten la geometría en contraste antes de que ningún modelo vea la imagen.

Esta es una lección que el deep learning no ha derogado: **el mejor preprocesado es capturar mejor el dato**. Una hora invertida en óptica e iluminación rinde más que un mes de fine-tuning sobre imágenes malas. En visión industrial, el pipeline empieza en el fotón, no en el tensor.

## Lección 2: los modelos pequeños especializados van en serio

Aquí entra GLM-OCR, el modelo con el que estuve trasteando en local: **0.9B parámetros** —un encoder visual pre-entrenado a gran escala, un conector con *downsampling* de tokens y un decoder de lenguaje de 0.5B— que en el momento de escribir esto es **nº1 en OmniDocBench V1.5**, por delante de sistemas mucho más grandes. Pesos abiertos, soporte en vLLM, SGLang y Ollama.

Para un contexto industrial, el tamaño no es una curiosidad: es la diferencia entre poder y no poder desplegarlo. En fábrica no hay cloud que valga: los datos de producción no salen de la planta (soberanía del dato), la latencia de red es inaceptable a cadencia de línea, y el hardware en el borde es limitado. Un modelo que corre en una GPU modesta —o en un portátil, como en mis pruebas— encaja donde un gigante generalista ni se plantea.

La tendencia que confirman estos modelos me parece la noticia importante: para tareas bien definidas, **un modelo pequeño entrenado con criterio compite con modelos órdenes de magnitud mayores**, y puedes ejecutarlo exactamente donde el dato nace.

## Lección 3: la salida generativa alucina, y en trazabilidad eso es lo peor

Los modelos OCR modernos como GLM-OCR no detectan caracteres: *leen* la imagen y *escriben* el resultado, como un LLM. Eso resuelve de golpe problemas históricos (orden de lectura, tablas, layouts), pero introduce un modo de fallo nuevo que en industria es venenoso: cuando un OCR clásico no puede leer algo, devuelve basura visible; cuando un modelo generativo no puede leer algo, puede devolver **algo plausible**. Un `8` donde había un `3` no parece un error — parece un dato.

En un código de trazabilidad, ese fallo silencioso es inaceptable. La defensa no está en el modelo sino en el sistema que lo rodea:

```python
import re

DOT_PATTERN = re.compile(r"^DOT [A-Z0-9]{2} [A-Z0-9]{2} [A-Z0-9]{3,4} \d{4}$")

def validar(lectura, confianza, umbral=0.90):
    if not DOT_PATTERN.match(lectura):
        return "revision_manual"   # el formato es conocido: lo que no encaja, no pasa
    if confianza < umbral:
        return "revision_manual"
    return "ok"
```

Los códigos industriales tienen una ventaja enorme sobre el texto libre: **su formato es conocido y a menudo se autoverifica** (patrones fijos, dígitos de control, rangos de lote válidos, la semana de fabricación tiene que existir en el calendario). Diseñar asumiendo que el modelo va a fallar —validación de formato, umbrales de confianza, cola de revisión humana— convierte un modelo bueno en un sistema fiable. Esa distinción, modelo vs sistema, es probablemente la idea más importante de todo el post.

## Lección 4: el benchmark no es tu fábrica

GLM-OCR puntúa altísimo en benchmarks de documentos. ¿Significa eso que lee texto en relieve sobre caucho? No necesariamente — y esa brecha es generalizable: **ningún número de benchmark sustituye a evaluar sobre tu distribución real**. La receta que me funciona, en cualquier proyecto de visión:

1. Monta un conjunto de evaluación pequeño pero *tuyo*, con los casos feos incluidos (los gastados, los sucios, los mal iluminados).
2. Mide el modo de fallo, no solo la tasa de acierto: no es lo mismo "no lo leo" que "lo leo mal con confianza alta".
3. Decide con esos datos si necesitas fine-tuning, mejor captura, o las dos cosas (casi siempre son las dos).

## Lo que me llevo

El OCR en contexto industrial extremo es un recordatorio de que los problemas "resueltos" solo lo están en su distribución de entrenamiento. Texto sin tinta, superficies que se deforman, suciedad y cadencia de línea empujan al estado del arte fuera de su zona de confort — y ahí es donde el oficio de la visión por computador clásica (óptica, iluminación, geometría) y la ingeniería alrededor del modelo (validación, trazabilidad del error, revisión humana) valen tanto como la red neuronal.

Y mientras tanto, abajo en el portátil, un modelo abierto de 0.9B parámetros lee documentos mejor que sistemas cien veces más grandes. Las dos fronteras —la del problema difícil y la del modelo eficiente— se están acercando. Mi apuesta es que se encuentran en el borde: modelos pequeños y especializados, corriendo junto a la línea, rodeados de mucha ingeniería humilde.

---

*Relacionado: en [CNNs vs Vision Transformers](../cnn-vs-vision-transformers-inspeccion-industrial) hablo de cómo elegir arquitectura para inspección industrial, y en [¿Qué ve realmente una red neuronal?](../que-ve-una-red-neuronal) de cómo auditar lo que el modelo mira — exactamente lo que querrías hacer cuando tu OCR lee un `8` donde había un `3`.*
