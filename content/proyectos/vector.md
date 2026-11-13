---
title: "Vector: mi día en una sola dirección"
description: "Una app nativa para iPhone y Apple Watch que hice para mí: entrenos, comidas, agua, gastos y agenda en un mismo sitio, con una flecha que dice cuánto llevo del día."
note: "No está en la App Store. La uso a diario y la enseño aquí como proyecto. Las pantallas de esta página son maquetas con datos de ejemplo."
date: 2026-11-13
layout: vector
role: "Autor · diseño y desarrollo"
period: "2026"
org: "Proyecto personal"
stack: [Swift, SwiftUI, SwiftData, HealthKit, WidgetKit, WatchConnectivity, EventKit, App Intents, Swift Charts]
metrics:
  - value: "9"
    label: "módulos en una sola app"
  - value: "4"
    label: "objetivos: iPhone, reloj, widgets y complicaciones"
  - value: "~22.000"
    label: "líneas de Swift"
  - value: "ES · EN"
    label: "según el idioma del dispositivo, en claro y en oscuro"
tags: ["iOS", "watchOS", "SwiftUI", "producto"]
---

{{< vx-row stage="phone" kicker="La idea" >}}
## Una flecha en lugar de seis anillos

Cada día tiene unos pocos objetivos: comer lo suficiente, beber, entrenar si toca, la pregunta de inglés, las tareas. El número cuenta los cumplidos. La flecha cuenta también los parciales, así que avanza aunque todavía no hayas cerrado ninguno.

- Solo cuenta lo que tiene sentido hoy: en día de descanso, el entreno no aparece.
- El mismo cálculo en el iPhone, el reloj y el widget.
{{< /vx-row >}}

{{< vx-row stage="calendar" kicker="Entrenos" flip="true" >}}
## El mes de entrenos de un vistazo

Cuatro semanas en una rejilla: las dos anteriores, la actual y la siguiente. Lo hecho va relleno y lo agendado solo con el borde, así se distingue lo que pasó de lo que está por venir.

- Running en naranja y gym en índigo; si un día hay los dos, mitad y mitad.
- Lo hecho sale de Salud y lo agendado, del calendario del sistema.
{{< /vx-row >}}

{{< vx-block stage="watches" kicker="Apple Watch" >}}
## La app entera en la muñeca

No es un mando a distancia del iPhone. El reloj tiene nueve páginas, una por módulo: se apunta el agua, la comida o un gasto desde ahí, se lanza la rutina de gym o la carrera, y todo vuelve al iPhone solo. También lleva complicaciones para la esfera.
{{< /vx-block >}}

{{< vx-row stage="run" kicker="Entrenador de carrera" >}}
## Un plan de carrera que sabe cuándo callarse

El reloj lee las pruebas del calendario y monta el objetivo: distancia, tiempo y ritmo uniforme. En carrera muestra cuánto vas por delante o por detrás. Pero el pulso manda sobre el ritmo.

- Con el pulso alto sostenido no te pide acelerar, aunque vayas por detrás.
- Si el plan deja de salir sin forzar, lo ajusta a una llegada realista.
- Con calor previsto ofrece alargar el objetivo antes de salir y es más prudente durante la carrera.
{{< /vx-row >}}

{{< vx-row stage="widgets" kicker="Widgets" flip="true" >}}
## Lo importante, sin abrir la app

Widgets para la pantalla de inicio y la de bloqueo, con el mismo estilo que la app y el aspecto claro u oscuro del sistema. El descanso entre series sale como actividad en directo.

- Añadir agua desde el widget, sin entrar en la app.
- Gasto del mes con la previsión de fin de mes.
{{< /vx-row >}}

{{< vx-row stage="car" kicker="CarPlay · StandBy" >}}
## El mes de entrenos, en el salpicadero

El calendario de entrenos también vive en la pantalla del coche. Está pensado para ese sitio: números grandes, nada que tocar y sin gastar batería, porque solo se redibuja cuando cambia un día.

- El mismo widget sirve en StandBy, con el iPhone cargando en horizontal.
{{< /vx-row >}}

{{< vx-block kicker="Todo lo que lleva dentro" >}}
## Nueve módulos, una sola app
{{< /vx-block >}}

{{< vx-tiles >}}
{{< vx-tile k="Carreras" color="run" title="Previsión de tiempo para cada prueba" >}}Lee las pruebas del calendario, estima tu marca a partir de tus carreras recientes y te da el ritmo por kilómetro. Parciales, zonas de pulso y cadencia en directo.{{< /vx-tile >}}
{{< vx-tile k="Gym" color="gym" title="Rutinas que se siguen desde el reloj" >}}Catálogo de ejercicios, series con la referencia de la última vez y temporizador de descanso que sigue visible aunque bloquees el iPhone.{{< /vx-tile >}}
{{< vx-tile k="Comidas" color="warn" title="Un objetivo de kcal que se mueve contigo" >}}Reposo más la actividad real que mide Salud, así que sube a lo largo del día. Miles de alimentos sin conexión y lector de códigos de barras.{{< /vx-tile >}}
{{< vx-tile k="Gastos" color="accent" title="Cómo acabará el mes, no solo cómo va" >}}Presupuesto por categoría, gastos anuales repartidos mes a mes y una proyección de fin de mes que cuenta los fijos pendientes y tu ritmo de gasto variable.{{< /vx-tile >}}
{{< vx-tile k="Agua y creatina" color="water" title="Apuntar en un toque, desde donde estés" >}}Desde la app, el reloj, el widget o la esfera. El objetivo de litros es tuyo y la creatina se marca cuando la tomas.{{< /vx-tile >}}
{{< vx-tile k="Agenda y tiempo" color="accent" title="Cada evento, con su previsión" >}}Calendario y tareas del sistema en una vista. Junto a cada evento, el tiempo previsto en ese sitio y a esa hora, y un aviso antes si va a llover, hará calor o hay alerta oficial.{{< /vx-tile >}}
{{< vx-tile k="Inglés" color="gym" title="Una pregunta al día" >}}Vocabulario y expresiones de nivel B2 y C1, con respuesta desde el iPhone o el reloj. Cuenta como objetivo del día.{{< /vx-tile >}}
{{< vx-tile k="Logros" color="warn" title="Experiencia, niveles y medallas" >}}Cada cosa que haces suma. Más de cien medallas y una racha que premia la constancia, no los días sueltos.{{< /vx-tile >}}
{{< vx-tile k="Laboratorio" color="muted" title="Qué se mueve junto en tus días" >}}Cruza comida, gasto y entreno de los últimos 120 días: correlación de Pearson con su intervalo de confianza, contraste de significación y relaciones de un día para el siguiente. Enseña la nube de puntos, no solo el número.{{< /vx-tile >}}
{{< /vx-tiles >}}

{{< vx-block kicker="Cómo está hecha" >}}
## Nativa, sin servidor y sin cuentas

Todo vive en el iPhone y el reloj. Los datos de salud salen de Salud, la agenda del calendario del sistema y el tiempo de una previsión pública. No hay backend ni registro: el iPhone y el reloj se hablan directamente y cada uno guarda lo suyo.

La interfaz usa una paleta con dos valores por color, de modo que la app y sus widgets siguen el aspecto claro u oscuro del sistema, y todos los textos están en español e inglés.
{{< /vx-block >}}
