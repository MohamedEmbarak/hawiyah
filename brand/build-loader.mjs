/** Trace the exact outlined Arabic wordmark with pressure-varying reveal masks.
 * Offline only: @playwright/test, Chromium and ffmpeg. No runtime font.
 * Edit the pen paths/timings below, not the finished logo outlines.
 */
import { chromium } from '@playwright/test';
import { readFile, mkdtemp, rm, copyFile, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = dirname(fileURLToPath(import.meta.url));
export const motion = { fps: 25, frames: 90, clearAt: 3.44 };
// Letters as contour indices in the source SVG. A letter's counter (hole) is
// clipped with its outer contour so the pen never fills it.
export const letters = {
  ha: [6, 7], waw: [5], ya: [4], ta: [1, 2], 'ya-dots': [3], 'ta-dots': [0],
};
// Width knots are [fraction of pen travel, nib diameter] in the 144×112 view box.
// Connected letters share end points. The pen lifts after the non-connecting
// waw and again for each Ruqaa two-dot dash.
export const strokes = [
  { part: 'ha', name: 'ha-hook', start: .08, end: .24,
    d: 'M104.5 32.5 C108.5 27 113.5 21 119.5 18.5', widths: [[0, 3], [.3, 10], [1, 13]] },
  { part: 'ha', name: 'ha-outer-bowl', start: .24, end: .60,
    d: 'M119.5 18.5 C122.5 19 122.8 25 123 32 C123.2 41 119 49.5 111 55 C106 58 102 58.5 99.5 58.2',
    widths: [[0, 13], [.25, 14], [1, 12]] },
  { part: 'ha', name: 'ha-inner-lobe', start: .60, end: .82,
    d: 'M99.5 58.2 C101.5 47 105.5 35.5 110.5 33.5 C115 32.5 116.5 40.5 113.2 46.2',
    widths: [[0, 12], [.6, 13], [1, 8]] },
  { part: 'ha', name: 'ha-join', start: .82, end: .94,
    d: 'M113.2 46.2 Q106 50 100 53 L88 55.5', widths: [[0, 8], [.3, 12], [1, 12]] },
  { part: 'waw', name: 'waw-head', start: .94, end: 1.16,
    d: 'M88 55.5 C86 59 80.5 61 78.8 57.5 C78 52.5 80.8 47 84 47 C88 47.4 89.6 53 89 58',
    widths: [[0, 12], [1, 12]] },
  { part: 'waw', name: 'waw-tail', start: 1.16, end: 1.44,
    d: 'M89 58 C88 64 85 68 80 71.3 C74 74.5 64 77.5 54 79.5', widths: [[0, 13], [.6, 12], [1, 5]] },
  { part: 'ya', name: 'ya-tooth', start: 1.54, end: 1.78,
    d: 'M49.6 50.5 C49.4 58 49 64 46 70.5 C42.5 75.5 36.5 78 31 80.5',
    widths: [[0, 2], [.15, 10], [.55, 15], [1, 15]] },
  { part: 'ta', name: 'ta-stem', start: 1.78, end: 1.94,
    d: 'M31 80.5 C32.2 76 33.6 68 34.3 62 C34.9 57 35.6 53 35.4 51', widths: [[0, 15], [1, 15]] },
  { part: 'ta', name: 'ta-loop', start: 1.94, end: 2.28,
    d: 'M35.4 51 C35 47 32.5 45.5 30 45.5 C26 46 21.5 52 18.5 58.5 C16.2 64 16.5 69 19.5 70.5 C22.5 72 26.5 71.2 29 69.5 Q28.6 66.5 27.2 64',
    widths: [[0, 14], [.2, 16], [1, 16]] },
  { part: 'ya-dots', name: 'ya-dash', start: 2.40, end: 2.54,
    d: 'M53.8 89.8 L39 92.2', widths: [[0, 14], [1, 14]] },
  { part: 'ta-dots', name: 'ta-dash', start: 2.62, end: 2.76,
    d: 'M39.2 31.7 L24.5 34.2', widths: [[0, 14], [1, 14]] },
];

export async function prepareScene(page, source) {
  const mark = source.match(/<path\b[^>]*\/>/)?.[0];
  const outlines = mark?.match(/\bd="([^"]+)"/)?.[1].match(/M[^M]+/g);
  const transform = mark?.match(/\btransform="([^"]+)"/)?.[1];
  const color = mark?.match(/\bfill="([^"]+)"/)?.[1];
  if (outlines?.length !== 8 || !transform || !color) {
    throw new Error('Wordmark outline changed: review the handwriting paths before regenerating.');
  }
  const parts = Object.keys(letters);
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:256px;height:256px}</style>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 112">
      <defs>${parts.map(part => `<clipPath id="letter-${part}"><path transform="${transform}" d="${letters[part].map(index => outlines[index]).join('')}"/></clipPath>`).join('')}</defs>
      <g id="ink" fill="${color}">${parts.map(part => `<path data-part="${part}" clip-path="url(#letter-${part})"/>`).join('')}</g>
    </svg>`);
  await page.evaluate(strokes => {
    const widthAt = (knots, at) => {
      for (let i = 1; i < knots.length; i++) {
        if (at <= knots[i][0]) {
          const [a, b] = [knots[i - 1], knots[i]];
          return a[1] + (b[1] - a[1]) * (at - a[0]) / (b[0] - a[0]);
        }
      }
      return knots.at(-1)[1];
    };
    window.penStrokes = strokes.map(stroke => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', stroke.d);
      const length = path.getTotalLength();
      const count = Math.ceil(length / .22);
      const points = Array.from({ length: count + 1 }, (_, index) => {
        const at = index / count;
        const point = path.getPointAtLength(length * at);
        const radius = widthAt(stroke.widths, at) / 2;
        // Each small stamp accumulates ink along the pen's curve. The letter clip
        // preserves the exact Aref outline and prevents ink leaking into neighbors.
        const x = point.x.toFixed(3), y = point.y.toFixed(3), r = radius.toFixed(3);
        return `M${x} ${y}m-${r} 0a${r} ${r} 0 1 0 ${radius * 2} 0a${r} ${r} 0 1 0 -${radius * 2} 0Z`;
      });
      return { ...stroke, points };
    });
  }, strokes);
}

export async function drawFrame(page, seconds) {
  await page.evaluate(({ seconds, clearAt, names }) => {
    const parts = new Map(names.map(part => [part, '']));
    if (seconds < clearAt) {
      for (const stroke of window.penStrokes) {
        const progress = Math.max(0, Math.min(1, (seconds - stroke.start) / (stroke.end - stroke.start)));
        if (!progress) continue;
        const count = Math.ceil(progress * stroke.points.length);
        parts.set(stroke.part, parts.get(stroke.part) + stroke.points.slice(0, count).join(''));
      }
    }
    for (const [part, d] of parts) document.querySelector(`[data-part="${part}"]`).setAttribute('d', d);
  }, { seconds, clearAt: motion.clearAt, names: Object.keys(letters) });
}

async function verifyFinishedWordmark(page, source) {
  const end = Math.max(...strokes.map(stroke => stroke.end));
  if (end >= motion.clearAt) throw new Error('The word must finish before the loop clears.');
  await drawFrame(page, end);
  const result = await page.evaluate(async source => {
    const rasterize = async svg => {
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 144 * 4;
      canvas.height = 112 * 4;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const [reference, traced] = await Promise.all([
      rasterize(source),
      rasterize(new XMLSerializer().serializeToString(document.querySelector('svg'))),
    ]);
    let interior = 0, missing = 0;
    for (let i = 3; i < reference.length; i += 4) {
      // Ignore boundary antialiasing; every solid interior pixel must be inked.
      if (reference[i] >= 250) {
        interior++;
        if (traced[i] < 235) missing++;
      }
    }
    return { interior, missing };
  }, source);
  if (!result.interior || result.missing) {
    throw new Error(`Incomplete handwriting mask: ${result.missing}/${result.interior} interior pixels missing.`);
  }
  console.log(`Finished outline verified: ${result.interior} interior pixels, no missing ink.`);
}

async function build() {
  const temp = await mkdtemp(join(tmpdir(), 'hawiyah-handwriting-'));
  const proof = process.argv.includes('--proof') ? resolve(root, '../.artifacts/handwriting') : null;
  if (proof) await mkdir(proof, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.HAWIYAH_CHROMIUM || '/usr/bin/chromium',
    headless: true, args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 256, height: 256 } });
    for (const [name, source] of [['hawiyah-loader', 'hawiyah-wordmark.svg'], ['hawiyah-loader-white', 'hawiyah-wordmark-white.svg']]) {
      const original = await readFile(join(root, 'assets', source), 'utf8');
      await prepareScene(page, original);
      await verifyFinishedWordmark(page, original);
      for (let frame = 0; frame < motion.frames; frame++) {
        await drawFrame(page, frame / motion.fps);
        const path = join(temp, `frame-${String(frame).padStart(3, '0')}.png`);
        await page.screenshot({ path, omitBackground: true });
        if (proof && name === 'hawiyah-loader') await copyFile(path, join(proof, `frame-${String(frame).padStart(3, '0')}.png`));
      }
      for (const size of [128, 256]) {
        const output = join(root, 'assets', `${name}${size === 256 ? '-256' : ''}.gif`);
        const filter = `scale=${size}:${size}:flags=lanczos,split[a][b];[a]palettegen=max_colors=32:reserve_transparent=1[p];[b][p]paletteuse=dither=none:alpha_threshold=128`;
        execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(motion.fps), '-i', join(temp, 'frame-%03d.png'), '-filter_complex', filter, '-loop', '0', '-gifflags', '0', output]);
        await copyFile(output, output.replace('hawiyah-loader', 'hawiyah-wordmark-loader'));
        console.log(output);
      }
    }
    if (proof) {
      const times = [.16, .36, .56, .72, .92, 1.16, 1.4, 1.64, 1.88, 2.16, 2.44, 2.8];
      await page.setViewportSize({ width: 1024, height: 840 });
      await page.setContent(`<style>body{margin:0;background:#f7f5ee;color:#142d30;font:16px system-ui;display:grid;grid-template-columns:repeat(4,1fr)}figure{margin:0;text-align:center}img{display:block;width:256px;height:256px}figcaption{height:24px}</style>${times.map(t => `<figure><img alt="Handwriting at ${t.toFixed(2)} seconds"><figcaption>${t.toFixed(2)} s</figcaption></figure>`).join('')}`);
      const frames = await Promise.all(times.map(t => readFile(join(proof, `frame-${String(Math.round(t * motion.fps)).padStart(3, '0')}.png`))));
      await page.evaluate(images => [...document.images].forEach((img, i) => img.src = `data:image/png;base64,${images[i]}`), frames.map(f => f.toString('base64')));
      await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
      await page.screenshot({ path: join(proof, 'sequence.png') });
      await writeFile(join(proof, 'timing.json'), JSON.stringify({ ...motion, strokes }, null, 2));
      console.log(`Handwriting proof: ${proof}/sequence.png`);
    }
  } finally {
    await browser.close();
    await rm(temp, { recursive: true, force: true });
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
