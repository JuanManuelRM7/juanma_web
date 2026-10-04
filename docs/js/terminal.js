// Terminal easter egg (⌘K → "Abrir terminal"). Site data is injected by
// layouts/partials/terminal.html as window.__terminalData (built from config.yaml, both languages);
// UI strings come from i18n/*.yaml through window.__i18n and follow the ES/EN toggle.
(function () {
  var overlay = document.getElementById('term-overlay');
  var output = document.getElementById('term-output');
  var input = document.getElementById('term-input');
  var body = document.getElementById('term-body');
  if (!overlay) return;

  var data = window.__terminalData || {};
  var base = data.base || '/';
  var history = [];
  var histIdx = -1;

  function esc(s) { return String(s).replace(/</g, '&lt;'); }

  var HELP = '<span class="term-accent">help</span>';
  function lang() { return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'es'; }
  // UI string in the current language; {help} becomes the highlighted command name
  function tr(key) {
    var s = ((window.__i18n || {})[lang()] || {})[key];
    return esc(s === undefined ? key : s).replace('{help}', HELP);
  }
  // Profile data in the current language
  function profile() { return (data.byLang || {})[lang()] || {}; }

  function banner() {
    return '<span class="term-accent">     ██╗███╗   ███╗</span>\n' +
      '<span class="term-accent">     ██║████╗ ████║</span>   Juan Manuel Ruiz\n' +
      '<span class="term-accent">     ██║██╔████╔██║</span>   ' + esc(profile().headline || 'ML Engineer · Computer Vision & LLMs') + '\n' +
      '<span class="term-accent">██   ██║██║╚██╔╝██║</span>   Physicist &amp; Mathematician\n' +
      '<span class="term-accent">╚█████╔╝██║ ╚═╝ ██║</span>\n' +
      '<span class="term-accent"> ╚════╝ ╚═╝     ╚═╝</span>\n\n' +
      tr('term_hint') + '\n';
  }

  var commands = {
    help: function () {
      return ['whoami', 'projects', 'skills', 'cv', 'blog', 'contact', 'neofetch', 'yolo', 'clear', 'exit'].map(function (c) {
        return '<span class="term-accent">' + c + '</span>' + new Array(13 - c.length).join(' ') + tr('term_help_' + c);
      }).join('\n');
    },
    whoami: function () {
      return esc(profile().whoami || '');
    },
    projects: function () {
      var lines = (profile().projects || []).map(function (p) {
        return '• ' + esc(p.title) + '  <span class="term-output-cmd">(' + esc(p.tech) + ')</span>';
      });
      lines.push('', tr('term_more') + ' <a href="' + (profile().projectsUrl || base + 'proyectos/') + '">' + tr('term_projects_page') + '</a>.');
      return lines.join('\n');
    },
    skills: function () {
      return (profile().skills || []).map(function (c) { return esc(c.name) + ': ' + esc(c.items); }).join('\n');
    },
    cv: function () {
      window.open(base + 'cv.pdf', '_blank');
      return tr('term_opening_cv');
    },
    blog: function () {
      window.location.href = base + 'blog/';
      return tr('term_going_blog');
    },
    contact: function () {
      return (data.social || []).filter(function (s) { return s.title !== 'Instagram'; }).map(function (s) {
        var key = (s.title || '').toLowerCase();
        var pad = key.length < 9 ? new Array(10 - key.length).join(' ') : ' ';
        var external = /^https?:/.test(s.url) ? ' target="_blank" rel="noopener"' : '';
        return esc(key) + ':' + pad + '<a href="' + s.url + '"' + external + '>' + esc(s.label || s.url) + '</a>';
      }).join('\n');
    },
    neofetch: function () {
      var theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      return banner() +
        '<span class="term-accent">OS:</span> juanmanuel.petrer.eu\n' +
        '<span class="term-accent">Host:</span> GitHub Pages\n' +
        '<span class="term-accent">Shell:</span> Hugo + Tailwind + vanilla JS\n' +
        '<span class="term-accent">Theme:</span> ' + theme + '\n' +
        '<span class="term-accent">Uptime:</span> ' + tr('term_uptime');
    },
    yolo: function () {
      if (window.toggleCvMode) {
        close();
        window.toggleCvMode();
        return null;
      }
      return '<span class="term-warn">' + tr('term_no_cvmode') + '</span>';
    },
    pwd: function () { return '/home/juanma/web'; },
    ls: function () { return 'experiencia/  educacion/  publicaciones/  proyectos/  blog/  cv.pdf'; },
    date: function () { return new Date().toString(); },
    sudo: function () { return '<span class="term-warn">juanma is not in the sudoers file. This incident will be reported.</span> 😏'; },
    echo: function (args) { return esc(args.join(' ')); },
    clear: function () { output.innerHTML = ''; return null; },
    exit: function () { close(); return null; }
  };

  function print(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    div.style.whiteSpace = 'pre-wrap';
    output.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function exec(line) {
    print('<span class="term-prompt">juanma@web:~$</span> <span class="term-output-cmd">' + esc(line) + '</span>');
    var parts = line.trim().split(/\s+/);
    var cmd = parts[0].toLowerCase();
    if (!cmd) return;
    var fn = commands[cmd];
    if (fn) {
      var out = fn(parts.slice(1));
      if (out !== null) print(out + '\n');
    } else {
      print('zsh: command not found: ' + esc(cmd) + '. ' + tr('term_try_help') + '\n');
    }
  }

  function open() {
    overlay.hidden = false;
    if (!output.innerHTML) print(banner());
    input.focus();
  }
  function close() { overlay.hidden = true; }
  window.openTerminal = open;
  window.closeTerminal = close;

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var line = input.value;
      input.value = '';
      if (line.trim()) { history.push(line); histIdx = history.length; }
      exec(line);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
      else { histIdx = history.length; input.value = ''; }
    } else if (e.key === 'Escape') {
      close();
    }
  });

  body.addEventListener('click', function () { input.focus(); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  // Focus trap: the input is the only focus target inside the terminal
  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!overlay.hidden && e.key === 'Escape') close();
  });
})();
