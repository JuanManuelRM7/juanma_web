// Maquetas animadas del caso de estudio de Vector (layouts/proyectos/vector.html).
// - Dibuja los calendarios de entrenos (datos de ejemplo).
// - «Tu día»: la flecha avanza según se cumplen objetivos.
// - Plan de carrera: cuatro escenarios con su aviso a pantalla completa, en bucle o a mano.
// - Compartir con foto: los cuatro estilos de ruta, en bucle o a mano.
// Las animaciones solo corren con la maqueta a la vista y se quedan quietas con «reducir movimiento».
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Llama a tick() cada `ms` solo mientras `el` está en pantalla.
  function whileVisible(el, ms, tick) {
    if (reduce) return { restart: function () {} };
    var timer = null, visible = !('IntersectionObserver' in window);
    function start() { stop(); if (visible) timer = setInterval(tick, ms); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.25 }).observe(el);
    } else { start(); }
    return { restart: start };
  }

  // ---- Calendarios: 4 semanas (2 anteriores, la actual y la siguiente)
  var DAYS = [26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  var KIND = { 2: 'gym', 4: 'run', 9: 'run', 10: 'gym', 11: 'both', 13: 'run', 16: 'gym', 17: 'today', 20: 'plan', 23: 'plan', 25: 'plan', 27: 'plan' };
  var TODAY = 17;
  [].forEach.call(document.querySelectorAll('[data-vx-cal]'), function (el) {
    el.getAttribute('data-vx-cal').split(',').forEach(function (label) {
      var d = document.createElement('div'); d.className = 'vx-cal__wd'; d.textContent = label; el.appendChild(d);
    });
    DAYS.forEach(function (n, i) {
      var d = document.createElement('div');
      d.className = 'vx-cal__d' + (KIND[i] ? ' is-' + KIND[i] : (i < TODAY ? ' is-past' : ''));
      d.textContent = n; el.appendChild(d);
    });
  });

  // ---- «Tu día»
  var day = document.querySelector('[data-vx-day]');
  if (day) {
    var STEPS = [{ n: 2, f: 0.42 }, { n: 3, f: 0.58 }, { n: 4, f: 0.71 }, { n: 5, f: 0.86 }, { n: 6, f: 1 }];
    var step = 0;
    var done = day.querySelector('[data-vx-done]'), bar = day.querySelector('[data-vx-daybar]'), chips = day.querySelector('[data-vx-chips]').children;
    whileVisible(day, 2400, function () {
      step = (step + 1) % STEPS.length;
      var s = STEPS[step];
      done.textContent = s.n;
      bar.style.setProperty('--f', s.f);
      for (var k = 0; k < chips.length; k++) chips[k].classList.toggle('is-on', k < s.n);
    });
  }

  // ---- Plan de carrera: el reloj y, encima, el aviso a pantalla completa de cada escenario
  var run = document.querySelector('[data-vx-run]');
  if (run) {
    var scenarios = [];
    try { scenarios = JSON.parse(run.getAttribute('data-vx-run')) || []; } catch (e) { scenarios = []; }
    var hrLabel = run.getAttribute('data-vx-hr') || '';
    var q = function (sel) { return run.querySelector(sel); };
    var buttons = run.querySelectorAll('[data-vx-scn]');
    var banner = q('[data-vx-banner]'), bannerTimer = null, current = 0;
    // Los iconos del reloj (SF Symbols), dibujados a mano.
    var ICONS = {
      up: 'M12 3l7 8h-4.5v10h-5V11H5z',
      down: 'M12 21l-7-8h4.5V3h5v10H19z',
      heart: 'M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 10c0 5.8-8 11-8 11z',
      flag: 'M5 3h2v18H5zM8 4h11l-2.5 4.5L19 13H8z'
    };
    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }
    function icon(name) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', ICONS[name] || ''); svg.appendChild(path);
      return svg;
    }
    function value(b) {
      var v = el('div', 'vx-banner__v', b.value);
      if (b.unit) v.appendChild(el('small', null, b.unit));
      return v;
    }
    function chips(b) {
      var row = el('div', 'vx-banner__chips');
      (b.chips || []).forEach(function (c) { var s = el('span'); s.appendChild(icon(c.icon)); s.appendChild(document.createTextNode(c.v)); row.appendChild(s); });
      return row;
    }
    function fill(b) {
      banner.textContent = '';
      banner.className = 'vx-banner is-' + (b.tone || 'neutral') + (b.kind === 'summary' ? ' vx-banner--sum' : '');
      if (b.kind === 'summary') {
        var top = el('div', 'vx-banner__top', b.title); top.appendChild(el('small', null, b.corner || '')); banner.appendChild(top);
        var mid = el('div', 'vx-banner__mid'); mid.appendChild(value(b));
        if (b.note) mid.appendChild(el('div', 'vx-banner__n', b.note));
        banner.appendChild(mid); banner.appendChild(chips(b));
      } else {
        if (b.icon) banner.appendChild(icon(b.icon));
        banner.appendChild(el('div', 'vx-banner__h', b.headline));
        if (b.value) banner.appendChild(value(b));
        if (b.chips) banner.appendChild(chips(b));
        if (b.footnote) banner.appendChild(el('div', 'vx-banner__f', b.footnote));
      }
    }
    function show(i, withBanner) {
      var s = scenarios[i]; if (!s) return;
      current = i;
      q('[data-vx-pace]').textContent = s.pace;
      q('[data-vx-hrv]').textContent = s.hr;
      q('[data-vx-zone]').textContent = hrLabel + ' · ' + s.zone;
      var delta = q('[data-vx-delta]'); delta.textContent = s.delta; delta.classList.toggle('is-good', !!s.good);
      for (var k = 0; k < buttons.length; k++) buttons[k].setAttribute('aria-pressed', String(k === i));
      clearTimeout(bannerTimer); banner.classList.remove('is-on');
      if (s.banner && withBanner) {
        fill(s.banner);
        // Un fotograma después, para que se vea la transición.
        requestAnimationFrame(function () { banner.classList.add('is-on'); });
        if (!reduce) bannerTimer = setTimeout(function () { banner.classList.remove('is-on'); }, 3400);
      }
    }
    var loop = whileVisible(run, 5200, function () { show((current + 1) % scenarios.length, true); });
    [].forEach.call(buttons, function (b, i) {
      b.addEventListener('click', function () { show(i, true); loop.restart(); });
    });
  }
  // ---- Compartir con foto: Gigante, Relieve, Trazo y Sello
  var share = document.querySelector('[data-vx-share]');
  if (share) {
    var styleButtons = share.querySelectorAll('[data-vx-sty-btn]');
    var names = [].map.call(styleButtons, function (b) { return b.getAttribute('data-vx-sty-btn'); });
    var shown = 0;
    function showStyle(i) {
      shown = i;
      [].forEach.call(share.querySelectorAll('[data-vx-sty]'), function (g) {
        g.classList.toggle('is-on', g.getAttribute('data-vx-sty') === names[i]);
      });
      for (var k = 0; k < styleButtons.length; k++) styleButtons[k].setAttribute('aria-pressed', String(k === i));
    }
    var cycle = whileVisible(share, 3200, function () { showStyle((shown + 1) % names.length); });
    [].forEach.call(styleButtons, function (b, i) {
      b.addEventListener('click', function () { showStyle(i); cycle.restart(); });
    });
  }
})();
