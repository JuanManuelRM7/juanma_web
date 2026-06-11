// Generates static/og-image.png (1200x630) with the site's hero aesthetic.
// Run: node scripts/generate-og-image.mjs  (needs `npm i --no-save sharp`)
import sharp from 'sharp';

// Deterministic pseudo-random so the image is reproducible between runs
let seed = 42;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const W = 1200, H = 630;
const nodes = Array.from({ length: 42 }, () => ({
  x: rand() * W,
  y: rand() * H,
  r: 1.5 + rand() * 2.5,
}));

let net = '';
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 200) {
      net += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="rgba(103,232,249,${(0.22 * (1 - d / 200)).toFixed(3)})" stroke-width="1"/>`;
    }
  }
}
for (const n of nodes) {
  net += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="rgba(165,243,252,0.55)"/>`;
}

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
  ${net}
  <rect x="80" y="382" width="120" height="6" rx="3" fill="url(#accent)"/>
  <text x="80" y="300" font-family="Helvetica, Arial, sans-serif" font-size="74" font-weight="bold" fill="#ffffff">Juan Manuel Ruiz</text>
  <text x="80" y="360" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#a5f3fc">ML Engineer · Computer Vision · Physicist &amp; Mathematician</text>
  <text x="80" y="560" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#cbd5e1">juanmanuel.petrer.eu</text>
</svg>`;

await sharp(Buffer.from(svg), { density: 96 }).png().toFile('static/og-image.png');
console.log('OK static/og-image.png');
