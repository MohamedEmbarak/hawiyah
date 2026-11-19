// Live block info strings, forms and grouping.

import { describe, expect, it } from 'vitest';
import { formOf, groupLive, isLive, parseInfo } from '../live.mjs';
import { parseMarkdown } from '../parse.mjs';

const node = (lang, meta, value = '') => ({ type: 'code', lang, meta, value, position: { start: { line: 1 } } });
const fence = (lang, meta, body) => `\`\`\`${lang} ${meta}\n${body}\n\`\`\`\n`;
const group = (name, extra = '') => [
  fence('html', `live example=${name}${extra}`, '<p class="hw-type">A</p>'),
  fence('tsx', `live example=${name}`, '<p className="hw-type">A</p>'),
  fence('vue', `live example=${name}`, '<p class="hw-type">A</p>'),
  fence('ts', `live example=${name} framework=angular`, 'template: `<p class="hw-type">A</p>`'),
].join('\n');
const run = (markdown) => groupLive(parseMarkdown(markdown, 'x.md').tree.children, 'x.md');

describe('parseInfo', () => {
  it('reads the keys and infers the framework', () => {
    expect(parseInfo(node('html', 'live example=basic check=tabs-click differences=d1'))).toEqual({
      lang: 'html', framework: 'vanilla', example: 'basic', check: 'tabs-click', checks: ['tabs-click'], differences: 'd1', errors: [],
    });
    expect(parseInfo(node('jsx', 'live example=basic')).framework).toBe('react');
    expect(parseInfo(node('vue', 'live example=basic framework=vue')).errors).toEqual([]);
    expect(parseInfo(node('ts', 'live example=basic framework=angular')).framework).toBe('angular');
  });

  it('rejects other keys, languages, names and misplaced values (HWC-LIVE1)', () => {
    expect(parseInfo(node('ts', 'live example=basic')).errors).toEqual(['a ts live block needs framework=angular']);
    expect(parseInfo(node('tsx', 'live example=basic framework=vue')).errors[0]).toMatch(/does not match the language tsx/);
    expect(parseInfo(node('css', 'live example=basic')).errors[0]).toMatch(/cannot be live/);
    expect(parseInfo(node('html', 'live example=Basic')).errors[0]).toMatch(/must match/);
    expect(parseInfo(node('tsx', 'live example=basic check=tabs-click')).errors).toEqual(['check= is allowed only on the html block, the first of the group']);
    expect(parseInfo(node('html', 'live')).errors).toEqual(['the key example=<name> is required']);
    expect(parseInfo(node('html', 'live example=a example=b')).errors).toEqual(['the key "example" is repeated']);
  });

  it('reads several checks and the static declaration, and rejects their misuse (HWC-LIVE1)', () => {
    expect(parseInfo(node('html', 'live example=basic check=tabs-keyboard,tabs-disabled'))).toMatchObject({ check: 'tabs-keyboard,tabs-disabled', checks: ['tabs-keyboard', 'tabs-disabled'], errors: [] });
    expect(parseInfo(node('html', 'live static example=basic'))).toMatchObject({ static: true, errors: [] });
    expect(parseInfo(node('html', 'live example=basic static check=tabs-click')).errors).toEqual(['a group is either static or names checks, not both']);
    expect(parseInfo(node('tsx', 'live example=basic static')).errors).toEqual(['static is allowed only on the html block, the first of the group']);
    expect(parseInfo(node('html', 'live example=basic check=tabs-click,tabs-click')).errors).toEqual(['check=tabs-click,tabs-click names a check more than once']);
    expect(parseInfo(node('html', 'live example=basic check=tabs-click,')).errors).toEqual(['the check value "" must match /^[a-z][a-z0-9-]{0,39}$/']);
  });

  it('detects live blocks', () => {
    expect(isLive(node('html', 'live example=a'))).toBe(true);
    expect(isLive(node('html', 'title="x"'))).toBe(false);
    expect(isLive({ type: 'code', lang: 'html', meta: null })).toBe(false);
  });
});

describe('formOf', () => {
  it('tells fragment and module forms apart', () => {
    expect(formOf('react', '<Button />')).toBe('fragment');
    expect(formOf('react', 'export default function Example() { return null; }')).toBe('module');
    expect(formOf('vue', '<HwButton />')).toBe('fragment');
    expect(formOf('vue', '<template>\n  <HwButton />\n</template>')).toBe('module');
    expect(formOf('angular', 'template: `<b></b>`')).toBe('fragment');
    expect(formOf('angular', "@Component({ selector: 'x', template: '' })\nexport class Example {}")).toBe('module');
    expect(formOf('vanilla', '<p></p>')).toBe('fragment');
  });
});

describe('groupLive', () => {
  it('groups four consecutive blocks separated only by blank lines', () => {
    const { groups, findings } = run(`${group('basic', ' check=tabs-keyboard')}\nText.\n\n${group('other')}`);
    expect(findings).toEqual([]);
    expect(groups.map((item) => [item.example, item.check, Object.keys(item.blocks)])).toEqual([
      ['basic', 'tabs-keyboard', ['vanilla', 'react', 'vue', 'angular']],
      ['other', undefined, ['vanilla', 'react', 'vue', 'angular']],
    ]);
    expect(groups[0].blocks.angular).toMatchObject({ lang: 'ts', form: 'fragment', code: 'template: `<p class="hw-type">A</p>`' });
  });

  it('reports missing, reordered and separated frameworks (HWC-LIVE2)', () => {
    const blocks = group('basic').split('\n\n');
    expect(run([blocks[0], blocks[2], blocks[1], blocks[3]].join('\n\n')).findings.map((item) => item.code)).toEqual(['HWC-LIVE2']);
    const separated = run(`${blocks[0]}\n${blocks[1]}\nText.\n\n${blocks[2]}\n${blocks[3]}`).findings;
    expect(separated.map((item) => item.code)).toEqual(['HWC-LIVE2', 'HWC-LIVE2']);
    expect(separated[1].message).toMatch(/separated by other content/);
    expect(run([blocks[0], blocks[0], blocks[1], blocks[2], blocks[3]].join('\n')).findings[0].message).toMatch(/vanilla, vanilla, react, vue, angular/);
  });

  it('reports a repeated example name (HWC-LIVE3)', () => {
    const { findings } = run(`${group('basic')}\nText.\n\n${group('basic')}`);
    expect(findings.map((item) => [item.code, item.message])).toEqual([['HWC-LIVE3', 'the example name "basic" is used more than once in this file']]);
  });
});
