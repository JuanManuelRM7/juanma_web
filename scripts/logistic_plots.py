#!/usr/bin/env python3
"""
Genera las figuras del post "Del clima al caos" (ecuación logística).
Tres regímenes: estable, periódico (duplicación de periodo) y caótico.
Salida en static/images/. Reproducible: python3 scripts/logistic_plots.py
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# Paleta coherente con el sitio (violeta / índigo / cian)
VIOLET = "#7c3aed"
INDIGO = "#6366f1"
CYAN = "#0891b2"
AMBER = "#d97706"
GRID = "#e5e7eb"

OUT = os.path.join(os.path.dirname(__file__), "..", "static", "images")

plt.rcParams.update({
    "figure.dpi": 150,
    "font.size": 12,
    "axes.edgecolor": "#9ca3af",
    "axes.linewidth": 0.8,
    "axes.grid": True,
    "grid.color": GRID,
    "grid.linewidth": 0.8,
    "grid.linestyle": "--",
})


def logistic(r, x0, n):
    xs = np.empty(n + 1)
    xs[0] = x0
    for i in range(n):
        xs[i + 1] = r * xs[i] * (1.0 - xs[i])
    return xs


def fig_estable():
    n = 50
    fig, ax = plt.subplots(figsize=(8, 4.5))
    for r, color in [(1.5, VIOLET), (2.8, CYAN)]:
        xs = logistic(r, 0.2, n)
        ax.plot(range(n + 1), xs, color=color, lw=2, label=f"r = {r}  →  punto fijo {1 - 1/r:.3f}")
    ax.set_title("Régimen estable: convergencia a un punto fijo (r < 3)", fontweight="bold")
    ax.set_xlabel("Iteración n")
    ax.set_ylabel("Población $x_n$")
    ax.set_ylim(0, 0.8)
    ax.legend(frameon=True, facecolor="white", edgecolor=GRID)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "logistic-estable.png"), bbox_inches="tight")
    plt.close(fig)


def fig_periodico():
    n = 60
    fig, axes = plt.subplots(1, 2, figsize=(9.5, 4.2), sharey=True)
    data = [(3.2, VIOLET, "periodo 2"), (3.5, INDIGO, "periodo 4")]
    for ax, (r, color, lab) in zip(axes, data):
        xs = logistic(r, 0.2, n)
        ax.plot(range(n + 1), xs, color=color, lw=1.6, marker="o", ms=3)
        ax.set_title(f"r = {r}  ({lab})", fontweight="bold")
        ax.set_xlabel("Iteración n")
        ax.set_xlim(20, n)  # tras el transitorio
    axes[0].set_ylabel("Población $x_n$")
    fig.suptitle("Régimen periódico: duplicación de periodo (3 < r < 3.57)", fontweight="bold")
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    fig.savefig(os.path.join(OUT, "logistic-periodico.png"), bbox_inches="tight")
    plt.close(fig)


def fig_caotico():
    """Sensibilidad a condiciones iniciales (efecto mariposa) en r = 3.9."""
    r = 3.9
    n = 60
    x0a, x0b = 0.300, 0.301
    xa = logistic(r, x0a, n)
    xb = logistic(r, x0b, n)
    diff = np.abs(xa - xb)

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6.2),
                                   gridspec_kw={"height_ratios": [2, 1]})

    ax1.plot(range(n + 1), xa, color=VIOLET, lw=1.8, marker="o", ms=3,
             label=f"$x_0$ = {x0a}")
    ax1.plot(range(n + 1), xb, color=CYAN, lw=1.8, marker="o", ms=3,
             label=f"$x_0$ = {x0b}")
    ax1.set_title(f"Régimen caótico: sensibilidad a las condiciones iniciales (r = {r})",
                  fontweight="bold")
    ax1.set_ylabel("Población $x_n$")
    ax1.set_ylim(0, 1)
    ax1.legend(frameon=True, facecolor="white", edgecolor=GRID)

    # Marca dónde la diferencia se vuelve apreciable
    thr = np.argmax(diff > 0.1)
    if thr > 0:
        ax1.axvline(thr, color=AMBER, lw=1.2, ls=":", alpha=0.9)
        ax1.text(thr + 0.5, 0.04, f"divergen ~n={thr}", color=AMBER, fontsize=10)

    ax2.semilogy(range(n + 1), np.maximum(diff, 1e-16), color=AMBER, lw=1.8)
    ax2.set_title("Diferencia entre trayectorias $|x_n^{(a)} - x_n^{(b)}|$ (escala log)",
                  fontsize=11)
    ax2.set_xlabel("Iteración n")
    ax2.set_ylabel("|Δ$x_n$|")
    ax2.set_ylim(1e-4, 1)

    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "logistic-caotico.png"), bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    fig_estable()
    fig_periodico()
    fig_caotico()
    print("Figuras generadas en", os.path.normpath(OUT))
