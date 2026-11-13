// Maquetas animadas del caso de estudio de Vector (layouts/proyectos/vector.html).
// - Dibuja los calendarios de entrenos (datos de ejemplo).
// - «Tu día»: la flecha avanza según se cumplen objetivos.
// - Plan de carrera: tres escenarios, en bucle o a mano.
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

  // ---- Plan de carrera
  var run = document.querySelector('[data-vx-run]');
  if (run) {
    var scenarios = [];
    try { scenarios = JSON.parse(run.getAttribute('data-vx-run')) || []; } catch (e) { scenarios = []; }
    var hrLabel = run.getAttribute('data-vx-hr') || '';
    var q = function (sel) { return run.querySelector(sel); };
    var buttons = run.querySelectorAll('[data-vx-scn]');
    var banner = q('[data-vx-banner]'), bannerTimer = null, current = 0;
    function show(i, withBanner) {
      var s = scenarios[i]; if (!s) return;
      current = i;
      q('[data-vx-pace]').textContent = s.pace;
      q('[data-vx-hrv]').textContent = s.hr;
      q('[data-vx-zone]').textContent = hrLabel + ' · ' + s.zone;
      var delta = q('[data-vx-delta]'); delta.textContent = s.delta; delta.classList.toggle('is-good', !!s.good);
      for (var k = 0; k < buttons.length; k++) buttons[k].setAttribute('aria-pressed', String(k === i));
      clearTimeout(bannerTimer); banner.classList.remove('is-on');
      if (s.title && withBanner) {
        q('[data-vx-bt]').textContent = s.title; q('[data-vx-bv]').textContent = s.value; q('[data-vx-bx]').textContent = s.detail;
        banner.classList.add('is-on');
        bannerTimer = setTimeout(function () { banner.classList.remove('is-on'); }, 3200);
      }
    }
    var loop = whileVisible(run, 5200, function () { show((current + 1) % scenarios.length, true); });
    [].forEach.call(buttons, function (b, i) {
      b.addEventListener('click', function () { show(i, true); loop.restart(); });
    });
  }
})();
