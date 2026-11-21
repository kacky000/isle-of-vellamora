// Builds art/poster.html: one 1024x1024 SVG travel poster for Vellamora, an invented island
// whose landmark is a lighthouse shaped like a spiral sea shell. Run: node art/build.mjs
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
const HORIZON = 612;

// ---------- palette ----------
const C = {
  skyTop: "#2f7fae",
  skyMid: "#7fc1cf",
  skyLow: "#ffd9a8",
  sun: "#fff3d0",
  sea1: "#3fc4c0",
  sea2: "#138aa0",
  sea3: "#0b5a78",
  cliff: "#d98c5f",
  cliffShade: "#a95f44",
  cliffDark: "#7c4436",
  cream: "#fff4df",
  coral: "#f0775c",
  coralDeep: "#c9503f",
  navy: "#0f3550",
  leaf: "#1f5a4a",
  leafDark: "#123d34",
  bloom: "#e0458f",
};

// ---------- sky, sun, clouds ----------
function sky() {
  return `
  <rect x="0" y="0" width="${W}" height="${HORIZON + 2}" fill="url(#sky)"/>
  <circle cx="808" cy="${HORIZON - 34}" r="250" fill="url(#sunGlow)"/>
  <circle cx="808" cy="${HORIZON - 34}" r="58" fill="${C.sun}"/>
  ${cloud(170, 360, 1.0, 0.85)}
  ${cloud(905, 330, 0.8, 0.8)}
  ${cloud(470, 420, 0.6, 0.6)}
  ${cloud(990, 455, 0.55, 0.6)}`;
}

function cloud(x, y, s, o) {
  const puffs = [
    [-70, 8, 34], [-36, -10, 42], [6, -22, 50], [52, -6, 40], [86, 10, 28],
  ];
  const body = puffs.map(([dx, dy, r]) => `<circle cx="${f(x + dx * s)}" cy="${f(y + dy * s)}" r="${f(r * s)}"/>`).join("");
  return `<g opacity="${o}">
    <g fill="#ffe9d6">${body}<rect x="${f(x - 90 * s)}" y="${f(y + 4 * s)}" width="${f(190 * s)}" height="${f(30 * s)}" rx="${f(15 * s)}"/></g>
    <g fill="#f7b7a3" opacity="0.55" transform="translate(0 ${f(10 * s)})"><rect x="${f(x - 80 * s)}" y="${f(y + 12 * s)}" width="${f(172 * s)}" height="${f(18 * s)}" rx="${f(9 * s)}"/></g>
  </g>`;
}

// ---------- far islands ----------
function farIslands() {
  return `
  <path d="M0 ${HORIZON} L0 586 C40 574 80 566 130 572 C170 560 214 568 250 584 L284 ${HORIZON} Z" fill="#b8a3c4" opacity="0.75"/>
  <path d="M880 ${HORIZON} C905 596 930 590 960 592 C990 586 1010 594 1024 600 L1024 ${HORIZON} Z" fill="#c9a8b8" opacity="0.7"/>`;
}

// ---------- sea ----------
function sea() {
  let glitter = "";
  for (let i = 0; i < 70; i++) {
    const t = i / 70;
    const y = HORIZON + 6 + t * t * 400;
    const spread = 18 + t * 150;
    const x = 808 - (t * 120) + (rnd() - 0.5) * spread * 2;
    const w = 8 + t * 46 * rnd() + 6;
    glitter += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(2 + t * 3)}" rx="${f(1 + t)}" fill="#fff6d8" opacity="${f(0.85 - t * 0.4)}"/>`;
  }
  let swells = "";
  for (let i = 0; i < 26; i++) {
    const y = HORIZON + 30 + i * i * 0.62 + i * 6;
    const x = rnd() * 700;
    const w = 40 + rnd() * 120;
    swells += `<path d="M${f(x)} ${f(y)} q${f(w / 4)} -4 ${f(w / 2)} 0 t${f(w / 2)} 0" stroke="#bff0ea" stroke-width="${f(1.2 + i * 0.1)}" fill="none" opacity="0.45"/>`;
  }
  return `
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#sea)"/>
  <rect x="0" y="${HORIZON}" width="${W}" height="3" fill="#fff0cf" opacity="0.7"/>
  ${swells}
  ${glitter}`;
}

// ---------- headland and town ----------
const CLIFF_TOP = (x) => {
  // the ridge line of the headland, high on the right where the lighthouse stands
  if (x < 0) return 560;
  const pts = [[0, 540], [90, 520], [200, 492], [320, 470], [430, 452], [520, 432], [600, 420], [680, 426], [720, 470], [742, 560]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 640;
};

function headland() {
  const d = `M0 ${HORIZON + 70} L0 540 C60 530 90 520 200 492 C280 474 360 460 430 452 C490 444 540 426 600 420 C650 415 690 420 708 444 C730 478 742 530 760 600 C772 640 790 660 810 676 L810 690 L0 700 Z`;
  return `
  <path d="${d}" fill="url(#cliff)"/>
  <path d="M600 420 C650 415 690 420 708 444 C730 478 742 530 760 600 C772 640 790 660 810 676 L760 684 C744 640 724 590 704 540 C690 500 668 470 640 450 Z" fill="${C.cliffShade}" opacity="0.7"/>
  <path d="M0 640 C120 630 300 640 470 650 C600 656 700 664 810 676 L810 700 L0 706 Z" fill="${C.cliffDark}" opacity="0.6"/>
  ${strata()}`;
}

function strata() {
  let s = "";
  for (let i = 0; i < 9; i++) {
    const y = 560 + i * 12;
    s += `<path d="M${10 + i * 20} ${y} q120 -10 240 -2 t260 4" stroke="#f3b184" stroke-width="2" fill="none" opacity="0.35"/>`;
  }
  return s;
}

function town() {
  const walls = ["#fffaf0", "#fff1dd", "#ffe2c4", "#cfe9ee", "#fdf0b8", "#ffd8cf", "#ffffff"];
  const roofs = ["#c9503f", "#d9653f", "#b8463a", "#e38a4f"];
  let out = "";
  // terraces: rows of houses stepping down the slope, back rows first
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
      const base = CLIFF_TOP(x + w / 2) + r.y0 + 26;
      if (base - h < 400) { x += w; continue; }
      const wall = pick(walls);
      const roofKind = rnd();
      out += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h + 30)}" fill="${wall}"/>`;
      // the sun sits low on the right: shade the left face, warm the right edge
      out += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w * 0.36)}" height="${f(h + 30)}" fill="#9a6a8a" opacity="0.22"/>`;
      out += `<rect x="${f(x + w - 3)}" y="${f(base - h)}" width="3" height="${f(h + 30)}" fill="#ffd08a" opacity="0.7"/>`;
      if (roofKind < 0.3) {
        // Vellamora's own roof: a scallop-shell fan with ribs, in coral or sea-glass green
        const rr = w / 2 + 2;
        const mx = x + w / 2;
        const my = base - h;
        const shell = pick(["#f0775c", "#e8916e", "#4fb3a3"]);
        out += `<path d="M${f(mx - rr)} ${f(my)} a${f(rr)} ${f(rr * 0.9)} 0 0 1 ${f(rr * 2)} 0 Z" fill="${shell}"/>`;
        for (let k = 1; k < 6; k++) {
          const a = Math.PI - (k / 6) * Math.PI;
          out += `<line x1="${f(mx)}" y1="${f(my)}" x2="${f(mx + Math.cos(a) * rr)}" y2="${f(my - Math.sin(a) * rr * 0.9)}" stroke="#fff1e0" stroke-width="1.6" opacity="0.8"/>`;
        }
        out += `<path d="M${f(mx - 5)} ${f(my)} l5 6 l5 -6 Z" fill="${shell}"/>`;
      } else if (roofKind < 0.65) {
        out += `<path d="M${f(x - 3)} ${f(base - h + 2)} L${f(x + w / 2)} ${f(base - h - 12)} L${f(x + w + 3)} ${f(base - h + 2)} Z" fill="${pick(roofs)}"/>`;
      } else {
        out += `<rect x="${f(x - 2)}" y="${f(base - h - 4)}" width="${f(w + 4)}" height="5" fill="#e9d7bf"/>`;
        if (rnd() < 0.4) out += `<rect x="${f(x + 6)}" y="${f(base - h - 18)}" width="${f(w * 0.4)}" height="14" fill="${wall}"/>`;
      }
      // arched windows / doors, a few lit in warm gold
      const nwin = Math.max(1, Math.floor(w / 18));
      for (let k = 0; k < nwin; k++) {
        const wx = x + 6 + k * ((w - 12) / nwin) + 2;
        const wy = base - h + 10 + rnd() * 6;
        const lit = rnd() < 0.3;
        out += `<path d="M${f(wx)} ${f(wy + 12)} v-7 a4 4 0 0 1 8 0 v7 Z" fill="${lit ? "#ffcf6b" : "#3d6f8e"}"/>`;
      }
      if (rnd() < 0.35) {
        // bougainvillea spilling over a wall
        for (let b = 0; b < 6; b++) {
          out += `<circle cx="${f(x + rnd() * w)}" cy="${f(base - h * (0.2 + rnd() * 0.5))}" r="${f(3 + rnd() * 4)}" fill="${C.bloom}" opacity="0.9"/>`;
        }
      }
      x += w + 2 + rnd() * 8;
    }
    // cypress trees and a stair between terraces
    for (let t = 0; t < 3; t++) {
      const tx = r.x0 + 40 + rnd() * (r.x1 - r.x0 - 80);
      const ty = CLIFF_TOP(tx) + r.y0 + 26;
      out += `<path d="M${f(tx)} ${f(ty - 46)} C${f(tx + 9)} ${f(ty - 30)} ${f(tx + 8)} ${f(ty - 6)} ${f(tx)} ${f(ty)} C${f(tx - 8)} ${f(ty - 6)} ${f(tx - 9)} ${f(ty - 30)} ${f(tx)} ${f(ty - 46)} Z" fill="${C.leaf}"/>`;
    }
  }
  // harbour wall and steps down to the water
  out += `<path d="M0 676 L640 690 L640 704 L0 712 Z" fill="#f3e2c8"/>`;
  out += `<path d="M0 712 L640 704 L640 712 L0 722 Z" fill="#b98b6a"/>`;
  return out;
}

// ---------- the landmark: the Spiral Light ----------
function lighthouse() {
  const cx = 640;
  const base = 436;
  const top = 168;
  // conch-shaped profile: wide shoulder near the base, tapering to the lantern
  const prof = (t) => 66 * Math.pow(1 - t, 0.9) * (1 + 0.18 * Math.sin(t * Math.PI * 1.2)) + 14; // half-width at height fraction t
  const N = 40;
  const left = [];
  const right = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = base - t * (base - top);
    // scalloped ridge where the spiral whorl meets the outline
    const ridge = 4 * Math.max(0, Math.sin(t * Math.PI * 6.0));
    left.push([cx - prof(t) - ridge, y]);
    right.push([cx + prof(t) + ridge * 0.6, y]);
  }
  const outline = `M${left.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} L${right.reverse().map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} Z`;

  // spiral bands: six whorls, each a sloping band drawn across the tower and clipped to it
  let bands = "";
  const whorls = 6;
  for (let i = 0; i < whorls; i++) {
    const y = base - (i + 0.15) * ((base - top) / whorls);
    const hgt = (base - top) / whorls;
    bands += `<path d="M${cx - 90} ${f(y + 10)} C${cx - 30} ${f(y + 2)} ${cx + 30} ${f(y - hgt * 0.45)} ${cx + 90} ${f(y - hgt * 0.75)} L${cx + 90} ${f(y - hgt * 0.75 - hgt * 0.42)} C${cx + 30} ${f(y - hgt * 0.9)} ${cx - 30} ${f(y - hgt * 0.42)} ${cx - 90} ${f(y - hgt * 0.32)} Z" fill="${C.coral}"/>`;
    bands += `<path d="M${cx - 90} ${f(y + 10)} C${cx - 30} ${f(y + 2)} ${cx + 30} ${f(y - hgt * 0.45)} ${cx + 90} ${f(y - hgt * 0.75)}" stroke="#ffe6cf" stroke-width="2.5" fill="none" opacity="0.9"/>`;
  }
  // little windows following the spiral
  let wins = "";
  for (let i = 0; i < 5; i++) {
    const t = 0.12 + i * 0.16;
    const y = base - t * (base - top);
    wins += `<rect x="${f(cx - 10 + (i % 2) * 14)}" y="${f(y - 9)}" width="7" height="11" rx="3.5" fill="#ffcf6b"/>`;
  }

  const lanternY = top - 6;
  return `
  <g>
    <path d="M${cx} ${lanternY - 20} L-60 40 L-60 300 Z" fill="url(#beam)" opacity="0.55"/>
    <circle cx="${cx}" cy="${lanternY - 20}" r="70" fill="url(#lampGlow)"/>
    <ellipse cx="${cx + 6}" cy="${base + 6}" rx="96" ry="12" fill="${C.cliffDark}" opacity="0.45"/>
    <clipPath id="towerClip"><path d="${outline}"/></clipPath>
    <path d="${outline}" fill="${C.cream}"/>
    <g clip-path="url(#towerClip)">
      ${bands}
      <rect x="${cx - 100}" y="${top - 10}" width="200" height="${base - top + 20}" fill="url(#towerShade)"/>
    </g>
    <path d="${outline}" fill="none" stroke="#7a3b33" stroke-width="2" opacity="0.5"/>
    <!-- the conch's flared lip and pink mouth at the foot of the tower: this is a shell, not a striped cone -->
    <path d="M${cx + 40} ${base} C${cx + 70} ${base - 4} ${cx + 104} ${base - 30} ${cx + 100} ${base - 78} C${cx + 96} ${base - 116} ${cx + 70} ${base - 140} ${cx + 52} ${base - 150} C${cx + 60} ${base - 110} ${cx + 66} ${base - 60} ${cx + 40} ${base} Z" fill="#fff0e2" stroke="#7a3b33" stroke-width="2" stroke-opacity="0.45"/>
    <path d="M${cx + 46} ${base - 8} C${cx + 74} ${base - 18} ${cx + 90} ${base - 46} ${cx + 88} ${base - 80} C${cx + 86} ${base - 108} ${cx + 72} ${base - 126} ${cx + 58} ${base - 136} C${cx + 64} ${base - 100} ${cx + 64} ${base - 50} ${cx + 46} ${base - 8} Z" fill="url(#shellMouth)"/>
    ${wins}
    <path d="M${cx - 13} ${base} v-26 a13 13 0 0 1 26 0 v26 Z" fill="${C.navy}"/>
    <path d="M${cx - 9} ${base} v-24 a9 9 0 0 1 18 0 v24 Z" fill="#ffcf6b"/>
    <!-- gallery, lantern room and the shell's tip as the roof -->
    <rect x="${cx - 30}" y="${lanternY}" width="60" height="7" rx="2" fill="${C.navy}"/>
    <rect x="${cx - 19}" y="${lanternY - 30}" width="38" height="30" fill="#fff1b8"/>
    <rect x="${cx - 19}" y="${lanternY - 30}" width="38" height="30" fill="none" stroke="${C.navy}" stroke-width="3"/>
    <line x1="${cx}" y1="${lanternY - 30}" x2="${cx}" y2="${lanternY}" stroke="${C.navy}" stroke-width="2"/>
    <path d="M${cx - 24} ${lanternY - 30} Q${cx - 4} ${lanternY - 44} ${cx + 2} ${lanternY - 78} Q${cx + 8} ${lanternY - 50} ${cx + 24} ${lanternY - 30} Z" fill="${C.coral}"/>
    <path d="M${cx - 14} ${lanternY - 36} Q${cx} ${lanternY - 44} ${cx + 12} ${lanternY - 52}" stroke="#ffe6cf" stroke-width="2.5" fill="none"/>
    <path d="M${cx - 8} ${lanternY - 50} Q${cx + 2} ${lanternY - 56} ${cx + 8} ${lanternY - 64}" stroke="#ffe6cf" stroke-width="2" fill="none"/>
  </g>`;
}

// reflection of the town and the tower in the harbour
function reflections() {
  let r = "";
  for (let i = 0; i < 40; i++) {
    const x = rnd() * 640;
    const y = 724 + rnd() * 60;
    r += `<rect x="${f(x)}" y="${f(y)}" width="${f(10 + rnd() * 30)}" height="2.5" fill="${pick(["#fff1dd", "#ffd8cf", "#f0775c", "#ffcf6b"])}" opacity="${f(0.25 + rnd() * 0.35)}"/>`;
  }
  return r;
}

// ---------- a sailing boat bound for the island ----------
function boat(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="34" rx="70" ry="7" fill="#0b4a64" opacity="0.4"/>
    <path d="M-60 18 L60 18 L44 34 L-46 34 Z" fill="${C.navy}"/>
    <rect x="-60" y="14" width="120" height="6" fill="${C.cream}"/>
    <line x1="0" y1="18" x2="0" y2="-130" stroke="#5a3a2c" stroke-width="3"/>
    <path d="M3 -124 C40 -80 52 -30 54 10 L3 10 Z" fill="${C.cream}"/>
    <path d="M-3 -116 C-34 -74 -46 -32 -50 10 L-3 10 Z" fill="${C.coral}"/>
    <path d="M3 -124 L22 -118 L3 -110 Z" fill="${C.coralDeep}"/>
  </g>`;
}

// ---------- foreground: a terrace frame with flowers ----------
function foreground() {
  // palm fronds reaching in from the top-left and bottom-right corners frame the view
  const frond = (x, y, ang, len, col) => {
    let leaves = "";
    for (let i = 1; i <= 12; i++) {
      const t = i / 13;
      const px = t * len;
      const sz = 70 * Math.sin(t * Math.PI) + 10;
      leaves += `<path d="M${f(px)} 0 q${f(sz * 0.35)} ${f(-sz * 0.4)} ${f(sz * 0.55)} ${f(-sz)} q${f(-sz * 0.05)} ${f(sz * 0.6)} ${f(-sz * 0.55)} ${f(sz)} Z" fill="${col}"/>`;
      leaves += `<path d="M${f(px)} 0 q${f(sz * 0.35)} ${f(sz * 0.4)} ${f(sz * 0.55)} ${f(sz)} q${f(-sz * 0.05)} ${f(-sz * 0.6)} ${f(-sz * 0.55)} ${f(-sz)} Z" fill="${col}"/>`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0 0 Q${len / 2} -14 ${len} 0" stroke="${col}" stroke-width="5" fill="none"/>${leaves}</g>`;
  };
  let blooms = "";
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI / 2;
    const r = 30 + rnd() * 150;
    const x = 1024 - Math.cos(a) * r;
    const y = 1024 - Math.sin(a) * r * 0.9;
    blooms += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(6 + rnd() * 8)}" fill="${pick([C.bloom, "#f06aa6", "#c9307a"])}"/>`;
  }
  // bougainvillea hanging into the top-left corner instead: it frames the sky without hiding the name
  let hang = "";
  for (let i = 0; i < 80; i++) {
    const a = rnd() * Math.PI / 2;
    const r = 20 + rnd() * 170 * (0.6 + 0.4 * Math.sin(a * 2));
    hang += `<circle cx="${f(Math.cos(a) * r * 1.15)}" cy="${f(Math.sin(a) * r * 0.75)}" r="${f(6 + rnd() * 8)}" fill="${pick([C.bloom, "#f06aa6", "#c9307a"])}"/>`;
  }
  void frond; void blooms;
  return `
  <path d="M0 0 L230 0 C200 40 150 90 80 120 C40 136 14 150 0 160 Z" fill="${C.leafDark}"/>
  <path d="M0 0 L150 0 C120 40 70 80 0 96 Z" fill="${C.leaf}"/>
  ${hang}`;
}

// ---------- type ----------
function title() {
  const name = "VELLAMORA";
  return `
  <g font-family="Bahnschrift, 'Arial Narrow', sans-serif" text-anchor="middle">
    <text x="512" y="842" font-size="32" font-weight="600" letter-spacing="14" fill="${C.cream}" style="font-variation-settings:'wght' 600,'wdth' 90">THE ISLE OF</text>
    <rect x="222" y="830" width="90" height="3" fill="${C.cream}"/>
    <rect x="712" y="830" width="90" height="3" fill="${C.cream}"/>
    <text x="517" y="989" font-size="172" font-weight="700" textLength="904" lengthAdjust="spacingAndGlyphs" fill="#06283d" opacity="0.6" style="font-variation-settings:'wght' 700,'wdth' 75">${name}</text>
    <text x="512" y="982" font-size="172" font-weight="700" textLength="904" lengthAdjust="spacingAndGlyphs" fill="url(#nameFill)" style="font-variation-settings:'wght' 700,'wdth' 75">${name}</text>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.skyTop}"/>
      <stop offset="0.45" stop-color="${C.skyMid}"/>
      <stop offset="0.78" stop-color="${C.skyLow}"/>
      <stop offset="1" stop-color="#ffc08f"/>
    </linearGradient>
    <radialGradient id="sunGlow">
      <stop offset="0" stop-color="#fff2c4" stop-opacity="0.95"/>
      <stop offset="0.35" stop-color="#ffd59a" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffb48a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.sea1}"/>
      <stop offset="0.45" stop-color="${C.sea2}"/>
      <stop offset="1" stop-color="${C.sea3}"/>
    </linearGradient>
    <linearGradient id="cliff" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9a271"/>
      <stop offset="1" stop-color="${C.cliff}"/>
    </linearGradient>
    <linearGradient id="towerShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6b3a5a" stop-opacity="0.35"/>
      <stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.8" stop-color="#ffe2a8" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#ffd27a" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="shellMouth" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff9e8a"/>
      <stop offset="1" stop-color="#ffd3b8"/>
    </linearGradient>
    <radialGradient id="lampGlow">
      <stop offset="0" stop-color="#fff7c8" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#fff7c8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="beam" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#fff6cc" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#fff6cc" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="nameFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff8e6"/>
      <stop offset="1" stop-color="#ffd9a0"/>
    </linearGradient>
  </defs>
  ${sky()}
  ${farIslands()}
  ${sea()}
  ${headland()}
  ${town()}
  ${lighthouse()}
  ${reflections()}
  ${boat(850, 726, 0.78)}
  ${boat(955, 655, 0.36)}
  ${foreground()}
  ${title()}
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#000}svg{display:block}</style></head><body>${svg}</body></html>`;
writeFileSync(join(here, "poster.html"), html);
console.log("wrote art/poster.html", html.length, "bytes");
