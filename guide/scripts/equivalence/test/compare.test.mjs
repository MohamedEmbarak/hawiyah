// Self-tests of the comparisons (contentPipeline.equivalence.selfTest): structure
// paths, aria snapshots and pixelmatch screenshots, with negative controls.
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { compareAria, compareScreenshot, compareScreenshots, compareStructure, firstDifference, PIXEL_THRESHOLD, pixelLimit } from '../compare.mjs';

/** A white PNG with a dark bar of 40x12 pixels at x (a stand-in for rendered text). */
function image(x, { width = 200, height = 50, extra = 0 } = {}) {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let i = 0; i < width; i += 1) {
      const dark = (i >= x && i < x + 40 && y >= 20 && y < 32) || (y === 0 && i < extra);
      const at = (y * width + i) * 4;
      png.data[at] = png.data[at + 1] = png.data[at + 2] = dark ? 20 : 255;
      png.data[at + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

describe('firstDifference', () => {
  it('returns null for deep-equal values and the first path otherwise', () => {
    expect(firstDifference({ a: [1, { b: 'x' }] }, { a: [1, { b: 'x' }] })).toBeNull();
    expect(firstDifference({ a: [1, { b: 'x' }] }, { a: [1, { b: 'y' }] })).toEqual({ path: '$.a[1].b', a: 'x', b: 'y' });
    expect(firstDifference([1, 2], [1, 2, 3])).toEqual({ path: '$[2]', a: undefined, b: 3 });
    expect(firstDifference({ 'aria-x': 1 }, {})).toEqual({ path: '$["aria-x"]', a: 1, b: undefined });
  });
});

describe('compareStructure', () => {
  it('compares each framework with vanilla and names the first differing path', () => {
    const results = compareStructure({ vanilla: ['a'], react: ['a'], vue: ['b'], angular: ['a'] });
    expect(results.map((r) => [r.pair, r.equal])).toEqual([
      ['vanilla-react', true],
      ['vanilla-vue', false],
      ['vanilla-angular', true],
    ]);
    expect(results[1].message).toBe('vanilla and vue differ at $[0]: vanilla "a", vue "b"');
  });
});

describe('compareAria', () => {
  const snapshot = '- tablist "Request details":\n  - tab "Overview" [selected]\n  - tab "History"\n- tabpanel "Overview"';
  it('passes equal snapshots', () => {
    expect(compareAria({ vanilla: snapshot, react: snapshot }).every((r) => r.equal)).toBe(true);
  });
  it('fails on a different role and reports the line', () => {
    const [result] = compareAria({ vanilla: snapshot, react: snapshot.replace('- tab "History"', '- button "History"') });
    expect(result.equal).toBe(false);
    expect(result.line).toBe(3);
  });
});

describe('compareScreenshot', () => {
  it('passes identical images and differences within the limit', () => {
    expect(compareScreenshot(image(10), image(10))).toMatchObject({ equal: true, differing: 0, limit: 16 });
    expect(compareScreenshot(image(10), image(10, { extra: 10 }))).toMatchObject({ equal: true, differing: 10 });
  });

  it('fails a 3-pixel shifted screenshot and returns the diff image', () => {
    const result = compareScreenshot(image(10), image(13));
    expect(result.equal).toBe(false);
    expect(result.differing).toBeGreaterThan(result.limit);
    expect(PNG.sync.read(result.diff).width).toBe(200);
  });

  it('fails an adjacent colour step over a large area (threshold 0.005)', () => {
    // The fill of the reference is rgb(27, 131, 84); the other one is the
    // pressed green rgb(20, 87, 58) or a lighter neutral, which threshold 0.1 let through.
    const fill = (rgb) => {
      const png = new PNG({ width: 200, height: 50 });
      for (let at = 0; at < png.data.length; at += 4) {
        [png.data[at], png.data[at + 1], png.data[at + 2]] = rgb;
        png.data[at + 3] = 255;
      }
      return PNG.sync.write(png);
    };
    expect(compareScreenshot(fill([27, 131, 84]), fill([20, 87, 58])).equal).toBe(false);
    expect(compareScreenshot(fill([249, 250, 251]), fill([224, 225, 226])).equal).toBe(false);
    expect(compareScreenshot(fill([22, 22, 22]), fill([42, 42, 42])).equal).toBe(false);
    expect(compareScreenshot(fill([27, 131, 84]), fill([27, 131, 84])).equal).toBe(true);
    // What was measured for 0.005 (compare.mjs): canvas and surface, surface-muted and
    // danger-subtle (equal at 0.02) differ; a grey lowered by 2 differs, by 1 passes.
    expect(compareScreenshot(fill([249, 250, 251]), fill([255, 255, 255])).equal).toBe(false);
    expect(compareScreenshot(fill([243, 244, 246]), fill([254, 243, 242])).equal).toBe(false);
    expect(compareScreenshot(fill([249, 250, 251]), fill([247, 248, 249])).equal).toBe(false);
    expect(compareScreenshot(fill([249, 250, 251]), fill([248, 249, 250])).equal).toBe(true);
    expect(PIXEL_THRESHOLD).toBe(0.005);
  });

  it('fails a different size', () => {
    const result = compareScreenshot(image(10), image(10, { height: 51 }));
    expect(result).toMatchObject({ equal: false, message: 'size 200x51 differs from 200x50' });
  });

  it('uses max(16, floor(0.0005 x width x height))', () => {
    expect(pixelLimit(200, 50)).toBe(16);
    expect(pixelLimit(680, 400)).toBe(136);
  });

  it('compares each framework with vanilla', () => {
    const results = compareScreenshots({ vanilla: image(10), react: image(10), vue: image(13), angular: image(10) });
    expect(results.map((r) => [r.framework, r.equal])).toEqual([
      ['react', true],
      ['vue', false],
      ['angular', true],
    ]);
  });
});
