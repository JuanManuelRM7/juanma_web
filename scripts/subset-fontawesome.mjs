// Subsets Font Awesome to only the icons this site uses, replacing the full
// 384KB self-hosted build with a few KB. Re-run after adding new icons
// (update USED below — `grep -rhoE '\bfa[bsr]? fa-[a-z0-9-]+' layouts/ config.yaml`).
// Run: npm i --no-save fontawesome-subset @fortawesome/fontawesome-free && node scripts/subset-fontawesome.mjs
import { fontawesomeSubset } from 'fontawesome-subset';
import { readFileSync, writeFileSync } from 'fs';

// Icon names as written in the markup (FA5 names allowed)
const USED = {
  solid: [
    'arrow-right', 'book', 'book-open', 'briefcase', 'calendar-alt', 'check',
    'check-circle', 'chevron-circle-left', 'chevron-circle-right', 'chevron-right',
    'chevron-up', 'clapperboard', 'cloud-sun', 'cloud-sun-rain', 'code', 'cogs',
    'comments', 'copy', 'envelope', 'eye', 'file-alt', 'file-download', 'flask',
    'font', 'globe', 'graduation-cap', 'home', 'laptop-code', 'list-ul',
    'microphone', 'moon', 'network-wired', 'newspaper', 'project-diagram',
    'random', 'robot', 'rss', 'search', 'shield-alt', 'spinner', 'star', 'sun',
    'terminal', 'times', 'user', 'wind',
  ],
  regular: ['calendar-alt', 'clock'],
  brands: ['github', 'instagram', 'linkedin-in', 'orcid'],
};

// Resolve FA5 alias names to canonical names + unicode via metadata
// (icon-families.json since FA 6.6+; before that it was icons.json)
const meta = JSON.parse(
  readFileSync('node_modules/@fortawesome/fontawesome-free/metadata/icon-families.json', 'utf8')
);
const aliasMap = {}; // any name -> { canonical, unicode }
for (const [name, info] of Object.entries(meta)) {
  const entry = { canonical: name, unicode: info.unicode };
  aliasMap[name] = entry;
  for (const alias of info.aliases?.names ?? []) aliasMap[alias] = entry;
}

const resolved = {};
const cssRules = [];
for (const [style, names] of Object.entries(USED)) {
  resolved[style] = [];
  for (const name of names) {
    const entry = aliasMap[name];
    if (!entry) throw new Error(`Icono desconocido: ${name}`);
    resolved[style].push(entry.canonical);
    cssRules.push(`.fa-${name}:before{content:"\\${entry.unicode}"}`);
    if (entry.canonical !== name) cssRules.push(`.fa-${entry.canonical}:before{content:"\\${entry.unicode}"}`);
  }
}

await fontawesomeSubset(resolved, 'static/fontawesome/webfonts', {
  targetFormats: ['woff2'],
});

// Bump FONT_VER whenever the subset changes, to bust caches on the fixed
// woff2 filenames (the preload links in head.html must use the same value).
const FONT_VER = '2';
const css = `/* Font Awesome 6 Free subset — generado por scripts/subset-fontawesome.mjs */
@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:block;src:url(../webfonts/fa-solid-900.woff2?v=${FONT_VER}) format("woff2")}
@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:400;font-display:block;src:url(../webfonts/fa-regular-400.woff2?v=${FONT_VER}) format("woff2")}
@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:block;src:url(../webfonts/fa-brands-400.woff2?v=${FONT_VER}) format("woff2")}
.fa,.fas,.far,.fab,.fa-solid,.fa-regular,.fa-brands{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font-style:normal;font-variant:normal;line-height:1;text-rendering:auto}
.fa,.fas,.far,.fa-solid,.fa-regular{font-family:"Font Awesome 6 Free"}
.fa,.fas,.fa-solid{font-weight:900}
.far,.fa-regular{font-weight:400}
.fab,.fa-brands{font-family:"Font Awesome 6 Brands";font-weight:400}
${[...new Set(cssRules)].join('\n')}
`;
writeFileSync('static/fontawesome/css/all.min.css', css);
console.log(`OK: subset con ${Object.values(resolved).flat().length} iconos, CSS ${(css.length / 1024).toFixed(1)}KB`);
