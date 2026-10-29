/* Escaneo de puntos (estilo Vantage).
   1. Portada: un neumático generado como nube de puntos (WebGL) que gira mientras lo cruza un
      barrido de luz rasante. El texto en relieve del flanco y un defecto (en lima) son puntos.
      Un OCR lee el texto del flanco como un escáner: una línea de luz recorre el texto, cada carácter
      que deja atrás se enciende en lima y la etiqueta lo escribe (el exact match sale de config.yaml).
   2. Todas las páginas: el nombre del pie dibujado con puntos y un barrido que lo recorre.
   Se pausa fuera de pantalla y, con "reducir movimiento", queda un fotograma fijo. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const css = getComputedStyle(document.documentElement);

  /* ---------- color: tokens OKLCH del tema a sRGB ---------- */
  function oklch(str) {
    const m = str.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/); if (!m) return [1, 1, 1];
    const L = +m[1] / 100, C = +m[2], h = (+m[3] * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s]
      .map((v) => { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; });
  }
  const tok = (n) => oklch(css.getPropertyValue(n));
  const COL = { lo: tok('--point-lo'), mid: tok('--point-mid'), hi: tok('--point-hi'), acc: tok('--color-accent') };
  const rgb = (c, a = 1) => `rgba(${c.map((v) => Math.round(v * 255)).join(',')},${a})`;

  let seed = 20261029;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* =================== 1. El neumático =================== */
  const canvas = document.getElementById('tire');
  if (canvas) tire(canvas);

  function tire(canvas) {
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) return;

    /* Geometría: eje del neumático en z. Radio exterior 100, talón 62.
       Clases: 0 goma, 1 texto en relieve, 3 defecto (encontrado, lima). */
    const small = innerWidth < 700;
    const Ro = 100, Ri = 62, HW = 28, RS = 10, ZB = 30, RSH = Ro - RS;
    const sideZ = (r) => { const t = (r - Ri) / (RSH - Ri); return ZB + (HW + RS - ZB) * t + 7 * Math.sin(Math.PI * t); };
    const sideDZ = (r) => { const L = RSH - Ri, t = (r - Ri) / L; return ((HW + RS - ZB) + 7 * Math.PI * Math.cos(Math.PI * t)) / L; };
    const wrapA = (a) => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };

    // Máscara del texto: se dibuja plano y se enrolla sobre la banda del flanco
    const BAND = [71.5, 83];
    const texts = [{ s: '205/55 R16 91V', c: Math.PI / 2, span: 1.55 }, { s: 'RADIAL  TUBELESS', c: -Math.PI / 2 + 0.2, span: 1.5 }].map((t) => {
      const cv = document.createElement('canvas'); cv.width = 900; cv.height = 90; const g = cv.getContext('2d');
      g.fillStyle = '#fff'; g.font = '700 74px "Arial Black", Arial, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center';
      const w = g.measureText(t.s).width, k = Math.min(1, 880 / w); g.save(); g.scale(k, 1); g.fillText(t.s, 450 / k, 48); g.restore();
      const x0 = 450 - (w * k) / 2, ends = [...t.s].map((_, i) => (x0 + g.measureText(t.s.slice(0, i + 1)).width * k) / 899);
      return { ...t, ends, data: g.getImageData(0, 0, 900, 90).data };
    });
    // 0: sin letra. Texto que lee el OCR (el primero): 1 + posición a lo largo del texto (0..1). Otro texto: 3.
    function glyph(th, r) {
      if (r < BAND[0] || r > BAND[1]) return 0;
      for (let i = 0; i < texts.length; i++) {
        const t = texts[i], d = wrapA(t.c - th); if (Math.abs(d) > t.span / 2) continue;
        const f = d / t.span + 0.5, u = Math.floor(f * 899), v = Math.floor(((BAND[1] - r) / (BAND[1] - BAND[0])) * 89);
        if (t.data[(v * 900 + u) * 4 + 3] > 110) return i === 0 ? 1 + f : 3;
      }
      return 0;
    }
    const readPos = (g) => (g >= 1 && g <= 2 ? g - 1 : -1);
    // Posición a lo largo del texto que se lee para cualquier punto de su banda (letra o no): por ahí pasa el escáner
    const bandPos = (th, r) => {
      if (r < BAND[0] - 1.2 || r > BAND[1] + 1.2) return -1;
      const d = wrapA(texts[0].c - th); return Math.abs(d) > texts[0].span / 2 ? -1 : d / texts[0].span + 0.5;
    };
    const DEF = { th: -0.75, r: 77, s: 4.4, h: 3.6 };
    const bump = (th, r) => { const d = Math.hypot(r - DEF.r, DEF.r * wrapA(th - DEF.th)); return DEF.h * Math.exp(-(d * d) / (2 * DEF.s * DEF.s)); };

    const pos = [], nor = [], cls = [], rr = [], tus = [];
    const add = (x, y, z, nx, ny, nz, c, tu = -1) => { pos.push(x, y, z); nor.push(nx, ny, nz); cls.push(c); rr.push(rnd()); tus.push(tu); };
    const ROWS = small ? 380 : 660, TSTEP = small ? 1.25 : 0.8, SSTEP = small ? 1.0 : 0.66;
    for (let i = 0; i < ROWS; i++) {
      const th = (i / ROWS) * Math.PI * 2 + (rnd() - 0.5) * 0.002, c = Math.cos(th), s = Math.sin(th);
      // banda de rodadura: tres surcos y laminillas en ángulo
      for (let z = -HW; z <= HW; z += TSTEP * (0.75 + rnd() * 0.5)) {
        let dep = 0;
        for (const zc of [-14, 0, 14]) if (Math.abs(z - zc) < 1.9) dep = 4;
        const u = (th * 46) / (2 * Math.PI) + 0.045 * Math.abs(z) * Math.sign(z || 1);
        if (!dep && Math.abs(z) > 2.2 && u - Math.floor(u) < 0.075) dep = 2.6;
        const r = Ro - dep + (rnd() - 0.5) * 0.15;
        add(r * c, r * s, z, c, s, 0, 0);
      }
      // hombros
      for (const sg of [1, -1]) for (let p = 0; p <= Math.PI / 2; p += (TSTEP / RS) * (0.75 + rnd() * 0.5)) {
        const r = RSH + RS * Math.cos(p), z = sg * (HW + RS * Math.sin(p));
        add(r * c, r * s, z, Math.cos(p) * c, Math.cos(p) * s, sg * Math.sin(p), 0);
      }
      // flancos (el delantero en cada fila, el trasero en una de cada dos)
      for (const sg of [1, -1]) {
        if (sg < 0 && i % 2) continue;
        for (let r = Ri; r <= RSH; r += SSTEP * (sg < 0 ? 1.4 : 1) * (0.75 + rnd() * 0.5)) {
          let z = sg * sideZ(r), k = 0, tu = -1;
          if (sg > 0) { const g = glyph(th, r); if (g) { z += 1.5; k = 1; } tu = bandPos(th, r); const b = bump(th, r); z += b; if (b > 0.6) k = 3; }
          const d = sideDZ(r), n = Math.hypot(d, 1);
          add(r * c, r * s, z, (-d * c) / n, (-d * s) / n, sg / n, k, tu);
        }
        for (let z = ZB - 6; z <= ZB; z += 1.4) add(Ri * c, Ri * s, sg * z, -c, -s, 0, 0); // talón
      }
    }
    // pasada densa sobre el texto y el defecto para que se lean bien
    const DSTEP = small ? 0.55 : 0.36;
    for (const t of texts) {
      for (let r = BAND[0]; r <= BAND[1]; r += DSTEP) {
        const step = DSTEP / r;
        for (let th = t.c - t.span / 2; th <= t.c + t.span / 2; th += step) {
          const jt = th + (rnd() - 0.5) * step, jr = r + (rnd() - 0.5) * 0.2;
          const g = glyph(jt, jr); if (!g) continue;
          const z = sideZ(jr) + 1.5, d = sideDZ(jr), n = Math.hypot(d, 1), c = Math.cos(jt), s = Math.sin(jt);
          add(jr * c, jr * s, z, (-d * c) / n, (-d * s) / n, 1 / n, 1, readPos(g));
        }
      }
    }
    for (let k = 0; k < (small ? 1500 : 4000); k++) {
      const f = rnd(), th = texts[0].c + texts[0].span / 2 - f * texts[0].span, r = BAND[0] - 1 + rnd() * (BAND[1] - BAND[0] + 2);
      if (glyph(th, r)) continue;
      const z = sideZ(r), d = sideDZ(r), n = Math.hypot(d, 1), c = Math.cos(th), s = Math.sin(th);
      add(r * c, r * s, z, (-d * c) / n, (-d * s) / n, 1 / n, 0, bandPos(th, r));
    }
    for (let k = 0; k < (small ? 900 : 2200); k++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * DEF.s * 2.1, r = DEF.r + d * Math.cos(a), th = DEF.th + (d * Math.sin(a)) / DEF.r;
      const b = bump(th, r), z = sideZ(r) + b + (glyph(th, r) ? 1.5 : 0), c = Math.cos(th), s = Math.sin(th);
      add(r * c, r * s, z, 0.2 * c, 0.2 * s, 1, b > 0.6 ? 3 : 0);
    }
    const N = cls.length;

    /* matrices */
    const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]; };
    function lookAt(e, c) { let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2]; let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l; let xx = zz, xz = -zx; l = Math.hypot(xx, xz); xx /= l; xz /= l; const yx = zy * xz, yy = zz * xx - zx * xz, yz = -zy * xx; return [xx, yx, zx, 0, 0, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]; }
    const mul = (a, b) => { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; };

    const VS = `attribute vec3 p; attribute vec3 n; attribute float c; attribute float r; attribute float tu;
uniform mat4 mvp; uniform vec2 rot; uniform float dpr, size, sweep, alpha, near, far, readU, readA, beamW;
uniform vec3 lo, mid, hi, acc, ldir;
varying vec4 col;
void main(){
  vec3 w = vec3(rot.x * p.x - rot.y * p.y, rot.y * p.x + rot.x * p.y, p.z);
  vec3 nn = vec3(rot.x * n.x - rot.y * n.y, rot.y * n.x + rot.x * n.y, n.z);
  vec4 q = mvp * vec4(w, 1.); gl_Position = q;
  float h = clamp((w.y + 108.) / 216., 0., 1.);
  vec3 k = h < .5 ? mix(lo, mid, h * 2.) : mix(mid, hi, (h - .5) * 2.);
  float sh = max(0., dot(normalize(nn), ldir));
  k *= .42 + .78 * sh;
  if (c > .5 && c < 1.5) k = mix(k, hi, .22 + .3 * sh);
  float d = sweep - w.x; float s = d >= 0. ? .6 * exp(-d / 2.4) + .4 * exp(-d / 22.) : exp(d / .8);
  k = mix(k, hi * 1.12, min(1., s * 1.05));
  float found = c > 2.5 ? 1. : 0.;
  float beam = tu >= 0. ? exp(-pow((tu - readU) / beamW, 2.)) * readA : 0.;
  float read = (c > .5 && c < 1.5 && tu >= 0. && tu < readU - .006) ? readA : 0.;
  k = mix(k, acc, read);
  k = mix(k, hi * 1.25, min(1., beam * 1.3));
  found = max(found, max(read, beam));
  if (found > .99 && beam < .5) k = acc;
  float fd = clamp(1. - (q.w - near) / (far - near), .22, 1.);
  gl_PointSize = clamp(size * dpr * 300. / q.w * (.8 + .4 * r) * (1. + .3 * s) * (1. + .5 * found + .6 * beam), 1. * dpr, 3.8 * dpr);
  col = vec4(k, mix(fd * min(1., .72 + .5 * s), 1., found) * alpha);
}`;
    const FS = `precision mediump float; varying vec4 col;
void main(){ vec2 d = gl_PointCoord - .5; float e = dot(d, d); if (e > .25) discard; float a = col.a * smoothstep(.25, .12, e); gl_FragColor = vec4(col.rgb * a, a); }`;
    const mk = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
    const pr = gl.createProgram(); gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = (data, name, n) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); };
    buf(new Float32Array(pos), 'p', 3); buf(new Float32Array(nor), 'n', 3); buf(new Float32Array(cls), 'c', 1); buf(new Float32Array(rr), 'r', 1); buf(new Float32Array(tus), 'tu', 1);
    const U = {}; ['mvp', 'rot', 'dpr', 'size', 'sweep', 'alpha', 'near', 'far', 'readU', 'readA', 'beamW', 'lo', 'mid', 'hi', 'acc', 'ldir'].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
    gl.uniform3fv(U.lo, COL.lo); gl.uniform3fv(U.mid, COL.mid); gl.uniform3fv(U.hi, COL.hi); gl.uniform3fv(U.acc, COL.acc);
    const L = [-0.35, 0.62, 0.7], ll = Math.hypot(...L); gl.uniform3f(U.ldir, L[0] / ll, L[1] / ll, L[2] / ll); gl.uniform1f(U.dpr, DPR);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.DEPTH_TEST);

    const st = { w: 0, h: 0, spin: 0.35, alpha: 0, px: 0, py: 0, tpx: 0, tpy: 0, mvp: null, on: true, t0: performance.now(), last: performance.now() };
    // Ancla de la etiqueta: el centro del texto que lee el OCR. El defecto en lima no lleva etiqueta.
    const ANCHORS = { text: [78 * Math.cos(texts[0].c), 78 * Math.sin(texts[0].c), sideZ(78) + 1.5] };
    // Lectura OCR como un escáner: en reposo 2,2 s, la línea recorre el texto en 3,2 s (velocidad constante),
    // el texto leído se mantiene 2,4 s y se apaga en 1,2 s
    const OCR = texts[0].s, ocrOut = document.querySelector('[data-ocr-out]');
    const readAt = (t) => {
      if (reduce) return [1.2, 1];
      const k = t % 9;
      if (k < 2.2) return [-1, 0];
      if (k < 5.4) return [-0.03 + ((k - 2.2) / 3.2) * 1.08, 1];
      if (k < 7.8) return [1.2, 1];
      return [1.2, 1 - (k - 7.8) / 1.2];
    };
    let typed = -1;
    const label = document.querySelector('.callout--fixed'), leader = document.querySelector('.scan__leader');
    const lLine = leader && leader.querySelector('line'), lDot = leader && leader.querySelector('circle');

    function resize() { const r = canvas.getBoundingClientRect(); if (!r.width) return; st.w = r.width; st.h = r.height; canvas.width = Math.round(r.width * DPR); canvas.height = Math.round(r.height * DPR); gl.viewport(0, 0, canvas.width, canvas.height); }
    // barrido: cruza en 5,6 s y descansa hasta 7,5 s
    const sweepAt = (t) => { const k = (t % 7.5) / 5.6; if (k > 1) return 999; const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; return -125 + e * 250; };
    function project(p) {
      const m = st.mvp; if (!m) return null; const c = Math.cos(st.spin), s = Math.sin(st.spin); const w = [c * p[0] - s * p[1], s * p[0] + c * p[1], p[2]];
      const x = m[0] * w[0] + m[4] * w[1] + m[8] * w[2] + m[12], y = m[1] * w[0] + m[5] * w[1] + m[9] * w[2] + m[13], ww = m[3] * w[0] + m[7] * w[1] + m[11] * w[2] + m[15];
      if (ww <= 0) return null; return [((x / ww) * 0.5 + 0.5) * st.w, (1 - ((y / ww) * 0.5 + 0.5)) * st.h];
    }
    function draw(t, dt) {
      const Lp = (a, b, k) => a + (b - a) * Math.min(1, k * dt);
      st.alpha = Lp(st.alpha, 1, 2); st.px = Lp(st.px, st.tpx, 3); st.py = Lp(st.py, st.tpy, 3);
      const wide = st.w > 560 && innerWidth >= 960;
      const yaw = 0.52 + st.px * 0.08 + (reduce ? 0 : Math.sin(t * 0.07) * 0.07), pitch = 0.26 + st.py * 0.05, R = wide ? 450 : 400;
      const eye = [R * Math.cos(pitch) * Math.sin(yaw), R * Math.sin(pitch), R * Math.cos(pitch) * Math.cos(yaw)];
      st.mvp = mul(persp(0.62, st.w / st.h, 20, 900), lookAt(eye, wide ? [-14, 4, 0] : [0, 0, 0]));
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(U.mvp, false, st.mvp); gl.uniform2f(U.rot, Math.cos(st.spin), Math.sin(st.spin));
      gl.uniform1f(U.size, wide ? 1.15 : 1.0); gl.uniform1f(U.alpha, st.alpha); gl.uniform1f(U.near, R - 120); gl.uniform1f(U.far, R + 120);
      gl.uniform1f(U.sweep, sweepAt(t));
      const [ru, ra] = readAt(t); gl.uniform1f(U.readU, ru); gl.uniform1f(U.readA, ra); gl.uniform1f(U.beamW, wide ? 0.011 : 0.022);
      const nChars = ru < 0 || ra < 0.05 ? 0 : texts[0].ends.filter((e) => e <= ru).length;
      if (ocrOut && nChars !== typed) { typed = nChars; ocrOut.textContent = OCR.slice(0, nChars); ocrOut.parentElement.classList.toggle('is-done', nChars === OCR.length); }
      gl.drawArrays(gl.POINTS, 0, N);
      // Línea guía desde la etiqueta (fija sobre el neumático) hasta el centro del texto que se lee
      if (label && leader && label.offsetParent) {
        const sp = project(ANCHORS.text);
        if (sp) {
          // Sale del borde de la etiqueta que mira al texto (abajo en escritorio, arriba en móvil)
          const x1 = label.offsetLeft + 18, y1 = sp[1] < label.offsetTop ? label.offsetTop : label.offsetTop + label.offsetHeight;
          lLine.setAttribute('x1', x1); lLine.setAttribute('y1', y1); lLine.setAttribute('x2', sp[0].toFixed(1)); lLine.setAttribute('y2', sp[1].toFixed(1));
          lDot.setAttribute('cx', sp[0].toFixed(1)); lDot.setAttribute('cy', sp[1].toFixed(1));
        }
        leader.classList.toggle('is-on', !!sp);
      }
    }
    let hiddenDoc = false;
    function frame(now, once) {
      if (!st.on && !once) return;
      const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
      if (!reduce) st.spin += dt * ((Math.PI * 2) / 70);
      draw(reduce ? 3.1 : (now - st.t0) / 1000, reduce ? 1 : dt);
      if (!reduce && !hiddenDoc && !once) requestAnimationFrame(frame);
    }
    resize();
    addEventListener('resize', () => { resize(); if (reduce) frame(performance.now(), true); });
    const hero = canvas.closest('.hero');
    if (hero) hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); st.tpx = ((e.clientX - r.left) / r.width - 0.5) * 2; st.tpy = ((e.clientY - r.top) / r.height - 0.5) * 2; });
    new IntersectionObserver(([e]) => { const was = st.on; st.on = e.isIntersecting; if (st.on && !was && !reduce) { st.last = performance.now(); requestAnimationFrame(frame); } }, { rootMargin: '60px' }).observe(canvas);
    document.addEventListener('visibilitychange', () => { hiddenDoc = document.hidden; if (!hiddenDoc && !reduce) { st.last = performance.now(); requestAnimationFrame(frame); } });
    if (reduce) { st.alpha = 1; requestAnimationFrame((n) => frame(n, true)); }
    else requestAnimationFrame(frame);
  }

  /* =================== 2. El nombre del pie, escaneado =================== */
  const fm = document.querySelector('[data-points-word]');
  if (fm) {
    const c = fm.querySelector('canvas'), g = c.getContext('2d');
    let dots = [], on = false; const t0 = performance.now();
    function build() {
      const w = fm.clientWidth, h = fm.clientHeight; if (!w) return; c.width = w * DPR; c.height = h * DPR;
      const o = document.createElement('canvas'); o.width = w; o.height = h; const og = o.getContext('2d');
      const face = css.getPropertyValue('--font-display'); og.font = `200 100px ${face}`; const fs = Math.min(h * 1.25, (100 * w) / og.measureText(fm.dataset.pointsWord).width);
      og.fillStyle = '#fff'; og.font = `200 ${fs}px ${face}`; og.textBaseline = 'alphabetic'; og.fillText(fm.dataset.pointsWord, -fs * 0.03, h * 0.92);
      const px = og.getImageData(0, 0, w, h).data, step = w < 700 ? 3 : 4; dots = []; seed = 77;
      for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step * (0.8 + rnd() * 0.4)) { const jx = x + (rnd() - 0.5) * step * 0.5, jy = y + (rnd() - 0.5) * step * 0.3; const a = px[(Math.floor(jy) * w + Math.floor(jx)) * 4 + 3]; if (a > 120) dots.push([jx, jy, rnd()]); }
    }
    function paint(now) {
      const w = fm.clientWidth, h = fm.clientHeight; g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, w, h);
      const t = reduce ? 0.35 : (((now - t0) / 1000) % 9) / 7, sx = t <= 1 ? -40 + t * (w + 80) : -999;
      for (const [x, y, r] of dots) {
        const k = 1 - y / h, d = sx - x, lit = d >= 0 ? 0.6 * Math.exp(-d / 6) + 0.4 * Math.exp(-d / 120) : Math.exp(d / 3);
        const base = COL.mid.map((v, j) => v * 0.7 + (COL.hi[j] - v * 0.7) * k * 0.35), col = base.map((v, j) => v + (COL.hi[j] - v) * lit * 0.9);
        g.fillStyle = rgb(col, 0.5 + 0.5 * lit); g.fillRect(x, y, 1.3 + r * 0.6, 1.3 + r * 0.6);
      }
      if (on && !reduce && !document.hidden) requestAnimationFrame(paint);
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { build(); paint(performance.now()); });
    new IntersectionObserver(([e]) => { const was = on; on = e.isIntersecting; if (on && !was) requestAnimationFrame(paint); }).observe(fm);
    addEventListener('resize', () => { build(); paint(performance.now()); });
  }
})();
