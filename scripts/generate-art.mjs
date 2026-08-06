/**
 * Generador de arte vectorial propio para Lo Más Cute.
 *
 * Produce el decorado de la marca —categorías, composiciones editoriales, la
 * imagen de Open Graph y el favicon— en SVG pastel. Al ser vectoriales y
 * locales: pesan poco, se ven nítidos en pantallas ultrawide y no dependen de
 * ningún CDN externo.
 *
 * No genera arte de producto: las imágenes de cada ficha se suben desde el
 * panel y viven en Storage. Un catálogo de ejemplo aquí volvería a meter
 * productos inventados en el proyecto.
 *
 *   node scripts/generate-art.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ART = path.join(root, "public", "art");

const W = 1000;
const H = 1250;

/* ---------------------------------------------------------------- paletas */
const P = {
  rose: { base: "#F8B6C8", deep: "#E38FA8", light: "#FCD6E2", mist: "#FDEAF1", accent: "#F4D58D" },
  mint: { base: "#BFDCD5", deep: "#95BFB5", light: "#DCEBE7", mist: "#EBF5F2", accent: "#F8B6C8" },
  lav: { base: "#DCCEF5", deep: "#B7A2E2", light: "#ECE5FB", mist: "#F5F1FD", accent: "#BFDCD5" },
  peach: { base: "#F7D7C4", deep: "#E5B192", light: "#FBE9E0", mist: "#FDF4EF", accent: "#DCCEF5" },
  gold: { base: "#F4D58D", deep: "#D9B25C", light: "#FAEAC6", mist: "#FCF5E4", accent: "#F8B6C8" },
};

/* ------------------------------------------------------------- utilidades */
const rnd = (seed) => {
  // PRNG determinista: mismo producto -> mismo arte en cada build
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

const hash = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) % 2147483647;
  return h;
};

const sparkle = (x, y, r, color, op = 0.9) => `
  <path d="M ${x} ${y - r} Q ${x + r * 0.16} ${y - r * 0.16} ${x + r} ${y}
           Q ${x + r * 0.16} ${y + r * 0.16} ${x} ${y + r}
           Q ${x - r * 0.16} ${y + r * 0.16} ${x - r} ${y}
           Q ${x - r * 0.16} ${y - r * 0.16} ${x} ${y - r} Z"
        fill="${color}" opacity="${op}"/>`;

const heart = (x, y, s, color, op = 1, rot = 0) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s / 100})" opacity="${op}">
    <path d="M0 34 C -30 8 -46 -8 -46 -28 C -46 -46 -32 -58 -17 -58 C -7 -58 0 -52 0 -44
             C 0 -52 7 -58 17 -58 C 32 -58 46 -46 46 -28 C 46 -8 30 8 0 34 Z" fill="${color}"/>
  </g>`;

const flower = (x, y, s, petal, heartC, op = 1, rot = 0) => {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    petals += `<ellipse cx="0" cy="-26" rx="15" ry="24" fill="${petal}" transform="rotate(${i * 72})"/>`;
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s / 100})" opacity="${op}">
    ${petals}<circle r="11" fill="${heartC}"/></g>`;
};

const defs = (p) => `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFFBF9"/>
    <stop offset="0.55" stop-color="${p.mist}"/>
    <stop offset="1" stop-color="${p.light}"/>
  </linearGradient>
  <radialGradient id="bloom">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="bloom2">
    <stop offset="0" stop-color="${p.base}" stop-opacity="0.4"/>
    <stop offset="1" stop-color="${p.base}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="body" x1="0" y1="0" x2="1" y2="0.2">
    <stop offset="0" stop-color="${p.deep}"/>
    <stop offset="0.28" stop-color="${p.base}"/>
    <stop offset="0.52" stop-color="#FFFFFF" stop-opacity="0.92"/>
    <stop offset="0.72" stop-color="${p.base}"/>
    <stop offset="1" stop-color="${p.deep}"/>
  </linearGradient>
  <linearGradient id="cap" x1="0" y1="0" x2="1" y2="0.3">
    <stop offset="0" stop-color="${p.accent}" stop-opacity="0.95"/>
    <stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0.9"/>
    <stop offset="1" stop-color="${p.accent}"/>
  </linearGradient>
  <linearGradient id="cream" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/>
    <stop offset="1" stop-color="${p.light}"/>
  </linearGradient>
  <linearGradient id="glassg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.85"/>
    <stop offset="0.5" stop-color="${p.light}" stop-opacity="0.7"/>
    <stop offset="1" stop-color="${p.base}" stop-opacity="0.55"/>
  </linearGradient>
  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="shadow">
    <stop offset="0" stop-color="${p.deep}" stop-opacity="0.4"/>
    <stop offset="1" stop-color="${p.deep}" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="9" result="b"/>
    <feComposite in="SourceGraphic" in2="b" operator="over"/>
  </filter>
</defs>`;

  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#shadow)"/>`;

const highlight = (x, y, w, h, r = 40, op = 0.55) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gloss)" opacity="${op}"/>`;

/* ------------------------------------------------------- familias de forma
   Cada familia recibe (p, view) y devuelve el objeto centrado. */

const shapes = {
  /** Labial en bala */
  lipstick(p) {
    return `
    <g>
      <rect x="415" y="352" width="170" height="470" rx="34" fill="url(#body)"/>
      ${highlight(447, 380, 40, 410, 20, 0.5)}
      <rect x="404" y="330" width="192" height="52" rx="26" fill="url(#cap)"/>
      <rect x="430" y="300" width="140" height="46" rx="22" fill="${p.light}"/>
      <path d="M430 306 h140 v-92 a70 70 0 0 0 -140 0 Z" fill="${p.deep}" opacity="0.15"/>
      <path d="M434 300 c0 -74 22 -128 54 -150 c30 -20 78 8 78 66 c0 40 -14 70 -30 84 Z"
            fill="${p.deep}"/>
      <path d="M452 288 c2 -62 20 -104 44 -122 c16 -12 34 2 36 26 c2 34 -16 74 -34 96 Z"
            fill="#FFFFFF" opacity="0.35"/>
      <rect x="415" y="600" width="170" height="16" rx="8" fill="#FFFFFF" opacity="0.55"/>
    </g>`;
  },

  /** Tubo con tapa larga (gloss, máscara, corrector) */
  tube(p, view) {
    const brush =
      view === 1
        ? `<g transform="translate(742 300) rotate(14)">
             <rect x="-9" y="0" width="18" height="150" rx="9" fill="${p.deep}"/>
             <ellipse cx="0" cy="190" rx="34" ry="52" fill="${p.base}"/>
             <ellipse cx="-10" cy="180" rx="12" ry="26" fill="#FFFFFF" opacity="0.4"/>
             <rect x="-46" y="-56" width="92" height="66" rx="30" fill="url(#cap)"/>
           </g>`
        : "";
    return `
    <g>
      ${brush}
      <rect x="428" y="392" width="150" height="452" rx="72" fill="url(#glassg)"/>
      <rect x="446" y="470" width="114" height="360" rx="56" fill="${p.base}" opacity="0.85"/>
      ${highlight(462, 436, 34, 380, 17, 0.6)}
      <rect x="418" y="250" width="170" height="168" rx="52" fill="url(#cap)"/>
      <rect x="446" y="272" width="36" height="120" rx="18" fill="#FFFFFF" opacity="0.5"/>
      <rect x="418" y="398" width="170" height="26" rx="13" fill="${p.deep}" opacity="0.35"/>
      ${heart(503, 700, 62, "#FFFFFF", 0.6)}
    </g>`;
  },

  /** Compacto redondo abierto (rubor, iluminador, espejo) */
  compact(p, view) {
    const mirror =
      view === 2
        ? `<g transform="translate(408 336) rotate(-12)">
             <circle r="176" fill="${p.light}"/>
             <circle r="150" fill="url(#glassg)"/>
             <path d="M-150 0 a150 150 0 0 1 150 -150 l0 300 a150 150 0 0 1 -150 -150 Z"
                   fill="#FFFFFF" opacity="0.55"/>
             ${sparkle(-56, -60, 34, "#FFFFFF", 0.9)}
           </g>`
        : `<g transform="translate(408 336) rotate(-12)">
             <circle r="176" fill="${p.base}"/>
             <circle r="176" fill="url(#gloss)" opacity="0.5"/>
             <circle r="132" fill="${p.light}" opacity="0.8"/>
             ${flower(0, 0, 150, "#FFFFFF", p.accent, 0.85)}
           </g>`;
    return `
    <g>
      ${mirror}
      <g transform="translate(556 686)">
        <circle r="214" fill="url(#body)"/>
        <circle r="214" fill="url(#gloss)" opacity="0.35"/>
        <circle r="168" fill="${p.deep}" opacity="0.9"/>
        <circle r="168" fill="url(#gloss)" opacity="0.4"/>
        <ellipse cx="-52" cy="-58" rx="54" ry="34" fill="#FFFFFF" opacity="0.45"
                 transform="rotate(-24)"/>
      </g>
      <path d="M470 470 L556 500" stroke="${p.deep}" stroke-width="26" stroke-linecap="round"
            opacity="0.45"/>
    </g>`;
  },

  /** Paleta rectangular con godets */
  palette(p) {
    let pans = "";
    const tones = [p.base, p.light, p.deep, p.accent, "#FFFFFF", p.mist, p.base, p.accent];
    for (let i = 0; i < 8; i++) {
      const cx = 352 + (i % 4) * 100;
      const cy = 596 + Math.floor(i / 4) * 104;
      pans += `<rect x="${cx - 42}" y="${cy - 42}" width="84" height="84" rx="26"
                 fill="${tones[i]}" opacity="0.95"/>
               <rect x="${cx - 42}" y="${cy - 42}" width="84" height="40" rx="20"
                 fill="#FFFFFF" opacity="0.3"/>`;
    }
    return `
    <g>
      <rect x="268" y="286" width="464" height="230" rx="46" fill="${p.light}"/>
      <rect x="290" y="308" width="420" height="186" rx="34" fill="url(#glassg)"/>
      ${flower(500, 400, 120, "#FFFFFF", p.accent, 0.75)}
      <rect x="268" y="500" width="464" height="330" rx="46" fill="url(#body)"/>
      <rect x="290" y="522" width="420" height="286" rx="32" fill="${p.mist}"/>
      ${pans}
      ${highlight(290, 522, 420, 60, 30, 0.5)}
    </g>`;
  },

  /** Frasco con dosificador / bruma */
  bottle(p) {
    return `
    <g>
      <rect x="392" y="432" width="216" height="404" rx="56" fill="url(#glassg)"/>
      <rect x="392" y="560" width="216" height="276" rx="56" fill="${p.base}" opacity="0.72"/>
      ${highlight(420, 464, 40, 344, 20, 0.6)}
      <rect x="452" y="380" width="96" height="64" rx="18" fill="${p.deep}" opacity="0.5"/>
      <rect x="424" y="286" width="152" height="104" rx="36" fill="url(#cap)"/>
      <rect x="482" y="222" width="36" height="76" rx="18" fill="${p.deep}" opacity="0.6"/>
      <path d="M500 222 c-56 0 -96 -14 -96 -40 c0 -26 40 -40 96 -40 c56 0 96 14 96 40
               c0 26 -40 40 -96 40 Z" fill="${p.light}"/>
      <rect x="418" y="640" width="164" height="110" rx="22" fill="#FFFFFF" opacity="0.75"/>
      ${heart(500, 700, 52, p.deep, 0.4)}
    </g>`;
  },

  /** Frasco con gotero (serum, iluminador líquido) */
  dropper(p) {
    return `
    <g>
      <rect x="400" y="452" width="200" height="384" rx="46" fill="url(#glassg)"/>
      <rect x="400" y="572" width="200" height="264" rx="46" fill="${p.base}" opacity="0.68"/>
      ${highlight(428, 480, 36, 330, 18, 0.6)}
      <rect x="436" y="300" width="128" height="164" rx="30" fill="url(#cap)"/>
      <rect x="466" y="248" width="68" height="70" rx="26" fill="${p.deep}" opacity="0.45"/>
      <rect x="482" y="464" width="36" height="300" rx="18" fill="#FFFFFF" opacity="0.5"/>
      <ellipse cx="500" cy="770" rx="30" ry="42" fill="#FFFFFF" opacity="0.6"/>
      ${sparkle(596, 380, 40, "#FFFFFF", 0.85)}
      <rect x="418" y="660" width="164" height="96" rx="20" fill="#FFFFFF" opacity="0.7"/>
    </g>`;
  },

  /** Tarro bajo (bálsamo, crema) */
  jar(p) {
    return `
    <g>
      <rect x="330" y="520" width="340" height="290" rx="72" fill="url(#body)"/>
      <rect x="330" y="520" width="340" height="120" rx="60" fill="${p.light}"/>
      <ellipse cx="500" cy="536" rx="170" ry="52" fill="url(#cream)"/>
      <ellipse cx="500" cy="530" rx="128" ry="36" fill="${p.base}" opacity="0.35"/>
      ${highlight(360, 560, 60, 210, 30, 0.45)}
      ${flower(500, 700, 130, "#FFFFFF", p.accent, 0.7)}
      <ellipse cx="500" cy="806" rx="168" ry="30" fill="${p.deep}" opacity="0.25"/>
    </g>`;
  },

  /** Brochas suaves */
  brush(p, view) {
    const one = (x, rot, len, sc) => `
      <g transform="translate(${x} 560) rotate(${rot}) scale(${sc})">
        <rect x="-24" y="0" width="48" height="${len}" rx="24" fill="url(#body)"/>
        <rect x="-30" y="-46" width="60" height="60" rx="16" fill="url(#cap)"/>
        <path d="M-56 -46 c0 -96 22 -150 56 -150 c34 0 56 54 56 150 Z" fill="${p.light}"/>
        <path d="M-34 -60 c0 -74 14 -116 34 -116 c8 0 16 8 22 26 c-26 18 -44 52 -50 90 Z"
              fill="#FFFFFF" opacity="0.55"/>
      </g>`;
    return view === 0
      ? `<g>${one(500, 0, 300, 1.14)}</g>`
      : `<g>${one(340, -13, 250, 0.9)}${one(500, 0, 290, 1.05)}${one(660, 13, 250, 0.9)}</g>`;
  },

  /** Cosmetiquera / neceser acolchado */
  pouch(p) {
    return `
    <g>
      <path d="M280 470 h440 a76 76 0 0 1 76 76 v208 a76 76 0 0 1 -76 76 H280
               a76 76 0 0 1 -76 -76 V546 a76 76 0 0 1 76 -76 Z" fill="url(#body)"/>
      <path d="M204 574 h592" stroke="${p.light}" stroke-width="26" stroke-linecap="round"/>
      <circle cx="700" cy="574" r="30" fill="${p.light}"/>
      ${heart(700, 574, 34, p.deep, 0.7)}
      <path d="M330 470 c0 -70 76 -118 170 -118 s170 48 170 118" fill="none"
            stroke="${p.deep}" stroke-width="22" stroke-linecap="round" opacity="0.55"/>
      ${flower(360, 700, 120, "#FFFFFF", p.accent, 0.7, 12)}
      ${heart(600, 720, 90, "#FFFFFF", 0.55, -12)}
      ${highlight(230, 600, 540, 60, 30, 0.35)}
    </g>`;
  },

  /** Cuaderno / papelería */
  book(p) {
    return `
    <g>
      <rect x="300" y="330" width="410" height="520" rx="40" fill="${p.deep}" opacity="0.35"
            transform="rotate(-5 500 590)"/>
      <rect x="290" y="320" width="420" height="530" rx="42" fill="url(#body)"/>
      <rect x="290" y="320" width="66" height="530" rx="30" fill="${p.deep}" opacity="0.45"/>
      <rect x="392" y="392" width="252" height="330" rx="26" fill="#FFFFFF" opacity="0.72"/>
      ${flower(518, 500, 130, p.light, p.accent, 0.95)}
      <g stroke="${p.base}" stroke-width="12" stroke-linecap="round" opacity="0.8">
        <path d="M430 606 h228"/><path d="M430 654 h176"/><path d="M430 702 h206"/>
      </g>
      <g fill="${p.accent}">
        <rect x="316" y="356" width="18" height="60" rx="9"/>
        <rect x="316" y="470" width="18" height="60" rx="9"/>
        <rect x="316" y="584" width="18" height="60" rx="9"/>
      </g>
    </g>`;
  },

  /** Caja de regalo con moño */
  box(p) {
    return `
    <g>
      <rect x="286" y="472" width="428" height="348" rx="46" fill="url(#body)"/>
      <rect x="262" y="410" width="476" height="110" rx="42" fill="${p.light}"/>
      <rect x="466" y="410" width="68" height="410" rx="20" fill="#FFFFFF" opacity="0.7"/>
      <path d="M500 412 c-56 -92 -170 -104 -170 -34 c0 44 78 52 170 34 Z" fill="${p.accent}"/>
      <path d="M500 412 c56 -92 170 -104 170 -34 c0 44 -78 52 -170 34 Z" fill="${p.accent}"/>
      <circle cx="500" cy="404" r="34" fill="${p.base}"/>
      ${highlight(300, 500, 400, 60, 30, 0.4)}
      ${sparkle(760, 330, 44, p.accent, 0.9)}
      ${heart(250, 880, 74, p.base, 0.55, 14)}
    </g>`;
  },

  /** Frasco de perfume */
  flask(p) {
    return `
    <g>
      <path d="M330 520 c0 -60 46 -84 46 -128 v-42 h248 v42 c0 44 46 68 46 128 v210
               a92 92 0 0 1 -92 92 H422 a92 92 0 0 1 -92 -92 Z" fill="url(#glassg)"/>
      <path d="M330 640 v90 a92 92 0 0 0 92 92 h156 a92 92 0 0 0 92 -92 v-90 Z"
            fill="${p.base}" opacity="0.7"/>
      ${highlight(366, 546, 44, 260, 22, 0.55)}
      <rect x="376" y="286" width="248" height="72" rx="24" fill="${p.light}"/>
      <rect x="418" y="196" width="164" height="104" rx="40" fill="url(#cap)"/>
      <rect x="452" y="222" width="34" height="56" rx="17" fill="#FFFFFF" opacity="0.6"/>
      <ellipse cx="500" cy="700" rx="96" ry="60" fill="#FFFFFF" opacity="0.5"/>
      ${heart(500, 700, 66, p.deep, 0.35)}
    </g>`;
  },
};

/* ------------------------------------------------------- arte de categoría */
function categorySvg({ tone, motifs }) {
  const p = P[tone];
  const w = 900;
  const h = 1100;
  let deco = "";
  const r = rnd(hash(tone + motifs.join("")));
  for (let i = 0; i < 10; i++) {
    const x = 60 + r() * (w - 120);
    const y = 60 + r() * (h - 120);
    const pick = r();
    if (pick < 0.34) deco += sparkle(x, y, 14 + r() * 20, p.accent, 0.6 + r() * 0.4);
    else if (pick < 0.67) deco += heart(x, y, 24 + r() * 34, p.base, 0.5 + r() * 0.3, r() * 40 - 20);
    else deco += flower(x, y, 30 + r() * 44, "#FFFFFF", p.accent, 0.7, r() * 90);
  }
  const objects = motifs
    .map((m, i) => {
      const off = (i - (motifs.length - 1) / 2) * 200;
      const sc = i === Math.floor(motifs.length / 2) ? 0.62 : 0.5;
      return `<g transform="translate(${w / 2 + off} ${h * 0.58}) rotate(${(i - 1) * 9}) scale(${sc}) translate(${-W / 2} ${-H / 2})">${shapes[m](p, 0)}</g>`;
    })
    .join("");
  // defs() ya trae todos los gradientes; solo sumamos uno propio para el fondo
  // de categoría. Antes intentábamos recortar el gradiente "bg" con una regex
  // y el resultado era un SVG malformado que el navegador no renderizaba.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
${defs(p)}
<defs>
  <linearGradient id="catbg" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#FFFCFA"/><stop offset="0.5" stop-color="${p.mist}"/>
    <stop offset="1" stop-color="${p.base}" stop-opacity="0.55"/>
  </linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#catbg)"/>
<circle cx="${w * 0.5}" cy="${h * 0.44}" r="${w * 0.42}" fill="url(#bloom)"/>
${deco}
<ellipse cx="${w / 2}" cy="${h * 0.79}" rx="300" ry="46" fill="url(#shadow)"/>
${objects}
</svg>`;
}

const CATEGORIES = [
  { slug: "maquillaje", tone: "rose", motifs: ["lipstick", "compact", "tube"] },
  { slug: "skincare", tone: "mint", motifs: ["dropper", "jar", "bottle"] },
  { slug: "accesorios", tone: "lav", motifs: ["brush", "pouch", "compact"] },
  { slug: "perfumes", tone: "gold", motifs: ["flask", "bottle"] },
  { slug: "papeleria", tone: "lav", motifs: ["book", "box"] },
  { slug: "regalos", tone: "peach", motifs: ["box", "jar", "flask"] },
];

/* ------------------------------------------------------------- editorial */
/** Composiciones editoriales para Nosotros / Hero */
function editorialSvg(kind) {
  const p = kind === "b" ? P.mint : kind === "c" ? P.lav : P.rose;
  const w = 1200;
  const h = kind === "hero" ? 1200 : 900;
  const r = rnd(hash("edit" + kind));
  let deco = "";
  for (let k = 0; k < 18; k++) {
    const x = 40 + r() * (w - 80);
    const y = 40 + r() * (h - 80);
    const pick = r();
    if (pick < 0.4) deco += sparkle(x, y, 10 + r() * 22, P.gold.base, 0.4 + r() * 0.5);
    else if (pick < 0.72) deco += heart(x, y, 16 + r() * 34, P.rose.base, 0.35 + r() * 0.35, r() * 50 - 25);
    else deco += flower(x, y, 22 + r() * 46, "#FFFFFF", P.rose.base, 0.7, r() * 90);
  }
  const count = kind === "hero" ? 5 : 3;
  const cluster = ["lipstick", "compact", "flask", "palette", "jar", "brush"]
    .slice(0, count)
    .map((m, i) => {
      const tone = ["rose", "mint", "lav", "peach", "gold"][i % 5];
      const mid = (count - 1) / 2;
      const off = (i - mid) * (kind === "hero" ? 232 : 250);
      const scale = (kind === "hero" ? 0.62 : 0.58) + (i === Math.round(mid) ? 0.14 : 0);
      return `<g transform="translate(${w / 2 + off} ${h * (kind === "hero" ? 0.55 : 0.58)}) rotate(${(i - mid) * 7}) scale(${scale}) translate(${-W / 2} ${-H / 2})">${shapes[m](P[tone], 0)}</g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
${defs(p)}
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<circle cx="${w * 0.42}" cy="${h * 0.4}" r="${w * 0.36}" fill="url(#bloom)"/>
<circle cx="${w * 0.74}" cy="${h * 0.66}" r="${w * 0.26}" fill="url(#bloom2)"/>
${deco}
<ellipse cx="${w / 2}" cy="${h * 0.84}" rx="440" ry="52" fill="url(#shadow)"/>
${cluster}
</svg>`;
}

/* ---------------------------------------------------------------- escritura */
async function main() {
  await mkdir(OUT_ART, { recursive: true });

  let count = 0;

  for (const c of CATEGORIES) {
    await writeFile(path.join(OUT_ART, `categoria-${c.slug}.svg`), categorySvg(c), "utf8");
    count++;
  }

  for (const kind of ["hero", "a", "b", "c"]) {
    await writeFile(path.join(OUT_ART, `editorial-${kind}.svg`), editorialSvg(kind), "utf8");
    count++;
  }

  // Open Graph: 1200x630 en PNG (X/Twitter no renderiza SVG)
  const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
${defs(P.rose)}
<rect width="1200" height="630" fill="url(#bg)"/>
<circle cx="600" cy="240" r="420" fill="url(#bloom)"/>
${sparkle(150, 120, 34, P.gold.base, 0.9)}${sparkle(1060, 500, 40, P.gold.base, 0.9)}
${heart(120, 480, 90, P.rose.base, 0.55, -12)}${heart(1080, 130, 70, P.rose.base, 0.5, 14)}
${flower(240, 560, 80, "#FFFFFF", P.rose.base, 0.85)}${flower(980, 90, 70, "#FFFFFF", P.mint.base, 0.85)}
<g transform="translate(600 340) scale(0.3) translate(-500 -625)">${shapes.lipstick(P.rose, 0)}</g>
<g transform="translate(360 360) rotate(-8) scale(0.24) translate(-500 -625)">${shapes.flask(P.gold, 0)}</g>
<g transform="translate(840 360) rotate(8) scale(0.24) translate(-500 -625)">${shapes.jar(P.mint, 0)}</g>
<text x="600" y="120" text-anchor="middle" font-family="Trebuchet MS, sans-serif" font-size="76"
      fill="#4A4145" font-weight="bold">Lo Más Cute</text>
<text x="600" y="180" text-anchor="middle" font-family="Trebuchet MS, sans-serif" font-size="34"
      fill="#6B6165">Cosas lindas para tu día a día · Medellín</text>
</svg>`;
  await writeFile(path.join(OUT_ART, "og-image.svg"), og, "utf8");
  await sharp(Buffer.from(og)).png({ quality: 92 }).toFile(path.join(root, "public", "og-image.png"));

  // Favicon a partir del pétalo de marca
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FCD6E2"/><stop offset="0.55" stop-color="#F8B6C8"/>
    <stop offset="1" stop-color="#DCCEF5"/></linearGradient></defs>
  <rect width="64" height="64" rx="18" fill="url(#g)"/>
  <path d="M32 50 C 16 36 8 28 8 19 C 8 11 14 6 21 6 C 26 6 30 9 32 13 C 34 9 38 6 43 6
           C 50 6 56 11 56 19 C 56 28 48 36 32 50 Z" fill="#FFF7F4" opacity="0.95"/>
  <circle cx="32" cy="24" r="5" fill="#F4D58D"/>
</svg>`;
  await writeFile(path.join(root, "public", "icon.svg"), icon, "utf8");
  await sharp(Buffer.from(icon)).resize(180, 180).png().toFile(path.join(root, "public", "apple-icon.png"));
  await sharp(Buffer.from(icon)).resize(32, 32).png().toFile(path.join(root, "public", "favicon.png"));

  console.log(`✔ ${count + 4} piezas de arte generadas`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
