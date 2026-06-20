---
title: "Del clima al caos: una analogía entre meteorología y dinámica de poblaciones"
date: 2025-10-24
tags:
    - caos
    - efecto-mariposa
    - ecuación-logística
    - dinámica-poblacional
    - meteorología
    - modelos-matemáticos
description: "Analogía entre el caos meteorológico y la dinámica poblacional mediante la ecuación logística; análisis de regímenes estables y caóticos con código y visualizaciones."
draft: false
math: true
---

En el estudio del clima, Edward Lorenz descubrió que pequeñas variaciones en las condiciones iniciales podían generar resultados drásticamente diferentes, incluso dentro de sistemas deterministas.  
Ese hallazgo, conocido como **efecto mariposa**, dio origen al concepto moderno de **caos determinista**.  

Curiosamente, esa misma lógica puede observarse en un sistema mucho más simple: la **dinámica poblacional** descrita por la **ecuación logística**:

$$x_{n+1} = r\,x_n\,(1 - x_n)$$

donde:
- $x_n$ representa la población normalizada en el tiempo $n$,
- $r$ es el parámetro de crecimiento,
- y el término $(1 - x_n)$ introduce un límite ambiental.

---

Para analizar la evolución de este sistema y visualizar sus comportamientos (estables o caóticos), se puede implementar una función en Python que calcule la secuencia poblacional:

```python
def poblacion(r, x_0, cota):
    """
    Calcula la evolución de una población según el modelo logístico:
        x_{n+1} = r * x_n * (1 - x_n)

    Parámetros:
        r (float): Tasa de crecimiento.
        x_0 (float): Valor inicial de la población (entre 0 y 1).
        cota (float): Tolerancia para considerar que se alcanzó la estabilización.

    Retorna:
        valor_estable (float): Valor final de estabilización.
        iteraciones (int): Número de iteraciones realizadas.
        evolucion (list): Lista con los valores de evolución.
    """

    evolucion = [x_0]

    while True:
        x_p = r * evolucion[-1] * (1 - evolucion[-1])
        evolucion.append(x_p)

        # Condición de estabilidad
        if abs(evolucion[-1] - evolucion[-2]) <= cota:
            break

        # Evita bucles infinitos
        if len(evolucion) > 500:
            break

    valor_estable = evolucion[-1]
    iteraciones = len(evolucion)

    return valor_estable, iteraciones, evolucion
```

A medida que se aumenta el parámetro $r$, este sistema tan simple atraviesa tres comportamientos cualitativamente distintos. No se pasa del orden al caos de golpe: hay una transición gradual, la **cascada de duplicaciones de periodo**, que merece la pena recorrer paso a paso.

### Régimen estable: equilibrio y previsibilidad

Cuando los valores de $r$ son pequeños —por debajo de $3$, por ejemplo $r = 1.5$ o $r = 2.8$— el sistema converge hacia un único **punto fijo** $x^{*} = 1 - 1/r$.  
En este régimen, cualquier población inicial tiende al mismo valor final, independientemente de pequeñas diferencias en $x_0$: las perturbaciones se disipan.

Visualmente, las trayectorias se **aplanan** hacia un valor fijo. Esto representa un entorno predecible:
- La población alcanza un tamaño estable.
- El comportamiento a largo plazo puede anticiparse fácilmente.

En términos meteorológicos, este escenario se asemeja a un sistema atmosférico **estable**, donde las perturbaciones se amortiguan y el clima retorna a su estado medio: orden, equilibrio y previsibilidad.

![Régimen estable](/images/logistic-estable.png)

---

### Régimen periódico: la duplicación de periodo

Al cruzar $r = 3$, el punto fijo se vuelve inestable y el sistema **no se estabiliza en un valor, sino que oscila entre varios**. Para $3 < r < 3.449$ la población alterna entre **dos** valores (periodo 2); un poco más arriba aparece el periodo 4, luego el 8, el 16… Cada bifurcación duplica el periodo, y los intervalos de $r$ en los que ocurren son cada vez más cortos.

Esto es importante para no confundir conceptos: la oscilación periódica **todavía no es caos**. Es perfectamente predecible —basta con conocer el ciclo— y dos condiciones iniciales cercanas siguen **convergiendo al mismo ciclo**. Es, eso sí, la antesala del caos.

![Régimen periódico](/images/logistic-periodico.png)

---

### Régimen caótico: sensibilidad a las condiciones iniciales

La cascada de duplicaciones se acumula en $r \approx 3.5699$ (la constante de Feigenbaum gobierna ese ritmo). A partir de ahí el sistema entra en el **régimen caótico**: las trayectorias dejan de ser periódicas y se vuelven aperiódicas.

Aquí aparece la firma del caos. Tomemos $r = 3.9$ y dos poblaciones iniciales casi idénticas, $x_0 = 0.300$ y $x_0 = 0.301$. Durante las primeras iteraciones avanzan juntas; pero la diferencia entre ellas **crece de forma exponencial** (esto es lo que mide un exponente de Lyapunov positivo) y, en torno a una decena de pasos, las dos trayectorias son ya completamente distintas.

En el panel inferior de la gráfica, esa diferencia $|x_n^{(a)} - x_n^{(b)}|$ se dispara en escala logarítmica: aunque la ecuación es determinista, su evolución se vuelve **prácticamente impredecible**.

Aquí es donde la analogía meteorológica se hace evidente: la atmósfera, como estas poblaciones, **obedece reglas deterministas**, pero la extrema sensibilidad a las condiciones iniciales hace que el pronóstico a largo plazo sea imposible. Un cambio minúsculo —una perturbación de temperatura imperceptible— puede alterar por completo la evolución del sistema. Ese es, en esencia, el **efecto mariposa**.

![Régimen caótico](/images/logistic-caotico.png)

---

Tanto en las ecuaciones meteorológicas como en el modelo logístico, el **caos no significa desorden absoluto**, sino **complejidad dentro de un sistema perfectamente determinista**.  
La ecuación sigue siendo la misma; lo que cambia es la relación entre sus variables.  
Este paralelismo entre el clima y las poblaciones revela una verdad profunda:  

> La predictibilidad no depende de conocer las leyes, sino de la estabilidad del sistema que esas leyes describen.

---

*Relacionado: estas mismas ideas de sensibilidad e impredecibilidad se llevan a la predicción del tiempo en [Predicciones por conjuntos](../predicciones-por-conjuntos), y a un fenómeno atmosférico real en [Bloqueos atmosféricos desde un punto de vista lagrangiano](../tfg).*
