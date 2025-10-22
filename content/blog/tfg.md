---
title: "Bloqueos atmosféricos desde un punto de vista lagrangiano."
date: 2025-10-07
tags: ["bloqueo atmosférico", "bloqueo en Omega", "bloqueo en Rex", "método lagrangiano"]
categories: []
description: "Descripción"
draft: False
---

# Un método lagrangiano para la identificación de bloqueos atmosféricos

## Figura 28
![Figura 28](/images/Figura_28.gif)

Durante los últimos años, los fenómenos meteorológicos extremos —olas de calor, olas de frío, sequías o inundaciones— se han hecho cada vez más frecuentes e intensos. Detrás de muchos de ellos se encuentra un patrón atmosférico fascinante y complejo: el bloqueo atmosférico. Estos bloqueos son grandes estructuras de alta presión que interrumpen el flujo normal del aire, desviando las corrientes y haciendo que determinadas masas de aire queden estancadas sobre una región durante días o semanas. Su efecto puede ser devastador, ya que pueden generar olas de calor persistentes o impedir la llegada de frentes lluviosos durante largos periodos.

Como físico y apasionado de la meteorología, decidí centrar mi Trabajo Fin de Grado en estos bloqueos, pero desde una perspectiva diferente a la habitual. En la mayoría de los estudios, la atmósfera se analiza desde un punto fijo del espacio, utilizando lo que se conoce como un enfoque euleriano. Este tipo de análisis examina cómo cambian en el tiempo variables como la altura geopotencial a 500 hPa o la vorticidad potencial en un punto dado, lo que permite detectar zonas de alta o baja presión y patrones de circulación anómalos. Sin embargo, este enfoque observa la atmósfera “desde fuera”, sin seguir el movimiento real del aire.

Mi propuesta fue cambiar de punto de vista y mirar la atmósfera “desde dentro”, siguiendo las trayectorias de las masas de aire. Para ello adopté un enfoque lagrangiano, que consiste en estudiar el movimiento de las partículas a medida que se desplazan por la atmósfera. Este método permite observar directamente dónde el flujo se frena, se desvía o queda atrapado, sin necesidad de imponer a priori una definición geométrica o dinámica del bloqueo. En otras palabras, deja que sean las trayectorias las que hablen.

El desarrollo del método se basó en el uso del software **HYSPLIT** (*Hybrid Single-Particle Lagrangian Integrated Trajectory*), una herramienta de la NOAA diseñada para calcular trayectorias de partículas en la atmósfera. A partir de los datos del reanálisis **ERA5** del Centro Europeo de Predicción a Medio Plazo (ECMWF), generé miles de retrotrayectorias de partículas virtuales en la atmósfera media (**Figura 14**), alrededor de los 500 hPa (unos 5.500 metros de altitud). Con estas trayectorias obtuve tres variables principales: la **distancia end-to-end**, que mide cuánto se separa el punto final del inicial y sirve como indicador del grado de estancamiento del aire (**Figura 20**); la **longitud total de la trayectoria**, que representa la distancia total recorrida por la partícula (**Figura 21**); y las **proyecciones zonal y meridional**, que muestran cuánto se ha desplazado el aire en dirección este-oeste y norte-sur respectivamente. En condiciones de bloqueo, la proyección zonal tiende a reducirse mientras que la meridional aumenta, ya que el aire deja de avanzar hacia el este y se desvía hacia latitudes distintas.

A partir de estos parámetros elaboré mapas y series temporales (**Figura 25 y 26**) que reflejan la evolución de los flujos en la región de estudio. Para identificar espacialmente las áreas bloqueadas (**Figura 28**) utilicé el algoritmo de agrupamiento **DBSCAN**, que permite detectar grupos de puntos con características similares basándose en la densidad de los datos. De esta forma fue posible aislar las zonas donde el flujo atmosférico mostraba un claro estancamiento y representarlas directamente sobre mapas de altura geopotencial.

El método se puso a prueba con un caso emblemático: la ola de calor europea del verano de 2003, uno de los eventos meteorológicos más extremos registrados en las últimas décadas. Entre el 6 y el 12 de agosto de aquel año, se formó un intenso anticiclón sobre Europa occidental que impidió la entrada de aire fresco y favoreció temperaturas récord en buena parte del continente. El modelo lagrangiano detectó con precisión esa región bloqueada, coincidiendo con los patrones de alta presión observados en los mapas sinópticos tradicionales. También se aplicó de forma preliminar al episodio de junio de 2019, que presentó varias olas de calor consecutivas. Aunque el método aún necesita ajustes para generalizar y captar múltiples episodios seguidos, los resultados fueron coherentes y alentadores.

Lo interesante de este enfoque es que no depende de un índice o umbral fijo (aunque por el momento sí **:(**), como ocurre con métodos tradicionales —por ejemplo, el de Tibaldi y Molteni—, sino que se apoya directamente en el movimiento de las masas de aire. Esto permite observar el bloqueo como un fenómeno dinámico y tangible, una consecuencia natural del flujo atmosférico, y no solo como una anomalía numérica en un campo meteorológico. Además, al ser un método explícito y cuantificable, resulta fácilmente adaptable a procedimientos automáticos y a técnicas modernas de análisis como el **machine learning** o las **redes neuronales convolucionales (CNN)**.

Los resultados obtenidos (**Figura 28**) muestran que este tipo de análisis lagrangiano puede ofrecer una visión mucho más intuitiva de la dinámica atmosférica. Permite seguir cómo se forma, evoluciona y disuelve un bloqueo, observando el comportamiento real del aire en movimiento. Sin embargo, para consolidar el método es necesario aplicarlo a un número mayor de episodios y ampliar el periodo de análisis a varias décadas, lo que permitirá estudiar la frecuencia, duración e intensidad de los bloqueos en el contexto del cambio climático. También se abre la posibilidad de automatizar la detección de los patrones de bloqueo más comunes, como los de tipo Omega o Rex, a través de modelos de aprendizaje profundo.

En definitiva, este trabajo propone una manera distinta de estudiar los bloqueos atmosféricos: no observándolos desde fuera, sino viajando con el propio aire. La atmósfera es un sistema dinámico, complejo y no lineal, donde los bloqueos representan una de sus manifestaciones más influyentes. Comprenderlos en detalle es esencial para anticipar los impactos de los fenómenos extremos sobre la sociedad y el medio ambiente. Confío en que los métodos lagrangianos, como el que he desarrollado, se conviertan en una herramienta clave para mejorar nuestra capacidad de observación, análisis y predicción en un clima en constante cambio.

Si te interesa profundizar en lo que comento en esta entrada, puedes visitar mi página de GitHub, donde encontrarás el trabajo completo en formato PDF. Actualmente sigo desarrollando esta línea de investigación, con el objetivo de generalizar el método a cualquier episodio mediante técnicas de Deep Learning. Si tienes alguna duda, sugerencia o simplemente quieres comentar algún detalle, no dudes en escribirme a mi correo. Toda aportación o intercambio de ideas será muy bien recibido.

---
# A Lagrangian Method for the Identification of Atmospheric Blocking

## Figure 28
![Figura 28](/images/Figura_28.gif)

In recent years, extreme weather events—heat waves, cold spells, droughts, and floods—have become increasingly frequent and intense. Behind many of these phenomena lies a fascinating and complex atmospheric pattern: **atmospheric blocking**. These blocks are large high-pressure systems that interrupt the normal flow of air, deflecting currents and causing certain air masses to remain stationary over a region for days or even weeks. Their impact can be devastating, as they may trigger persistent heat waves or prevent rain-bearing fronts from arriving for long periods.

As a physicist and someone passionate about meteorology, I decided to focus my undergraduate thesis on these blocking events, but from a different perspective than usual. In most studies, the atmosphere is analyzed from fixed points in space using what is known as an **Eulerian approach**. This type of analysis examines how variables such as the **geopotential height at 500 hPa** or **potential vorticity** change over time at a given location, which allows researchers to detect regions of high or low pressure and anomalous circulation patterns. However, this approach observes the atmosphere “from the outside,” without following the actual movement of the air.

My proposal was to change that perspective and look at the atmosphere “from the inside,” following the trajectories of the air masses themselves. To do so, I adopted a **Lagrangian approach**, which consists of studying the motion of particles as they move through the atmosphere. This method makes it possible to observe directly where the flow slows down, deviates, or becomes trapped—without having to impose a predefined geometric or dynamical definition of what constitutes a block. In other words, it lets the trajectories speak for themselves.

The development of the method was based on the use of **HYSPLIT** (*Hybrid Single-Particle Lagrangian Integrated Trajectory*), a NOAA tool designed to compute particle trajectories in the atmosphere. Using data from the **ERA5 reanalysis** (ECMWF), I generated thousands of backward trajectories of virtual air parcels in the mid-troposphere (**Figure 14**), around 500 hPa (roughly 5,500 meters above sea level). From these trajectories, I derived three main variables: the **end-to-end distance**, which measures how far the final point is from the initial one and serves as an indicator of flow stagnation (**Figure 20**); the **total trajectory length**, representing the total distance traveled by each parcel (**Figure 21**); and the **zonal and meridional projections**, which quantify how much the air has moved in the east–west and north–south directions, respectively. Under blocking conditions, the zonal projection tends to decrease while the meridional projection increases, since the air stops moving eastward and deviates toward different latitudes.

From these parameters, I produced maps and time series (**Figure 25 and 26**) reflecting the evolution of air flows over the study region. To spatially identify blocked areas (**Figure 28**), I used the **DBSCAN clustering algorithm**, which detects groups of points with similar properties based on data density. This made it possible to isolate regions where the atmospheric flow exhibited clear stagnation and to display them directly on **geopotential height maps**.

The method was tested on a particularly notable case: the **European heat wave of summer 2003**, one of the most extreme weather events recorded in recent decades. Between August 6 and 12 of that year, an intense anticyclone formed over Western Europe, blocking the entry of cooler air and producing record-breaking temperatures across much of the continent. The Lagrangian model accurately detected this blocked region, matching the high-pressure patterns visible in traditional synoptic maps. It was also applied preliminarily to the **June 2019** heatwave episode, which featured several consecutive heat waves. Although the method still requires refinement to generalize and capture multiple events in sequence, the results were consistent and encouraging.

What makes this approach particularly interesting is that it does not depend on a fixed index or threshold (well, not yet entirely), as traditional methods do—such as the **Tibaldi–Molteni index**—but instead relies directly on the motion of air masses. This allows blocking to be understood as a **dynamic, physical phenomenon**, a natural consequence of the atmospheric flow, rather than merely as a numerical anomaly within a meteorological field. Moreover, being an explicit and quantifiable method, it can easily be adapted to automatic detection procedures and modern analytical techniques such as **machine learning** or **convolutional neural networks (CNNs)**.

The results (**Figure 28**) show that this type of Lagrangian analysis can provide a more intuitive and physically grounded view of atmospheric dynamics. It allows us to follow how a block forms, evolves, and dissipates by observing the real motion of air masses. However, to consolidate the method, it will be necessary to apply it to a larger number of events and extend the analysis period to several decades, which will enable the study of blocking frequency, duration, and intensity in the context of **climate change**. There is also potential to automate the detection of the most common blocking patterns, such as the **Omega** and **Rex** types, using deep learning models.

Ultimately, this work proposes a new way of studying atmospheric blocking: not by observing it from the outside, but by traveling with the air itself. The atmosphere is a dynamic, complex, and nonlinear system in which blocking represents one of its most influential manifestations. Understanding these events in detail is essential for anticipating the impacts of extreme weather on society and the environment. I am confident that **Lagrangian methods**, like the one I have developed, can become a key tool for improving our ability to observe, analyze, and predict such phenomena in an ever-changing climate.

If you would like to explore this work in greater depth, you can visit my **GitHub page**, where the complete project is available in PDF format. I am currently continuing to develop this research, aiming to generalize the method to any type of blocking episode using **Deep Learning** techniques. If you have any questions, suggestions, or simply want to discuss any detail, feel free to contact me by email—every idea and piece of feedback is welcome.

---

Los mapas mostrados no incluyen su correspondiente escala de color, lo que puede generar dudas sobre lo que se representa en cada figura. Debido a limitaciones de formato, no me ha sido posible incorporarlas aquí. Sin embargo, invito a quienes estén interesados a visitar mi repositorio de GitHub, donde podrán encontrar los mapas con sus barras de color y un análisis detallado de cada uno de los resultados.

---

The maps shown do not include their corresponding color scale, which may cause some confusion about what each figure represents. Due to formatting limitations, I was unable to include them here. However, I invite anyone interested to visit my GitHub repository, where you can find the maps with their color bars as well as an in-depth discussion of each result.

## Figura/Figure 14

![Mapa animado distancias End-to-End](/images/traj_25E.gif)

## Figura/Figure 20

![Figura 20 animada](/images/Figura_20_animada.gif)


## Figura/Figure 21

![Figura 21 animada](/images/Figura_21_animada.gif)


## Figura/Figure 23

![Figura 23 arriba izquierda](/images/Figura_23_arriba_izquierda.gif) ![Figura 23 arriba derecha](/images/Figura_23_arriba_derecha.gif)

![Figura 23 abajo izquierda](/images/Figura_23_abajo_izquierda.gif) ![Figura 23 abajo derecha](/images/Figura_23_abajo_derecha.gif)


## Figura/Figure 25

![Figura 25 izquierda](/images/Figura_25_izquierda.gif) ![Figura 25 derecha](/images/Figura_25_derecha.gif)

## Figura/Figure 27

![Figura 27 izquierda](/images/Figura_27_izquierda.gif) ![Figura 27 derecha](/images/Figura_27_derecha.gif)