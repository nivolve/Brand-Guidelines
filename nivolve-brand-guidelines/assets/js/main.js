/* ============================================================
   NIVOLVE — Brand Guideline / main.js
   ============================================================ */

const LOGO_VIEWBOX = "0 0 419.5 137.820211";
const LOGO_W = 419.5, LOGO_H = 137.820211;

// Brand palette — single source of truth, mirrors design.md tokens
const PALETTE = [
  { name: "Navy",      token: "--navy",      hex: "#0D2C62", use: "Primary body text, primary dark surfaces. 13.5:1 on cream.", dark: true  },
  { name: "Navy Deep", token: "--navy-deep", hex: "#071B3D", use: "Footer & deep background sections.",                          dark: true  },
  { name: "Cyan Ink",  token: "--cyan-ink",  hex: "#0077A8", use: "Accessible link & accent text on light backgrounds. 4.6:1.",   dark: true  },
  { name: "Aqua",      token: "--aqua",      hex: "#86D5DD", use: "Accent highlights on dark backgrounds.",                       dark: false },
  { name: "Muted",     token: "--muted",     hex: "#5A6B8C", use: "Secondary / paragraph body text. 5.2:1.",                      dark: true  },
  { name: "Cream",     token: "--cream",     hex: "#FDFBFA", use: "Standard page background.",                                    dark: false },
  { name: "Cream 2",   token: "--cream-2",   hex: "#F4F1EF", use: "Alternate section background bands.",                          dark: false },
  { name: "Fill Blue", token: "--fill-blue", hex: "#00A3E0", use: "Decorative fills only, 2.9:1, never use as text.",             dark: false },
];

// Logo colorway options (subset of palette + pure black/white for print use)
const LOGO_COLORWAYS = [
  { name: "Navy",      hex: "#0D2C62", bgDark: false },
  { name: "Navy Deep", hex: "#071B3D", bgDark: false },
  { name: "Cyan Ink",  hex: "#0077A8", bgDark: false },
  { name: "Aqua",      hex: "#86D5DD", bgDark: true  },
  { name: "Cream",     hex: "#FDFBFA", bgDark: true  },
  { name: "Black",     hex: "#000000", bgDark: false },
  { name: "White",     hex: "#FFFFFF", bgDark: true  },
];

let state = { logoColor: PALETTE[0].hex, logoBgDark: false };

/* ---------------- toast ---------------- */
const toastEl = document.getElementById('toast');
const toastTextEl = document.getElementById('toast-text');
let toastTimer;
function showToast(msg) {
  toastTextEl.textContent = msg;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
}

async function copyText(text, successMsg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg || `Copied ${text}`);
    return true;
  } catch (e) {
    showToast('Copy failed. Please select the text manually.');
    return false;
  }
}

/* ---------------- footer year / hero date ---------------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- pill nav ---------------- */
const pillnav = document.getElementById('pillnav');
window.addEventListener('scroll', () => {
  pillnav.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive: true });

const navLinks = document.querySelectorAll('.pillnav__links a');
const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if (sections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = document.querySelector(`.pillnav__links a[href="#${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => navObserver.observe(s));
}

/* ---------------- GSAP scroll reveals ---------------- */
gsap.registerPlugin(ScrollTrigger);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  gsap.utils.toArray('.r-up').forEach((el, i) => {
    gsap.fromTo(el, { y: 28, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      delay: Math.min((i % 6) * 0.05, 0.25),
    });
  });
  gsap.utils.toArray('.r-fade').forEach(el => {
    gsap.fromTo(el, { opacity: 0 }, {
      opacity: 1, duration: 1.1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
} else {
  gsap.set('.r-up, .r-fade', { opacity: 1, y: 0 });
}

/* ============================================================
   COLOR PALETTE — render + click-to-copy
   ============================================================ */
const swatchGrid = document.getElementById('swatch-grid');
PALETTE.forEach(c => {
  const el = document.createElement('button');
  el.className = 'swatch r-up';
  el.setAttribute('role', 'listitem');
  el.setAttribute('type', 'button');
  el.setAttribute('aria-label', `Copy ${c.name} ${c.hex}`);
  el.style.cssText = 'text-align:left;width:100%;border:1px solid var(--line);font:inherit;';
  el.innerHTML = `
    <div class="swatch__fill" style="background:${c.hex}">
      <span class="swatch__copy-hint">Click to copy</span>
    </div>
    <div class="swatch__body">
      <div class="swatch__name" style="${c.dark ? '' : 'color:var(--navy)'}">${c.name}</div>
      <div class="swatch__hex">${c.hex}</div>
      <div class="swatch__use">${c.use}</div>
    </div>`;
  el.addEventListener('click', async () => {
    const ok = await copyText(c.hex, `${c.name}, ${c.hex} copied`);
    if (ok) {
      el.classList.add('is-copied');
      setTimeout(() => el.classList.remove('is-copied'), 1200);
    }
  });
  swatchGrid.appendChild(el);
});

/* ============================================================
   LOGO — colorway switch, SVG/PNG export, kit zip
   ============================================================ */
const logoStage = document.getElementById('logo-stage');
const logoPreview = document.getElementById('logo-preview');
const logoSwatchRow = document.getElementById('logo-swatches');

function setLogoColor(hex, bgDark, btn) {
  state.logoColor = hex;
  state.logoBgDark = bgDark;
  logoPreview.style.color = hex;
  logoStage.classList.toggle('is-dark', bgDark);
  [...logoSwatchRow.children].forEach(b => b.classList.remove('is-active'));
  if (btn) btn.classList.add('is-active');
}

LOGO_COLORWAYS.forEach((c, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.style.background = c.hex;
  if (c.hex === '#FFFFFF' || c.hex === '#FDFBFA') b.style.borderColor = 'rgba(13,44,98,.25)';
  b.setAttribute('aria-label', `${c.name} ${c.hex}`);
  b.title = `${c.name}, ${c.hex}`;
  b.addEventListener('click', () => setLogoColor(c.hex, c.bgDark, b));
  logoSwatchRow.appendChild(b);
  if (i === 0) setLogoColor(c.hex, c.bgDark, b);
});

/* Build a standalone, self-contained SVG string for a given hex color */
function buildLogoSVG(hex) {
  // Inner paths inherit `fill="currentColor"` from the traced <g>. currentColor
  // resolves against the CSS `color` property, so it must be set inline here —
  // an outer `fill` attribute alone would be overridden by the inner group's
  // explicit fill and the exported file would render black.
  const g = document.getElementById('nivolve-mark').innerHTML;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}" style="color:${hex}" fill="${hex}">${g}</svg>`;
}

/* Rasterize an SVG string to a PNG Blob at a given pixel width (transparent bg) */
function svgToPngBlob(svgString, widthPx = 1200) {
  return new Promise((resolve, reject) => {
    const heightPx = Math.round(widthPx * (LOGO_H / LOGO_W));
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, widthPx, heightPx);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/png');
    };
    img.onerror = reject;
    img.src = url;
  });
}

function triggerDownload(blobOrUrl, filename) {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof blobOrUrl !== 'string') setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function slug(hex, name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

document.getElementById('dl-svg').addEventListener('click', () => {
  const svg = buildLogoSVG(state.logoColor);
  const name = LOGO_COLORWAYS.find(c => c.hex === state.logoColor)?.name || 'custom';
  triggerDownload(new Blob([svg], { type: 'image/svg+xml' }), `nivolve-logo-${slug(state.logoColor, name)}.svg`);
  showToast('SVG downloaded');
});

document.getElementById('dl-png').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    const svg = buildLogoSVG(state.logoColor);
    const blob = await svgToPngBlob(svg, 1600);
    const name = LOGO_COLORWAYS.find(c => c.hex === state.logoColor)?.name || 'custom';
    triggerDownload(blob, `nivolve-logo-${slug(state.logoColor, name)}.png`);
    showToast('PNG downloaded (1600px, transparent)');
  } catch (err) {
    showToast('PNG export failed');
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('dl-kit').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>Building kit…</span>';
  try {
    const zip = new JSZip();
    const svgFolder = zip.folder('svg');
    const pngFolder = zip.folder('png');
    for (const c of LOGO_COLORWAYS) {
      const svg = buildLogoSVG(c.hex);
      svgFolder.file(`nivolve-logo-${slug(c.hex, c.name)}.svg`, svg);
      const png1x = await svgToPngBlob(svg, 800);
      const png2x = await svgToPngBlob(svg, 1600);
      pngFolder.file(`nivolve-logo-${slug(c.hex, c.name)}@1x.png`, png1x);
      pngFolder.file(`nivolve-logo-${slug(c.hex, c.name)}@2x.png`, png2x);
    }
    zip.file('README.txt',
`NIVOLVE LOGO KIT
==================

Contents:
  /svg  - the logo as a vector file, one for each approved color (scales to any size)
  /png  - transparent background image files at 800px and 1600px wide

Colorways included: ${LOGO_COLORWAYS.map(c => `${c.name} (${c.hex})`).join(', ')}

Usage:
  - Never stretch, skew, or recolor outside the approved palette.
  - Keep clear space equal to the height of the lowercase "n" on all sides.
  - Use light colorways (Cream / White / Aqua) only on dark, low-texture backgrounds.

Full brand guideline: https://nivolve.in
Questions: connect@nivolve.in
`);
    const blob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(blob, 'nivolve-logo-kit.zip');
    showToast('Logo kit downloaded');
  } catch (err) {
    console.error(err);
    showToast('Kit build failed. Please try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
});

/* Mini logo kit grid preview (visual reference of all colorways) */
const kitGrid = document.getElementById('logo-kit-grid');
LOGO_COLORWAYS.forEach(c => {
  const card = document.createElement('div');
  card.className = 'mini-logo-card';
  card.innerHTML = `
    <div class="mini-logo-card__stage" style="background:${c.bgDark ? 'var(--navy-deep)' : 'var(--cream)'}">
      <svg viewBox="${LOGO_VIEWBOX}" style="color:${c.hex}"><use href="#nivolve-mark"></use></svg>
    </div>
    <div class="mini-logo-card__meta">
      <span>${c.name}</span>
      <button type="button" data-hex="${c.hex}" data-name="${c.name}">Copy hex</button>
    </div>`;
  card.querySelector('button').addEventListener('click', (e) => {
    copyText(c.hex, `${c.name}, ${c.hex} copied`);
  });
  kitGrid.appendChild(card);
});

/* ============================================================
   FONT FILE DOWNLOADS
   ============================================================ */
const FONT_ZIPS = {
  'bricolage-grotesque': 'assets/fonts-download/Nivolve-BricolageGrotesque.zip',
  'manrope': 'assets/fonts-download/Nivolve-Manrope.zip',
  'jetbrains-mono': 'assets/fonts-download/Nivolve-JetBrainsMono.zip',
};
document.querySelectorAll('.dl-font').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.family;
    const path = FONT_ZIPS[key];
    if (path) {
      triggerDownload(path, path.split('/').pop());
      showToast('Font files downloading (variable TTF + OFL license)');
    }
  });
});

/* ---------------- copy embed code ---------------- */
document.getElementById('copy-embed').addEventListener('click', () => {
  const code = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Manrope:wght@400..800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`;
  copyText(code, 'Embed code copied');
});

/* ============================================================
   HERO — Three.js signature moment (capability-gated)
   ============================================================ */
(async function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');

  const nav = navigator;
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory || 4;
  const smallScreen = window.innerWidth < 560;
  const capable = cores > 2 && mem > 2 && !prefersReducedMotion && !smallScreen;

  if (!capable) return; // CSS radial-gradient .hero__grain remains as the ambient fallback

  let webglOK = false;
  try {
    const testCanvas = document.createElement('canvas');
    webglOK = !!(testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'));
  } catch (e) { webglOK = false; }
  if (!webglOK) return;

  let THREE;
  try {
    THREE = await import('./three.module.min.js');
  } catch (e) { return; }

  const hero = document.querySelector('.hero');
  let width = hero.clientWidth, height = hero.clientHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Signature element: a low-poly icosahedron wireframe mid-transform into a
  // smoother sphere — a visual metaphor for "website transformation."
  const geoA = new THREE.IcosahedronGeometry(2.6, 0);
  const geoB = new THREE.IcosahedronGeometry(2.6, 3);

  // Match vertex counts isn't trivial across subdivision levels, so instead
  // render two layered meshes and cross-fade their opacity based on scroll.
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x86D5DD, wireframe: true, transparent: true, opacity: 0.55 });
  const smoothMat = new THREE.MeshBasicMaterial({ color: 0x0077A8, wireframe: true, transparent: true, opacity: 0 });

  const meshA = new THREE.Mesh(geoA, wireMat);
  const meshB = new THREE.Mesh(geoB, smoothMat);
  scene.add(meshA, meshB);

  // Ambient point field around the mark
  const ptCount = 220;
  const ptPositions = new Float32Array(ptCount * 3);
  for (let i = 0; i < ptCount; i++) {
    const r = 5 + Math.random() * 3.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    ptPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    ptPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    ptPositions[i * 3 + 2] = r * Math.cos(phi) * 0.4;
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPositions, 3));
  const ptMat = new THREE.PointsMaterial({ color: 0x86D5DD, size: 0.035, transparent: true, opacity: 0.5 });
  const points = new THREE.Points(ptGeo, ptMat);
  scene.add(points);

  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  gsap.to(canvas, { opacity: 1, duration: 1.6, delay: 0.3, ease: 'power2.out' });

  let raf;
  const clock = new THREE.Clock();
  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    targetRotX += (mouseY * 0.4 - targetRotX) * 0.04;
    targetRotY += (mouseX * 0.4 - targetRotY) * 0.04;
    meshA.rotation.y = t * 0.09 + targetRotY;
    meshA.rotation.x = t * 0.05 + targetRotX;
    meshB.rotation.y = -t * 0.06 + targetRotY;
    meshB.rotation.x = t * 0.04 + targetRotX;
    points.rotation.y = t * 0.02;
    renderer.render(scene, camera);
  }
  animate();

  // Scroll-driven cross-fade: wireframe icosahedron "resolves" into the
  // smoother form as the visitor scrolls past the hero — echoing the
  // logo-section message about the mark being drawn once, precisely.
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: self => {
      wireMat.opacity = 0.55 * (1 - self.progress);
      smoothMat.opacity = 0.4 * self.progress;
    },
  });

  function onResize() {
    width = hero.clientWidth; height = hero.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else animate();
  });
})();
