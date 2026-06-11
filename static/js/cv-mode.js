// CV Mode — easter egg de detección de objetos estilo YOLO sobre la propia web.
// Activación: escribe "yolo" en cualquier parte, paleta ⌘K → "CV Mode",
// o comando `yolo` en el terminal. Salir: ESC o volver a activarlo.
(function () {
  'use strict';

  var active = false;
  var hud = null;
  var boxLayer = null;
  var crosshair = null;
  var hudTimer = null;
  var styleEl = null;
  var resizeTimer = null;

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE_POINTER = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  var CLASS_COLORS = {
    person: '#f43f5e',
    heading: '#22d3ee',
    hyperlink: '#a3e635',
    image: '#fbbf24',
    button: '#f472b6',
    icon: '#818cf8',
    code_block: '#34d399',
    text: '#94a3b8'
  };

  var CSS = [
    '#cvm-boxes { position: absolute; top: 0; left: 0; width: 100%; z-index: 100; pointer-events: none; }',
    '.cvm-box { position: absolute; border: 1.5px solid; border-radius: 2px; opacity: 0; }',
    '.cvm-box.cvm-on { animation: cvmPop 0.25s ease-out forwards; }',
    '@keyframes cvmPop { 0% { opacity: 0; transform: scale(1.06); } 60% { opacity: 1; } 100% { opacity: 1; transform: none; } }',
    '.cvm-tag { position: absolute; top: -1.15rem; left: -1.5px; padding: 0 0.3rem; font-family: "Roboto Mono", monospace; font-size: 0.62rem; font-weight: 700; line-height: 1.1rem; color: #0f172a; white-space: nowrap; border-radius: 2px 2px 2px 0; }',
    '#cvm-hud { position: fixed; top: 0.75rem; left: 0.75rem; z-index: 119; min-width: 240px; padding: 0.6rem 0.8rem; background: rgba(15, 23, 42, 0.92); border: 1px solid #22d3ee; border-radius: 0.5rem; box-shadow: 0 0 24px rgba(34, 211, 238, 0.25); font-family: "Roboto Mono", monospace; font-size: 0.68rem; line-height: 1.6; color: #e2e8f0; }',
    '#cvm-hud .cvm-hud-title { display: flex; align-items: center; gap: 0.45rem; color: #22d3ee; font-weight: 700; letter-spacing: 0.06em; }',
    '#cvm-hud .cvm-rec { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: cvmBlink 1.1s steps(1) infinite; }',
    '@keyframes cvmBlink { 50% { opacity: 0.15; } }',
    '#cvm-hud .cvm-dim { color: #64748b; }',
    '#cvm-hud .cvm-val { color: #a3e635; }',
    '#cvm-close { position: absolute; top: 0.3rem; right: 0.45rem; border: none; background: none; color: #64748b; font-size: 0.8rem; cursor: pointer; pointer-events: auto; }',
    '#cvm-close:hover { color: #f43f5e; }',
    '#cvm-scan { position: fixed; left: 0; width: 100%; height: 3px; z-index: 118; background: linear-gradient(90deg, transparent, #22d3ee, transparent); box-shadow: 0 0 18px 4px rgba(34, 211, 238, 0.55); animation: cvmSweep 1.3s ease-in-out forwards; pointer-events: none; }',
    '@keyframes cvmSweep { from { top: -1%; } to { top: 101%; } }',
    '#cvm-grid { position: fixed; inset: 0; z-index: 98; pointer-events: none; background-image: linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px); background-size: 48px 48px; }',
    '.cvm-cross-x, .cvm-cross-y { position: fixed; z-index: 99; pointer-events: none; background: rgba(34, 211, 238, 0.35); }',
    '.cvm-cross-x { left: 0; width: 100%; height: 1px; }',
    '.cvm-cross-y { top: 0; height: 100%; width: 1px; }',
    '.cvm-cross-label { position: fixed; z-index: 99; pointer-events: none; font-family: "Roboto Mono", monospace; font-size: 0.6rem; color: #22d3ee; background: rgba(15, 23, 42, 0.85); padding: 0 0.25rem; border-radius: 2px; }'
  ].join('\n');

  // Confianza pseudo-aleatoria pero estable por detección
  function conf(i) {
    return (0.62 + (((i + 7) * 2654435761 % 1000) / 1000) * 0.37).toFixed(2);
  }

  function visible(el) {
    if (!el.offsetParent && el.tagName !== 'BODY') return false;
    var r = el.getBoundingClientRect();
    return r.width > 14 && r.height > 9;
  }

  function collect() {
    var found = [];
    var seen = {};
    function add(el, label) {
      if (!visible(el)) return;
      if (el.closest('#cvm-hud, #cvm-boxes, #cmdk-overlay, #term-overlay')) return;
      var r = el.getBoundingClientRect();
      var key = [Math.round(r.left / 6), Math.round((r.top + window.scrollY) / 6), Math.round(r.width / 6), Math.round(r.height / 6)].join('|');
      if (seen[key]) return;
      seen[key] = true;
      found.push({ label: label, x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height, vy: r.top });
    }
    function grab(sel, label, cap) {
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length && cap > 0; i++) {
        var before = found.length;
        add(els[i], label);
        if (found.length > before) cap--;
      }
    }
    grab('img', 'image', 12);
    // La foto de perfil se "detecta" como persona
    found.forEach(function (d) {
      if (d.label === 'image' && d.w > 80 && d.h > 80 && d.y < 1200) d.label = 'person';
    });
    grab('h1, h2, h3', 'heading', 25);
    grab('button:not(.cmdk-item)', 'button', 14);
    grab('pre', 'code_block', 10);
    grab('main a[href]', 'hyperlink', 30);
    grab('main i[class*="fa-"]', 'icon', 20);
    grab('main p', 'text', 16);
    return found.slice(0, 110);
  }

  function buildBoxes() {
    if (boxLayer) boxLayer.remove();
    boxLayer = document.createElement('div');
    boxLayer.id = 'cvm-boxes';
    boxLayer.style.height = document.documentElement.scrollHeight + 'px';
    var dets = collect();
    var vh = window.innerHeight;
    dets.forEach(function (d, i) {
      var color = CLASS_COLORS[d.label] || '#22d3ee';
      var box = document.createElement('div');
      box.className = 'cvm-box';
      box.style.cssText = 'left:' + d.x + 'px;top:' + d.y + 'px;width:' + d.w + 'px;height:' + d.h + 'px;border-color:' + color + ';box-shadow:0 0 10px ' + color + '33, inset 0 0 6px ' + color + '1a;';
      var tag = document.createElement('span');
      tag.className = 'cvm-tag';
      tag.style.background = color;
      tag.textContent = d.label + ' ' + conf(i);
      box.appendChild(tag);
      // Cada caja aparece cuando el barrido pasa por su posición en pantalla
      var delay = REDUCED ? 0 : Math.max(0, Math.min(d.vy / vh, 1)) * 1.2 + 0.1;
      box.style.animationDelay = delay.toFixed(2) + 's';
      boxLayer.appendChild(box);
      requestAnimationFrame(function () { box.classList.add('cvm-on'); });
    });
    document.body.appendChild(boxLayer);
    return dets.length;
  }

  function buildHud(count) {
    hud = document.createElement('div');
    hud.id = 'cvm-hud';
    hud.innerHTML =
      '<button id="cvm-close" aria-label="Salir de CV Mode">✕</button>' +
      '<div class="cvm-hud-title"><span class="cvm-rec"></span>CV MODE — LIVE</div>' +
      '<div><span class="cvm-dim">model:</span> juanma-yolov8n.pt</div>' +
      '<div><span class="cvm-dim">objects:</span> <span class="cvm-val">' + count + '</span>' +
      ' <span class="cvm-dim">· fps:</span> <span class="cvm-val" id="cvm-fps">47</span>' +
      ' <span class="cvm-dim">· inf:</span> <span class="cvm-val" id="cvm-inf">11ms</span></div>' +
      '<div class="cvm-dim">ESC para salir</div>';
    document.body.appendChild(hud);
    hud.querySelector('#cvm-close').addEventListener('click', deactivate);
    var fps = hud.querySelector('#cvm-fps');
    var inf = hud.querySelector('#cvm-inf');
    hudTimer = setInterval(function () {
      fps.textContent = 42 + Math.floor(Math.random() * 16);
      inf.textContent = (8 + Math.floor(Math.random() * 14)) + 'ms';
    }, 700);
  }

  function buildCrosshair() {
    if (!FINE_POINTER) return;
    crosshair = document.createElement('div');
    crosshair.innerHTML =
      '<div class="cvm-cross-x"></div><div class="cvm-cross-y"></div><div class="cvm-cross-label"></div>';
    document.body.appendChild(crosshair);
    document.addEventListener('mousemove', onMove);
  }

  function onMove(e) {
    if (!crosshair) return;
    crosshair.children[0].style.top = e.clientY + 'px';
    crosshair.children[1].style.left = e.clientX + 'px';
    var label = crosshair.children[2];
    label.style.left = (e.clientX + 10) + 'px';
    label.style.top = (e.clientY + 10) + 'px';
    label.textContent = '(' + e.clientX + ', ' + e.clientY + ')';
  }

  function onKey(e) {
    if (e.key === 'Escape' && active) deactivate();
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (active) buildBoxes(); }, 250);
  }

  function activate() {
    if (active) return;
    active = true;
    styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    var grid = document.createElement('div');
    grid.id = 'cvm-grid';
    document.body.appendChild(grid);

    if (!REDUCED) {
      var scan = document.createElement('div');
      scan.id = 'cvm-scan';
      document.body.appendChild(scan);
      setTimeout(function () { scan.remove(); }, 1500);
    }

    var count = buildBoxes();
    buildHud(count);
    buildCrosshair();
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
  }

  function deactivate() {
    if (!active) return;
    active = false;
    clearInterval(hudTimer);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('mousemove', onMove);
    window.removeEventListener('resize', onResize);
    ['cvm-hud', 'cvm-boxes', 'cvm-grid', 'cvm-scan'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    if (crosshair) { crosshair.remove(); crosshair = null; }
    if (styleEl) { styleEl.remove(); styleEl = null; }
  }

  window.toggleCvMode = function () { active ? deactivate() : activate(); };

  // Disparador secreto: escribir "yolo" en cualquier parte de la página
  var buffer = '';
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-4);
    if (buffer === 'yolo') {
      buffer = '';
      window.toggleCvMode();
    }
  });
})();
