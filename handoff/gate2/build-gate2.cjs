// Builds the Gate 2 review page: prototypes with eight captures each, reviewer notes and a recommendation.
const fs = require('node:fs');
const path = require('node:path');
const here = __dirname;
const site = path.join(here, 'site');
fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(path.join(site, 'shots'), { recursive: true });
const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const list = (items) => (items && items.length ? `<ul>${items.map((i) => `<li>${esc(typeof i === 'string' ? i : JSON.stringify(i))}</li>`).join('')}</ul>` : '<p class="muted">None recorded.</p>');
let n = 0;
const publish = (file) => { if (!fs.existsSync(file)) return null; const name = `g${String(n++).padStart(3, '0')}.png`; fs.copyFileSync(file, path.join(site, 'shots', name)); return `shots/${name}`; };
const variants = [['ar', 'light'], ['ar', 'dark'], ['en', 'light'], ['en', 'dark']];
const label = { ar: 'Arabic', en: 'English', light: 'light', dark: 'dark' };

const config = JSON.parse(fs.readFileSync(path.join(here, 'gate2-config.json'), 'utf8'));
const sections = config.prototypes.map((p) => {
  const result = read(path.join(here, p.workspace, 'RESULT.json')) || {};
  const review = read(path.join(here, 'review', p.workspace, 'review.json')) || {};
  const per = (result.perRoute && result.perRoute[p.route]) || {};
  const shots = variants.map(([lang, mode]) => {
    const d = publish(path.join(here, p.shots, `${p.file}.${lang}.${mode}.desktop.png`));
    const m = publish(path.join(here, p.shots, `${p.file}.${lang}.${mode}.phone.png`));
    return `<figure class="pair"><figcaption>${label[lang]}, ${label[mode]}</figcaption><div class="frames">${d ? `<button type="button" class="shot desk" data-full="${d}"><img src="${d}" alt="${esc(p.title)}: ${label[lang]}, ${label[mode]}, desktop" loading="lazy"></button>` : ''}${m ? `<button type="button" class="shot phone" data-full="${m}"><img src="${m}" alt="${esc(p.title)}: ${label[lang]}, ${label[mode]}, phone" loading="lazy"></button>` : ''}</div></figure>`;
  }).join('');
  const issues = (review.issues || []).filter((i) => !p.routeFilter || !i.detail || true);
  const count = (s) => issues.filter((i) => i.severity === s).length;
  return `<section id="${p.id}" aria-labelledby="h-${p.id}">
    <header><span class="kicker">${esc(p.kind)}</span><h2 id="h-${p.id}">${esc(p.title)}</h2><p class="lede">${esc(p.idea || per.idea || result.idea || result.summary || '')}</p></header>
    <div class="grid">${shots}</div>
    <div class="cols">
      ${per.works ? `<div class="card"><h3>What works in this prototype</h3>${list(per.works)}</div><div class="card"><h3>Mocked or missing</h3>${list(per.doesNotWork)}</div>` : ''}
      ${result.motion && p.kind.startsWith('Landing') ? `<div class="card"><h3>Motion</h3>${list(result.motion)}</div>` : ''}
      <div class="card"><h3>Independent review${p.sharedReview ? ' (covers all editor routes)' : ''}</h3><p>${esc(review.verdict || 'Review not available.')}</p><p class="muted">${count('blocking')} blocking, ${count('major')} major, ${count('minor')} minor.</p>${list(issues.filter((i) => i.severity !== 'minor').map((i) => `${i.severity}: ${i.title}`))}</div>
      ${p.showGaps ? `<div class="card"><h3>Package gaps it ran into</h3>${list((result.packageGaps || []).slice(0, 12))}</div>` : ''}
    </div>
  </section>`;
}).join('\n');

const html = `<title>Hawiyah Gate 2</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap">
<style>
/* Layout: one column; each prototype is a section with four language-and-mode pairs, desktop beside phone. */
:root { --bg: #F9FAFB; --surface: #FFFFFF; --sunken: #F3F4F6; --fg: #161616; --muted: #4D5761; --line: #D2D6DB; --line-strong: #6C737F; --accent: #1B8354; --accent-fg: #1B8354; --on-accent: #FFFFFF;
  --sans: "IBM Plex Sans", "IBM Plex Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif; --mono: "IBM Plex Mono", Consolas, monospace; --r: 8px; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0D121C; --surface: #1F2A37; --sunken: #111927; --fg: #FFFFFF; --muted: #D2D6DB; --line: #384250; --line-strong: #9DA4AE; --accent-fg: #54C08A; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #0D121C; --surface: #1F2A37; --sunken: #111927; --fg: #FFFFFF; --muted: #D2D6DB; --line: #384250; --line-strong: #9DA4AE; --accent-fg: #54C08A; color-scheme: dark }
html { scroll-behavior: smooth; scroll-padding-top: 4.5rem; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { background: var(--bg); color: var(--fg); font: 400 0.9375rem/1.6 var(--sans); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }
.wrap { max-width: 76rem; margin-inline: auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
a { color: var(--accent-fg); } :focus-visible { outline: 2px solid var(--accent-fg); outline-offset: 2px; border-radius: 4px; }
h1, h2, h3 { font-weight: 600; line-height: 1.25; margin: 0; text-wrap: balance; } h1 { font-size: 1.875rem; } h2 { font-size: 1.375rem; } h3 { font-size: 0.9375rem; }
p { margin: 0; max-width: 72ch; overflow-wrap: anywhere; } .muted { color: var(--muted); } code { font-family: var(--mono); font-size: 0.86em; }
.kicker { font-size: 0.8125rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
.masthead { padding-block: 2.5rem 1.5rem; display: grid; gap: 0.75rem; } .lede { font-size: 1.0625rem; }
.bar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-block: 1px solid var(--line); }
.bar nav { display: flex; gap: 0.25rem; overflow-x: auto; padding-block: 0.5rem; } .bar a { flex: none; padding: 0.3rem 0.7rem; border-radius: 999px; text-decoration: none; color: var(--fg); font-size: 0.8125rem; } .bar a:hover { background: var(--sunken); }
main { display: grid; gap: 4rem; padding-block: 2.5rem 5rem; } section { display: grid; gap: 1.25rem; min-width: 0; } section > *, .cols > *, .card > * { min-width: 0; } section > header { display: grid; gap: 0.4rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 34rem), 1fr)); gap: 1rem; }
.pair { margin: 0; display: grid; gap: 0.4rem; min-width: 0; } .pair figcaption { font-size: 0.8125rem; color: var(--muted); }
.frames { display: grid; grid-template-columns: minmax(0, 3.2fr) minmax(0, 1fr); gap: 0.6rem; align-items: start; }
.shot { padding: 0; border: 1px solid var(--line); border-radius: 6px; background: var(--sunken); cursor: zoom-in; overflow: hidden; max-block-size: 26rem; display: block; inline-size: 100%; }
.shot img { display: block; inline-size: 100%; }
.cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 0.75rem; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r); padding: 1rem 1.1rem; display: grid; gap: 0.5rem; align-content: start; }
.card ul, .prose ul { margin: 0; padding-inline-start: 1.1rem; display: grid; gap: 0.3rem; } .card li, .prose li { overflow-wrap: anywhere; }
.prose { display: grid; gap: 0.9rem; } .rec { background: var(--surface); border: 1px solid var(--line); border-inline-start: 4px solid var(--accent); border-radius: var(--r); padding: 1rem 1.1rem; display: grid; gap: 0.6rem; }
dialog.viewer { border: 0; padding: 0; background: transparent; max-inline-size: min(96vw, 90rem); max-block-size: 96vh; overflow: auto; } dialog.viewer::backdrop { background: rgb(0 0 0 / 0.75); }
dialog.viewer img { display: block; max-inline-size: 100%; background: var(--surface); border-radius: 6px; } dialog.viewer form { position: sticky; top: 0; display: flex; justify-content: flex-end; padding-block-end: 0.4rem; }
dialog.viewer button { font: inherit; padding: 0.35rem 0.8rem; border-radius: 6px; border: 1px solid var(--line); background: var(--surface); color: var(--fg); cursor: pointer; }
</style>
<div class="wrap masthead"><span class="kicker">Hawiyah guide rebuild · decision gate 2</span><h1>Landing page and editor prototypes</h1><p class="lede">${config.lede}</p></div>
<div class="bar"><div class="wrap"><nav aria-label="Sections"><a href="#choose">Recommendation</a>${config.prototypes.map((p) => `<a href="#${p.id}">${esc(p.short)}</a>`).join('')}<a href="#notes">Notes</a></nav></div></div>
<main class="wrap">
  <section id="choose" aria-labelledby="h-choose"><header><h2 id="h-choose">What to choose</h2></header><div class="prose">${fs.readFileSync(path.join(here, 'gate2-recommendation.html'), 'utf8')}</div></section>
  ${sections}
  <section id="notes" aria-labelledby="h-notes"><header><h2 id="h-notes">Notes on these prototypes</h2></header><div class="prose">${fs.readFileSync(path.join(here, 'gate2-notes.html'), 'utf8')}</div></section>
</main>
<dialog class="viewer" id="viewer" aria-label="Screenshot"><form method="dialog"><button>Close</button></form><img id="viewer-img" alt=""></dialog>
<script>
document.addEventListener('click', (event) => { const shot = event.target.closest('.shot'); if (shot) { const v = document.getElementById('viewer'); document.getElementById('viewer-img').src = shot.dataset.full; v.showModal(); v.scrollTop = 0; } });
</script>
`;
fs.writeFileSync(path.join(site, 'index.html'), html);
console.log(`site/index.html ${(html.length / 1024).toFixed(0)} kB; screenshots ${n}; ${(fs.readdirSync(path.join(site, 'shots')).reduce((s, f) => s + fs.statSync(path.join(site, 'shots', f)).size, 0) / 1048576).toFixed(1)} MB`);
