# CV (fuentes LaTeX)

- `juanmanuel_ruizmunoz_es.tex` → `static/cv.pdf`
- `juanmanuel_ruizmunoz_en.tex` → `static/cv-en.pdf`

Para regenerarlos:

```bash
cd cv
pdflatex juanmanuel_ruizmunoz_es.tex && pdflatex juanmanuel_ruizmunoz_es.tex
pdflatex juanmanuel_ruizmunoz_en.tex && pdflatex juanmanuel_ruizmunoz_en.tex
cp juanmanuel_ruizmunoz_es.pdf ../static/cv.pdf
cp juanmanuel_ruizmunoz_en.pdf ../static/cv-en.pdf
rm -f *.aux *.log *.out *.pdf
```

Hugo ignora esta carpeta: solo se publica lo que se copia a `static/`.
