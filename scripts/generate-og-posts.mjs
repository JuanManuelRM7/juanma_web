// Generates static/og/<slug>.png (1200x630) for every blog post, using the
// same aesthetic as the main og-image. Re-run when adding posts.
// Run: npm i --no-save sharp && node scripts/generate-og-posts.mjs
import sharp from 'sharp';
import { readdirSync, readFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const W = 1200, H = 630;
const BLOG_DIR = 'content/blog';
const OUT_DIR = 'static/og';
mkdirSync(OUT_DIR, { recursive: true });

// Deterministic background net, same seed/look as the main OG image
function buildNet() {
  let seed = 42;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const nodes = Array.from({ length: 42 }, () => ({ x: rand() * W, y: rand() * H, r: 1.5 + rand() * 2.5 }));
  let net = '';
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 200) net += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="rgba(103,232,249,${(0.18 * (1 - d / 200)).toFixed(3)})" stroke-width="1"/>`;
    }
  }
  for (const n of nodes) net += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="rgba(165,243,252,0.45)"/>`;
  return net;
}

const NET = buildNet();

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Greedy wrap to lines that fit the card at the chosen font size
function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

const posts = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'));

for (const file of posts) {
  const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
  const m = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (!m) { console.warn(`skip ${file}: no title`); continue; }
  const title = m[1];
  const slug = basename(file, '.md');

  const lines = wrap(title, 30);
  const fontSize = lines.length > 2 ? 52 : 60;
  const lineHeight = fontSize * 1.25;
  const startY = 320 - ((lines.length - 1) * lineHeight) / 2;
  const titleSvg = lines
    .map((l, i) => `<text x="80" y="${(startY + i * lineHeight).toFixed(0)}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff">${escapeXml(l)}</text>`)
    .join('');

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="55%" stop-color="#164e63"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22d3ee"/>
        <stop offset="100%" stop-color="#6366f1"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${NET}
    <text x="80" y="160" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#a5f3fc">Juan Manuel Ruiz · Blog</text>
    ${titleSvg}
    <rect x="80" y="${(startY + (lines.length - 0.4) * lineHeight).toFixed(0)}" width="120" height="6" rx="3" fill="url(#accent)"/>
    <text x="80" y="560" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#cbd5e1">juanmanuel.petrer.eu</text>
  </svg>`;

  await sharp(Buffer.from(svg), { density: 96 }).png().toFile(join(OUT_DIR, `${slug}.png`));
  console.log(`OK ${OUT_DIR}/${slug}.png — ${title}`);
}
