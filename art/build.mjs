// Builds art/poster.html: one 1024x1024 SVG travel poster for Vellamora, an invented island
// whose landmark is a lighthouse shaped like a spiral conch shell, seen at dusk from the harbour.
// Run: node art/build.mjs   (then art/render.sh turns it into entry.png)
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// Small deterministic random so every build draws the same town.
let seed = 20261121;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const f = (n) => Math.round(n * 10) / 10;

const W = 1024;
const H = 1024;
const M = 24; // cream paper margin around the printed picture
const LAND_DY = 58; // the headland is drawn in its own coordinates and lowered by this much
const HORIZON = 612 + LAND_DY;
const WATERLINE = 712 + LAND_DY; // foot of the harbour wall: the mirror line for reflections
const SUN_X = 800;

const C = {
  paper: "#efe2c6",
  ink: "#1b1838",
  cream: "#fff1d8",
  coral: "#ec7a62",
  amber: "#ffc27a",
  lamp: "#ffd27f",
  violet: "#4b3f7a",
  plum: "#6a3f63",
};

// ---------- sky ----------
function sky() {
  let stars = "";
  for (let i = 0; i < 46; i++) {
    const x = M + rnd() * (W - 2 * M);
    const y = M + rnd() * 300;
    stars += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.6 + rnd() * 1.3)}" fill="#fff6e0" opacity="${f(0.25 + rnd() * 0.6 * (1 - y / 340))}"/>`;
  }
  // long thin evening clouds, lit rose from below by the set sun
  const streak = (x, y, w, h, o) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#streak)" opacity="${o}"/>`;
  return `
  <rect x="0" y="0" width="${W}" height="${HORIZON + 2}" fill="url(#sky)"/>
  ${stars}
  <ellipse cx="${SUN_X}" cy="${HORIZON}" rx="520" ry="230" fill="url(#afterglow)"/>
  ${streak(60, 330, 300, 9, 0.75)}
  ${streak(170, 348, 220, 6, 0.6)}
  ${streak(760, 300, 240, 10, 0.8)}
  ${streak(700, 322, 150, 6, 0.6)}
  ${streak(420, 470, 230, 7, 0.55)}
  ${streak(840, 520, 160, 6, 0.6)}
  <path d="M${SUN_X - 44} ${HORIZON} a44 44 0 0 1 88 0 Z" fill="#ffe0a6"/>
  <path d="M${M} ${HORIZON} L${M} ${HORIZON - 26} C80 ${HORIZON - 40} 150 ${HORIZON - 44} 210 ${HORIZON - 30} C250 ${HORIZON - 22} 280 ${HORIZON - 10} 300 ${HORIZON} Z" fill="#6d5a8c" opacity="0.85"/>
  <path d="M880 ${HORIZON} C905 ${HORIZON - 16} 940 ${HORIZON - 24} 970 ${HORIZON - 20} C990 ${HORIZON - 20} 1000 ${HORIZON - 12} ${W} ${HORIZON - 8} L${W} ${HORIZON} Z" fill="#8a6a96" opacity="0.8"/>`;
}

// ---------- sea ----------
function sea() {
  let glitter = "";
  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    const y = HORIZON + 4 + t * t * (H - HORIZON);
    const spread = 10 + t * 120;
    const x = SUN_X - t * 60 + (rnd() - 0.5) * spread * 2;
    const w = 6 + t * 40 * rnd() + 4;
    glitter += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(1.5 + t * 2.5)}" rx="1" fill="#ffe2ae" opacity="${f(0.85 - t * 0.5)}"/>`;
  }
  return `
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#sea)"/>
  <rect x="0" y="${HORIZON}" width="${W}" height="2" fill="#ffd9a6" opacity="0.8"/>
  ${glitter}`;
}

// ---------- headland, town, lighthouse (drawn in land coordinates) ----------
const RIDGE = [[0, 540], [90, 520], [200, 492], [320, 470], [430, 452], [520, 432], [600, 420], [680, 426], [720, 470], [742, 560]];
const ridgeAt = (x) => {
  for (let i = 0; i < RIDGE.length - 1; i++) {
    const [x0, y0] = RIDGE[i];
    const [x1, y1] = RIDGE[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 640;
};

function headland() {
  const d = "M0 700 L0 540 C60 530 90 520 200 492 C280 474 360 460 430 452 C490 444 540 426 600 420 C650 415 690 420 708 444 C730 478 742 530 760 600 C772 640 790 660 810 676 L810 712 L0 712 Z";
  return `
  <path d="${d}" fill="url(#cliff)"/>
  <path d="M600 420 C650 415 690 420 708 444 C730 478 742 530 760 600 C772 640 790 660 810 676 L796 680 C770 640 752 590 734 530 C722 486 704 456 668 434 Z" fill="${C.amber}" opacity="0.55"/>
  <path d="M0 640 C120 630 300 640 470 650 C600 656 700 664 810 676 L810 712 L0 712 Z" fill="#3a2b52" opacity="0.55"/>`;
}

function town() {
  const walls = ["#f6e9e0", "#f3dccd", "#efd0c4", "#d9dcea", "#f4e6c4", "#ecc9c6", "#fbf2ea"];
  const roofs = ["#b9533f", "#c8653f", "#a8463a", "#d48250"];
  let out = "";
  const rows = [
    { y0: -6, x0: 30, x1: 560, h: [26, 40] },
    { y0: 30, x0: 0, x1: 600, h: [28, 44] },
    { y0: 68, x0: 10, x1: 640, h: [30, 46] },
    { y0: 108, x0: 0, x1: 690, h: [32, 50] },
  ];
  for (const r of rows) {
    let x = r.x0 + rnd() * 20;
    while (x < r.x1) {
      const w = 34 + rnd() * 34;
      const h = r.h[0] + rnd() * (r.h[1] - r.h[0]);
      const base = ridgeAt(x + w / 2) + r.y0 + 26;
      if (base - h < 400) { x += w; continue; }
      const wall = pick(walls);
      const roofKind = rnd();
      out += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h + 30)}" fill="${wall}"/>`;
      // dusk: every wall falls into violet shade, the sun-side edge keeps a last amber line
      out += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h + 30)}" fill="${C.violet}" opacity="0.24"/>`;
      out += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w * 0.4)}" height="${f(h + 30)}" fill="#2c2350" opacity="0.22"/>`;
      out += `<rect x="${f(x + w - 3)}" y="${f(base - h)}" width="3" height="${f(h + 30)}" fill="${C.amber}" opacity="0.75"/>`;
      if (roofKind < 0.3) {
        // Vellamora's own roof: a ribbed scallop-shell fan
        const rr = w / 2 + 2;
        const mx = x + w / 2;
        const my = base - h;
        const shell = pick(["#d9705c", "#c98468", "#4f9c95"]);
        out += `<path d="M${f(mx - rr)} ${f(my)} a${f(rr)} ${f(rr * 0.9)} 0 0 1 ${f(rr * 2)} 0 Z" fill="${shell}"/>`;
        for (let k = 1; k < 6; k++) {
          const a = Math.PI - (k / 6) * Math.PI;
          out += `<line x1="${f(mx)}" y1="${f(my)}" x2="${f(mx + Math.cos(a) * rr)}" y2="${f(my - Math.sin(a) * rr * 0.9)}" stroke="#ffe7d2" stroke-width="1.4" opacity="0.7"/>`;
        }
        out += `<path d="M${f(mx + rr * 0.2)} ${f(my)} a${f(rr * 0.8)} ${f(rr * 0.72)} 0 0 0 ${f(rr * 0.8)} -${f(rr * 0.05)}" stroke="${C.amber}" stroke-width="2" fill="none" opacity="0.8"/>`;
      } else if (roofKind < 0.65) {
        out += `<path d="M${f(x - 3)} ${f(base - h + 2)} L${f(x + w / 2)} ${f(base - h - 12)} L${f(x + w + 3)} ${f(base - h + 2)} Z" fill="${pick(roofs)}"/>`;
        out += `<path d="M${f(x + w / 2)} ${f(base - h - 12)} L${f(x + w + 3)} ${f(base - h + 2)}" stroke="${C.amber}" stroke-width="2" opacity="0.8"/>`;
      } else {
        out += `<rect x="${f(x - 2)}" y="${f(base - h - 4)}" width="${f(w + 4)}" height="5" fill="#d8c2b4"/>`;
      }
      // windows: most of them lit for the evening
      const nwin = Math.max(1, Math.floor(w / 18));
      for (let k = 0; k < nwin; k++) {
        const wx = x + 6 + k * ((w - 12) / nwin) + 2;
        const wy = base - h + 10 + rnd() * 6;
        const lit = rnd() < 0.68;
        if (lit) out += `<circle cx="${f(wx + 4)}" cy="${f(wy + 6)}" r="11" fill="url(#winGlow)"/>`;
        out += `<path d="M${f(wx)} ${f(wy + 12)} v-7 a4 4 0 0 1 8 0 v7 Z" fill="${lit ? C.lamp : "#3b3a66"}"/>`;
      }
      if (rnd() < 0.3) {
        for (let b = 0; b < 5; b++) {
          out += `<circle cx="${f(x + rnd() * w)}" cy="${f(base - h * (0.2 + rnd() * 0.5))}" r="${f(3 + rnd() * 3)}" fill="#c8407f" opacity="0.85"/>`;
        }
      }
      x += w + 2 + rnd() * 8;
    }
    for (let t = 0; t < 3; t++) {
      const tx = r.x0 + 40 + rnd() * (r.x1 - r.x0 - 80);
      const ty = ridgeAt(tx) + r.y0 + 26;
      out += `<path d="M${f(tx)} ${f(ty - 46)} C${f(tx + 9)} ${f(ty - 30)} ${f(tx + 8)} ${f(ty - 6)} ${f(tx)} ${f(ty)} C${f(tx - 8)} ${f(ty - 6)} ${f(tx - 9)} ${f(ty - 30)} ${f(tx)} ${f(ty - 46)} Z" fill="#1f3b3a"/>`;
    }
  }
  // harbour quay with a string of festival lanterns along it
  out += `<path d="M0 676 L640 690 L640 704 L0 712 Z" fill="#cdb7b0"/>`;
  out += `<path d="M0 676 L640 690 L640 693 L0 679 Z" fill="${C.amber}" opacity="0.5"/>`;
  out += `<path d="M0 704 L640 698 L640 712 L0 712 Z" fill="#4a3657"/>`;
  let lanterns = "";
  for (let i = 0; i < 4; i++) {
    const x0 = 20 + i * 150;
    const x1 = x0 + 150;
    const y0 = 650 + (x0 / 640) * 14;
    const y1 = 650 + (x1 / 640) * 14;
    lanterns += `<path d="M${x0} ${f(y0)} Q${(x0 + x1) / 2} ${f((y0 + y1) / 2 + 16)} ${x1} ${f(y1)}" stroke="#2a2340" stroke-width="1.2" fill="none"/>`;
    for (let k = 1; k < 8; k++) {
      const t = k / 8;
      const lx = x0 + t * 150;
      const ly = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * ((y0 + y1) / 2 + 16) + t * t * y1;
      lanterns += `<circle cx="${f(lx)}" cy="${f(ly + 3)}" r="7" fill="url(#winGlow)"/><circle cx="${f(lx)}" cy="${f(ly + 3)}" r="2.6" fill="${k % 3 ? C.lamp : "#ff9f7a"}"/>`;
    }
    lanterns += `<rect x="${x0 - 1.5}" y="${f(y0 - 4)}" width="3" height="${f(682 + (x0 / 640) * 14 - y0 + 4)}" fill="#2a2340"/>`;
  }
  // two people at the end of the quay, looking out to the light
  const person = (x, y, s, coat) => `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-30" r="4.2" fill="#231d38"/>
    <path d="M-5 -25 L5 -25 L7 -4 L4 -4 L3 6 L-3 6 L-4 -4 L-7 -4 Z" fill="${coat}"/>
  </g>`;
  out += lanterns;
  out += person(560, 684, 1.1, "#2b2442");
  out += person(574, 685, 1.05, "#3a2a4a");
  return out;
}

// ---------- the landmark: the Spiral Light ----------
function lighthouse() {
  const cx = 640;
  const base = 436;
  const top = 258;
  const prof = (t) => 64 * Math.pow(1 - t, 0.9) * (1 + 0.18 * Math.sin(t * Math.PI * 1.2)) + 14;
  const N = 40;
  const left = [];
  const right = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = base - t * (base - top);
    const ridge = 4 * Math.max(0, Math.sin(t * Math.PI * 6.0));
    left.push([cx - prof(t) - ridge, y]);
    right.push([cx + prof(t) + ridge * 0.6, y]);
  }
  const outline = `M${left.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} L${right.reverse().map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} Z`;

  let bands = "";
  const whorls = 6;
  for (let i = 0; i < whorls; i++) {
    const hgt = (base - top) / whorls;
    const y = base - (i + 0.15) * hgt;
    bands += `<path d="M${cx - 90} ${f(y + 10)} C${cx - 30} ${f(y + 2)} ${cx + 30} ${f(y - hgt * 0.45)} ${cx + 90} ${f(y - hgt * 0.75)} L${cx + 90} ${f(y - hgt * 1.17)} C${cx + 30} ${f(y - hgt * 0.9)} ${cx - 30} ${f(y - hgt * 0.42)} ${cx - 90} ${f(y - hgt * 0.32)} Z" fill="${C.coral}"/>`;
    bands += `<path d="M${cx - 90} ${f(y + 10)} C${cx - 30} ${f(y + 2)} ${cx + 30} ${f(y - hgt * 0.45)} ${cx + 90} ${f(y - hgt * 0.75)}" stroke="#ffe6cf" stroke-width="2.5" fill="none" opacity="0.9"/>`;
  }
  let wins = "";
  for (let i = 0; i < 5; i++) {
    const t = 0.14 + i * 0.16;
    const y = base - t * (base - top);
    const wx = cx - 10 + (i % 2) * 14;
    wins += `<circle cx="${wx + 3.5}" cy="${f(y - 3)}" r="12" fill="url(#winGlow)"/><rect x="${wx}" y="${f(y - 9)}" width="7" height="11" rx="3.5" fill="${C.lamp}"/>`;
  }
  const ly = top - 6;
  return `
  <g>
    <path d="M${cx} ${ly - 18} L-80 ${250 - LAND_DY} L-80 ${360 - LAND_DY} Z" fill="url(#beamL)" opacity="0.5"/>
    <path d="M${cx} ${ly - 18} L1100 ${200 - LAND_DY} L1100 ${270 - LAND_DY} Z" fill="url(#beamR)" opacity="0.35"/>
    <circle cx="${cx}" cy="${ly - 18}" r="90" fill="url(#lampGlow)"/>
    <clipPath id="towerClip"><path d="${outline}"/></clipPath>
    <path d="${outline}" fill="${C.cream}"/>
    <g clip-path="url(#towerClip)">
      ${bands}
      <rect x="${cx - 100}" y="${top - 10}" width="200" height="${base - top + 20}" fill="url(#towerShade)"/>
    </g>
    <path d="${outline}" fill="none" stroke="#4a2a40" stroke-width="2" opacity="0.6"/>
    ${wins}
    <path d="M${cx - 13} ${base} v-26 a13 13 0 0 1 26 0 v26 Z" fill="#2a2340"/>
    <path d="M${cx - 9} ${base} v-24 a9 9 0 0 1 18 0 v24 Z" fill="${C.lamp}"/>
    <!-- the conch's flared lip and pink mouth, catching the last of the sun -->
    <g transform="translate(${cx} ${base}) scale(0.9 0.66) translate(${-cx} ${-base})">
    <path d="M${cx + 40} ${base} C${cx + 70} ${base - 4} ${cx + 104} ${base - 30} ${cx + 100} ${base - 78} C${cx + 96} ${base - 116} ${cx + 70} ${base - 140} ${cx + 52} ${base - 150} C${cx + 60} ${base - 110} ${cx + 66} ${base - 60} ${cx + 40} ${base} Z" fill="#ffe6cc" stroke="#4a2a40" stroke-width="2" stroke-opacity="0.5"/>
    <path d="M${cx + 46} ${base - 8} C${cx + 74} ${base - 18} ${cx + 90} ${base - 46} ${cx + 88} ${base - 80} C${cx + 86} ${base - 108} ${cx + 72} ${base - 126} ${cx + 58} ${base - 136} C${cx + 64} ${base - 100} ${cx + 64} ${base - 50} ${cx + 46} ${base - 8} Z" fill="url(#shellMouth)"/>
    </g>
    <rect x="${cx - 30}" y="${ly}" width="60" height="7" rx="2" fill="#2a2340"/>
    <rect x="${cx - 19}" y="${ly - 30}" width="38" height="30" fill="#fff3c0"/>
    <rect x="${cx - 19}" y="${ly - 30}" width="38" height="30" fill="none" stroke="#2a2340" stroke-width="3"/>
    <line x1="${cx}" y1="${ly - 30}" x2="${cx}" y2="${ly}" stroke="#2a2340" stroke-width="2"/>
    <path d="M${cx - 24} ${ly - 30} Q${cx - 4} ${ly - 44} ${cx + 2} ${ly - 78} Q${cx + 8} ${ly - 50} ${cx + 24} ${ly - 30} Z" fill="${C.coral}"/>
    <path d="M${cx - 14} ${ly - 36} Q${cx} ${ly - 44} ${cx + 12} ${ly - 52}" stroke="#ffe6cf" stroke-width="2.5" fill="none"/>
    <path d="M${cx - 8} ${ly - 50} Q${cx + 2} ${ly - 56} ${cx + 8} ${ly - 64}" stroke="#ffe6cf" stroke-width="2" fill="none"/>
  </g>`;
}

function boat(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-60 18 L60 18 L44 34 L-46 34 Z" fill="#231d38"/>
    <line x1="0" y1="18" x2="0" y2="-130" stroke="#231d38" stroke-width="3"/>
    <path d="M3 -124 C40 -80 52 -30 54 10 L3 10 Z" fill="#f4d9c4"/>
    <path d="M-3 -116 C-34 -74 -46 -32 -50 10 L-3 10 Z" fill="#d9705c"/>
    <path d="M3 -124 C40 -80 52 -30 54 10 L46 10 C44 -30 34 -76 3 -116 Z" fill="${C.amber}" opacity="0.8"/>
    <circle cx="-40" cy="14" r="14" fill="url(#winGlow)"/><circle cx="-40" cy="14" r="3.5" fill="${C.lamp}"/>
  </g>`;
}

// the scene above the water, drawn once and reused for its reflection
function land() {
  return `<g id="land" transform="translate(0 ${LAND_DY})">${headland()}${town()}${lighthouse()}</g>`;
}

function reflection() {
  // mirror about the foot of the quay, rippled and darkened like evening water
  let ripples = "";
  for (let i = 0; i < 60; i++) {
    const y = WATERLINE + 6 + rnd() * (H - WATERLINE - 30);
    const x = rnd() * 760;
    ripples += `<rect x="${f(x)}" y="${f(y)}" width="${f(30 + rnd() * 110)}" height="1.6" fill="#ffe0b8" opacity="${f(0.12 + rnd() * 0.18)}"/>`;
  }
  return `
  <g clip-path="url(#below)" opacity="0.55">
    <g filter="url(#ripple)">
      <use href="#land" transform="translate(0 ${2 * WATERLINE}) scale(1 -1)"/>
    </g>
  </g>
  <g opacity="0.4" filter="url(#ripple)">
    <g transform="translate(860 ${HORIZON + 62 + 34 * 0.62}) scale(1 -1) translate(-860 ${-(HORIZON + 62 + 34 * 0.62)})">${boat(860, HORIZON + 62, 0.62)}</g>
  </g>
  <rect x="0" y="${WATERLINE}" width="${W}" height="${H - WATERLINE}" fill="url(#deepen)"/>
  ${ripples}`;
}

function title() {
  const name = "VELLAMORA";
  const serif = "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif";
  return `
  <g text-anchor="middle" font-family="${serif}">
    <text x="512" y="84" font-size="24" letter-spacing="13" fill="#f6dcc0" opacity="0.92">THE ISLE OF</text>
    <text x="515" y="192" font-size="134" font-weight="700" letter-spacing="10" textLength="840" lengthAdjust="spacingAndGlyphs" fill="${C.ink}" opacity="0.6">${name}</text>
    <text x="512" y="188" font-size="134" font-weight="700" letter-spacing="10" textLength="840" lengthAdjust="spacingAndGlyphs" fill="url(#nameFill)">${name}</text>
    <rect x="262" y="221" width="130" height="1.5" fill="#f6dcc0" opacity="0.6"/>
    <rect x="632" y="221" width="130" height="1.5" fill="#f6dcc0" opacity="0.6"/>
    <text x="512" y="228" font-size="19" letter-spacing="7" fill="#f6dcc0" opacity="0.9">THE SPIRAL LIGHT</text>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1e1d4a"/>
      <stop offset="0.35" stop-color="#3f3672"/>
      <stop offset="0.62" stop-color="#8b5b8c"/>
      <stop offset="0.84" stop-color="#e88a7c"/>
      <stop offset="1" stop-color="#ffc58c"/>
    </linearGradient>
    <radialGradient id="afterglow">
      <stop offset="0" stop-color="#ffe3a6" stop-opacity="0.95"/>
      <stop offset="0.3" stop-color="#ffb07e" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#e77f86" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="streak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b47ba0"/>
      <stop offset="1" stop-color="#ffb995"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6927f"/>
      <stop offset="0.25" stop-color="#9b6b8e"/>
      <stop offset="0.7" stop-color="#3e3f72"/>
      <stop offset="1" stop-color="#1c1f45"/>
    </linearGradient>
    <linearGradient id="deepen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c1f45" stop-opacity="0"/>
      <stop offset="1" stop-color="#14163a" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="cliff" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5a3f66"/>
      <stop offset="0.7" stop-color="#8c5466"/>
      <stop offset="1" stop-color="#b8695e"/>
    </linearGradient>
    <linearGradient id="towerShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3a2a5e" stop-opacity="0.55"/>
      <stop offset="0.5" stop-color="#3a2a5e" stop-opacity="0.12"/>
      <stop offset="0.82" stop-color="#ffcf8a" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#ffc070" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="shellMouth" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f08a80"/>
      <stop offset="1" stop-color="#ffd0b0"/>
    </linearGradient>
    <radialGradient id="lampGlow">
      <stop offset="0" stop-color="#fff7c8" stop-opacity="1"/>
      <stop offset="0.3" stop-color="#ffe3a0" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#ffd890" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="winGlow">
      <stop offset="0" stop-color="#ffd27f" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#ffb860" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="beamL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#fff2c4" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#fff2c4" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="beamR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff2c4" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#fff2c4" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="nameFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff4dc"/>
      <stop offset="1" stop-color="#ffc98e"/>
    </linearGradient>
    <clipPath id="below"><rect x="0" y="${WATERLINE}" width="${W}" height="${H - WATERLINE}"/></clipPath>
    <filter id="ripple" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="1" seed="7"/>
      <feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="grain" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.09  0 0 0 0 0.16  0 0 0 -1.6 1.05"/>
    </filter>
  </defs>
  ${sky()}
  ${sea()}
  ${land()}
  <g id="boats">${boat(860, HORIZON + 62, 0.62)}${boat(960, HORIZON + 14, 0.3)}</g>
  ${reflection()}
  ${title()}
  <rect x="0" y="0" width="${W}" height="${H}" filter="url(#grain)" opacity="0.3"/>
  <path d="M0 0 H${W} V${H} H0 Z M${M} ${M} V${H - M} H${W - M} V${M} Z" fill-rule="evenodd" fill="${C.paper}"/>
  <rect x="${M}" y="${M}" width="${W - 2 * M}" height="${H - 2 * M}" fill="none" stroke="#2a2340" stroke-width="2"/>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#000}svg{display:block}</style></head><body>${svg}</body></html>`;
writeFileSync(join(here, "poster.html"), html);
console.log("wrote art/poster.html", html.length, "bytes");
