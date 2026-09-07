// Command palette (⌘K). The static items are rendered by layouts/partials/command_palette.html;
// full-text results come from the Hugo JSON index at window.__cmdkIndexUrl (lazy-loaded).
(function () {
  var overlay = document.getElementById('cmdk-overlay');
  var input = document.getElementById('cmdk-input');
  var list = document.getElementById('cmdk-list');
  var empty = document.getElementById('cmdk-empty');
  if (!overlay || !input) return;

  var items = Array.prototype.slice.call(list.querySelectorAll('.cmdk-item'));
  var groups = Array.prototype.slice.call(list.querySelectorAll('[data-group]'));
  var activeIdx = -1;
  var contentBox = document.getElementById('cmdk-content-results');
  var searchIndex = null;
  var indexRequested = false;
  var indexUrl = window.__cmdkIndexUrl || '/index.json';

  function loadIndex() {
    if (indexRequested) return;
    indexRequested = true;
    fetch(indexUrl)
      .then(function (r) { return r.json(); })
      .then(function (data) { searchIndex = data; filter(input.value); })
      .catch(function () {});
  }

  // Full-text search over the Hugo-generated JSON index (lazy-loaded)
  function searchContent(q) {
    contentBox.innerHTML = '';
    if (!searchIndex || q.length < 3) return [];
    var staticUrls = items.map(function (el) { return el.dataset.target; });
    var results = searchIndex.filter(function (page) {
      if (staticUrls.indexOf(page.url) !== -1 && normalize(page.title).indexOf(q) !== -1) return false;
      return normalize(page.title + ' ' + page.tags.join(' ') + ' ' + page.content).indexOf(q) !== -1;
    }).slice(0, 6);
    if (!results.length) return [];
    var header = document.createElement('div');
    header.className = 'cmdk-group';
    header.textContent = 'Contenido';
    contentBox.appendChild(header);
    return results.map(function (page) {
      var idx = normalize(page.content).indexOf(q);
      var snippet = idx >= 0 ? page.content.substr(Math.max(0, idx - 30), 90).trim() : '';
      var btn = document.createElement('button');
      btn.className = 'cmdk-item';
      btn.dataset.action = 'goto';
      btn.dataset.target = page.url;
      btn.innerHTML = '<i class="fas fa-file-alt"></i><span></span>';
      btn.querySelector('span').innerHTML = page.title.replace(/</g, '&lt;') +
        (snippet ? ' <small style="opacity:0.6">— …' + snippet.replace(/</g, '&lt;') + '…</small>' : '');
      btn.addEventListener('click', function () { run(btn); });
      contentBox.appendChild(btn);
      return btn;
    });
  }

  function open() {
    overlay.hidden = false;
    input.value = '';
    filter('');
    input.focus();
    loadIndex();
  }
  function close() {
    overlay.hidden = true;
    activeIdx = -1;
  }
  window.openCmdk = open;

  function visibleItems() {
    return Array.prototype.slice.call(list.querySelectorAll('.cmdk-item')).filter(function (el) { return !el.hidden; });
  }

  function normalize(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function filter(q) {
    q = normalize(q.trim());
    items.forEach(function (el) {
      var haystack = normalize(el.textContent + ' ' + (el.dataset.keywords || ''));
      el.hidden = q !== '' && haystack.indexOf(q) === -1;
    });
    // Hide group headers with no visible items before the next header
    groups.forEach(function (g) {
      var sib = g.nextElementSibling, any = false;
      while (sib && !sib.hasAttribute('data-group')) {
        if (sib.classList.contains('cmdk-item') && !sib.hidden) { any = true; break; }
        sib = sib.nextElementSibling;
      }
      g.hidden = !any;
    });
    searchContent(q);
    empty.hidden = visibleItems().length > 0;
    setActive(q === '' ? -1 : 0);
  }

  function setActive(idx) {
    var vis = visibleItems();
    Array.prototype.forEach.call(list.querySelectorAll('.cmdk-item'), function (el) { el.classList.remove('active'); });
    activeIdx = Math.max(-1, Math.min(idx, vis.length - 1));
    if (activeIdx >= 0) {
      vis[activeIdx].classList.add('active');
      vis[activeIdx].scrollIntoView({ block: 'nearest' });
    }
  }

  function run(el) {
    var action = el.dataset.action, target = el.dataset.target;
    close();
    if (action === 'goto') {
      window.location.href = target;
    } else if (action === 'open') {
      window.open(target, '_blank', 'noopener');
    } else if (action === 'theme' && typeof toggleTheme === 'function') {
      toggleTheme();
    } else if (action === 'lang' && window.toggleLang) {
      window.toggleLang();
    } else if (action === 'copy-email') {
      navigator.clipboard.writeText('juanmanuelruiz383@gmail.com');
    } else if (action === 'terminal' && window.openTerminal) {
      window.openTerminal();
    } else if (action === 'cvmode' && window.toggleCvMode) {
      window.toggleCvMode();
    }
  }

  items.forEach(function (el) {
    el.addEventListener('click', function () { run(el); });
  });

  input.addEventListener('input', function () { filter(input.value); });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.hidden ? open() : close();
      return;
    }
    if (overlay.hidden) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); }
    else if (e.key === 'Enter') {
      var vis = visibleItems();
      var el = activeIdx >= 0 ? vis[activeIdx] : vis[0];
      if (el) { e.preventDefault(); run(el); }
    }
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  // Focus trap: keep Tab cycling inside the dialog while open
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusables = [input].concat(visibleItems());
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
