// Neural network animation for the hero canvas.
// Nodes drift slowly, edges fade in/out with distance, and the cursor acts
// as an extra node that attracts connections. Skipped entirely when the
// user prefers reduced motion or on very small screens.
(function () {
  var canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove();
    return;
  }

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width = 0, height = 0;
  var nodes = [];
  var mouse = { x: null, y: null };
  var LINK_DIST = 130;
  var MOUSE_DIST = 180;
  var running = true;

  function nodeCount() {
    return Math.min(90, Math.max(30, Math.floor(width * height / 14000)));
  }

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var target = nodeCount();
    while (nodes.length < target) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.8
      });
    }
    nodes.length = target;
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.28 * (1 - dist / LINK_DIST)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if (mouse.x !== null) {
        var mdx = a.x - mouse.x, mdy = a.y - mouse.y;
        var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_DIST) {
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.45 * (1 - mdist / MOUSE_DIST)).toFixed(3) + ')';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  var hero = canvas.parentElement;
  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
  });

  // Pause when the hero is off-screen or the tab is hidden.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting && !document.hidden;
      if (visible && !running) { running = true; requestAnimationFrame(step); }
      else if (!visible) { running = false; }
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; }
    else { running = true; requestAnimationFrame(step); }
  });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(step);
})();
